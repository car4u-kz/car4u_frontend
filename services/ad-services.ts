import { MenuItemAction } from "@/constants";
import { AdFormData } from "@/client-pages/my-ads/types";

export const getAds = async () => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ad`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export const getAdFilterList = async () => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/adview/filters`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export const postAd = async (formData: AdFormData) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";

  const url = `${basePath}/api/our-ad`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      return Promise.reject(new Error(result?.error || "Something went wrong"));
    }

    return Promise.resolve(result);
  } catch (error) {
    console.log("Error durring posting an Ad:", error);
    return Promise.reject(
      error instanceof Error ? error : new Error("Something went wrong")
    );
  }
};

export const deleteAd = async (adId: number) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ad/delete`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      body: JSON.stringify({ id: adId }),
    });

    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export const changeAdState = async (payload: {
  id: number;
  action: MenuItemAction;
}) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ad/change-state`;

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
    console.log("Error durring changing state of an Ad:", error);
    return Promise.reject(
      error instanceof Error ? error : new Error("Something went wrong")
    );
  }
};

export const getParsingTemplates = async () => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/parsing-template/lookup`;

  try {
    const response = await fetch(url);

    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export const generateReport = async (adId: number) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/adview/report`;

  try {
    const response = await fetch(url, {
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
