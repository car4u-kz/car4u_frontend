"use client";

import { useState, useEffect, useCallback } from "react";

const BACKEND_JWT_KEY = "backend_jwt";

export function useBackendToken() {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(BACKEND_JWT_KEY);
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  const setToken = useCallback((jwt: string) => {
    localStorage.setItem(BACKEND_JWT_KEY, jwt);
    setTokenState(jwt);
  }, []);

  const removeToken = useCallback(() => {
    localStorage.removeItem(BACKEND_JWT_KEY);
    setTokenState(null);
  }, []);

  return {
    token,
    setToken,
    removeToken,
  };
}
