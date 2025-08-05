import { camelCase } from "change-case/keys";

import type { CarAd, PaginatedCarAds } from "@/types";
import { SEARCH_QUERY as SQ } from "@/constants";

type RawCarAd = Record<string, string | number>;

export const getCars = async (
  {
    pageParam = 1,
    params,
    emailAddress,
  }: {
    pageParam: number;
    params: string;
    emailAddress: string;
  },
  fetchWithAuth: typeof fetch
): Promise<PaginatedCarAds> => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";

  const url = `${basePath}/api/adview?${params}&page=${pageParam}`;

  // TEMP SOLUTION
  if (params.includes(SQ.myAds)) {
    return Promise.resolve({
      carAds: [],
      hasMore: false,
      page: 0,
      pageSize: 10,
    });
  }

  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: emailAddress }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch car ads");
    }

    const data = await response.json();

    const { items = [], ...rest } = data;

    const carAds: CarAd[] = items.map((item: RawCarAd) => camelCase(item));

    return { carAds, ...rest };
  } catch (error) {
    console.error("Error fetching car ads:", error);
    return Promise.resolve({
      carAds: [],
      hasMore: false,
      page: 0,
      pageSize: 10,
    });
  }
};
