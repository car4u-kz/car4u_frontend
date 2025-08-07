import { useBackendAuthContext } from "@/context/auth-context";
import { useLoading } from "@/context/loading-context";

export function useFetchWithAuth() {
  const BACKEND_JWT_KEY = "backend_jwt";
  const { logout } = useBackendAuthContext();
  const { startLoading, stopLoading } = useLoading();

  async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
    startLoading();
    try {
      const headers = new Headers(init?.headers);

      const jwt = localStorage.getItem(BACKEND_JWT_KEY);
      if (jwt) {
        headers.set("Authorization", `Bearer ${jwt}`);

        let url = input;
        if (typeof input === "string" && !input.startsWith("http")) {
          url = `${url}`;
        }

        const response = await fetch(url, { ...init, headers });

        if (response.status === 401) {
          await logout();
        }

        return response;
      }
    } finally {
      stopLoading();
    }
  }

  return fetchWithAuth;
}
