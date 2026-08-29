import { headers } from "next/headers";
import { type Tenant, tenantFromHost, tenantIdFromHost } from "./tenants";

/** The firm this request belongs to. Server components and route handlers. */
export async function getTenant(): Promise<Tenant> {
  return tenantFromHost((await headers()).get("host"));
}

export async function getTenantId(): Promise<string> {
  return tenantIdFromHost((await headers()).get("host"));
}
