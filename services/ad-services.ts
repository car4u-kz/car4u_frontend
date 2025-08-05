import { MenuItemAction } from "@/constants";
import { AdFormData } from "@/client-pages/my-ads/types";

export const getAds = async (fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ad`;

  try {
    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch ads");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching ads:", error);
    throw error;
  }
};

export const getAdFilterList = async (fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/adview/filters`;

  try {
    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch filter list");
    }

    return await response.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const postAd = async (formData: AdFormData, fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ad`;

  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      return Promise.reject(new Error(result?.error || "Something went wrong"));
    }

    return result;
  } catch (error) {
    console.error("Error during posting an Ad:", error);
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const deleteAd = async (adId: number, fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ad/delete`;

  try {
    const response = await fetchWithAuth(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: adId }),
    });

    return await response.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const changeAdState = async (
  payload: { id: number; action: MenuItemAction },
  fetchWithAuth: typeof fetch
) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ad/change-state`;

  try {
    const response = await fetchWithAuth(url, {
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
    console.log("Error during changing state of an Ad:", error);
    return Promise.reject(
      error instanceof Error ? error : new Error("Something went wrong")
    );
  }
};

export const getParsingTemplates = async (fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template/lookup`;

  try {
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error("Failed to fetch parsing templates");
    }

    return await response.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const generateReport = async (
  adId: number,
  fetchWithAuth: typeof fetch
) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/adview/report`;

  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: adId }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate report");
    }
    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `report_${adId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.log(error);
  }
};
