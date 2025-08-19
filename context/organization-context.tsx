"use client";

import { useOrganizationManager } from "@/hooks/use-organization-manager";
import { Organization } from "@/types/organization";
import React, { createContext, useContext } from "react";
 

type OrgCtx = {
  organizations: Organization[] | null;
  activeOrganizationId: string | null;
  setActiveOrganization: (id: string) => void;
  isLoading: boolean;
};

const OrgContext = createContext<OrgCtx | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const manager = useOrganizationManager();
  return <OrgContext.Provider value={manager}>{children}</OrgContext.Provider>;
};

export function useOrganization() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
}
