import { MenuItemAction } from "@/constants";

export type ActionPayloadType = {
  id?: number;
  state?: "activate" | "select";
  method?: MenuItemAction;
};

export type MenuItemConfig = {
  label: string;
  value: MenuItemAction;
};

export type AdFormData = {
  name: string;
  parsingTemplateId: string;
  url: string;
  mainImagePath: string;
  notDetectedCount: string;
  depthOfMonitoring: string;
  intervalSeconds: string;
  monitoringDurationDays: string;
  sessionId: string;
  accountId: string;
};
