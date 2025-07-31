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

export type SearchFormData = {
  source: string;
  url: string;
  searchName: string;
  intervalSeconds: string;
  searchDurationDays: string;
};
