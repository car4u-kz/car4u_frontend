"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography as MuiTypography,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { useQuery } from "@tanstack/react-query";

import { Button, IconButton, Typography } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { getAdFilterList } from "@/services/ad-services";
import { getCounterparties } from "@/services/seller-services";
import type { AdViewFiltersResponse } from "@/types";
import type { CounterpartyFilters } from "./types";
import CounterpartiesFiltersSidebar from "./components/filters-sidebar";

const formatPrice = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₸`;
};

const formatCount = (value: number | null | undefined) =>
  new Intl.NumberFormat("ru-RU").format(value ?? 0);

const CountDelta = ({ value }: { value: number }) => {
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

const countLineSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minWidth: 0,
};

const smallLabelSx = {
  fontSize: 11,
  color: "#64748b",
  flexShrink: 0,
};

const valueSx = {
  fontSize: 13,
  fontWeight: 700,
  color: "#0f172a",
  textAlign: "right",
};

const sortButtonSx: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  font: "inherit",
  fontWeight: 700,
  color: "inherit",
  textAlign: "left",
};

const CounterpartiesPage = () => {
  const fetchWithAuth = useFetchWithAuth();
  const fetchWithAuthNoLoading = useFetchWithAuth({ trackLoading: false });
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showExpandFiltersButton, setShowExpandFiltersButton] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const queryString = searchParams.toString();

  const filters = useMemo<CounterpartyFilters>(() => {
    const readNumber = (key: string) => {
      const value = searchParams.get(key);
      return value ? Number(value) : undefined;
    };

    return {
      allAdsFrom: readNumber("allAdsFrom") ?? 2,
      allAdsTo: readNumber("allAdsTo"),
      archivedAdsFrom: readNumber("archivedAdsFrom") ?? 2,
      archivedAdsTo: readNumber("archivedAdsTo"),
      category: searchParams.get("category") || undefined,
      region: searchParams.get("region") || undefined,
      brandId: readNumber("brandId"),
      modelId: readNumber("modelId"),
      sortBy:
        (searchParams.get("sortBy") as CounterpartyFilters["sortBy"]) ||
        "allAdsCount",
      sortOrder:
        (searchParams.get("sortOrder") as CounterpartyFilters["sortOrder"]) ||
        "desc",
      page: readNumber("page") ?? 1,
      pageSize: 50,
    };
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setShowExpandFiltersButton(window.scrollY < 220);
      setShowScrollTop(window.scrollY > 700);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filterOptionsQuery = useQuery<AdViewFiltersResponse>({
    queryKey: ["adview-filters"],
    queryFn: () => getAdFilterList(fetchWithAuthNoLoading),
    retry: false,
  });

  const counterpartiesQuery = useQuery({
    queryKey: ["counterparties", queryString],
    queryFn: () => getCounterparties(filters, fetchWithAuth),
    retry: false,
  });

  const setQueryParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams);
    mutate(params);
    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
  };

  const handleSortClick = (sortBy: "allAdsCount" | "archivedAdsCount") => {
    setQueryParams((params) => {
      const currentSortBy = params.get("sortBy") as CounterpartyFilters["sortBy"];
      const currentSortOrder =
        (params.get("sortOrder") as CounterpartyFilters["sortOrder"]) || "desc";

      if (currentSortBy !== sortBy) {
        params.set("sortBy", sortBy);
        params.set("sortOrder", "desc");
      } else {
        params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
      }

      params.delete("page");
    });
  };

  const handlePageChange = (nextPage: number) => {
    setQueryParams((params) => {
      params.set("page", String(nextPage));
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const rows = counterpartiesQuery.data?.items ?? [];
  const totalCount = counterpartiesQuery.data?.totalCount ?? 0;
  const currentPage = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const allSortArrow =
    filters.sortBy === "allAdsCount"
      ? filters.sortOrder === "asc"
        ? " ↑"
        : " ↓"
      : "";
  const archivedSortArrow =
    filters.sortBy === "archivedAdsCount"
      ? filters.sortOrder === "asc"
        ? " ↑"
        : " ↓"
      : "";

  const hasItems = rows.length > 0;

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
        <Stack spacing={2}>
          <Stack spacing={0.75}>
            <Typography sx={{ fontSize: 32, fontWeight: 800, color: "#0f172a" }}>
              Контрагенты
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#64748b" }}>
              Аккаунты, их активность, оборот и специализация по текущим данным
              каталога.
            </Typography>
          </Stack>

          {counterpartiesQuery.error instanceof Error ? (
            <Alert severity="error">{counterpartiesQuery.error.message}</Alert>
          ) : null}

          <Box
            sx={{
              background: "#ffffff",
              border: "1px solid #e6eaf0",
              borderRadius: "14px",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table
                stickyHeader
                sx={{
                  width: "100%",
                  minWidth: 1240,
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  fontSize: 14,
                  color: "#0f172a",
                  "& .account-col": { width: 220 },
                  "& .category-col": { width: 130 },
                  "& .counts-col": { width: 200 },
                  "& .turnover-col": { width: 220 },
                  "& .avg-col": { width: 120 },
                  "& .region-col": { width: 180 },
                  "& .spec-col": { width: 260 },
                }}
              >
                <TableHead sx={{ background: "#ffffff" }}>
                  <TableRow>
                    <TableCell
                      className="account-col"
                      sx={{
                        height: 48,
                        px: { xs: "8px", xl: "12px" },
                        py: 0,
                        borderBottom: "1px solid #e6eaf0",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#334155",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        background: "#ffffff",
                      }}
                    >
                      Account
                    </TableCell>
                    <TableCell
                      className="category-col"
                      sx={{
                        height: 48,
                        px: { xs: "8px", xl: "12px" },
                        py: 0,
                        borderBottom: "1px solid #e6eaf0",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#334155",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        background: "#ffffff",
                      }}
                    >
                      Категория
                    </TableCell>
                    <TableCell
                      className="counts-col"
                      sx={{
                        height: 48,
                        px: { xs: "8px", xl: "12px" },
                        py: 0,
                        borderBottom: "1px solid #e6eaf0",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#334155",
                        textAlign: "left",
                        background: "#ffffff",
                      }}
                    >
                      <Stack spacing={0.25}>
                        <button
                          type="button"
                          onClick={() => handleSortClick("allAdsCount")}
                          style={sortButtonSx}
                        >
                          Объявления{allSortArrow}
                        </button>
                        <MuiTypography sx={{ fontSize: 11, color: "#94a3b8" }}>
                          Клик по заголовку сортирует по количеству ВСЕ
                        </MuiTypography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      className="turnover-col"
                      sx={{
                        height: 48,
                        px: { xs: "8px", xl: "12px" },
                        py: 0,
                        borderBottom: "1px solid #e6eaf0",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#334155",
                        textAlign: "left",
                        background: "#ffffff",
                      }}
                    >
                      Оборот
                    </TableCell>
                    <TableCell
                      className="avg-col"
                      sx={{
                        height: 48,
                        px: { xs: "8px", xl: "12px" },
                        py: 0,
                        borderBottom: "1px solid #e6eaf0",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#334155",
                        textAlign: "left",
                        background: "#ffffff",
                      }}
                    >
                      Средний чек
                    </TableCell>
                    <TableCell
                      className="region-col"
                      sx={{
                        height: 48,
                        px: { xs: "8px", xl: "12px" },
                        py: 0,
                        borderBottom: "1px solid #e6eaf0",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#334155",
                        textAlign: "left",
                        background: "#ffffff",
                      }}
                    >
                      Регион
                    </TableCell>
                    <TableCell
                      className="spec-col"
                      sx={{
                        height: 48,
                        px: { xs: "8px", xl: "12px" },
                        py: 0,
                        borderBottom: "1px solid #e6eaf0",
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#334155",
                        textAlign: "left",
                        background: "#ffffff",
                      }}
                    >
                      <Stack spacing={0.25}>
                        <button
                          type="button"
                          onClick={() => handleSortClick("archivedAdsCount")}
                          style={sortButtonSx}
                        >
                          Специализация / Архивные{archivedSortArrow}
                        </button>
                        <MuiTypography sx={{ fontSize: 11, color: "#94a3b8" }}>
                          Клик по заголовку сортирует по количеству АРХИВНЫЕ
                        </MuiTypography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {counterpartiesQuery.isLoading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <TableRow key={`counterparty-skeleton-${index}`}>
                        <TableCell
                          colSpan={7}
                          sx={{
                            height: 64,
                            px: "14px",
                            py: "10px",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <Box
                            sx={{
                              height: 36,
                              borderRadius: "8px",
                              background:
                                "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
                              backgroundSize: "200% 100%",
                              animation:
                                "counterpartiesSkeletonLoading 1.2s ease-in-out infinite",
                              "@keyframes counterpartiesSkeletonLoading": {
                                from: { backgroundPosition: "200% 0" },
                                to: { backgroundPosition: "-200% 0" },
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : hasItems ? (
                    rows.map((item, index) => (
                      <TableRow
                        key={item.userId}
                        sx={{
                          backgroundColor:
                            index % 2 === 0
                              ? "#ffffff"
                              : "rgba(148, 163, 184, 0.05)",
                          "&:hover": {
                            backgroundColor: "#f8fafc",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
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
                            <MuiTypography
                              sx={{ fontSize: 12, color: "#64748b" }}
                            >
                              Account ID: {item.userId}
                            </MuiTypography>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <MuiTypography
                            sx={{ fontSize: 13, color: "#0f172a" }}
                          >
                            {item.category || "—"}
                          </MuiTypography>
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <Stack spacing={0.6}>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>Все</MuiTypography>
                              <Stack direction="row" alignItems="center" spacing={0.25}>
                                <MuiTypography sx={valueSx}>
                                  {formatCount(item.allAdsCount)}
                                </MuiTypography>
                                <CountDelta value={item.allAdsDelta} />
                              </Stack>
                            </Box>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>Новые</MuiTypography>
                              <Stack direction="row" alignItems="center" spacing={0.25}>
                                <MuiTypography sx={valueSx}>
                                  {formatCount(item.newAdsCount)}
                                </MuiTypography>
                                <CountDelta value={item.newAdsDelta} />
                              </Stack>
                            </Box>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>Архив</MuiTypography>
                              <Stack direction="row" alignItems="center" spacing={0.25}>
                                <MuiTypography sx={valueSx}>
                                  {formatCount(item.archivedAdsCount)}
                                </MuiTypography>
                                <CountDelta value={item.archivedAdsDelta} />
                              </Stack>
                            </Box>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>404</MuiTypography>
                              <Stack direction="row" alignItems="center" spacing={0.25}>
                                <MuiTypography sx={valueSx}>
                                  {formatCount(item.notFound404AdsCount)}
                                </MuiTypography>
                                <CountDelta value={item.notFound404AdsDelta} />
                              </Stack>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <Stack spacing={0.6}>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>Все</MuiTypography>
                              <MuiTypography sx={valueSx}>
                                {formatPrice(item.allTurnover)}
                              </MuiTypography>
                            </Box>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>Новые</MuiTypography>
                              <MuiTypography sx={valueSx}>
                                {formatPrice(item.newTurnover)}
                              </MuiTypography>
                            </Box>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>Архив</MuiTypography>
                              <MuiTypography sx={valueSx}>
                                {formatPrice(item.archivedTurnover)}
                              </MuiTypography>
                            </Box>
                            <Box sx={countLineSx}>
                              <MuiTypography sx={smallLabelSx}>404</MuiTypography>
                              <MuiTypography sx={valueSx}>
                                {formatPrice(item.notFound404Turnover)}
                              </MuiTypography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <MuiTypography
                            sx={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}
                          >
                            {item.averageCheck ? formatPrice(item.averageCheck) : "—"}
                          </MuiTypography>
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <Stack direction="row" flexWrap="wrap" gap={0.75}>
                            {(item.regions ?? []).length ? (
                              item.regions.map((region) => (
                                <Chip key={region} size="small" label={region} />
                              ))
                            ) : (
                              <MuiTypography
                                sx={{ fontSize: 13, color: "#94a3b8" }}
                              >
                                —
                              </MuiTypography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
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
                              <MuiTypography
                                sx={{ fontSize: 13, color: "#94a3b8" }}
                              >
                                —
                              </MuiTypography>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ px: "24px", py: "48px", borderBottom: "none" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            textAlign: "center",
                          }}
                        >
                          <MuiTypography
                            sx={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            Контрагенты не найдены
                          </MuiTypography>
                          <MuiTypography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#64748b",
                            }}
                          >
                            Попробуйте изменить фильтры.
                          </MuiTypography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                minHeight: 56,
                px: "14px",
                py: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                borderTop: "1px solid #e6eaf0",
                background: "#ffffff",
              }}
            >
              <Box sx={{ fontSize: 13, fontWeight: 500, color: "#475569" }}>
                Найдено {formatCount(totalCount)}
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                {counterpartiesQuery.isFetching ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}
                  >
                    <CircularProgress size={18} thickness={5} />
                    <span>Загружаем...</span>
                  </Stack>
                ) : null}
                <MuiTypography sx={{ fontSize: 13, color: "#64748b" }}>
                  Страница {currentPage} из {totalPages}
                </MuiTypography>
                <Button
                  variant="outlined"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Назад
                </Button>
                <Button
                  variant="outlined"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Далее
                </Button>
              </Stack>
            </Box>
          </Box>
        </Stack>
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
          <CounterpartiesFiltersSidebar
            onCollapse={() => setFiltersOpen(false)}
            regions={filterOptionsQuery.data?.regions ?? []}
            brands={filterOptionsQuery.data?.brands ?? []}
            models={filterOptionsQuery.data?.models ?? []}
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

      {hasItems && showScrollTop ? (
        <IconButton
          size="small"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            right: { xs: 16, md: 24 },
            bottom: { xs: 20, md: 28 },
            zIndex: 30,
            width: 44,
            height: 44,
            borderRadius: "12px",
            border: "1px solid #dbe1ea",
            background: "#ffffff",
            color: "#2563eb",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.14)",
            transition: "transform 160ms ease, box-shadow 160ms ease",
            "&:hover": {
              background: "#f8fafc",
              transform: "translateY(-1px)",
              boxShadow: "0 14px 28px rgba(15, 23, 42, 0.18)",
            },
          }}
        >
          <ArrowUpward fontSize="small" />
        </IconButton>
      ) : null}
    </Box>
  );
};

export default CounterpartiesPage;
