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
