export type ProxyListItem = {
  proxy: string;
  comment?: string | null;
  serviceNames: string[];
  runtimeStatuses: ProxyRuntimeStatus[];
};

export type ProxyRuntimeStatus = {
  serviceName: string;
  isActive: boolean;
  isCoolingDown: boolean;
  isQuarantined: boolean;
  pauseRemainingSeconds?: number | null;
  recentSuccessCount: number;
  recentFailureCount: number;
  recentTotalCount: number;
  consecutiveFailureCount: number;
  errorRatePercent: number;
  penaltyCooldownSeconds: number;
  stableSuccessCount: number;
  stableSuccessesToDecreasePenalty: number;
  status: "ready" | "active" | "cooling_down" | "quarantined" | "unknown" | string;
};

export type ProxyListResponse = {
  items: ProxyListItem[];
  summary: ProxySummary;
};

export type ProxySummary = {
  total: number;
  services: ProxyServiceSummary[];
};

export type ProxyServiceSummary = {
  serviceName: string;
  total: number;
  active: number;
  coolingDown: number;
  quarantined: number;
  ready: number;
};

export type ProxyBatchCreatePayload = {
  serviceNames: string[];
  proxiesText: string;
  comment?: string;
};

export type ProxyUpdatePayload = {
  proxy: string;
  serviceNames: string[];
  comment?: string;
};

export type ProxyBatchCreateResult = {
  addedCount: number;
  duplicateCount: number;
  invalidCount: number;
  failedCount: number;
  addedProxies: string[];
  duplicateProxies: string[];
  invalidLines: string[];
  failedProxies: string[];
};

export type ProxyCheckResult = {
  success: boolean;
  statusCode?: number | null;
  responseTimeMs: number;
  message: string;
  snippet?: string | null;
  url: string;
};
