import { UserStatus } from "@/types/user";

type ValidateResponse =
  | { jwt: string; status: UserStatus }
  | { error: string };

export async function validateClerkToken(clerkToken: string): Promise<ValidateResponse> {
  try {
    const res = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { Authorization: `Bearer ${clerkToken}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Token validation failed");
    }

    return data;
  } catch (error) {
    console.error("AuthService validateClerkToken error:", error);
    throw error;
  }
}
