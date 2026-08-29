import type { ProviderOAuthConfig } from "@dayotter/calendar";
import { env } from "../server/env";

/** OAuth app config per provider, from env. Redirect URIs must match the connect routes. */
export function providerConfig(provider: "google" | "microsoft"): ProviderOAuthConfig {
  if (provider === "google") {
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${env.APP_URL}/api/calendars/connect/google/callback`,
    };
  }
  return {
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
    redirectUri: `${env.APP_URL}/api/calendars/connect/microsoft/callback`,
  };
}

/**
 * Whether this server has OAuth credentials for the provider at all.
 *
 * env.GOOGLE_CLIENT_ID defaults to "", so without this the connect route happily
 * builds a consent URL with an empty client_id and sends the user to Google,
 * which answers "Access blocked: Authorization Error / Missing required
 * parameter: client_id". An unconfigured integration should stay inert, not
 * look like the product is broken.
 */
export function providerConfigured(provider: "google" | "microsoft"): boolean {
  const { clientId, clientSecret } = providerConfig(provider);
  return Boolean(clientId && clientSecret);
}
