"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Checklist } from "@mui/icons-material";

import { Table } from "@/components";
import TableRows from "./components/table-row";
import TableButtons from "./components/table-buttons";

import { getCars } from "@/services/car-services";
import { getAdFilterList } from "@/services/ad-services";

import { SEARCH_QUERY as SQ } from "@/constants";

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
  const [visiblePages, setVisiblePages] = useState(1);
  const [selectValue, setSelectValue] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const statusId = searchParams.get("statusId") as SQ;
  const stringParams = searchParams.toString();

  const queryFilterList = useQuery<{ id: number; name: string }[]>({
    queryKey: ["adview-filters"],
    queryFn: getAdFilterList,
  });

  useEffect(() => {
    setVisiblePages(1);
  }, [searchParams]);

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["car-ads", stringParams],
      queryFn: ({ pageParam, queryKey }) =>
        getCars({ pageParam, params: queryKey[1], emailAddress }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
    });

  const headerLabels = generateHeaderLabels(statusId);
  const items = data?.pages.slice(0, visiblePages).flatMap((p) => p.carAds);

  const onFetchNext = () => {
    setVisiblePages((prev) => prev + 1);
    fetchNextPage();
  };
  const mappedMenuItems = (queryFilterList.data ?? []).map((item) => ({
    value: !!item.id ? item.id : "",
    label: item?.name,
  }));

  return (
    <Table
      dataLength={items?.length ?? 0}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNext={onFetchNext}
      hasNextPage={hasNextPage}
      headerLabels={headerLabels}
      visiblePages={visiblePages}
      tableRows={<TableRows statusId={statusId} items={items!} />}
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
