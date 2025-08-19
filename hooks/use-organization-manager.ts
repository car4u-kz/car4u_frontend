"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMyOrganizations } from "../services/organization-service";
import { useFetchWithAuth } from "./use-fetch-with-auth";
import { useBackendAuthContext } from "@/context/auth-context";
import { useQueryClient } from "@tanstack/react-query";

const ACTIVE_ORG_PREFIX = "active_organization_id_";

export function useOrganizationManager() {
  const { backendToken, userId } = useBackendAuthContext();
  const fetchWithAuth = useFetchWithAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[] | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] = useState<
    string | null
  >(null);

  const activeOrgRef = useRef<string | null>(null);

  const storageKey = useMemo(
    () => (userId ? `${ACTIVE_ORG_PREFIX}${userId}` : null),
    [userId]
  );

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
      setOrganizations(null);
      setActiveOrganizationId(null);
      activeOrgRef.current = null;
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await getMyOrganizations(fetchWithAuth, userId);
      if ("error" in result) {
        console.error("Error loading organizations:", result.error);
        setOrganizations(null);
        setActiveOrganizationId(null);
        activeOrgRef.current = null;
        return;
      }

      const orgs = result.orgs || [];
      setOrganizations(orgs);

      const stored = storageKey ? localStorage.getItem(storageKey) : null;
      if (stored && orgs.some((o: any) => o.id.toString() === stored)) {
        activeOrgRef.current = stored;
        setActiveOrganizationId(stored);
        return;
      }

      if (
        activeOrgRef.current &&
        orgs.some((o: any) => o.id.toString() === activeOrgRef.current)
      ) {
        setActiveOrganizationId(activeOrgRef.current);
        return;
      }

      if (orgs.length > 0) {
        const first = orgs[0].id.toString();
        activeOrgRef.current = first;
        setActiveOrganizationId(first);
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, first);
          } catch (e) {
            console.warn("Failed to persist active organization", e);
          }
        }
      } else {
        activeOrgRef.current = null;
        setActiveOrganizationId(null);
      }
    } catch (e) {
      console.error("Unexpected error in loadOrganizations:", e);
      setOrganizations(null);
      setActiveOrganizationId(null);
      activeOrgRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [backendToken, userId, fetchWithAuth, storageKey]);

  const queryClient = useQueryClient();

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
      setOrganizations(null);
      setActiveOrganizationId(null);
      activeOrgRef.current = null;
    }
  }, [backendToken, userId, loadOrganizations]);

  return {
    organizations,
    activeOrganizationId,
    setActiveOrganization,
    isLoading,
  };
}
