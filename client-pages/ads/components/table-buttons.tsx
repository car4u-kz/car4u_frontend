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
import {
  Box,
  Paper,
  Skeleton,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";

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

const formatNumber = (value: number | undefined) => {
  return numberFormatter.format(value ?? 0);
};

const formatDelta = (value: number | undefined) => {
  if (!value) {
    return "+0 за 24ч";
  }

  return `+${numberFormatter.format(value)} за 24ч`;
};

const statCardSx = {
  p: 2,
  borderRadius: 3,
  backgroundColor: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
  minHeight: 118,
};

const StatCard = ({
  label,
  value,
  delta,
  icon,
  accentColor,
  accentBackground,
}: {
  label: string;
  value: number | undefined;
  delta?: number;
  icon: ReactNode;
  accentColor: string;
  accentBackground: string;
}) => (
  <Box sx={statCardSx}>
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box
          sx={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            color: accentColor,
            backgroundColor: accentBackground,
            boxShadow: `inset 0 0 0 1px ${accentBackground}`,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 600, lineHeight: 1.3 }}
        >
          {label}
        </Typography>
      </Stack>

      <Box>
        <Typography
          sx={{
            fontSize: { xs: 28, md: 32 },
            lineHeight: 1,
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "-0.03em",
          }}
        >
          {formatNumber(value)}
        </Typography>
        {typeof delta === "number" && (
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 13,
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {formatDelta(delta)}
          </Typography>
        )}
      </Box>
    </Stack>
  </Box>
);

const StatCardSkeleton = () => (
  <Box sx={statCardSx}>
    <Skeleton variant="rounded" width={42} height={42} />
    <Skeleton variant="text" width="68%" height={22} sx={{ mt: 1 }} />
    <Skeleton variant="text" width="52%" height={42} />
    <Skeleton variant="text" width="46%" height={18} />
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
    minHeight: 42,
    px: 2,
    borderRadius: 999,
    fontWeight: 700,
    textTransform: "none",
    backgroundColor: btnName === statusId ? "#111827" : "rgba(255,255,255,0.92)",
    color: btnName === statusId ? "#FFFFFF" : "#111827",
    border: "1px solid",
    borderColor: btnName === statusId ? "#111827" : "rgba(148, 163, 184, 0.28)",
    boxShadow:
      btnName === statusId
        ? "0 12px 28px rgba(17, 24, 39, 0.18)"
        : "0 6px 18px rgba(15, 23, 42, 0.04)",
    "&:hover": {
      backgroundColor: btnName === statusId ? "#111827" : "#F8FAFC",
      borderColor: btnName === statusId ? "#111827" : "rgba(100, 116, 139, 0.4)",
    },
  });

  const showStatsSkeleton = isStatsLoading && !stats;

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.75 },
          borderRadius: 4,
          border: "1px solid rgba(148, 163, 184, 0.18)",
          background:
            "linear-gradient(180deg, #F8FBFF 0%, #F4F7FB 54%, #FFFFFF 100%)",
          boxShadow: "0 18px 44px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 34, md: 42 },
                  lineHeight: 1,
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.04em",
                }}
              >
                Объявления
              </Typography>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", sm: 280, lg: 300 },
                alignSelf: { xs: "stretch", lg: "center" },
                flexShrink: 0,
              }}
            >
              <Select {...selectProps} />
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: 1.5,
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
                  accentColor="#2563EB"
                  accentBackground="rgba(37, 99, 235, 0.12)"
                />
                <StatCard
                  label="Новые"
                  value={stats?.newAds}
                  delta={stats?.newAdsLast24Hours}
                  icon={<AddCircleRounded fontSize="small" />}
                  accentColor="#16A34A"
                  accentBackground="rgba(22, 163, 74, 0.12)"
                />
                <StatCard
                  label="Ожидают архивирования"
                  value={stats?.pendingArchiveValidationAds}
                  delta={stats?.pendingArchiveValidationAdsLast24Hours}
                  icon={<AccessTimeFilledRounded fontSize="small" />}
                  accentColor="#D97706"
                  accentBackground="rgba(217, 119, 6, 0.12)"
                />
                <StatCard
                  label="В архиве"
                  value={stats?.archivedAds}
                  delta={stats?.archivedAdsLast24Hours}
                  icon={<Inventory2Rounded fontSize="small" />}
                  accentColor="#6B7280"
                  accentBackground="rgba(107, 114, 128, 0.12)"
                />
                <StatCard
                  label="404"
                  value={stats?.notFound404Ads}
                  delta={stats?.notFound404AdsLast24Hours}
                  icon={<ReportProblemRounded fontSize="small" />}
                  accentColor="#DC2626"
                  accentBackground="rgba(220, 38, 38, 0.12)"
                />
              </>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              pt: 0.25,
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
              Ожидают архивирования
            </Button>
            <Button
              size="small"
              sx={statusButtonSx(SQ.notFound404)}
              onClick={() => onClick(SQ.notFound404)}
            >
              404
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TableButtons;
