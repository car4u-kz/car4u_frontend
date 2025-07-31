export type CarAd = {
  dynamicInfoId: number;
  adId: number;
  adTitle: string;
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
};

export type PaginatedCarAds = {
  carAds: CarAd[];
  hasMore: boolean;
  page: number;
  pageSize: number;
};
