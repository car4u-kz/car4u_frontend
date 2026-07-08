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
  stats?: AdStatusStats;
  isStatsLoading?: boolean;
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

const statCardSx = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  minHeight: "86px",
  padding: "18px 20px",
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
  fontSize: 22,
  lineHeight: "28px",
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

  const statusButtonSx = (btnName: string): SxProps => ({
    height: 36,
    minHeight: 36,
    px: 2,
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
      "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      background: btnName === statusId ? "#0f172a" : "#f8fafc",
      borderColor: btnName === statusId ? "#0f172a" : "#cbd5e1",
    },
  });

  const showStatsSkeleton = isStatsLoading && !stats;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        p: { xs: "16px", md: "24px 32px 20px" },
        background: "transparent",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
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
              value={stats?.totalAds}
              icon={<DirectionsCarFilledRounded fontSize="small" />}
              iconBackground="#e8f1ff"
              iconColor="#2563eb"
            />
            <StatCard
              label="Новые"
              value={stats?.newAds}
              delta={stats?.newAdsLast24Hours}
              icon={<AddCircleRounded fontSize="small" />}
              iconBackground="#e9f9ef"
              iconColor="#16a34a"
            />
            <StatCard
              label="Ожидают архивирования"
              value={stats?.pendingArchiveValidationAds}
              delta={stats?.pendingArchiveValidationAdsLast24Hours}
              icon={<AccessTimeFilledRounded fontSize="small" />}
              iconBackground="#fff4e5"
              iconColor="#f97316"
            />
            <StatCard
              label="В архиве"
              value={stats?.archivedAds}
              delta={stats?.archivedAdsLast24Hours}
              icon={<Inventory2Rounded fontSize="small" />}
              iconBackground="#eef2f7"
              iconColor="#64748b"
            />
            <StatCard
              label="404"
              value={stats?.notFound404Ads}
              delta={stats?.notFound404AdsLast24Hours}
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
          <Button size="small" sx={statusButtonSx(SQ.all)} onClick={() => onClick(SQ.all)}>
            Все
          </Button>
          <Button size="small" sx={statusButtonSx(SQ.new)} onClick={() => onClick(SQ.new)}>
            Новые
          </Button>
          <Button
            size="small"
            sx={statusButtonSx(SQ.archived)}
            onClick={() => onClick(SQ.archived)}
          >
            Архивные
          </Button>
          <Button
            size="small"
            sx={statusButtonSx(SQ.pendingArchiveValidation)}
            onClick={() => onClick(SQ.pendingArchiveValidation)}
          >
            Ожид. архивирования
          </Button>
          <Button
            size="small"
            sx={statusButtonSx(SQ.notFound404)}
            onClick={() => onClick(SQ.notFound404)}
          >
            404
          </Button>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "280px" },
            flexShrink: 0,
          }}
        >
          <Select {...selectProps} />
        </Box>
      </Box>
    </Box>
  );
};

export default TableButtons;
