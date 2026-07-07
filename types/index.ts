export type CarAd = {
  dynamicInfoId: number;
  adId: number;
  adTitle: string;
  sellerUserId?: string;
  engineVolume: number;
  shortDescription: string;
  adUrl: string;
  adYear: number;
  dynamicPrice: number;
  adStatus: "string"; // TODO: Provide enum later
  lastCheckDate: string;
  latestAdUpdateDate: string;
  publicationDate: string;
  mileage: number;
  transmission: string;
  bodyType: string;
  region: string;
  fuelType: string;
  firstPhotoLink: string;
  isViewed: boolean,
};

export type PaginatedCarAds = {
  carAds: CarAd[];
  hasMore: boolean;
  page: number;
  pageSize: number;
};

export type AdStatusStats = {
  totalAds: number;
  newAds: number;
  archivedAds: number;
  pendingArchiveValidationAds: number;
  notFound404Ads: number;
  newAdsLast24Hours: number;
  archivedAdsLast24Hours: number;
  pendingArchiveValidationAdsLast24Hours: number;
  notFound404AdsLast24Hours: number;
};
