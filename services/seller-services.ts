import type { SellerProfile, SellerProfileUpdatePayload } from "@/types";
import type {
  CounterpartiesResponse,
  CounterpartyFilters,
} from "@/client-pages/counterparties/types";

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

export const getCounterparties = async (
  filters: CounterpartyFilters,
  fetchWithAuth: typeof fetch,
): Promise<CounterpartiesResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  const response = await fetchWithAuth(`/api/sellers/counterparties${query ? `?${query}` : ""}`, {
    method: "GET",
  });

  if (!response.ok) {
    let message = "Failed to fetch counterparties";

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
