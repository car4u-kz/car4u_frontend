"use client";

import { AuthStorage } from "@/lib/auth/auth-storage";
import { ValidateResponseSuccess } from "@/services/auth-service";
import { UserRole } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

const USER_ROLE_KEY = "user_role";

export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload;
  } catch {
    return null;
  }
}

export function useBackendToken() {
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = AuthStorage.getJWT();
    if (stored) {
      setTokenState(stored);
      const payload = decodeJwt(stored);
      setUserId(payload?.sub || payload?.userId || null);

      const roleStr = localStorage.getItem(USER_ROLE_KEY);
      let role: UserRole | null = null;

      if (roleStr) {
        const roleNum = Number(roleStr);
        if (roleNum === UserRole.Admin) role = UserRole.Admin;
        else if (roleNum === UserRole.User) role = UserRole.User;
      }

      setRole(role);
    }
  }, []);

  const setUser = useCallback((response: ValidateResponseSuccess) => {
    AuthStorage.setJWT(response.jwt);

    localStorage.setItem(USER_ROLE_KEY, response.role.toString());

    setTokenState(response.jwt);
    const payload = decodeJwt(response.jwt);
    setUserId(payload?.sub || payload?.userId || null);

    setRole(response.role || null);
  }, []);

  const removeUser = useCallback(() => {
    AuthStorage.clearJWT();
    setTokenState(null);
    setUserId(null);
    setRole(null);
  }, []);

  return {
    token,
    userId,
    role,
    setUser,
    removeUser,
  };
}
