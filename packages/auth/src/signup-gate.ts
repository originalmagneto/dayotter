import { APIError } from "better-auth/api";

/**
 * Who may create an account on this deployment.
 *
 * SIGNUP_ALLOWED_DOMAINS is a comma-separated list of email domains, e.g.
 * "skallars.com,humanintheloop.sk". Anything else is refused.
 *
 * Unset means closed, not open. These instances sit on public domains with a
 * public /sign-up route; defaulting to open would mean anyone who finds the URL
 * gets an account inside a law firm's workspace. A deployment that wants open
 * registration has to say so with SIGNUP_ALLOWED_DOMAINS="*".
 */
export function allowedSignupDomains(): string[] {
  return (process.env.SIGNUP_ALLOWED_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function signupAllowed(email: string): boolean {
  const allowed = allowedSignupDomains();
  if (allowed.length === 0) return false;
  if (allowed.includes("*")) return true;
  const domain = email.toLowerCase().split("@").pop();
  return Boolean(domain && allowed.includes(domain));
}

/** Throws the error Better Auth turns into a 403 for a refused sign-up. */
export function assertSignupAllowed(email: string): void {
  if (signupAllowed(email)) return;
  throw new APIError("FORBIDDEN", {
    message:
      allowedSignupDomains().length === 0
        ? "Registration is closed on this server. Ask an administrator for an account."
        : "That email address is not allowed to register here. Use your work address, or ask an administrator.",
  });
}
