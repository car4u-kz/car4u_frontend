"use client";

import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography as MuiTypography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button, IconButton, Modal, Tooltip, Typography } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { getAdFilterList } from "@/services/ad-services";
import { getCounterparties, updateSellerProfile } from "@/services/seller-services";
import type {
  AdLookupOption,
  AdViewFiltersResponse,
  SellerProfileUpdatePayload,
} from "@/types";
import type { CounterpartyFilters, CounterpartyItem } from "./types";
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

const compactButtonSx = {
  minWidth: "auto",
  height: 24,
  px: 1,
  borderRadius: "999px",
  borderColor: "#cbd5e1",
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1,
  whiteSpace: "nowrap",
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    borderColor: "#94a3b8",
    background: "#eff6ff",
    boxShadow: "none",
  },
};

const tooltipContentSx = {
  minWidth: 280,
  maxWidth: 320,
  p: 0.5,
};

const ACCOUNT_TYPE_OPTIONS = [
  "РћР” РђРІС‚РѕСЃР°Р»РѕРЅ",
  "РџРµСЂРµРєСѓРї",
  "РђРІС‚РѕРїР»РѕС‰Р°РґРєР°",
  "Р§Р°СЃС‚РЅРѕРµ Р»РёС†Рѕ",
  "РќРѕРІС‹Р№ РёРіСЂРѕРє",
] as const;

const ACCOUNT_TYPE_OPTIONS_FIXED = [
  "ОД Автосалон",
  "Перекуп",
  "Автоплощадка",
  "Частное лицо",
  "Новый игрок",
] as const;

const normalizeNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const maxPreviewCharacters = 95;
const maxChipsContainerHeight = 92;

type GroupedChipSection = {
  label: string;
  items: string[];
  tone?: "default" | "success";
};

const getVisibleItemsByCharacterLimit = (
  items: string[],
  maxCharacters = maxPreviewCharacters,
) => {
  const visibleItems: string[] = [];
  let usedCharacters = 0;

  for (const item of items) {
    const nextLength = visibleItems.length === 0 ? item.length : item.length + 2;
    if (visibleItems.length > 0 && usedCharacters + nextLength > maxCharacters) {
      break;
    }

    visibleItems.push(item);
    usedCharacters += nextLength;
  }

  return visibleItems;
};

const getVisibleGroupedSectionsByCharacterLimit = (
  sections: GroupedChipSection[],
  maxCharacters = maxPreviewCharacters,
) => {
  const visibleSections: GroupedChipSection[] = [];
  let usedCharacters = 0;
  let visibleItemsCount = 0;

  for (const section of sections) {
    if (!section.items.length) {
      continue;
    }

    const nextItems: string[] = [];
    const labelLength = section.label.length + (visibleSections.length > 0 ? 3 : 0);
    let itemsCharacters = 0;

    for (const item of section.items) {
      const itemLength = nextItems.length === 0 ? item.length : item.length + 2;
      const projectedLength =
        usedCharacters +
        (nextItems.length === 0 ? labelLength : 0) +
        itemsCharacters +
        itemLength;

      if (nextItems.length > 0 && projectedLength > maxCharacters) {
        break;
      }

      if (nextItems.length === 0 && projectedLength > maxCharacters && visibleItemsCount > 0) {
        break;
      }

      nextItems.push(item);
      itemsCharacters += itemLength;
    }

    if (!nextItems.length) {
      break;
    }

    visibleSections.push({
      ...section,
      items: nextItems,
    });

    usedCharacters += labelLength + itemsCharacters;
    visibleItemsCount += nextItems.length;
  }

  return {
    visibleSections,
    visibleItemsCount,
  };
};

const CompactChipList = ({
  items,
  onShowAll,
}: {
  items: string[];
  onShowAll: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useEffect(() => {
    setVisibleCount(items.length);
  }, [items]);

  useLayoutEffect(() => {
    if (!items.length) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (container.scrollHeight > maxChipsContainerHeight && visibleCount > 1) {
      setVisibleCount((current) => Math.max(1, current - 1));
    }
  }, [items, visibleCount]);

  if (!items.length) {
    return <MuiTypography sx={{ fontSize: 13, color: "#94a3b8" }}>—</MuiTypography>;
  }

  const hasHiddenItems = visibleCount < items.length;
  const visibleItems = items.slice(0, hasHiddenItems ? visibleCount : items.length);

  return (
    <Stack alignItems="flex-start" gap={0.75}>
      <Stack
        ref={containerRef}
        direction="row"
        flexWrap="wrap"
        gap={0.75}
        sx={{ maxHeight: `${maxChipsContainerHeight}px`, overflow: "hidden" }}
      >
        {visibleItems.map((item) => (
          <Box key={item} data-chip-item="true">
            <Chip size="small" label={item} />
          </Box>
        ))}
      </Stack>
      {hasHiddenItems ? (
        <Button variant="outlined" size="small" onClick={onShowAll} sx={compactButtonSx}>
          +{items.length - visibleCount}
        </Button>
      ) : null}
    </Stack>
  );
};

const successChipSx = {
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #86efac",
  "& .MuiChip-label": {
    color: "#166534",
    fontWeight: 600,
  },
};

const CompactGroupedChipList = ({
  sections,
  onShowAll,
}: {
  sections: GroupedChipSection[];
  onShowAll: () => void;
}) => {
  const normalizedSections = sections.filter((section) => section.items.length > 0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodes = useMemo(
    () =>
      normalizedSections.flatMap((section, sectionIndex) => [
        {
          type: "label" as const,
          key: `label-${section.label}-${sectionIndex}`,
          label: section.label,
          tone: section.tone ?? "default",
        },
        ...section.items.map((item, itemIndex) => ({
          type: "chip" as const,
          key: `chip-${section.label}-${item}-${itemIndex}`,
          label: item,
          tone: section.tone ?? "default",
        })),
      ]),
    [normalizedSections],
  );
  const totalItems = normalizedSections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );
  const [visibleNodeCount, setVisibleNodeCount] = useState(nodes.length);

  useEffect(() => {
    setVisibleNodeCount(nodes.length);
  }, [nodes]);

  useLayoutEffect(() => {
    if (!nodes.length) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (container.scrollHeight > maxChipsContainerHeight && visibleNodeCount > 1) {
      setVisibleNodeCount((current) => Math.max(1, current - 1));
    }
  }, [nodes, visibleNodeCount]);

  if (!totalItems) {
    return <MuiTypography sx={{ fontSize: 13, color: "#94a3b8" }}>вЂ”</MuiTypography>;
  }

  const hasHiddenNodes = visibleNodeCount < nodes.length;
  const previewNodes = nodes.slice(0, hasHiddenNodes ? visibleNodeCount : nodes.length);

  while (previewNodes.length > 0 && previewNodes[previewNodes.length - 1]?.type === "label") {
    previewNodes.pop();
  }

  const visibleItemsCount = previewNodes.filter((node) => node.type === "chip").length;
  const hiddenItemsCount = Math.max(0, totalItems - visibleItemsCount);

  return (
    <Stack alignItems="flex-start" gap={0.75}>
      <Stack
        ref={containerRef}
        direction="row"
        flexWrap="wrap"
        gap={0.75}
        sx={{ maxHeight: `${maxChipsContainerHeight}px`, overflow: "hidden" }}
      >
        {previewNodes.map((node) =>
          node.type === "label" ? (
            <Box
              key={node.key}
              data-group-node="true"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 24,
                px: 0.25,
              }}
            >
              <MuiTypography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: node.tone === "success" ? "#15803d" : "#64748b",
                }}
              >
                {node.label}
              </MuiTypography>
            </Box>
          ) : (
            <Box key={node.key} data-group-node="true">
              <Chip
                size="small"
                label={node.label}
                sx={node.tone === "success" ? successChipSx : undefined}
              />
            </Box>
          ),
        )}
      </Stack>
      {hiddenItemsCount > 0 ? (
        <Button variant="outlined" size="small" onClick={onShowAll} sx={compactButtonSx}>
          +{hiddenItemsCount}
        </Button>
      ) : null}
    </Stack>
  );
};

const CharacterLimitedChipList = ({
  items,
  onShowAll,
}: {
  items: string[];
  onShowAll: () => void;
}) => {
  if (!items.length) {
    return <MuiTypography sx={{ fontSize: 13, color: "#94a3b8" }}>вЂ”</MuiTypography>;
  }

  const visibleItems = getVisibleItemsByCharacterLimit(items);
  const hiddenItemsCount = Math.max(0, items.length - visibleItems.length);

  return (
    <Stack alignItems="flex-start" gap={0.75}>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {visibleItems.map((item) => (
          <Box key={item}>
            <Chip size="small" label={item} />
          </Box>
        ))}
      </Stack>
      {hiddenItemsCount > 0 ? (
        <Button variant="outlined" size="small" onClick={onShowAll} sx={compactButtonSx}>
          +{hiddenItemsCount}
        </Button>
      ) : null}
    </Stack>
  );
};

const CharacterLimitedGroupedChipList = ({
  sections,
  onShowAll,
}: {
  sections: GroupedChipSection[];
  onShowAll: () => void;
}) => {
  const normalizedSections = sections.filter((section) => section.items.length > 0);
  const totalItems = normalizedSections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  if (!totalItems) {
    return <MuiTypography sx={{ fontSize: 13, color: "#94a3b8" }}>РІР‚вЂќ</MuiTypography>;
  }

  const { visibleSections, visibleItemsCount } =
    getVisibleGroupedSectionsByCharacterLimit(normalizedSections);
  const hiddenItemsCount = Math.max(0, totalItems - visibleItemsCount);

  return (
    <Stack alignItems="flex-start" gap={0.75}>
      <Stack gap={0.75}>
        {visibleSections.map((section) => (
          <Stack key={section.label} direction="row" flexWrap="wrap" gap={0.75}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 24,
                px: 0.25,
              }}
            >
              <MuiTypography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: section.tone === "success" ? "#15803d" : "#64748b",
                }}
              >
                {section.label}
              </MuiTypography>
            </Box>
            {section.items.map((item) => (
              <Box key={`${section.label}-${item}`}>
                <Chip
                  size="small"
                  label={item}
                  sx={section.tone === "success" ? successChipSx : undefined}
                />
              </Box>
            ))}
          </Stack>
        ))}
      </Stack>
      {hiddenItemsCount > 0 ? (
        <Button variant="outlined" size="small" onClick={onShowAll} sx={compactButtonSx}>
          +{hiddenItemsCount}
        </Button>
      ) : null}
    </Stack>
  );
};

const CounterpartiesPage = () => {
  const fetchWithAuth = useFetchWithAuth();
  const fetchWithAuthNoLoading = useFetchWithAuth({ trackLoading: false });
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showExpandFiltersButton, setShowExpandFiltersButton] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [editingSeller, setEditingSeller] =
    useState<SellerProfileUpdatePayload | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [sellerOverrides, setSellerOverrides] = useState<
    Record<string, Partial<CounterpartyItem>>
  >({});
  const [listModalState, setListModalState] = useState<{
    title: string;
    accountLabel: string;
    items: string[];
    groupedSections?: GroupedChipSection[];
  } | null>(null);

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

  const sellerMutation = useMutation({
    mutationFn: (payload: SellerProfileUpdatePayload) =>
      updateSellerProfile(payload, fetchWithAuth),
    onSuccess: (seller) => {
      setSellerOverrides((prev) => ({
        ...prev,
        [seller.userId]: {
          accountLabel: seller.displayName?.trim() || seller.userId,
          displayName: seller.displayName,
          phone1: seller.phone1,
          phone2: seller.phone2,
          phone3: seller.phone3,
          notes: seller.notes,
          category: seller.accountType,
          accountRegionName: seller.accountRegionName,
        },
      }));
      setEditError(null);
      setEditingSeller(null);
    },
    onError: (error: Error) => {
      setEditError(error.message);
    },
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

  const rows = useMemo(
    () =>
      (counterpartiesQuery.data?.items ?? []).map((item) => {
        const override = sellerOverrides[item.userId];
        return override ? { ...item, ...override } : item;
      }),
    [counterpartiesQuery.data?.items, sellerOverrides],
  );
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

  const sellerRegionNames = useMemo(() => {
    const currentValue = editingSeller?.accountRegionName?.trim();
    const values = [
      ...(filterOptionsQuery.data?.regions ?? []),
      ...(currentValue ? [currentValue] : []),
    ]
      .map((value) => value.trim())
      .filter(Boolean);

    return Array.from(new Set(values));
  }, [filterOptionsQuery.data?.regions, editingSeller?.accountRegionName]);

  const handleOpenSellerEdit = (item: CounterpartyItem) => {
    setEditError(null);

    setEditingSeller({
      userId: item.userId,
      displayName: item.displayName ?? "",
      phone1: item.phone1 ?? "",
      phone2: item.phone2 ?? "",
      phone3: item.phone3 ?? "",
      notes: item.notes ?? "",
      accountType: item.category ?? "",
      accountRegionName: item.accountRegionName ?? "",
      accountRegionId: undefined,
    });
  };

  const handleCloseSellerEdit = () => {
    if (sellerMutation.isPending) {
      return;
    }

    setEditError(null);
    setEditingSeller(null);
  };

  const handleSaveSeller = () => {
    if (!editingSeller) {
      return;
    }

    sellerMutation.mutate({
      userId: editingSeller.userId,
      displayName: normalizeNullable(editingSeller.displayName ?? ""),
      phone1: normalizeNullable(editingSeller.phone1 ?? ""),
      phone2: normalizeNullable(editingSeller.phone2 ?? ""),
      phone3: normalizeNullable(editingSeller.phone3 ?? ""),
      notes: normalizeNullable(editingSeller.notes ?? ""),
      accountType: normalizeNullable(editingSeller.accountType ?? ""),
      accountRegionId: undefined,
      accountRegionName: normalizeNullable(editingSeller.accountRegionName ?? ""),
    });
  };

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
                          Сортирует по количеству ВСЕ
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
                          Сортирует по количеству АРХИВНЫЕ
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
                          {(() => {
                            const phones = [
                              item.phone1,
                              item.phone2,
                              item.phone3,
                            ].filter(Boolean);

                            return (
                          <Stack spacing={0.5}>
                            <Tooltip
                              placement="top-start"
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    backgroundColor: "#ffffff",
                                    color: "#0f172a",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.14)",
                                    borderRadius: "14px",
                                    p: 1.25,
                                    maxWidth: 360,
                                  },
                                },
                              }}
                              title={
                                <Box sx={tooltipContentSx}>
                                  <Stack spacing={1}>
                                    <Box>
                                      <MuiTypography
                                        sx={{
                                          fontSize: 14,
                                          fontWeight: 700,
                                          color: "#0f172a",
                                        }}
                                      >
                                        {item.displayName?.trim() ||
                                          "Аккаунт без наименования"}
                                      </MuiTypography>
                                      <MuiTypography
                                        sx={{
                                          mt: 0.25,
                                          fontSize: 12,
                                          color: "#64748b",
                                        }}
                                      >
                                        ID: {item.userId}
                                      </MuiTypography>
                                    </Box>

                                    {item.category?.trim() ? (
                                      <Box>
                                        <MuiTypography
                                          sx={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#64748b",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                          }}
                                        >
                                          Тип аккаунта
                                        </MuiTypography>
                                        <MuiTypography
                                          sx={{
                                            mt: 0.25,
                                            fontSize: 13,
                                            color: "#0f172a",
                                          }}
                                        >
                                          {item.category}
                                        </MuiTypography>
                                      </Box>
                                    ) : null}

                                    {item.accountRegionName?.trim() ? (
                                      <Box>
                                        <MuiTypography
                                          sx={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#64748b",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                          }}
                                        >
                                          Регион
                                        </MuiTypography>
                                        <MuiTypography
                                          sx={{
                                            mt: 0.25,
                                            fontSize: 13,
                                            color: "#0f172a",
                                          }}
                                        >
                                          {item.accountRegionName}
                                        </MuiTypography>
                                      </Box>
                                    ) : null}

                                    {phones.length ? (
                                      <Box>
                                        <MuiTypography
                                          sx={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#64748b",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                          }}
                                        >
                                          Телефоны
                                        </MuiTypography>
                                        {phones.map((phone) => (
                                          <MuiTypography
                                            key={phone}
                                            sx={{
                                              mt: 0.25,
                                              fontSize: 13,
                                              color: "#0f172a",
                                            }}
                                          >
                                            {phone}
                                          </MuiTypography>
                                        ))}
                                      </Box>
                                    ) : null}

                                    {item.notes?.trim() ? (
                                      <Box>
                                        <MuiTypography
                                          sx={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#64748b",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.04em",
                                          }}
                                        >
                                          Заметки
                                        </MuiTypography>
                                        <MuiTypography
                                          sx={{
                                            mt: 0.25,
                                            fontSize: 13,
                                            lineHeight: "18px",
                                            color: "#0f172a",
                                            whiteSpace: "pre-wrap",
                                          }}
                                        >
                                          {item.notes}
                                        </MuiTypography>
                                      </Box>
                                    ) : null}

                                    <Box>
                                      <MuiTypography sx={{ fontSize: 13, color: "#0f172a" }}>
                                        Объявлений: {formatCount(item.allAdsCount)}
                                      </MuiTypography>
                                      {item.allAdsCount > 1 && item.averageCheck ? (
                                        <MuiTypography
                                          sx={{
                                            mt: 0.25,
                                            fontSize: 13,
                                            color: "#0f172a",
                                          }}
                                        >
                                          Средний чек: {formatPrice(item.averageCheck)}
                                        </MuiTypography>
                                      ) : null}
                                    </Box>

                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        onClick={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          handleOpenSellerEdit(item);
                                        }}
                                        startIcon={<EditOutlinedIcon fontSize="small" />}
                                        sx={{
                                          minWidth: 0,
                                          px: 1.5,
                                          py: 0.5,
                                          textTransform: "none",
                                        }}
                                      >
                                        Редактировать
                                      </Button>
                                    </Stack>
                                  </Stack>
                                </Box>
                              }
                            >
                              <NextLink
                                href={`/ads?statusId=0&accountId=${encodeURIComponent(item.userId)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#2563eb",
                                  fontWeight: 700,
                                  textDecoration: "none",
                                }}
                              >
                                {item.accountLabel}
                              </NextLink>
                            </Tooltip>
                            <MuiTypography sx={{ fontSize: 12, color: "#64748b" }}>
                              Account ID: {item.userId}
                            </MuiTypography>
                          </Stack>
                            );
                          })()}
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <MuiTypography sx={{ fontSize: 13, color: "#0f172a" }}>
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
                          <CharacterLimitedChipList
                            items={item.regions ?? []}
                            onShowAll={() =>
                              setListModalState({
                                title: "Регионы",
                                accountLabel: item.accountLabel,
                                items: item.regions ?? [],
                              })
                            }
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 2,
                            px: { xs: "8px", xl: "12px" },
                            verticalAlign: "top",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <CharacterLimitedGroupedChipList
                            sections={[
                              {
                                label: "ВСЕ",
                                items: item.allSpecializations ?? [],
                                tone: "success",
                              },
                              {
                                label: "Архивные",
                                items: item.archivedSpecializations ?? [],
                              },
                            ]}
                            onShowAll={() =>
                              setListModalState({
                                title: "Специализация",
                                accountLabel: item.accountLabel,
                                items: [
                                  ...(item.allSpecializations ?? []),
                                  ...(item.archivedSpecializations ?? []),
                                ],
                                groupedSections: [
                                  {
                                    label: "ВСЕ",
                                    items: item.allSpecializations ?? [],
                                    tone: "success",
                                  },
                                  {
                                    label: "Архивные",
                                    items: item.archivedSpecializations ?? [],
                                  },
                                ],
                              })
                            }
                          />
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

      {listModalState ? (
        <Modal
          open
          title={`${listModalState.title}: ${listModalState.accountLabel}`}
          onClose={() => setListModalState(null)}
          onSubmit={() => setListModalState(null)}
          submitLabel="Закрыть"
          cancelLabel="Отмена"
          hideFooter
          sx={{
            width: 640,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "80vh",
            overflow: "auto",
            borderRadius: "16px",
            p: 3,
          }}
        >
          <Box>
            <MuiTypography
              sx={{ mb: 2, fontSize: 14, color: "#64748b", lineHeight: 1.5 }}
            >
              Всего элементов: {listModalState.items.length}
            </MuiTypography>
            {listModalState.groupedSections ? (
              <Stack spacing={2} sx={{ mb: 2 }}>
                {listModalState.groupedSections
                  .filter((section) => section.items.length > 0)
                  .map((section) => (
                    <Box key={section.label}>
                      <MuiTypography
                        sx={{
                          mb: 1,
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: section.tone === "success" ? "#15803d" : "#64748b",
                        }}
                      >
                        {section.label}
                      </MuiTypography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {section.items.map((item) => (
                          <Chip
                            key={`${section.label}-${item}`}
                            size="small"
                            label={item}
                            sx={{
                              ...(section.tone === "success" ? successChipSx : {}),
                              maxWidth: "100%",
                              "& .MuiChip-label": {
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
              </Stack>
            ) : null}
            {!listModalState.groupedSections ? (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {(listModalState.items ?? []).map((item) => (
                <Chip
                  key={item}
                  size="small"
                  label={item}
                  sx={{
                    maxWidth: "100%",
                    "& .MuiChip-label": {
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
                ))}
              </Stack>
            ) : null}
            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => setListModalState(null)}
              >
                Закрыть
              </Button>
            </Box>
          </Box>
        </Modal>
      ) : null}

      <Modal
        open={!!editingSeller}
        onClose={handleCloseSellerEdit}
        onSubmit={handleSaveSeller}
        title="Редактировать аккаунт"
        submitLabel="Сохранить"
        cancelLabel="Отмена"
        isLoading={sellerMutation.isPending}
        sx={{ width: 560, maxWidth: "calc(100vw - 32px)" }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {editError ? <Alert severity="error">{editError}</Alert> : null}

          <TextField
            label="ID аккаунта"
            value={editingSeller?.userId ?? ""}
            fullWidth
            disabled
            size="small"
          />
          <TextField
            label="Наименование"
            value={editingSeller?.displayName ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      displayName: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Тип аккаунта"
            value={editingSeller?.accountType ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      accountType: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
            select
          >
            <MenuItem value="">Не выбрано</MenuItem>
            {ACCOUNT_TYPE_OPTIONS_FIXED.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Регион"
            value={editingSeller?.accountRegionName ?? ""}
            onChange={(event) => {
              const selectedRegionName = event.target.value;

              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      accountRegionId: undefined,
                      accountRegionName: selectedRegionName,
                    }
                  : prev,
              );
            }}
            fullWidth
            size="small"
            select
          >
            <MenuItem value="">Не выбрано</MenuItem>
            {sellerRegionNames.map((regionName) => (
              <MenuItem key={regionName} value={regionName}>
                {regionName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Телефон 1"
            value={editingSeller?.phone1 ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      phone1: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Телефон 2"
            value={editingSeller?.phone2 ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      phone2: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Телефон 3"
            value={editingSeller?.phone3 ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      phone3: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Заметки"
            value={editingSeller?.notes ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      notes: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
            multiline
            minRows={4}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default CounterpartiesPage;
