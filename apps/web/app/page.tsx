import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * The root of a firm's domain is the way in, not a pitch.
 *
 * These domains are handed to colleagues and clients of a specific firm; the
 * product's own marketing has no audience here. Signed in you land on your
 * dashboard, signed out on the login screen. The marketing site still exists at
 * /home for whoever wants it.
 */
export default async function RootPage() {
  const session = await getSession();
  redirect(session?.user ? "/dashboard" : "/sign-in");
}
