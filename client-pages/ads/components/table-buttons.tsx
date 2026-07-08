"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { Box, Paper, Skeleton, SxProps, Typography } from "@mui/material";
import { Button } from "@/components";
import { Select, SelectProps } from "@/components/form";
import { SEARCH_QUERY as SQ } from "@/constants";
import { AdStatusStats } from "@/types";

type Props = {
  selectProps: SelectProps;
  stats?: AdStatusStats;
  isStatsLoading?: boolean;
};

const formatDelta = (value: number | undefined) => {
  if (!value) {
    return "0 за 24ч";
  }

  return `+${value} за 24ч`;
};

const cardSx = {
  minWidth: 150,
  padding: 1.75,
  borderRadius: 3,
  border: "1px solid",
  borderColor: "grey.300",
  background:
    "linear-gradient(180deg, rgba(250,250,250,1) 0%, rgba(243,244,246,1) 100%)",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
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
    <Typography variant="h6" fontWeight={700} lineHeight={1.15}>
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
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusId = searchParams.get("statusId") as string;

  const onClick = (btnType: SQ) => {
    const query = new URLSearchParams(searchParams);
    query.set("statusId", btnType);
    query.delete("page");

    window.history.pushState({}, "", `${pathname}?${query.toString()}`);
  };

  const sxProps = (btnName: string): SxProps => ({
    borderRadius: 999,
    px: 1.75,
    backgroundColor: btnName === statusId ? "#111827" : "white",
    color: btnName === statusId ? "white" : "#111827",
    border: "1px solid",
    borderColor: btnName === statusId ? "#111827" : "grey.300",
    boxShadow: btnName === statusId ? "0 10px 24px rgba(17,24,39,0.14)" : "none",
    "&:hover": {
      backgroundColor: btnName === statusId ? "#111827" : "grey.100",
    },
  });

  const showStatsSkeleton = isStatsLoading && !stats;

  return (
    <Box padding={2.5}>
      <Box display="flex" gap={1.5} flexWrap="wrap" mb={2.25}>
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

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.300",
          backgroundColor: "white",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
        >
          <Box sx={{ minWidth: { xs: "100%", md: 280 }, flexShrink: 0 }}>
            <Select {...selectProps} />
          </Box>
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
      </Paper>
    </Box>
  );
};

export default TableButtons;
