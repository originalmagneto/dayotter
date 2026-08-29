"use client";

import { createContext, useContext } from "react";
import type { Tenant } from "./tenants";

/**
 * The active firm, for client components.
 *
 * A client component cannot read the request's Host, so the root layout
 * resolves the tenant on the server and hands it down. Everything that used to
 * import the build-time TENANT constant reads this instead.
 */
const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({
  tenant,
  children,
}: { tenant: Tenant; children: React.ReactNode }) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}

export function useTenant(): Tenant {
  const t = useContext(TenantContext);
  if (!t) throw new Error("useTenant must be used inside <TenantProvider>");
  return t;
}
