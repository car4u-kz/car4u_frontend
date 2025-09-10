"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Checklist } from "@mui/icons-material";

import { Table } from "@/components";
import TableRows from "./components/table-row";
import TableButtons from "./components/table-buttons";

import { getCars } from "@/services/car-services";
import { getAdFilterList } from "@/services/ad-services";

import { SEARCH_QUERY as SQ } from "@/constants";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { CarsPage, getPageIndexForItem } from "@/helpers/findPageIndexByItemIndex";
import { PaginatedCarAds } from "@/types";

const changebleHeader: Record<SQ, string> = {
  [SQ.all]: "Опубликовано",
  [SQ.new]: "Дата Обнаружения",
  [SQ.archived]: "Помещено В Архив",
  [SQ.myAds]: "Мои Объявления",
};

const generateHeaderLabels = (carSeachParam: SQ) => {
  const firstheader = changebleHeader[carSeachParam];

  return [
    firstheader,
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
  const queryClient = useQueryClient();

  const [visiblePages, setVisiblePages] = useState(1);
  const [selectValue, setSelectValue] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const statusId = searchParams.get("statusId") as SQ;
  const stringParams = searchParams.toString();
  const templateId = searchParams.get("templateId");

  const queryFilterList = useQuery<{ id: number; name: string }[]>({
    queryKey: ["adview-filters"],
    queryFn: () => getAdFilterList(fetchWithAuth),
    retry: false,
  });

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["car-ads", stringParams],
      queryFn: ({ pageParam, queryKey }) =>
        getCars(
          { pageParam, params: queryKey[1], emailAddress },
          fetchWithAuth
        ),
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
        pageParams: [((old.pageParams?.[0] as number) ?? 1)],
      };
    });

    refetch();
  }, [templateId, refetch, queryClient, searchParams]);

  const headerLabels = generateHeaderLabels(statusId);
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
          old.pages
        );
        if (pageIndex < 0 || indexInPage < 0) return old;
  
        const pages = old.pages.slice();
        const page = pages[pageIndex];
        const carAds = page.carAds.slice();
  
        carAds[indexInPage] = { ...carAds[indexInPage], isViewed: true };
        pages[pageIndex] = { ...page, carAds };
  
        return { ...old, pages };
      }
    );
  };

  const mappedMenuItems = (queryFilterList.data ?? []).map((item) => ({
    value: !!item.id ? item.id : "",
    label: item?.name,
  }));

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const templateValue = params.get("templateId");
    const templates = mappedMenuItems.map(item => item.value.toString());

    if (!templateValue) {
      setSelectValue('');
    }

    if (templateValue && !queryFilterList.isLoading) {
      if (templates.includes(templateValue)) {
        setSelectValue(templateValue);
      } else {
        params.delete("templateId");
        const newUrl = `${pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        setSelectValue('');
      }
    }
  }, [mappedMenuItems, searchParams, queryFilterList])

  return (
    <Table
      dataLength={items?.length ?? 0}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNext={onFetchNext}
      hasNextPage={hasNextPage}
      headerLabels={headerLabels}
      visiblePages={visiblePages}
      tableRows={<TableRows statusId={statusId} items={items!} onUpdate={handleUpdateItemPage} />}
      tableButtons={
        <TableButtons
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
