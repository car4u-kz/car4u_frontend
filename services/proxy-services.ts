import type {
  ProxyBatchCreatePayload,
  ProxyBatchCreateResult,
  ProxyCheckResult,
  ProxyListItem,
  ProxyUpdatePayload,
} from "@/client-pages/proxies/types";

export const getProxies = async (
  fetchWithAuth: typeof fetch,
): Promise<ProxyListItem[]> => {
  const response = await fetchWithAuth("/api/proxies", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to fetch proxies");
  }

  return response.json();
};

export const getProxyServices = async (
  fetchWithAuth: typeof fetch,
): Promise<string[]> => {
  const response = await fetchWithAuth("/api/proxies/services", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch proxy services");
  }

  return response.json();
};

export const addProxies = async (
  payload: ProxyBatchCreatePayload,
  fetchWithAuth: typeof fetch,
): Promise<ProxyBatchCreateResult> => {
  const response = await fetchWithAuth("/api/proxies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    return Promise.reject(
      new Error(error?.error || error?.message || "Something went wrong"),
    );
  }

  return response.json();
};

export const deleteProxy = async (
  proxy: string,
  fetchWithAuth: typeof fetch,
) => {
  const response = await fetchWithAuth("/api/proxies", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proxy }),
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const result = await response.json();
      message = result?.error || result?.message || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    return Promise.reject(new Error(message));
  }

  return true;
};

export const updateProxy = async (
  payload: ProxyUpdatePayload,
  fetchWithAuth: typeof fetch,
) => {
  const response = await fetchWithAuth("/api/proxies", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const result = await response.json();
      message = result?.error || result?.message || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    return Promise.reject(new Error(message));
  }

  return true;
};

export const checkProxy = async (
  proxy: string,
  fetchWithAuth: typeof fetch,
): Promise<ProxyCheckResult> => {
  const response = await fetchWithAuth("/api/proxies/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proxy }),
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const result = await response.json();
      message = result?.error || result?.message || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    return Promise.reject(new Error(message));
  }

  return response.json();
};
