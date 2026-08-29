import { env } from "../server/env";
import { knownHost } from "./tenants";

/**
 * Where an external OAuth round trip should put somebody back.
 *
 * A provider can only return to redirect URIs registered with it, and that list
 * is built from `APP_URL` - one origin for the whole stack. So someone who
 * starts connecting a calendar on cal.skallars.com comes back on whichever
 * domain APP_URL names, where they have no session cookie and are asked to sign
 * in again. The connection itself is fine; only the landing is wrong.
 *
 * The fix is to carry the origin they started from through the provider in the
 * signed state, and use it for the last hop. The provider never sees it as a
 * redirect target, so nothing about registration changes.
 */

/** The origin a request arrived on, or null if we don't serve that host. */
export function originForHost(host: string | null | undefined): string | undefined {
  const known = knownHost(host);
  if (!known) return undefined;
  // Scheme from APP_URL rather than the request: behind the proxy the app
  // speaks plain HTTP, and reflecting that would hand out an http:// link.
  return `${new URL(env.APP_URL).protocol}//${known}`;
}

/**
 * Validate an origin that came back from a round trip, falling back to APP_URL.
 *
 * The state is signed, so this cannot be forged - but the check is cheap and
 * this is the function that decides where to send a browser. Only the host is
 * taken from the candidate, and only if it is one of ours; the scheme always
 * comes from our own config. A candidate that is not a URL, names a host we
 * don't serve, or carries a scheme of its own can't survive that.
 */
export function returnOrigin(candidate: string | null | undefined): string {
  if (!candidate) return env.APP_URL;
  try {
    return originForHost(new URL(candidate).host) ?? env.APP_URL;
  } catch {
    return env.APP_URL;
  }
}
