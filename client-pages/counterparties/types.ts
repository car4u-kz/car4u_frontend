export type CounterpartyItem = {
  userId: string;
  accountLabel: string;
  displayName?: string;
  category?: string;
  allAdsCount: number;
  newAdsCount: number;
  archivedAdsCount: number;
  notFound404AdsCount: number;
  allTurnover: number;
  newTurnover: number;
  archivedTurnover: number;
  notFound404Turnover: number;
  allAdsDelta: number;
  newAdsDelta: number;
  archivedAdsDelta: number;
  notFound404AdsDelta: number;
  allTurnoverDelta: number;
  newTurnoverDelta: number;
  archivedTurnoverDelta: number;
  notFound404TurnoverDelta: number;
  averageCheck?: number | null;
  regions: string[];
  specializations: string[];
};

export type CounterpartiesResponse = {
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalCount: number;
  items: CounterpartyItem[];
};

export type CounterpartyFilters = {
  allAdsFrom?: number;
  allAdsTo?: number;
  archivedAdsFrom?: number;
  archivedAdsTo?: number;
  category?: string;
  region?: string;
  brandId?: number;
  modelId?: number;
  sortBy?: "allAdsCount" | "archivedAdsCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};
