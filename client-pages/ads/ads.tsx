"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Checklist } from "@mui/icons-material";

import { Table } from "@/components";
import TableRows from "./components/table-row";
import TableButtons from "./components/table-buttons";

import { getCars } from "@/services/car-services";
import { getAdFilterList, getAdStats } from "@/services/ad-services";

import { SEARCH_QUERY as SQ } from "@/constants";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import {
  CarsPage,
  getPageIndexForItem,
} from "@/helpers/findPageIndexByItemIndex";
import { AdStatusStats, PaginatedCarAds } from "@/types";

const changebleHeader: Record<SQ, string> = {
  [SQ.all]: "Опубликовано",
  [SQ.new]: "Дата обнаружения",
  [SQ.archived]: "Помещено в архив",
  [SQ.pendingArchiveValidation]: "Отправлено на проверку",
  [SQ.notFound404]: "404",
  [SQ.myAds]: "Мои объявления",
};

const generateHeaderLabels = (
  carSeachParam: SQ,
  sortBy: string | null,
  sortOrder: string | null,
  onDateSortClick: () => void,
) => {
  const firstheader = changebleHeader[carSeachParam];
  const isActive = sortBy === "date";
  const arrow = !isActive ? "" : sortOrder === "asc" ? " ↑" : " ↓";

  return [
    <button
      type="button"
      onClick={onDateSortClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        font: "inherit",
        fontWeight: 500,
      }}
    >
      {firstheader}
      {arrow}
    </button>,
    <Checklist />,
    "Автомобиль",
    "Год",
    "Цена",
    "Пробег",
    "Двигатель",
    "КПП",
    "Кузов",
    "Регион",
    "",
  ];
};

const AdsPage = ({ emailAddress }: { emailAddress: string }) => {
  const fetchWithAuth = useFetchWithAuth();
  const fetchWithAuthNoLoading = useFetchWithAuth({ trackLoading: false });
  const queryClient = useQueryClient();

  const [visiblePages, setVisiblePages] = useState(1);
  const [selectValue, setSelectValue] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const statusId = (searchParams.get("statusId") as SQ) || SQ.all;
  const stringParams = searchParams.toString();
  const templateId = searchParams.get("templateId");
  const adId = searchParams.get("adId") ?? "";
  const accountId = searchParams.get("accountId") ?? "";

  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  const handleDateSortClick = () => {
    const params = new URLSearchParams(searchParams);

    const currentSortBy = params.get("sortBy");
    const currentSortOrder = params.get("sortOrder");

    if (currentSortBy !== "date") {
      params.set("sortBy", "date");
      params.set("sortOrder", "desc");
    } else {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    }

    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const queryFilterList = useQuery<{ id: number; name: string }[]>({
    queryKey: ["adview-filters"],
    queryFn: () => getAdFilterList(fetchWithAuthNoLoading),
    retry: false,
  });

  const queryStats = useQuery<AdStatusStats>({
    queryKey: ["adview-stats", templateId ?? ""],
    queryFn: () => getAdStats(templateId, fetchWithAuthNoLoading),
    retry: false,
  });

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["car-ads", stringParams],
    queryFn: ({ pageParam, queryKey }) =>
      getCars({ pageParam, params: queryKey[1], emailAddress }, fetchWithAuth),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  useEffect(() => {
    setVisiblePages(1);

    const key = ["car-ads", searchParams.toString()] as const;

    queryClient.setQueryData<InfiniteData<PaginatedCarAds>>(key, (old) => {
      if (!old) return old;
      return {
        pages: old.pages.slice(0, 1),
        pageParams: [(old.pageParams?.[0] as number) ?? 1],
      };
    });

    refetch();
  }, [templateId, refetch, queryClient, searchParams]);

  const headerLabels = generateHeaderLabels(
    statusId,
    sortBy,
    sortOrder,
    handleDateSortClick,
  );
  const items = data?.pages.slice(0, visiblePages).flatMap((p) => p.carAds);

  const onFetchNext = () => {
    setVisiblePages((prev) => prev + 1);
    fetchNextPage();
  };

  const handleUpdateItemPage = async (itemGlobalIndex: number) => {
    queryClient.setQueryData<InfiniteData<CarsPage>>(
      ["car-ads", stringParams],
      (old) => {
        if (!old) return old;

        const { pageIndex, indexInPage } = getPageIndexForItem(
          itemGlobalIndex,
          old.pages,
        );
        if (pageIndex < 0 || indexInPage < 0) return old;

        const pages = old.pages.slice();
        const page = pages[pageIndex];
        const carAds = page.carAds.slice();

        carAds[indexInPage] = { ...carAds[indexInPage], isViewed: true };
        pages[pageIndex] = { ...page, carAds };

        return { ...old, pages };
      },
    );
  };

  const mappedMenuItems = (queryFilterList.data ?? []).map((item) => ({
    value: !!item.id ? item.id : "",
    label: item?.name,
  }));

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const templateValue = params.get("templateId");
    const templates = mappedMenuItems.map((item) => item.value.toString());

    if (!templateValue) {
      setSelectValue("");
    }

    if (templateValue && !queryFilterList.isLoading) {
      if (templates.includes(templateValue)) {
        setSelectValue(templateValue);
      } else {
        params.delete("templateId");
        const newUrl = `${pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        setSelectValue("");
      }
    }
  }, [mappedMenuItems, searchParams, queryFilterList]);

  return (
    <Table
      dataLength={items?.length ?? 0}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNext={onFetchNext}
      hasNextPage={hasNextPage}
      headerLabels={headerLabels}
      visiblePages={visiblePages}
      tableRows={
        <TableRows
          statusId={statusId}
          items={items ?? []}
          onUpdate={handleUpdateItemPage}
        />
      }
      tableButtons={
        <TableButtons
          stats={queryStats.data}
          isStatsLoading={queryStats.isLoading}
          initialAdId={adId}
          initialAccountId={accountId}
          selectProps={{
            menuItems: mappedMenuItems,
            value: selectValue,
            handleChange: (e) => {
              const value = e.target.value;
              setSelectValue(value);

              const params = new URLSearchParams(searchParams);

              if (value) {
                params.set("templateId", value);
              } else {
                params.delete("templateId");
              }

              const newUrl = `${pathname}?${params.toString()}`;
              window.history.pushState({}, "", newUrl);
            },
          }}
        />
      }
    />
  );
};

export default AdsPage;
