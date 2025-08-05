import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserStatus } from "@/types/user";

const BACKEND_JWT_KEY = "backend_jwt";

export function useBackendAuth(
  setErrorStatus: (status: UserStatus | null) => void
) {
  const { isSignedIn, getToken, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn === undefined) return;

    const validateAndStoreJwt = async () => {
      if (!isSignedIn) {
        localStorage.removeItem(BACKEND_JWT_KEY);
        setLoading(false);
        return;
      }

      const existingJwt = localStorage.getItem(BACKEND_JWT_KEY);
      if (existingJwt) {
        setLoading(false);
        return;
      }

      try {
        const clerkToken = await getToken({ template: "dev" });
        const res = await fetch("/api/auth/validate", {
          method: "POST",
          headers: { Authorization: `Bearer ${clerkToken}` },
        });

        if (!res.ok) {
          await signOut();
          router.push("/");
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (
          data.status === UserStatus.Unconfirmed ||
          data.status === UserStatus.AccessDenied ||
          data.status === UserStatus.Deleted
        ) {
          setErrorStatus(data.status);
          await signOut();
          setLoading(false);
          return;
        }

        localStorage.setItem(BACKEND_JWT_KEY, data.jwt);
      } catch (error) {
        console.error("Backend auth validation error:", error);
        await signOut();
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    validateAndStoreJwt();
  }, [isSignedIn, getToken, signOut, router, setErrorStatus]);

  return loading;
}
