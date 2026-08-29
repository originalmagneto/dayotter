import { getOrigin, getTenant } from "@/lib/brand/server";

/**
 * Who a booking email is from, and where its links point.
 *
 * Both used to come from `APP_URL`, which names one firm out of the several
 * this deployment serves. A client of one firm therefore got mail signed with
 * another firm's name, carrying a "manage your booking" link to a domain where
 * their booking isn't. Resolved from the request instead, so the mail matches
 * the page the person just used.
 */
export async function bookingSender(): Promise<{ appUrl: string; brandName: string }> {
  const [appUrl, tenant] = await Promise.all([getOrigin(), getTenant()]);
  return { appUrl, brandName: tenant.name };
}
