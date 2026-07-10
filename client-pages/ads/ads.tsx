"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
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
import { IconButton } from "@/components";

import { getCars } from "@/services/car-services";
import {
  exportAdsArchiveWithFilters,
  getAdFilterList,
  getAdStats,
} from "@/services/ad-services";

import { SEARCH_QUERY as SQ } from "@/constants";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import {
  CarsPage,
  getPageIndexForItem,
} from "@/helpers/findPageIndexByItemIndex";
import { AdStatusStats, AdViewFiltersResponse } from "@/types";

const changeableHeader: Record<SQ, string> = {
  [SQ.all]: "Опубликовано",
  [SQ.new]: "Дата",
  [SQ.archived]: "В архиве",
  [SQ.pendingArchiveValidation]: "На проверке",
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExpandFiltersButton, setShowExpandFiltersButton] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const statusId = (searchParams.get("statusId") as SQ) || SQ.all;
  const stringParams = searchParams.toString();
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const statsParams = new URLSearchParams(searchParams.toString());
  statsParams.delete("statusId");
  statsParams.delete("page");
  statsParams.delete("sortBy");
  statsParams.delete("sortOrder");
  const statsQueryString = statsParams.toString();
  const hasActiveFilters = [
    "adId",
    "accountId",
    "accountAdsFrom",
    "accountAdsTo",
    "publishedFrom",
    "publishedTo",
    "priceFrom",
    "priceTo",
    "mileageFrom",
    "mileageTo",
    "yearFrom",
    "yearTo",
    "region",
    "brandId",
    "modelId",
    "bodyTypeId",
  ].some((key) => !!searchParams.get(key));

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

  const queryFilterList = useQuery<AdViewFiltersResponse>({
    queryKey: ["adview-filters"],
    queryFn: () => getAdFilterList(fetchWithAuthNoLoading),
    retry: false,
  });

  const queryStats = useQuery<AdStatusStats>({
    queryKey: ["adview-stats", statsQueryString],
    queryFn: () => getAdStats(new URLSearchParams(statsQueryString), fetchWithAuthNoLoading),
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

  useEffect(() => {
    const handleScroll = () => {
      setShowExpandFiltersButton(window.scrollY < 220);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams);

    [
      "adId",
      "accountId",
      "accountAdsFrom",
      "accountAdsTo",
      "publishedFrom",
      "publishedTo",
      "priceFrom",
      "priceTo",
      "mileageFrom",
      "mileageTo",
      "yearFrom",
      "yearTo",
      "region",
      "brandId",
      "modelId",
      "bodyTypeId",
      "page",
    ].forEach((key) => params.delete(key));

    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const exportParams = new URLSearchParams(searchParams);
      exportParams.delete("statusId");
      exportParams.delete("page");
      exportParams.delete("sortBy");
      exportParams.delete("sortOrder");

      await exportAdsArchiveWithFilters(exportParams, fetchWithAuth);
    } catch (error) {
      console.error("Ошибка при выгрузке объявлений", error);
    } finally {
      setIsExporting(false);
    }
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

  const mappedMenuItems = (queryFilterList.data?.templates ?? []).map((item) => ({
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
        gridTemplateColumns: {
          xs: "1fr",
          lg: filtersOpen ? "minmax(0, 1fr) 320px" : "minmax(0, 1fr)",
        },
        gap: filtersOpen ? 2.5 : 0,
        alignItems: "start",
        width: "100%",
        transition: "grid-template-columns 220ms ease, gap 220ms ease",
      }}
    >
      <Box sx={{ minWidth: 0, width: "100%" }}>
        <TableButtons
          stats={queryStats.data}
          isStatsLoading={queryStats.isLoading}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
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

      {filtersOpen ? (
        <Box
          sx={{
            width: 320,
            maxWidth: "100%",
            justifySelf: { xs: "stretch", lg: "end" },
            mt: { xs: 0, lg: "60px" },
            opacity: 1,
            transform: "translateX(0)",
            transition: "opacity 180ms ease, transform 220ms ease",
          }}
        >
          <FiltersSidebar
            onCollapse={() => setFiltersOpen(false)}
            regions={queryFilterList.data?.regions ?? []}
            brands={queryFilterList.data?.brands ?? []}
            models={queryFilterList.data?.models ?? []}
            bodyTypes={queryFilterList.data?.bodyTypes ?? []}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </Box>
      ) : showExpandFiltersButton ? (
        <IconButton
          onClick={() => setFiltersOpen(true)}
          aria-label="Показать фильтры"
          sx={{
            position: "fixed",
            right: { xs: 16, md: 24 },
            top: { xs: 88, md: 96 },
            zIndex: 20,
            width: 42,
            height: 42,
            borderRadius: "12px",
            border: "1px solid #dbe1ea",
            background: "#ffffff",
            color: "#2563eb",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
            transition: "transform 160ms ease, box-shadow 160ms ease",
            "&:hover": {
              background: "#f8fafc",
              transform: "translateY(-1px)",
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.16)",
            },
          }}
        >
          <TuneRoundedIcon fontSize="small" />
        </IconButton>
      ) : null}
    </Box>
  );
};

export default AdsPage;
