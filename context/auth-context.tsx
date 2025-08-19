"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { validateClerkToken } from "../services/auth-service";
import { UserStatus } from "@/types/user";
import { useLoading } from "./loading-context";
import { useBackendToken } from "./use-backend-token";

type AuthContextType = {
  backendToken: string | null;
  errorStatus: UserStatus | null;
  userId: string | null;
  logout: () => Promise<void>;
  setErrorStatus: React.Dispatch<React.SetStateAction<UserStatus | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isSignedIn, getToken, signOut } = useAuth();
  const {
    token: backendToken,
    userId,
    setToken,
    removeToken,
  } = useBackendToken();
  const [errorStatus, setErrorStatus] = useState<UserStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const logout = useCallback(async () => {
    removeToken();
    try {
      await signOut();
    } catch (e) {
      console.warn("signOut error", e);
    }
    try {
      router.push("/");
    } catch (e) {}
  }, [removeToken, signOut, router]);

  useEffect(() => {
    if (isSignedIn === undefined) return;

    if (initializingRef.current) return;

    const init = async () => {
      initializingRef.current = true;
      if (mountedRef.current) setIsLoading(true);

      if (!isSignedIn) {
        await logout();
        if (mountedRef.current) setIsLoading(false);
        initializingRef.current = false;
        return;
      }

      if (backendToken) {
        if (mountedRef.current) setIsLoading(false);
        initializingRef.current = false;
        return;
      }

      startLoading();
      try {
        const clerkToken = await getToken({ template: "dev" });
        if (!clerkToken) {
          throw new Error("Clerk token is missing");
        }

        const data = await validateClerkToken(clerkToken);

        if ("error" in data) {
          setErrorStatus(UserStatus.AccessDenied);
          await logout();
          return;
        }

        if (
          data.status === UserStatus.Unconfirmed ||
          data.status === UserStatus.AccessDenied ||
          data.status === UserStatus.Deleted
        ) {
          setErrorStatus(data.status);
          await logout();
          return;
        }

        setToken(data.jwt);
      } catch (e) {
        console.error("Auth init error", e);
        try {
          await logout();
        } catch {}
      } finally {
        stopLoading();
        if (mountedRef.current) setIsLoading(false);
        initializingRef.current = false;
      }
    };

    init();
  }, [isSignedIn, backendToken]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid #3b82f6",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>Проверяем авторизацию...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ backendToken, errorStatus, userId, logout, setErrorStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useBackendAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useBackendAuthContext must be used inside AuthProvider");
  return ctx;
}
