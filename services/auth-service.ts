// services/auth-service.ts
import { UserRole, UserStatus } from "@/types/user";

export type ValidateResponseSuccess = {
  jwt: string;
  status: UserStatus;
  role: UserRole;
};

export type ValidateResponseError = { error: string };

export type ValidateResult = ValidateResponseSuccess | ValidateResponseError;

const inflightByToken = new Map<string, Promise<ValidateResult>>();

export async function validateClerkToken(
  clerkToken: string,
  opts?: { signal?: AbortSignal }
): Promise<ValidateResult> {
  if (!clerkToken) return { error: "Clerk token is missing" };

  const existing = inflightByToken.get(clerkToken);
  if (existing) return existing;

  const p = (async (): Promise<ValidateResult> => {
    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({}),
        signal: opts?.signal,
      });

      let data: any = null;
      const isJSON = res.headers
        .get("content-type")
        ?.toLowerCase()
        .includes("application/json");

      if (isJSON) {
        try {
          data = await res.json();
        } catch {
          // ignore malformed body
        }
      }

      if (!res.ok) {
        const msg =
          data?.error ||
          (res.status === 401 || res.status === 403
            ? "Unauthorized"
            : "Token validation failed");
        return { error: msg };
      }

      const jwt = data?.jwt as string | undefined;
      const status = data?.status as UserStatus | undefined;
      const role = data?.role as UserRole | undefined;

      if (!jwt || !status) {
        return { error: "Malformed validation response" };
      }

      return { jwt, status, role: role as UserRole };
    } catch (e: any) {
      if (e?.name === "AbortError") return { error: "aborted" };
      console.error("validateClerkToken error", e);
      return { error: e?.message || "Network error" };
    } finally {
      setTimeout(() => {
        inflightByToken.delete(clerkToken);
      }, 0);
    }
  })();

  inflightByToken.set(clerkToken, p);
  return p;
}
