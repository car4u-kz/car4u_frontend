export type ProxyListItem = {
  proxy: string;
  serviceName: string;
};

export type ProxyBatchCreatePayload = {
  serviceName: string;
  proxiesText: string;
};

export type ProxyBatchCreateResult = {
  addedCount: number;
  duplicateCount: number;
  invalidCount: number;
  addedProxies: string[];
  duplicateProxies: string[];
  invalidLines: string[];
};

export type ProxyCheckResult = {
  success: boolean;
  isBlocked: boolean;
  statusCode?: number | null;
  responseTimeMs: number;
  message: string;
  snippet?: string | null;
  url: string;
};
