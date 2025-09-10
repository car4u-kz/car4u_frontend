export type CarsPage = { carAds: any[]; hasMore: boolean; page: number };

export function getPageIndexForItem(globalIndex: number, pages: CarsPage[]) {
  let pos = globalIndex;
  for (let i = 0; i < pages.length; i++) {
    const len = pages[i].carAds.length;
    if (pos < len) return { pageIndex: i, indexInPage: pos };
    pos -= len;
  }
  return { pageIndex: -1, indexInPage: -1 };
}