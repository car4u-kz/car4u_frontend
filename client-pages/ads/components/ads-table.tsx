"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";

import { Button, IconButton } from "@/components";

type HeaderCell = {
  key: string;
  label: React.ReactNode;
  className?: string;
};

type Props = {
  headerCells: HeaderCell[];
  dataLength: number;
  totalCount?: number;
  hasNextPage?: boolean;
  isInitialLoading?: boolean;
  isLoadingMore?: boolean;
  isError?: boolean;
  isLoadMoreError?: boolean;
  onFetchNext?: () => void;
  onRetry?: () => void;
  tableRows: React.ReactNode;
};

const SKELETON_ROWS = 8;

const AdsTable = ({
  headerCells,
  dataLength,
  totalCount,
  hasNextPage = false,
  isInitialLoading = false,
  isLoadingMore = false,
  isError = false,
  isLoadMoreError = false,
  onFetchNext,
  onRetry,
  tableRows,
}: Props) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasNextPage || isInitialLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && typeof onFetchNext === "function") {
          onFetchNext();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 420px 0px",
        threshold: 0,
      },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasNextPage, isInitialLoading, isLoadingMore, onFetchNext, dataLength]);

  const showScrollToTop = dataLength >= 30 && showScrollTop;
  const hasItems = dataLength > 0;

  const loadedText = useMemo(() => {
    if (typeof totalCount === "number" && totalCount > 0) {
      return `Показано ${dataLength.toLocaleString("ru-RU")} из ${totalCount.toLocaleString("ru-RU")}`;
    }

    return `Показано ${dataLength.toLocaleString("ru-RU")}`;
  }, [dataLength, totalCount]);

  const footerState = (() => {
    if (isLoadMoreError || (isError && hasItems)) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            color: "#ef4444",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <span>Не удалось загрузить объявления</span>
          <Button
            size="small"
            variant="outlined"
            onClick={onRetry}
            sx={{
              height: 32,
              px: 1.5,
              borderRadius: "8px",
              borderColor: "#e2e8f0",
              color: "#0f172a",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              "&:hover": {
                background: "#f8fafc",
                borderColor: "#cbd5e1",
              },
            }}
          >
            Повторить
          </Button>
        </Box>
      );
    }

    if (isLoadingMore) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.25,
            color: "#64748b",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <CircularProgress size={18} thickness={5} />
          <span>Загружаем объявления...</span>
        </Box>
      );
    }

    if (!hasNextPage && hasItems) {
      return (
        <Box sx={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>
          Все объявления загружены
        </Box>
      );
    }

    return null;
  })();

  return (
    <Box
      sx={{
        mt: 2,
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
            minWidth: 1100,
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: 14,
            color: "#0f172a",
            "& .published-col": {
              width: 140,
            },
            "& .car-col": {
              width: 310,
            },
            "& .year-col": {
              width: 70,
            },
            "& .price-col": {
              width: 110,
            },
            "& .mileage-col": {
              width: 120,
            },
            "& .engine-col": {
              width: 120,
            },
            "& .gearbox-col": {
              width: 100,
            },
            "& .body-col": {
              width: 110,
            },
            "& .region-col": {
              width: "auto",
            },
            "& .actions-col": {
              width: 44,
            },
            "@media (max-width: 1200px)": {
              "& .body-col": {
                display: "none",
              },
            },
            "@media (max-width: 1000px)": {
              "& .engine-col, & .gearbox-col": {
                display: "none",
              },
            },
          }}
        >
          <TableHead sx={{ background: "#ffffff" }}>
            <TableRow>
              {headerCells.map((cell) => (
                <TableCell
                  key={cell.key}
                  className={cell.className}
                  sx={{
                    height: 48,
                    px: "14px",
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
                  {cell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isInitialLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={headerCells.length} sx={{ height: 64, px: "14px", py: "10px", borderBottom: "1px solid #edf2f7" }}>
                    <Box
                      sx={{
                        height: 36,
                        borderRadius: "8px",
                        background:
                          "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
                        backgroundSize: "200% 100%",
                        animation: "adsTableSkeletonLoading 1.2s ease-in-out infinite",
                        "@keyframes adsTableSkeletonLoading": {
                          from: {
                            backgroundPosition: "200% 0",
                          },
                          to: {
                            backgroundPosition: "-200% 0",
                          },
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : hasItems ? (
              <>
                {tableRows}
                <TableRow>
                  <TableCell
                    colSpan={headerCells.length}
                    sx={{ height: 1, p: 0, borderBottom: "none" }}
                  >
                    <Box ref={triggerRef} sx={{ width: "100%", height: 1 }} />
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headerCells.length}
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
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                      Объявления не найдены
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>
                      Попробуйте изменить фильтры или выбрать другой шаблон.
                    </Typography>
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
          {loadedText}
        </Box>
        <Box
          sx={{
            minWidth: 180,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {footerState}
        </Box>
      </Box>

      {showScrollToTop && (
        <IconButton
          size="small"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "absolute",
            right: 24,
            bottom: 72,
            width: 38,
            height: 38,
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#334155",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
            "&:hover": {
              background: "#f8fafc",
            },
          }}
        >
          <ArrowUpward fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default AdsTable;
