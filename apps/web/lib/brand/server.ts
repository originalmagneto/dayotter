import { env } from "@/lib/server/env";
import { headers } from "next/headers";
import { originForHost } from "./origin";
import { type Tenant, tenantFromHost, tenantIdFromHost } from "./tenants";

/** The firm this request belongs to. Server components and route handlers. */
export async function getTenant(): Promise<Tenant> {
  return tenantFromHost((await headers()).get("host"));
}

export async function getTenantId(): Promise<string> {
  return tenantIdFromHost((await headers()).get("host"));
}

/**
 * The public origin this request came in on.
 *
 * Metadata that names a URL - canonical, OpenGraph, the icon - has to name the
 * firm's own domain. APP_URL names one firm out of three, so using it made
 * every firm's pages declare themselves as living on that one's domain.
 *
 * Falls back to APP_URL for a Host we don't serve, which is the only sane
 * answer: a canonical URL must be absolute and must not be attacker-chosen.
 */
export async function getOrigin(): Promise<string> {
  return originForHost((await headers()).get("host")) ?? env.APP_URL;
}
