import type {
  CatalogDescriptionKeyword,
  CatalogDescriptionKeywordPayload,
  CatalogDescriptionKeywordProgress,
  CatalogDescriptionKeywordRequeueResult,
} from "@/client-pages/catalog-keywords/types";

const readError = async (response: Response) => {
  let message = "Something went wrong";

  try {
    const result = await response.json();
    message =
      result?.errorMessage ||
      result?.error ||
      result?.message ||
      message;
  } catch {
    const text = await response.text();
    message = text || message;
  }

  return new Error(message);
};

export const getCatalogDescriptionKeywords = async (
  fetchWithAuth: typeof fetch,
): Promise<CatalogDescriptionKeyword[]> => {
  const response = await fetchWithAuth("/api/catalog-description-keywords", {
    method: "GET",
  });

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
};

export const getCatalogDescriptionKeywordProgress = async (
  fetchWithAuth: typeof fetch,
): Promise<CatalogDescriptionKeywordProgress> => {
  const response = await fetchWithAuth(
    "/api/catalog-description-keywords/progress",
    { method: "GET" },
  );

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
};

export const createCatalogDescriptionKeyword = async (
  payload: CatalogDescriptionKeywordPayload,
  fetchWithAuth: typeof fetch,
): Promise<CatalogDescriptionKeyword> => {
  const response = await fetchWithAuth("/api/catalog-description-keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
};

export const updateCatalogDescriptionKeyword = async (
  id: number,
  payload: CatalogDescriptionKeywordPayload,
  fetchWithAuth: typeof fetch,
): Promise<CatalogDescriptionKeyword> => {
  const response = await fetchWithAuth(
    `/api/catalog-description-keywords/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
};

export const setCatalogDescriptionKeywordActive = async (
  id: number,
  isActive: boolean,
  fetchWithAuth: typeof fetch,
): Promise<CatalogDescriptionKeyword> => {
  const action = isActive ? "activate" : "deactivate";
  const response = await fetchWithAuth(
    `/api/catalog-description-keywords/${id}/${action}`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
};

export const deleteCatalogDescriptionKeyword = async (
  id: number,
  fetchWithAuth: typeof fetch,
) => {
  const response = await fetchWithAuth(
    `/api/catalog-description-keywords/${id}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw await readError(response);
  }

  return true;
};

export const requeueCatalogDescriptionKeywords = async (
  fetchWithAuth: typeof fetch,
): Promise<CatalogDescriptionKeywordRequeueResult> => {
  const response = await fetchWithAuth(
    "/api/catalog-description-keywords/requeue",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetAlreadyCheckedDescriptions: true }),
    },
  );

  if (!response.ok) {
    throw await readError(response);
  }

  return response.json();
};
