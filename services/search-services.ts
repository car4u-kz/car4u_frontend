// Alias for parsing-template
import { SearchFormData } from "@/client-pages/search/types";
import { MenuItemAction } from "@/constants";

export const postSearch = async (
  formData: SearchFormData,
  fetchWithAuth: typeof fetch
): Promise<true | Error> => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template`;

  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      return Promise.reject(
        new Error(error?.error || error?.message || "Something went wrong")
      );
    }

    return true;
  } catch (error) {
    console.error("Error during posting a search:", error);
    return Promise.reject(
      error instanceof Error ? error : new Error("Something went wrong")
    );
  }
};

export const getParsingTemplates = async (fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template`;

  try {
    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch parsing templates");
    }

    return await response.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const changeParsingTemplateState = async (
  payload: {
    id: number;
    action: MenuItemAction;
  },
  fetchWithAuth: typeof fetch
) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template/change-state`;

  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return Promise.reject(new Error(result?.error || "Something went wrong"));
    }

    return Promise.resolve(result);
  } catch (error) {
    console.log("Error during changing state of parsing-template:", error);
    return Promise.reject(
      error instanceof Error ? error : new Error("Something went wrong")
    );
  }
};
