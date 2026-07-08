"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import AdsTable from "./components/ads-table";
import TableRows from "./components/table-row";
import TableButtons from "./components/table-buttons";
import FiltersSidebar from "./components/filters-sidebar";

import { getCars } from "@/services/car-services";
import { getAdFilterList, getAdStats } from "@/services/ad-services";

import { SEARCH_QUERY as SQ } from "@/constants";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import {
  CarsPage,
  getPageIndexForItem,
} from "@/helpers/findPageIndexByItemIndex";
import { AdStatusStats, PaginatedCarAds } from "@/types";

const changeableHeader: Record<SQ, string> = {
  [SQ.all]: "Опубликовано",
  [SQ.new]: "Дата обнаружения",
  [SQ.archived]: "Помещено в архив",
  [SQ.pendingArchiveValidation]: "Отправлено на проверку",
  [SQ.notFound404]: "404",
  [SQ.myAds]: "Мои объявления",
};

const generateHeaderCells = (
  carSearchParam: SQ,
  sortBy: string | null,
  sortOrder: string | null,
  onDateSortClick: () => void,
) => {
  const firstHeader = changeableHeader[carSearchParam];
  const isActive = sortBy === "date";
  const arrow = !isActive ? "" : sortOrder === "asc" ? " ↑" : " ↓";

  return [
    {
      key: "published",
      className: "published-col",
      label: (
        <button
          type="button"
          onClick={onDateSortClick}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            font: "inherit",
            fontWeight: 700,
            color: "inherit",
          }}
        >
          {firstHeader}
          {arrow}
        </button>
      ),
    },
    { key: "car", className: "car-col", label: "Автомобиль" },
    { key: "year", className: "year-col", label: "Год" },
    { key: "price", className: "price-col", label: "Цена" },
    { key: "mileage", className: "mileage-col", label: "Пробег" },
    { key: "engine", className: "engine-col", label: "Двигатель" },
    { key: "gearbox", className: "gearbox-col", label: "КПП" },
    { key: "body", className: "body-col", label: "Кузов" },
    { key: "region", className: "region-col", label: "Регион" },
    { key: "actions", className: "actions-col", label: "" },
  ];
};

const AdsPage = ({ emailAddress }: { emailAddress: string }) => {
  const fetchWithAuth = useFetchWithAuth();
  const fetchWithAuthNoLoading = useFetchWithAuth({ trackLoading: false });
  const queryClient = useQueryClient();

  const [selectValue, setSelectValue] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const statusId = (searchParams.get("statusId") as SQ) || SQ.all;
  const stringParams = searchParams.toString();
  const templateId = searchParams.get("templateId");

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
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
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
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stringParams]);

  const headerCells = generateHeaderCells(
    statusId,
    sortBy,
    sortOrder,
    handleDateSortClick,
  );
  const items = data?.pages.flatMap((page) => page.carAds) ?? [];
  const totalCount = data?.pages?.[0]?.totalCount;

  const handleAccountClick = (clickedAccountId: string) => {
    const params = new URLSearchParams(searchParams);

    params.set("accountId", clickedAccountId);
    params.delete("adId");
    params.delete("page");

    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
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
    value: item.id || "",
    label: item.name,
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
  }, [mappedMenuItems, searchParams, queryFilterList, pathname]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
        gap: 2.5,
        alignItems: "start",
        width: "100%",
      }}
    >
      <Box sx={{ minWidth: 0, width: "100%" }}>
        <TableButtons
          stats={queryStats.data}
          isStatsLoading={queryStats.isLoading}
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

        <AdsTable
          headerCells={headerCells}
          dataLength={items.length}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          isInitialLoading={isFetching && !isFetchingNextPage && items.length === 0}
          isLoadingMore={isFetchingNextPage}
          isError={isError}
          isLoadMoreError={isFetchNextPageError}
          onFetchNext={() => fetchNextPage()}
          onRetry={() => {
            if (items.length > 0 && hasNextPage) {
              fetchNextPage();
              return;
            }

            refetch();
          }}
          tableRows={
            <TableRows
              statusId={statusId}
              items={items}
              onUpdate={handleUpdateItemPage}
              onAccountClick={handleAccountClick}
            />
          }
        />
      </Box>

      <Box
        sx={{
          width: 320,
          maxWidth: "100%",
          justifySelf: { xs: "stretch", lg: "end" },
        }}
      >
        <FiltersSidebar />
      </Box>
    </Box>
  );
};

export default AdsPage;
