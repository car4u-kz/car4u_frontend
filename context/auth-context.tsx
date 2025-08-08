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
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
        return;
      }

      if (backendToken) {
        setIsLoading(false);
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
        setIsLoading(false);
        stopLoading();
      }
    };

    init();
  }, [isSignedIn, getToken, logout, backendToken, setToken]);

  const styles: Record<string, React.CSSProperties> = {
    wrapper: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffffff",
    },
    inner: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    loader: {
      width: "20px",
      height: "20px",
      border: "2px solid #3b82f6",
      borderTop: "2px solid transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    text: {
      fontSize: "14px",
      color: "#4b5563",
    },
  };

  if (isLoading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.inner}>
          <div style={styles.loader}></div>
          <span style={styles.text}>Проверяем авторизацию...</span>
        </div>
      </div>
    );
  }

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
