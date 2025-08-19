"use client";

import { useCallback, useEffect, useState } from "react";

const BACKEND_JWT_KEY = "backend_jwt";

export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

export function useBackendToken() {
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(BACKEND_JWT_KEY);
    if (stored) {
      setTokenState(stored);
      const payload = decodeJwt(stored);
      setUserId(payload?.sub || payload?.userId || null);
    }
  }, []);

  const setToken = useCallback((jwt: string) => {
    localStorage.setItem(BACKEND_JWT_KEY, jwt);
    setTokenState(jwt);
    const payload = decodeJwt(jwt);
    setUserId(payload?.sub || payload?.userId || null);
  }, []);

  const removeToken = useCallback(() => {
    localStorage.removeItem(BACKEND_JWT_KEY);
    setTokenState(null);
    setUserId(null);
  }, []);

  return {
    token,
    userId,
    setToken,
    removeToken,
  };
}
