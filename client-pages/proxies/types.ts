export type ProxyListItem = {
  proxy: string;
  comment?: string | null;
  serviceNames: string[];
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
