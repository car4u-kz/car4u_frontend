"use client";

import { useBackendAuthContext } from "@/context/auth-context";
import { useCallback } from "react";
import { useLoading } from "@/context/loading-context";
import { ACTIVE_ORG_PREFIX, AuthStorage } from "@/lib/auth/auth-storage";

export function useFetchWithAuth() {
  const { startLoading, stopLoading } = useLoading();

  const { logout, userId } = useBackendAuthContext();

  const fetchWithAuth = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (typeof window === "undefined") {
        throw new Error("useFetchWithAuth must be used on client side");
      }

      startLoading();
      try {
        const jwt = AuthStorage.getJWT();
        let organizationId: string | null = null;
        if (userId) {
          organizationId = localStorage.getItem(
            `${ACTIVE_ORG_PREFIX}${userId}`
          );
        } else {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(ACTIVE_ORG_PREFIX)) {
              organizationId = localStorage.getItem(k);
              break;
            }
          }
        }

        const headers = new Headers(init?.headers ?? undefined);

        if (jwt) headers.set("Authorization", `Bearer ${jwt}`);
        if (organizationId) headers.set("X-Organization-Id", organizationId);

        if (!headers.has("Accept")) headers.set("Accept", "application/json");

        const url =
          typeof input === "string"
            ? input.startsWith("http")
              ? input
              : input
            : input;

        const response = await fetch(url, { ...init, headers });

        if (response.status === 401) {
          try {
            await logout();
          } catch {}
        }

        return response;
      } finally {
        stopLoading();
      }
    },
    [logout, userId]
  );

  return fetchWithAuth;
}
