import { APIError } from "better-auth/api";

/**
 * Who may create an account, and on which domain.
 *
 * One deployment serves several firms, one firm per hostname, so "who may
 * register" is a per-hostname question: an @skallars.com address has no
 * business creating an account on cal.lawoss.app.
 *
 * SIGNUP_ALLOWED_DOMAINS is a comma-separated list of rules:
 *
 *   host=value   the rule applies only to requests for that Host
 *   value        the rule applies to every Host on this deployment
 *
 * A value is an email domain (`skallars.com`), one exact address
 * (`someone@icloud.com` - for a person whose address isn't on a firm domain),
 * or `*` for anyone.
 *
 *   SIGNUP_ALLOWED_DOMAINS="cal.skallars.com=skallars.com,cal.lawoss.app=lawoss.app"
 *
 * Unset means closed, not open. These instances sit on public domains with a
 * public /sign-up route; defaulting to open would mean anyone who finds the URL
 * gets an account inside a law firm's workspace. A deployment that wants open
 * registration has to say so with SIGNUP_ALLOWED_DOMAINS="*".
 *
 * Note for whoever turns on Twilio: phone-only sign-up mints a temp address on
 * `@phone.dayotter.local`, which no allowlist here will match. Add that domain
 * as a rule when you enable it.
 */
interface Rule {
  /** null = applies to every host. */
  host: string | null;
  value: string;
}

function parseRules(): Rule[] {
  return (process.env.SIGNUP_ALLOWED_DOMAINS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .map((entry) => {
      // First `=` only: the value side can be an address, the host side can't.
      const split = entry.indexOf("=");
      if (split === -1) return { host: null, value: entry };
      return { host: entry.slice(0, split).trim(), value: entry.slice(split + 1).trim() };
    })
    .filter((rule) => rule.value !== "" && rule.host !== "");
}

/**
 * Exact match on the Host, never a suffix - a rule for cal.skallars.com must
 * not hand cal.skallars.com.evil.net an account. Both the full Host and the
 * host without its port are compared, so a rule can name `localhost:3000` in
 * development and a bare hostname in production; this mirrors
 * `tenantIdFromHost` in the web app so the gate and the page it renders can
 * never disagree about which firm a request belongs to.
 */
function hostMatches(ruleHost: string, host: string | null | undefined): boolean {
  if (!host) return false;
  const full = host.toLowerCase().trim();
  const bare = full.split(":")[0] ?? full;
  return ruleHost === full || ruleHost === bare;
}

/**
 * The rules in force for one hostname: its own, plus any deployment-wide ones.
 * Off-request (a seed script, a CLI) there is no Host, so only the
 * deployment-wide rules apply - which is closed unless some exist.
 */
export function allowedSignupDomains(host?: string | null): string[] {
  return parseRules()
    .filter((rule) => rule.host === null || hostMatches(rule.host, host))
    .map((rule) => rule.value);
}

export function signupAllowed(email: string, host?: string | null): boolean {
  const allowed = allowedSignupDomains(host);
  if (allowed.length === 0) return false;
  if (allowed.includes("*")) return true;
  const address = email.toLowerCase().trim();
  if (!address.includes("@")) return false;
  const domain = address.split("@").pop();
  return allowed.some((value) => (value.includes("@") ? value === address : value === domain));
}

/** Throws the error Better Auth turns into a 403 for a refused sign-up. */
export function assertSignupAllowed(email: string, host?: string | null): void {
  if (signupAllowed(email, host)) return;
  throw new APIError("FORBIDDEN", {
    message:
      allowedSignupDomains(host).length === 0
        ? "Registration is closed on this server. Ask an administrator for an account."
        : "That email address is not allowed to register here. Use your work address, or ask an administrator.",
  });
}

/**
 * The Host of the request a sign-up came in on.
 *
 * Better Auth hands database hooks the endpoint context, or null when the write
 * didn't come from a request. Typed loose on purpose: the hook is declared with
 * `unknown` so the auth instance's inferred type stays portable (same TS2742
 * reason as the plugin casts in ./index).
 */
export function hostFromAuthContext(context: unknown): string | null {
  const ctx = context as {
    headers?: { get?: (name: string) => string | null };
    request?: { headers?: { get?: (name: string) => string | null } };
  } | null;
  return ctx?.headers?.get?.("host") ?? ctx?.request?.headers?.get?.("host") ?? null;
}
