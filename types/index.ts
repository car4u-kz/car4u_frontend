export type CarAd = {
  dynamicInfoId: number;
  parsingTemplateId?: number;
  adId: number;
  adTitle: string;
  sellerUserId?: string;
  sellerDisplayName?: string;
  sellerPhone1?: string;
  sellerPhone2?: string;
  sellerPhone3?: string;
  sellerNotes?: string;
  sellerAccountType?: string;
  sellerAccountRegionId?: number;
  sellerAccountRegionName?: string;
  accountAdsCount?: number;
  accountAvgPrice?: number;
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
  otherMonitoringsCount: number;
};

export type PaginatedCarAds = {
  carAds: CarAd[];
  hasMore: boolean;
  page: number;
  pageSize: number;
  totalCount?: number;
};

export type AdStatusStats = {
  totalAds: number;
  allTabAds: number;
  newAds: number;
  archivedAds: number;
  pendingArchiveValidationAds: number;
  notFound404Ads: number;
  newAdsLast24Hours: number;
  archivedAdsLast24Hours: number;
  pendingArchiveValidationAdsLast24Hours: number;
  notFound404AdsLast24Hours: number;
};

export type SellerProfile = {
  userId: string;
  displayName?: string;
  phone1?: string;
  phone2?: string;
  phone3?: string;
  notes?: string;
  accountType?: string;
  accountRegionId?: number;
  accountRegionName?: string;
};

export type SellerProfileUpdatePayload = SellerProfile;

export type TemplateFilterOption = {
  id: number | null;
  name: string;
};

export type AdLookupOption = {
  id: number;
  name: string;
};

export type AdModelLookupOption = {
  id: number;
  name: string;
  brandId: number;
};

export type AdViewFiltersResponse = {
  templates: TemplateFilterOption[];
  regions: string[];
  brands: AdLookupOption[];
  models: AdModelLookupOption[];
  bodyTypes: AdLookupOption[];
  sellerRegions: AdLookupOption[];
};

export type CatalogAdMonitoring = {
  catalogAdTemplateId: number;
  templateId: number;
  templateName: string;
  templateUrl: string;
  statusId: number;
  statusName: string;
  firstSeenAt: string;
  lastSeenAt?: string | null;
  lastCheckDate?: string | null;
  lastMissingAt?: string | null;
  position?: number | null;
  previousPosition?: number | null;
};

export type CatalogAdDuplicateHistoryItem = {
  catalogAdId: number;
  parentCatalogAdId?: number | null;
  externalAdId: string;
  title: string;
  url: string;
  currentStatusId: number;
  currentStatusName: string;
  templateId: number;
  templateName: string;
  templateUrl: string;
  firstSeenAt: string;
  lastCheckDate?: string | null;
  currentStatusSince?: string | null;
};

export type CatalogAdStatusTimelineEvent = {
  statusId: number;
  statusName: string;
  templateId: number;
  templateName: string;
  templateUrl: string;
  capturedAt: string;
  lastCheckDate?: string | null;
  reason?: string | null;
};

export type CatalogAdStatusTimeline = {
  catalogAdId: number;
  externalAdId: string;
  title: string;
  url: string;
  events: CatalogAdStatusTimelineEvent[];
};

export type CatalogAdPositionHistoryPoint = {
  position: number;
  capturedAt: string;
};

export type CatalogAdPositionHistory = {
  catalogAdId: number;
  externalAdId: string;
  title: string;
  templateId: number;
  templateName: string;
  templateUrl: string;
  points: CatalogAdPositionHistoryPoint[];
};
