"use client";

import { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  AccessTimeFilledRounded,
  AddCircleRounded,
  DirectionsCarFilledRounded,
  Inventory2Rounded,
  ReportProblemRounded,
} from "@mui/icons-material";
import { Box, Skeleton, SxProps, Typography } from "@mui/material";

import { Button } from "@/components";
import { Select, SelectProps } from "@/components/form";
import { SEARCH_QUERY as SQ } from "@/constants";
import { AdStatusStats } from "@/types";

type Props = {
  selectProps: SelectProps;
  summaryStats?: AdStatusStats;
  statusStats?: AdStatusStats;
  isSummaryStatsLoading?: boolean;
  isStatusStatsLoading?: boolean;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
};

const numberFormatter = new Intl.NumberFormat("ru-RU");

const formatNumber = (value: number | undefined) =>
  numberFormatter.format(value ?? 0);

const formatDelta = (value: number | undefined) => {
  const formatted = numberFormatter.format(value ?? 0);
  return (
    <>
      <strong>+{formatted}</strong> за 24ч
    </>
  );
};

const getStatusCount = (status: SQ, stats?: AdStatusStats) => {
  switch (status) {
    case SQ.all:
      return stats?.allTabAds;
    case SQ.new:
      return stats?.newAds;
    case SQ.archived:
      return stats?.archivedAds;
    case SQ.pendingArchiveValidation:
      return stats?.pendingArchiveValidationAds;
    case SQ.notFound404:
      return stats?.notFound404Ads;
    default:
      return undefined;
  }
};

const statCardSx = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minHeight: "80px",
  padding: "16px 18px",
  background: "#ffffff",
  border: "1px solid #e6eaf0",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
};

const statIconSx = (background: string, color: string) => ({
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background,
  color,
});

const statLabelSx = {
  fontSize: 13,
  lineHeight: "18px",
  fontWeight: 500,
  color: "#64748b",
};

const statValueSx = {
  mt: "2px",
  fontSize: 20,
  lineHeight: "24px",
  fontWeight: 700,
  color: "#0f172a",
  letterSpacing: "-0.02em",
};

const statDeltaSx = {
  mt: "2px",
  fontSize: 12,
  lineHeight: "16px",
  fontWeight: 500,
  color: "#64748b",
  "& strong": {
    color: "#2563eb",
    fontWeight: 600,
  },
};

const StatCard = ({
  label,
  value,
  delta,
  icon,
  iconBackground,
  iconColor,
}: {
  label: string;
  value: number | undefined;
  delta?: number;
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
}) => (
  <Box sx={statCardSx}>
    <Box sx={statIconSx(iconBackground, iconColor)}>{icon}</Box>
    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Typography sx={statLabelSx}>{label}</Typography>
      <Typography sx={statValueSx}>{formatNumber(value)}</Typography>
      {typeof delta === "number" && (
        <Typography component="div" sx={statDeltaSx}>
          {formatDelta(delta)}
        </Typography>
      )}
    </Box>
  </Box>
);

const StatCardSkeleton = () => (
  <Box sx={statCardSx}>
    <Skeleton variant="circular" width={38} height={38} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="70%" height={18} />
      <Skeleton variant="text" width="44%" height={30} />
      <Skeleton variant="text" width="54%" height={16} />
    </Box>
  </Box>
);

const TableButtons = ({
  selectProps,
  summaryStats,
  statusStats,
  isSummaryStatsLoading = false,
  isStatusStatsLoading = false,
  hasActiveFilters = false,
  onResetFilters,
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusId = (searchParams.get("statusId") as string) || SQ.all;

  const onClick = (btnType: SQ) => {
    const query = new URLSearchParams(searchParams);
    query.set("statusId", btnType);
    query.delete("page");

    window.history.pushState({}, "", `${pathname}?${query.toString()}`);
  };

  const statusButtonSx = (btnName: string): SxProps => ({
    height: 38,
    minHeight: 38,
    px: 0.85,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: "1px solid",
    borderColor: btnName === statusId ? "#0f172a" : "#e2e8f0",
    background: btnName === statusId ? "#0f172a" : "#ffffff",
    color: btnName === statusId ? "#ffffff" : "#0f172a",
    fontSize: 13,
    fontWeight: 600,
    textTransform: "none",
    cursor: "pointer",
    boxShadow:
      btnName === statusId
        ? "0 4px 10px rgba(15, 23, 42, 0.14)"
        : "none",
    transition:
      "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
    "&:hover": {
      background: btnName === statusId ? "#0f172a" : "#f8fafc",
      borderColor: btnName === statusId ? "#0f172a" : "#cbd5e1",
      transform: "translateY(-1px)",
    },
  });

  const statusCountBadgeSx = (btnName: string): SxProps => ({
    minWidth: 34,
    height: 28,
    px: 1.15,
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: btnName === statusId ? "rgba(255, 255, 255, 0.16)" : "#f8fafc",
    color: btnName === statusId ? "#ffffff" : "#334155",
    border: btnName === statusId ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #dbe1ea",
    boxShadow: btnName === statusId ? "inset 0 1px 0 rgba(255, 255, 255, 0.08)" : "none",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.01em",
  });

  const showStatsSkeleton = isSummaryStatsLoading && !summaryStats;
  const showStatusCountSkeleton = isStatusStatsLoading && !statusStats;

  const StatusButton = ({
    value,
    label,
  }: {
    value: SQ;
    label: string;
  }) => (
    <Button size="small" sx={statusButtonSx(value)} onClick={() => onClick(value)}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "9px",
          pl: 1.45,
          pr: 0.45,
        }}
      >
        <Box component="span">{label}</Box>
        <Box component="span" sx={statusCountBadgeSx(value)}>
          {showStatusCountSkeleton ? "..." : formatNumber(getStatusCount(value, statusStats))}
        </Box>
      </Box>
    </Button>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        p: 0,
        mb: 2,
        background: "transparent",
      }}
    >
      <Typography
        sx={{
          fontSize: 28,
          lineHeight: 1.1,
          fontWeight: 700,
          color: "#0f172a",
          letterSpacing: "-0.03em",
        }}
      >
        Объявления
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: "14px",
        }}
      >
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
            <StatCard
              label="Всего объявлений"
              value={summaryStats?.totalAds}
              icon={<DirectionsCarFilledRounded fontSize="small" />}
              iconBackground="#e8f1ff"
              iconColor="#2563eb"
            />
            <StatCard
              label="Новые"
              value={summaryStats?.newAds}
              delta={summaryStats?.newAdsLast24Hours}
              icon={<AddCircleRounded fontSize="small" />}
              iconBackground="#e9f9ef"
              iconColor="#16a34a"
            />
            <StatCard
              label="Ожидают архивирования"
              value={summaryStats?.pendingArchiveValidationAds}
              delta={summaryStats?.pendingArchiveValidationAdsLast24Hours}
              icon={<AccessTimeFilledRounded fontSize="small" />}
              iconBackground="#fff4e5"
              iconColor="#f97316"
            />
            <StatCard
              label="В архиве"
              value={summaryStats?.archivedAds}
              delta={summaryStats?.archivedAdsLast24Hours}
              icon={<Inventory2Rounded fontSize="small" />}
              iconBackground="#eef2f7"
              iconColor="#64748b"
            />
            <StatCard
              label="404"
              value={summaryStats?.notFound404Ads}
              delta={summaryStats?.notFound404AdsLast24Hours}
              icon={<ReportProblemRounded fontSize="small" />}
              iconBackground="#feecec"
              iconColor="#ef4444"
            />
          </>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: "16px",
          flexDirection: { xs: "column", md: "row" },
          padding: "12px 14px",
          background: "#ffffff",
          border: "1px solid #e6eaf0",
          borderRadius: "14px",
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <StatusButton value={SQ.all} label="Все" />
          <StatusButton value={SQ.new} label="Новые" />
          <StatusButton value={SQ.archived} label="Архивные" />
          <StatusButton value={SQ.pendingArchiveValidation} label="Ожид. архивирования" />
          <StatusButton value={SQ.notFound404} label="404" />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "stretch", md: "flex-end" },
            gap: "10px",
            width: { xs: "100%", md: "auto" },
            flexShrink: 0,
          }}
        >
          {hasActiveFilters ? (
            <Button
              size="small"
              variant="outlined"
              onClick={onResetFilters}
              sx={{
                height: 36,
                minHeight: 36,
                px: 1.75,
                borderRadius: "999px",
                borderColor: "#dbe1ea",
                background: "#ffffff",
                color: "#0f172a",
                textTransform: "none",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: "none",
                "&:hover": {
                  background: "#f8fafc",
                  borderColor: "#cbd5e1",
                  boxShadow: "none",
                },
              }}
            >
              Сбросить фильтры
            </Button>
          ) : null}

          <Box
            sx={{
              width: { xs: "100%", md: "280px" },
              minWidth: 0,
            }}
          >
            <Select {...selectProps} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TableButtons;
