"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllOrganizations, getMyOrganizations } from "../services/organization-service";
import { useFetchWithAuth } from "./use-fetch-with-auth";
import { useBackendAuthContext } from "@/context/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Organization } from "@/types/organization";
import { UserRole } from "@/types/user";
import { ACTIVE_ORG_PREFIX } from "@/lib/auth/auth-storage";

export function useOrganizationManager() {
  const { backendToken, userId, userRole } = useBackendAuthContext();
  const fetchWithAuth = useFetchWithAuth();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [myOrganizations, setMyOrganizations] = useState<any[] | null>(null);
  const [allOrganizations, setAllOrganizations] = useState<any[] | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);

  const activeOrgRef = useRef<string | null>(null);

  const storageKey = useMemo(
    () => (userId ? `${ACTIVE_ORG_PREFIX}${userId}` : null),
    [userId]
  );

  // Загружаем id активной организации из localStorage
  useEffect(() => {
    if (!storageKey) {
      activeOrgRef.current = null;
      return;
    }
    try {
      activeOrgRef.current = localStorage.getItem(storageKey);
    } catch {
      activeOrgRef.current = null;
    }
  }, [storageKey]);

  const loadOrganizations = useCallback(async () => {
    if (!backendToken || !userId) {
      setMyOrganizations(null);
      setAllOrganizations(null);
      setActiveOrganizationId(null);
      activeOrgRef.current = null;
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const myResult = await getMyOrganizations(fetchWithAuth, userId);
      const myOrgs: Organization[] = "error" in myResult ? [] : myResult.orgs || [];
      setMyOrganizations(myOrgs);
      let allOrgs : Organization[] = [];

      if (userRole === UserRole.Admin) {
        allOrgs = await getAllOrganizations(fetchWithAuth);
        setAllOrganizations(allOrgs || []);
      }

      const stored = storageKey ? localStorage.getItem(storageKey) : null;
      let activeId: string | null = null;

      if (stored && [...myOrgs, ...(allOrgs || [])].some(o => o.id.toString() === stored)) {
        activeId = stored;
      } else if (myOrgs.length > 0) {
        activeId = myOrgs[0].id.toString();
      } else if (userRole === UserRole.Admin && allOrgs && allOrgs.length > 0) {
        activeId = allOrgs[0].id.toString();
      }

      activeOrgRef.current = activeId;
      setActiveOrganizationId(activeId);

      if (storageKey && activeId) {
        try {
          localStorage.setItem(storageKey, activeId);
        } catch (e) {
          console.warn("Failed to persist active organization", e);
        }
      }

    } catch (e) {
      console.error("Unexpected error in loadOrganizations:", e);
      setMyOrganizations(null);
      setAllOrganizations(null);
      setActiveOrganizationId(null);
      activeOrgRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [backendToken, userId, userRole, fetchWithAuth, storageKey]);

  const setActiveOrganization = useCallback(
    (id: string) => {
      activeOrgRef.current = id;
      setActiveOrganizationId(id);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, id);
        } catch (e) {
          console.warn("Failed to persist active organization", e);
        }
      }

      queryClient.invalidateQueries({
        predicate: (query) => {
          const k = query.queryKey;
          return (
            k[0] === "adview-filters" ||
            k[0] === "parsing-templates" ||
            k[0] === "car-ads" ||
            k[0] === "my-ads" ||
            k[0] === "my-ads/parsing-template/lookup"
          );
        },
      });
    },
    [storageKey, queryClient]
  );

  useEffect(() => {
    if (backendToken && userId) {
      loadOrganizations();
    } else {
      setIsLoading(false);
      setMyOrganizations(null);
      setAllOrganizations(null);
      setActiveOrganizationId(null);
      activeOrgRef.current = null;
    }
  }, [backendToken, userId, loadOrganizations]);

  return {
    myOrganizations,
    allOrganizations,
    activeOrganizationId,
    setActiveOrganization,
    isLoading,
  };
}