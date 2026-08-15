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
  monitoringBoundaryType: "page" | "position";
  intervalSeconds: string;
  timingRepublishingEnabled: boolean;
  timingRepublishingIntervalHours: string;
  monitoringDurationDays: string;
  price: string;
  isNewAuto: boolean;
  toOrder: boolean;
  description: string;
  hasDetails: boolean;
  sessionId: string;
  accountId: string;
};

export type OurAdItem = Omit<AdFormData, "sessionId" | "accountId"> & {
  id: number;
  status: number;
  displayStatus?: string;
  displayStatusText?: string;
  displayStatusReason?: string | null;
  lastEventType?: string | null;
  lastEventReason?: string | null;
  lastEventAt?: string | null;
  Description?: string | null;
  desctiption?: string | null;
};

export type OurAdMonitoringEvent = {
  id: number;
  ourAdId: number;
  externalAdId: string;
  eventType: string;
  reason?: string | null;
  message: string;
  detailsJson?: string | null;
  createdAt: string;
};
