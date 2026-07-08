"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Box, Skeleton, SxProps, Typography } from "@mui/material";
import { Button } from "@/components";
import { Select, SelectProps, TextInput } from "@/components/form";
import { SEARCH_QUERY as SQ } from "@/constants";
import { AdStatusStats } from "@/types";

type Props = {
  selectProps: SelectProps;
  stats?: AdStatusStats;
  isStatsLoading?: boolean;
  initialAdId?: string;
  initialAccountId?: string;
};

const formatDelta = (value: number | undefined) => {
  if (!value) {
    return "0 за 24ч";
  }

  return `+${value} за 24ч`;
};

const cardSx = {
  minWidth: 150,
  padding: 1.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "grey.300",
  backgroundColor: "grey.50",
};

const StatCard = ({
  label,
  value,
  delta,
}: {
  label: string;
  value: number | undefined;
  delta?: number;
}) => (
  <Box sx={cardSx}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
      {value ?? 0}
    </Typography>
    {typeof delta === "number" && (
      <Typography variant="caption" color="text.secondary">
        {formatDelta(delta)}
      </Typography>
    )}
  </Box>
);

const StatCardSkeleton = () => (
  <Box sx={cardSx}>
    <Skeleton variant="text" width="70%" height={20} />
    <Skeleton variant="text" width="45%" height={34} />
    <Skeleton variant="text" width="55%" height={18} />
  </Box>
);

const TableButtons = ({
  selectProps,
  stats,
  isStatsLoading = false,
  initialAdId = "",
  initialAccountId = "",
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [adId, setAdId] = useState(initialAdId);
  const [accountId, setAccountId] = useState(initialAccountId);

  useEffect(() => {
    setAdId(initialAdId);
  }, [initialAdId]);

  useEffect(() => {
    setAccountId(initialAccountId);
  }, [initialAccountId]);

  const statusId = searchParams.get("statusId") as string;

  const onClick = (btnType: SQ) => {
    const templateId = searchParams.get("templateId") as string;

    const query = new URLSearchParams({
      statusId: btnType,
    });

    if (templateId) {
      query.set("templateId", templateId);
    }

    const adIdValue = searchParams.get("adId");
    const accountIdValue = searchParams.get("accountId");

    if (adIdValue) {
      query.set("adId", adIdValue);
    }

    if (accountIdValue) {
      query.set("accountId", accountIdValue);
    }

    const url = `${pathname}?${query.toString()}`;

    window.history.pushState({}, "", url);
  };

  const sxProps = (btnName: string): SxProps => ({
    backgroundColor: btnName === statusId ? "white" : "black",
    color: btnName === statusId ? "black" : "white",
  });

  const applySearch = () => {
    const params = new URLSearchParams(searchParams);

    if (adId.trim()) {
      params.set("adId", adId.trim());
    } else {
      params.delete("adId");
    }

    if (accountId.trim()) {
      params.set("accountId", accountId.trim());
    } else {
      params.delete("accountId");
    }

    const url = `${pathname}?${params.toString()}`;
    window.history.pushState({}, "", url);
  };

  const resetSearch = () => {
    setAdId("");
    setAccountId("");

    const params = new URLSearchParams(searchParams);
    params.delete("adId");
    params.delete("accountId");
    const url = `${pathname}?${params.toString()}`;
    window.history.pushState({}, "", url);
  };

  const showStatsSkeleton = isStatsLoading && !stats;

  return (
    <Box padding={2}>
      <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
        {showStatsSkeleton ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Всего объявлений" value={stats?.totalAds} />
            <StatCard
              label="Новые"
              value={stats?.newAds}
              delta={stats?.newAdsLast24Hours}
            />
            <StatCard
              label="Ожидают архивирования"
              value={stats?.pendingArchiveValidationAds}
              delta={stats?.pendingArchiveValidationAdsLast24Hours}
            />
            <StatCard
              label="В архиве"
              value={stats?.archivedAds}
              delta={stats?.archivedAdsLast24Hours}
            />
            <StatCard
              label="404"
              value={stats?.notFound404Ads}
              delta={stats?.notFound404AdsLast24Hours}
            />
          </>
        )}
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap">
        <Button size="small" sx={sxProps(SQ.all)} onClick={() => onClick(SQ.all)}>
          Все
        </Button>
        <Button size="small" sx={sxProps(SQ.new)} onClick={() => onClick(SQ.new)}>
          Новые
        </Button>
        <Button
          size="small"
          sx={sxProps(SQ.archived)}
          onClick={() => onClick(SQ.archived)}
        >
          Архивные
        </Button>
        <Button
          size="small"
          sx={sxProps(SQ.pendingArchiveValidation)}
          onClick={() => onClick(SQ.pendingArchiveValidation)}
        >
          Ожид. архивирования
        </Button>
        <Button
          size="small"
          sx={sxProps(SQ.notFound404)}
          onClick={() => onClick(SQ.notFound404)}
        >
          404
        </Button>
      </Box>
      <Box
        mt={2}
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "minmax(240px, 280px) 1fr 1fr auto auto" }}
        gap={1.5}
        alignItems="center"
      >
        <Select {...selectProps} />
        <TextInput
          label="Ad ID"
          value={adId}
          onChange={(e) => setAdId(e.target.value)}
          placeholder="Ad ID"
        />
        <TextInput
          label="Account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="Account ID"
        />
        <Button size="small" onClick={applySearch}>
          Search
        </Button>
        <Button size="small" onClick={resetSearch}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default TableButtons;
