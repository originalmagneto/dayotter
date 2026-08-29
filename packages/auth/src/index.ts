import { expo } from "@better-auth/expo";
import { tenantOrigins } from "@dayotter/core";
import { eq, getDb, schema } from "@dayotter/db";
import { sendEmail } from "@dayotter/emails";
import { sendTextSms, twilioConfigured } from "@dayotter/notifications";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { bearer, organization, phoneNumber, twoFactor } from "better-auth/plugins";
import { assertSignupAllowed, hostFromAuthContext } from "./signup-gate";

/**
 * Which site an auth email is about.
 *
 * This package is shared by every firm on the deployment and cannot see the
 * tenant registry in apps/web, so it names the host the person actually used
 * rather than a firm name. That is always right; a hardcoded name was wrong for
 * two firms out of three.
 */
function siteFromRequest(request?: Request | { headers?: Headers }): string {
  const host = request?.headers?.get("host");
  return host ?? new URL(process.env.APP_URL ?? "https://localhost").host;
}

/**
 * Label shown in authenticator apps and in OTP texts. Static by nature - a TOTP
 * issuer is baked into the QR code when the user enrols - so it names the
 * deployment, not a firm. Override with AUTH_ISSUER.
 */
const AUTH_ISSUER = process.env.AUTH_ISSUER ?? "Scheduling";

/**
 * Better Auth server instance - the single source of truth for identity and
 * organizations. Lives in a package (not apps/web) so the future mobile API
 * uses the exact same auth. See docs/DECISIONS.md §2 (API-first).
 *
 * The Drizzle adapter maps Better Auth's model names to our tables; note
 * `member -> memberships`. IDs are DB-generated UUIDs (`generateId: false`),
 * so Better Auth defers id creation to Postgres `defaultRandom()`.
 */
export const auth = betterAuth({
  appName: "dayotter",
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.APP_URL,
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.organizations,
      member: schema.memberships,
      invitation: schema.invitations,
      twoFactor: schema.twoFactors,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Password reset via emailed capability link. Better Auth mints the token
    // and hands us the URL (it routes through the API, then redirects to the
    // `redirectTo` page with the token) - we just deliver it.
    sendResetPassword: async ({ user, url }, request) => {
      const site = siteFromRequest(request);
      await sendEmail({
        to: user.email,
        subject: `Reset your password on ${site}`,
        text: `Reset your password on ${site}: ${url}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>Someone requested a password reset for your account on ${site}.</p>
<p><a href="${url}">Reset your password</a></p>
<p style="color:#666;font-size:13px">If this wasn't you, you can safely ignore this email - your password won't change.</p>`,
      });
    },
  },
  // Send a verification email on sign-up. NOT hard-required (that would block the
  // mobile bearer-token flow and self-hosts without SMTP); flip
  // `emailAndPassword.requireEmailVerification` on once you have SMTP + handle it
  // on mobile. When SMTP is unset the mailer just logs the message.
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const site = siteFromRequest(request);
      await sendEmail({
        to: user.email,
        subject: `Confirm your email on ${site}`,
        text: `Confirm your email to secure your account on ${site}: ${url}`,
        html: `<p>Confirm your email to secure your account on ${site}.</p>
<p><a href="${url}">Verify your email</a></p>
<p style="color:#666;font-size:13px">If you didn't sign up, you can ignore this email.</p>`,
      });
    },
  },
  // "Sign in with Google" - enabled only when Google OAuth creds are configured
  // (the same app used for calendar connect). Register
  // `${APP_URL}/api/auth/callback/google` as an authorized redirect URI.
  socialProviders: process.env.GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        },
      }
    : undefined,
  user: {
    additionalFields: {
      handle: { type: "string", required: false, input: true },
      timezone: { type: "string", required: false, input: true },
    },
    deleteUser: {
      enabled: true,
      // bookings.host_id is ON DELETE restrict - remove the host's bookings first
      // so the cascade on everything else (event types, schedules, sessions…) runs.
      beforeDelete: async (user) => {
        await getDb().delete(schema.bookings).where(eq(schema.bookings.hostId, user.id));
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // The gate runs before the row exists, so a refused sign-up leaves
        // nothing behind - no half-created user to clean up. It sits here
        // rather than in the sign-up route because this is the one point every
        // path to a new account goes through, Google OAuth included.
        //
        // `context` carries the request, which is how the gate knows which
        // firm's domain the sign-up arrived on.
        before: async (user: { email: string }, context: unknown) => {
          assertSignupAllowed(user.email, hostFromAuthContext(context));
          return { data: user };
        },
      },
    },
  },
  advanced: {
    database: {
      // Let Postgres generate UUIDs via defaultRandom() instead of Better Auth.
      generateId: false,
    },
  },
  /**
   * Which origins may post to the auth endpoints.
   *
   * Better Auth trusts its own `baseURL` and refuses everything else with
   * "Invalid origin" - and `baseURL` is one value for a stack that answers on
   * three domains. Without the firms' own origins here, sign-up and sign-in
   * work on whichever domain APP_URL names and are refused on the other two.
   *
   * `dayotter://` is the mobile app's deep-link scheme, for the Expo OAuth
   * callback (native Google sign-in redirects there).
   */
  trustedOrigins: [...tenantOrigins(), "dayotter://"],
  // `expo` bridges OAuth back to the native app; `bearer` enables token auth for
  // native mobile clients; `nextCookies` must be last so cookies are set
  // correctly from server actions.
  // `expo()` is cast to the generic plugin type so the auth instance's inferred
  // type stays portable (avoids TS2742 leaking a nested zod-v4 path); it still
  // runs and registers its endpoints at runtime.
  plugins: [
    organization(),
    // TOTP two-factor auth (authenticator apps) + recovery codes. When a user
    // has it enabled, email/password sign-in returns a `twoFactorRedirect`
    // instead of a session until they verify a code (see the web sign-in step).
    // Cast for the same TS2742 reason as expo()/phoneNumber() below - keeps the
    // inferred auth type portable; the plugin still registers its endpoints.
    twoFactor({ issuer: AUTH_ISSUER }) as BetterAuthPlugin,
    // Phone + OTP sign-in - enabled only when Twilio is configured (it sends the
    // code). Phone-only users get an auto-provisioned account via a temp email.
    ...(twilioConfigured()
      ? [
          phoneNumber({
            sendOTP: async ({ phoneNumber: phone, code }) => {
              await sendTextSms(phone, `Your ${AUTH_ISSUER} code is ${code}`);
            },
            signUpOnVerification: {
              getTempEmail: (phone) => `${phone.replace(/[^0-9]/g, "")}@phone.dayotter.local`,
              getTempName: (phone) => phone,
            },
          }) as BetterAuthPlugin,
        ]
      : []),
    expo() as BetterAuthPlugin,
    bearer(),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];
