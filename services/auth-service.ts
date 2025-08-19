import { UserStatus } from "@/types/user";

type ValidateResponseSuccess = { jwt: string; status: UserStatus };
type ValidateResponseError = { error: string };

let inFlightValidate: Promise<
  ValidateResponseSuccess | ValidateResponseError
> | null = null;

export async function validateClerkToken(
  clerkToken: string
): Promise<ValidateResponseSuccess | ValidateResponseError> {
  if (inFlightValidate) return inFlightValidate;

  inFlightValidate = (async () => {
    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data?.error || "Token validation failed" };
      }

      return { jwt: data.jwt, status: data.status as UserStatus };
    } catch (e: any) {
      console.error("validateClerkToken error", e);
      return { error: e?.message || "Network error" };
    } finally {
      setTimeout(() => {
        inFlightValidate = null;
      }, 0);
    }
  })();

  return inFlightValidate;
}
