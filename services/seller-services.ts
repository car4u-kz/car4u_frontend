import type { SellerProfile, SellerProfileUpdatePayload } from "@/types";

export const updateSellerProfile = async (
  payload: SellerProfileUpdatePayload,
  fetchWithAuth: typeof fetch,
): Promise<SellerProfile> => {
  const response = await fetchWithAuth("/api/sellers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to update seller profile";

    try {
      const result = await response.json();
      message = result?.errorMessage || result?.error || result?.message || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  return response.json();
};
