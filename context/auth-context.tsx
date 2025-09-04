"use client";

import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { validateClerkToken } from "../services/auth-service";
import { UserRole, UserStatus } from "@/types/user";
import { useLoading } from "./loading-context";
import { useBackendToken } from "./use-backend-token";
import { AuthErrorModal } from "@/components/auth-error-modal/auth-error-modal";

/** ===== Types ===== */
type AuthContextType = {
  backendToken: string | null;
  errorStatus: UserStatus | null;
  userId: string | null;
  userRole: UserRole | null;
  logout: () => Promise<void>;
  setErrorStatus: React.Dispatch<React.SetStateAction<UserStatus | null>>;
};

type Phase = "idle" | "checking" | "ready";

/** ===== Helpers ===== */
const isDenied = (s: UserStatus) =>
  s === UserStatus.Unconfirmed ||
  s === UserStatus.AccessDenied ||
  s === UserStatus.Deleted;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, getToken, signOut } = useAuth();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  const {
    token: backendToken,
    userId,
    role: userRole,
    setUser,
    removeUser,
  } = useBackendToken();

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorStatus, setErrorStatus] = useState<UserStatus | null>(null);

  const didInitRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const logout = useCallback(async () => {
    removeUser();
    try { await signOut(); } catch (e) { console.warn("signOut error", e); }
    try { router.push("/"); } catch { }
  }, [removeUser, signOut, router]);

  const initAuth = useCallback(async () => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const abort = new AbortController();
    abortRef.current = abort;

    setPhase("checking");
    startLoading();

    try {
      if (!isSignedIn) {
        removeUser();
        return;
      }

      if (backendToken) return;

      const clerkToken = await getToken({ template: "dev" });
      if (!clerkToken || abort.signal.aborted) return;

      const data = await validateClerkToken(clerkToken, { signal: abort.signal });
      if (abort.signal.aborted) return;

      if ("error" in data && data.error === "aborted") return;

      if ("error" in data) {
        setErrorStatus(UserStatus.AccessDenied);
        await logout();
        return;
      }

      if (isDenied(data.status)) {
        setErrorStatus(data.status);
        await logout();
        return;
      }

      setUser(data);
    } catch (e) {
      console.error("Auth init error", e);
      await logout();
    } finally {
      stopLoading();
      setPhase("ready");
      if (abortRef.current === abort) abortRef.current = null;
    }
  }, [
    isSignedIn,
    backendToken,
    getToken,
    removeUser,
    setUser,
    logout,
    startLoading,
    stopLoading,
  ]);

  useEffect(() => {
    if (isSignedIn === undefined) return;
    void initAuth();
  }, [isSignedIn, initAuth]);

  /** ===== UI blocking while checking ===== */
  if (phase !== "ready") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-busy
        aria-live="polite"
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
      value={{
        backendToken,
        errorStatus,
        userId,
        userRole,
        logout,
        setErrorStatus,
      }}
    >
      {children}
      {errorStatus && (
        <AuthErrorModal
          errorStatus={errorStatus}
          onClose={() => setErrorStatus(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

export function useBackendAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useBackendAuthContext must be used inside AuthProvider");
  return ctx;
}
