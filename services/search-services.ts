// Alias for parsing-template
import { SearchFormData } from "@/client-pages/search/types";
import { MenuItemAction } from "@/constants";

export const postSearch = async (
  formData: SearchFormData
): Promise<true | Error> => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template`;

  try {
    const response = await fetch(url, {
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
    return Promise.resolve(true);
  } catch (error) {
    console.log("Error during posting a search:", error);
    return Promise.reject(
      error instanceof Error ? error : new Error("Something went wrong")
    );
  }
};

export const getParsingTemplates = async () => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export const changeParsingTemplateState = async (payload: {
  id: number;
  action: MenuItemAction;
}) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template/change-state`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return Promise.reject(new Error(result?.error || "Something went wrong"));
    }

    return Promise.resolve(result);
  } catch (error) {
    console.log("Error durring changing state of parsing-template:", error);
    return Promise.reject(
      error instanceof Error ? error : new Error("Something went wrong")
    );
  }
};
