"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useBackendToken } from "@/context/use-backend-token";
import { UserStatus } from "@/types/user";
import { AuthErrorModal } from "@/components/auth-error-modal/auth-error-modal";
import { validateClerkToken } from "@/services/auth-service";
import { useLoading } from "./loading-context";

type AuthContextType = {
  backendToken: string | null;
  errorStatus: UserStatus | null;
  logout: () => Promise<void>;
  setErrorStatus: React.Dispatch<React.SetStateAction<UserStatus | null>>;
};

const AuthContext = createContext<AuthContextType>({
  backendToken: null,
  errorStatus: null,
  logout: async () => {},
  setErrorStatus: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, getToken, signOut } = useAuth();
  const { token: backendToken, setToken, removeToken } = useBackendToken();
  const [errorStatus, setErrorStatus] = useState<UserStatus | null>(null);

  const router = useRouter();

  const logout = useCallback(async () => {
    removeToken();
    await signOut();
    router.push("/");
  }, [signOut, router, removeToken]);

  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (isSignedIn === undefined) return;

    const init = async () => {
      if (!isSignedIn) {
        logout();
        return;
      }

      if (backendToken) {
        return;
      }

      try {
        startLoading();
        const clerkToken = await getToken({ template: "dev" });

        if (!clerkToken) {
          throw new Error("Clerk token is missing");
        }
        const data = await validateClerkToken(clerkToken);

        if ("error" in data) {
          setErrorStatus(UserStatus.AccessDenied);
          logout();
          return;
        }

        if (
          data.status === UserStatus.Unconfirmed ||
          data.status === UserStatus.AccessDenied ||
          data.status === UserStatus.Deleted
        ) {
          setErrorStatus(data.status);
          logout();
          return;
        }

        setToken(data.jwt);
      } catch {
        logout();
      } finally {
        stopLoading();
      }
    };

    init();
  }, [isSignedIn, getToken, logout, backendToken, setToken]);
  return (
    <AuthContext.Provider
      value={{ backendToken, logout, errorStatus, setErrorStatus }}
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

export const useBackendAuthContext = () => useContext(AuthContext);
