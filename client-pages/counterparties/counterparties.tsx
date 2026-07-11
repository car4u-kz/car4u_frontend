"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import { useQuery } from "@tanstack/react-query";

import { Button, Typography } from "@/components";
import TableBody from "@/components/table/table-body";
import { default as CommonTableCell } from "@/components/table/table-cell";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { getAdFilterList } from "@/services/ad-services";
import { getCounterparties } from "@/services/seller-services";
import type { AdViewFiltersResponse } from "@/types";
import type { CounterpartyFilters } from "./types";

const headerLabels = [
  "Account",
  "Категория",
  "Объявления",
  "Оборот",
  "Средний чек",
  "Регион",
  "Специализация",
];

const pageSize = 50;

const formatPrice = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₸`;
};

const formatCount = (value: number | null | undefined) =>
  new Intl.NumberFormat("ru-RU").format(value ?? 0);

const MetricDelta = ({ value }: { value: number }) => {
  if (value > 0) {
    return <ArrowDropUpRoundedIcon sx={{ color: "#16a34a", fontSize: 18 }} />;
  }

  if (value < 0) {
    return (
      <ArrowDropDownRoundedIcon sx={{ color: "#dc2626", fontSize: 18 }} />
    );
  }

  return <RemoveRoundedIcon sx={{ color: "#94a3b8", fontSize: 14 }} />;
};

const MetricBlock = ({
  label,
  value,
  delta,
  money = false,
}: {
  label: string;
  value: number;
  delta: number;
  money?: boolean;
}) => (
  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: 11, color: "#64748b" }}>{label}</Typography>
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
        {money ? formatPrice(value) : formatCount(value)}
      </Typography>
      <MetricDelta value={delta} />
    </Stack>
  </Stack>
);

const CounterpartiesPage = () => {
  const fetchWithAuth = useFetchWithAuth();
  const [filters, setFilters] = useState<CounterpartyFilters>({
    allAdsFrom: 2,
    archivedAdsFrom: 2,
    sortBy: "allAdsCount",
    sortOrder: "desc",
    page: 1,
    pageSize,
  });

  const filterOptionsQuery = useQuery<AdViewFiltersResponse>({
    queryKey: ["adview-filters"],
    queryFn: () => getAdFilterList(fetchWithAuth),
    retry: false,
  });

  const counterpartiesQuery = useQuery({
    queryKey: ["counterparties", filters],
    queryFn: () => getCounterparties(filters, fetchWithAuth),
    retry: false,
  });

  const filteredModels = useMemo(() => {
    if (!filters.brandId) {
      return filterOptionsQuery.data?.models ?? [];
    }

    return (filterOptionsQuery.data?.models ?? []).filter(
      (item) => item.brandId === filters.brandId,
    );
  }, [filterOptionsQuery.data?.models, filters.brandId]);

  const updateFilter = <K extends keyof CounterpartyFilters>(
    key: K,
    value: CounterpartyFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters({
      allAdsFrom: 2,
      archivedAdsFrom: 2,
      sortBy: "allAdsCount",
      sortOrder: "desc",
      page: 1,
      pageSize,
    });
  };

  const rows = counterpartiesQuery.data?.items ?? [];
  const totalCount = counterpartiesQuery.data?.totalCount ?? 0;
  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: 30, fontWeight: 800, color: "#0f172a" }}>
            Контрагенты
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#64748b" }}>
            Аккаунты, их активность, оборот и специализация по текущим данным
            каталога.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
            p: 2.5,
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            background: "#ffffff",
            boxShadow: "0 16px 32px rgba(15, 23, 42, 0.05)",
          }}
        >
          <TextField
            label="Количество объявлений: от"
            type="number"
            size="small"
            value={filters.allAdsFrom ?? ""}
            onChange={(event) =>
              updateFilter(
                "allAdsFrom",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
          <TextField
            label="Количество объявлений: до"
            type="number"
            size="small"
            value={filters.allAdsTo ?? ""}
            onChange={(event) =>
              updateFilter(
                "allAdsTo",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
          <TextField
            label="Архивные: от"
            type="number"
            size="small"
            value={filters.archivedAdsFrom ?? ""}
            onChange={(event) =>
              updateFilter(
                "archivedAdsFrom",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
          <TextField
            label="Архивные: до"
            type="number"
            size="small"
            value={filters.archivedAdsTo ?? ""}
            onChange={(event) =>
              updateFilter(
                "archivedAdsTo",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
          <TextField
            label="Регион"
            select
            size="small"
            value={filters.region ?? ""}
            onChange={(event) =>
              updateFilter("region", event.target.value || undefined)
            }
          >
            <MenuItem value="">Все регионы</MenuItem>
            {(filterOptionsQuery.data?.regions ?? []).map((region) => (
              <MenuItem key={region} value={region}>
                {region}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Марка"
            select
            size="small"
            value={filters.brandId?.toString() ?? ""}
            onChange={(event) =>
              updateFilter(
                "brandId",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          >
            <MenuItem value="">Все марки</MenuItem>
            {(filterOptionsQuery.data?.brands ?? []).map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Модель"
            select
            size="small"
            value={filters.modelId?.toString() ?? ""}
            onChange={(event) =>
              updateFilter(
                "modelId",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          >
            <MenuItem value="">Все модели</MenuItem>
            {filteredModels.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Сортировка"
            select
            size="small"
            value={filters.sortBy ?? "allAdsCount"}
            onChange={(event) =>
              updateFilter(
                "sortBy",
                event.target.value as CounterpartyFilters["sortBy"],
              )
            }
          >
            <MenuItem value="allAdsCount">Количество: ВСЕ</MenuItem>
            <MenuItem value="archivedAdsCount">
              Количество: АРХИВНЫЕ
            </MenuItem>
          </TextField>
          <TextField
            label="Порядок"
            select
            size="small"
            value={filters.sortOrder ?? "desc"}
            onChange={(event) =>
              updateFilter(
                "sortOrder",
                event.target.value as CounterpartyFilters["sortOrder"],
              )
            }
          >
            <MenuItem value="desc">По убыванию</MenuItem>
            <MenuItem value="asc">По возрастанию</MenuItem>
          </TextField>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              gridColumn: { xs: "1 / -1", xl: "span 4" },
              justifyContent: "flex-end",
            }}
          >
            <Button variant="outlined" onClick={resetFilters}>
              Сбросить
            </Button>
          </Stack>
        </Box>

        {counterpartiesQuery.isLoading ? <LinearProgress /> : null}
        {counterpartiesQuery.error instanceof Error ? (
          <Alert severity="error">{counterpartiesQuery.error.message}</Alert>
        ) : null}

        <TableContainer
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            boxShadow: "0 16px 32px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.75,
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <Typography
              sx={{ fontSize: 14, color: "#475569", fontWeight: 600 }}
            >
              Найдено контрагентов: {formatCount(totalCount)}
            </Typography>
          </Box>

          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse" }}
          >
            <TableHead>
              <TableRow>
                {headerLabels.map((label) => (
                  <CommonTableCell key={label}>
                    <Typography>{label}</Typography>
                  </CommonTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody
              initialFetch={counterpartiesQuery.isLoading}
              colSpan={headerLabels.length}
            >
              <>
                {rows.map((item, index) => (
                  <TableRow
                    key={item.userId}
                    sx={{
                      backgroundColor:
                        index % 2 === 0 ? "#ffffff" : "rgba(148, 163, 184, 0.05)",
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2, px: 2, verticalAlign: "top" }}>
                      <Stack spacing={0.5}>
                        <NextLink
                          href={`/ads?statusId=0&accountId=${encodeURIComponent(item.userId)}`}
                          style={{
                            color: "#2563eb",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          {item.accountLabel}
                        </NextLink>
                        <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                          Account ID: {item.userId}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 2, verticalAlign: "top" }}>
                      <Typography sx={{ fontSize: 13, color: "#0f172a" }}>
                        {item.category || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 2, verticalAlign: "top" }}>
                      <Stack spacing={1}>
                        <MetricBlock
                          label="Все"
                          value={item.allAdsCount}
                          delta={item.allAdsDelta}
                        />
                        <MetricBlock
                          label="Новые"
                          value={item.newAdsCount}
                          delta={item.newAdsDelta}
                        />
                        <MetricBlock
                          label="Архивные"
                          value={item.archivedAdsCount}
                          delta={item.archivedAdsDelta}
                        />
                        <MetricBlock
                          label="404"
                          value={item.notFound404AdsCount}
                          delta={item.notFound404AdsDelta}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 2, verticalAlign: "top" }}>
                      <Stack spacing={1}>
                        <MetricBlock
                          label="Все"
                          value={item.allTurnover}
                          delta={item.allTurnoverDelta}
                          money
                        />
                        <MetricBlock
                          label="Новые"
                          value={item.newTurnover}
                          delta={item.newTurnoverDelta}
                          money
                        />
                        <MetricBlock
                          label="Архивные"
                          value={item.archivedTurnover}
                          delta={item.archivedTurnoverDelta}
                          money
                        />
                        <MetricBlock
                          label="404"
                          value={item.notFound404Turnover}
                          delta={item.notFound404TurnoverDelta}
                          money
                        />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 2, verticalAlign: "top" }}>
                      <Typography
                        sx={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}
                      >
                        {item.averageCheck ? formatPrice(item.averageCheck) : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 2, verticalAlign: "top" }}>
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {(item.regions ?? []).length ? (
                          item.regions.map((region) => (
                            <Chip key={region} size="small" label={region} />
                          ))
                        ) : (
                          <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>
                            —
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2, px: 2, verticalAlign: "top" }}>
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {(item.specializations ?? []).length ? (
                          item.specializations.map((specialization) => (
                            <Chip
                              key={specialization}
                              size="small"
                              label={specialization}
                            />
                          ))
                        ) : (
                          <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>
                            —
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            </TableBody>
          </Box>
        </TableContainer>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: 13, color: "#64748b" }}>
            Страница {currentPage} из {totalPages}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={currentPage <= 1}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, (prev.page ?? 1) - 1),
                }))
              }
            >
              Назад
            </Button>
            <Button
              variant="outlined"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: (prev.page ?? 1) + 1,
                }))
              }
            >
              Далее
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CounterpartiesPage;
