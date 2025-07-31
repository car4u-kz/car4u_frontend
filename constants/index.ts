export enum SEARCH_QUERY {
  all = "0",
  new = "1",
  archived = "2",
  myAds = "myAds",
}

export enum MenuItemAction {
  start = 0,
  stop = 1,
  delete = 2,
}

export enum Status {
  started = 0,
  stopped = 1,
  monitoringCompleted = 2,
}

export const statusLabels: Record<Status, string> = {
  [Status.started]: "Запущен",
  [Status.stopped]: "Остановлен",
  [Status.monitoringCompleted]: "Завершено",
};
