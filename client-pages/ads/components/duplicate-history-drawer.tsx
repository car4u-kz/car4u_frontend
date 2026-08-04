"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import { Box, IconButton, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { Drawer } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import {
  getCatalogAdDuplicateChainStatusHistory,
  getCatalogAdDuplicateHistory,
  getCatalogAdPositionHistory,
  getCatalogAdStatusHistory,
} from "@/services/ad-services";
import { CatalogAdPositionHistory, CatalogAdStatusTimeline } from "@/types";

type Props = {
  open: boolean;
  adId: number | null;
  externalAdId?: string | null;
  templateId?: number | null;
  onClose: () => void;
};

type DetailState =
  | { mode: "ad"; adId: number; externalAdId: string; title: string; templateId?: number | null }
  | { mode: "chain"; adId: number; templateId?: number | null }
  | { mode: "positions"; adId: number; externalAdId?: string | null; title: string; templateId?: number | null };

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatStatusReason = (reason?: string | null) => {
  switch (reason) {
    case "ActiveOutOfTemplate":
      return "Не соответствует условиям поиска";
    case "ArchivedOnKolesa":
      return "Архивировано на Kolesa";
    case "NotFound404":
      return "Объявление не найдено";
    default:
      return reason || null;
  }
};

const statusSx = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 24,
  px: 1,
  borderRadius: "999px",
  background: "#eef2ff",
  color: "#3730a3",
  fontSize: 12,
  lineHeight: "16px",
  fontWeight: 700,
};

const fieldLabelSx = {
  fontSize: 11,
  lineHeight: "14px",
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
};

const fieldValueSx = {
  mt: 0.25,
  fontSize: 13,
  lineHeight: "18px",
  fontWeight: 500,
  color: "#0f172a",
};

const linkSx = {
  color: "#2563eb",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
};

const kolesaAdTooltip = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u043d\u0430 kolesa.kz";
const systemAdTooltip = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0435 \u0432 \u043d\u0430\u0448\u0435\u0439 \u0441\u0438\u0441\u0442\u0435\u043c\u0435";

const iconButtonSx = {
  width: 34,
  height: 34,
  borderRadius: "8px",
  border: "1px solid #bfdbfe",
  background: "#ffffff",
  color: "#2563eb",
  flexShrink: 0,
  "&:hover": {
    background: "#eff6ff",
    borderColor: "#93c5fd",
  },
};

const quietIconButtonSx = {
  ...iconButtonSx,
  borderColor: "#e2e8f0",
  color: "#64748b",
  "&:hover": {
    background: "#f8fafc",
    borderColor: "#cbd5e1",
  },
};

const chartIconButtonSx = {
  ...iconButtonSx,
  borderColor: "#bbf7d0",
  color: "#15803d",
  background: "#f0fdf4",
  "&:hover": {
    background: "#dcfce7",
    borderColor: "#86efac",
  },
};

const HistoryCardSkeleton = () => (
  <Box
    sx={{
      p: 1.5,
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      background: "#ffffff",
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="44%" height={22} />
        <Skeleton variant="text" width="70%" height={18} />
      </Box>
      <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: "999px" }} />
    </Box>
    <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
      <Box>
        <Skeleton variant="text" width="64%" height={16} />
        <Skeleton variant="text" width="78%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="72%" height={16} />
        <Skeleton variant="text" width="76%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="74%" height={20} />
      </Box>
    </Box>
  </Box>
);

const TimelineSkeleton = () => (
  <Stack spacing={1.25}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Box key={index} sx={{ display: "flex", gap: 1.25 }}>
        <Skeleton variant="circular" width={10} height={10} sx={{ mt: 0.75 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="44%" height={20} />
          <Skeleton variant="text" width="72%" height={18} />
        </Box>
      </Box>
    ))}
  </Stack>
);

const PositionChartSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="48%" height={20} />
    <Skeleton variant="rounded" width="100%" height={190} sx={{ mt: 1, borderRadius: "8px" }} />
    <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
      <Skeleton variant="text" width="26%" height={16} />
      <Skeleton variant="text" width="26%" height={16} />
    </Box>
  </Box>
);

const ChainConnector = ({ height = 28 }: { height?: number }) => (
  <Box
    sx={{
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.75,
      color: "#94a3b8",
    }}
  >
    <Box sx={{ flex: 1, borderTop: "1px solid #e2e8f0" }} />
    <KeyboardArrowDownRoundedIcon
      sx={{
        fontSize: 18,
        color: "#94a3b8",
        flex: "0 0 auto",
      }}
    />
    <Box sx={{ flex: 1, borderTop: "1px solid #e2e8f0" }} />
  </Box>
);

const formatShortDate = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const renderPositionChart = (history: CatalogAdPositionHistory[]) => {
  const sourceTimelines = history.filter((item) => item.points.length > 0);
  const adCount = new Set(sourceTimelines.map((item) => item.catalogAdId)).size;
  const timelines = sourceTimelines.length
    ? [
        {
          ...sourceTimelines[0],
          points: sourceTimelines
            .flatMap((timeline) => timeline.points)
            .sort((left, right) => new Date(left.capturedAt).getTime() - new Date(right.capturedAt).getTime()),
        },
      ]
    : [];

  if (!timelines.length) {
    return (
      <Typography sx={{ fontSize: 14, color: "#64748b" }}>
        {"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u043e\u0437\u0438\u0446\u0438\u0439 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430."}
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {timelines.map((timeline, timelineIndex) => {
        const points = timeline.points;
        const minPosition = Math.min(...points.map((point) => point.position));
        const maxPosition = Math.max(...points.map((point) => point.position));
        const firstDate = points[0]?.capturedAt;
        const lastDate = points[points.length - 1]?.capturedAt;
        const width = 360;
        const height = 190;
        const padding = { top: 18, right: 16, bottom: 34, left: 48 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const positionRange = Math.max(1, maxPosition - minPosition);
        const xStep = points.length > 1 ? plotWidth / (points.length - 1) : 0;
        const coords = points.map((point, index) => {
          const x = padding.left + (points.length > 1 ? index * xStep : plotWidth / 2);
          const y = padding.top + ((point.position - minPosition) / positionRange) * plotHeight;
          return { x, y, point };
        });
        const linePath = coords
          .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`)
          .join(" ");
        const latestPoint = points[points.length - 1];
        const bestDirection = points.length > 1
          ? points[points.length - 2].position - latestPoint.position
          : 0;

        return (
          <Box
            key={`${timeline.catalogAdId}-${timeline.templateId}`}
            sx={{
              py: 1.5,
              borderBottom: timelineIndex < timelines.length - 1 ? "1px solid #e2e8f0" : "none",
              background: "#ffffff",
            }}
          >
            <Tooltip title={systemAdTooltip} arrow>
              <Typography
                component="a"
                href={`/ads?statusId=0&adId=${encodeURIComponent(timeline.externalAdId)}&templateId=${timeline.templateId}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "block",
                  fontSize: 13,
                  lineHeight: "18px",
                  fontWeight: 800,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  ...linkSx,
                }}
              >
                {timeline.templateName || `Template ID: ${timeline.templateId}`}
              </Typography>
            </Tooltip>
            <Typography sx={{ mt: 0.25, fontSize: 12, lineHeight: "16px", color: "#64748b" }}>
              {adCount > 1
                ? `\u041f\u043e\u0437\u0438\u0446\u0438\u0438 \u043f\u043e ${adCount} \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f\u043c \u0432 \u0446\u0435\u043f\u043e\u0447\u043a\u0435`
                : `\u041f\u043e\u0437\u0438\u0446\u0438\u0438 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f ID: ${timeline.externalAdId}`}
            </Typography>

            <Box
              sx={{
                mt: 1.25,
                borderRadius: "8px",
                background: "#f8fafc",
                overflow: "hidden",
              }}
            >
              <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="190" role="img">
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#cbd5e1" />
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" />
                {[0, 0.5, 1].map((tick) => {
                  const y = padding.top + tick * plotHeight;
                  const value = Math.round(minPosition + tick * positionRange);
                  return (
                    <g key={tick}>
                      <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" />
                      <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                        {value}
                      </text>
                    </g>
                  );
                })}
                <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {coords.map((coord, index) => (
                  <g key={`${coord.point.capturedAt}-${index}`}>
                    <circle cx={coord.x} cy={coord.y} r={3.5} fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                    {index === coords.length - 1 ? (
                      <text x={coord.x} y={Math.max(12, coord.y - 8)} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">
                        {coord.point.position}
                      </text>
                    ) : null}
                  </g>
                ))}
                <text x={padding.left} y={height - 12} fontSize="10" fill="#64748b">
                  {formatShortDate(firstDate)}
                </text>
                <text x={width - padding.right} y={height - 12} textAnchor="end" fontSize="10" fill="#64748b">
                  {formatShortDate(lastDate)}
                </text>
              </svg>
            </Box>

            <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Box>
                <Typography sx={fieldLabelSx}>{"\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f"}</Typography>
                <Typography sx={fieldValueSx}>
                  {latestPoint.position}
                  {bestDirection !== 0 ? (
                    <Box component="span" sx={{ ml: 0.75, color: bestDirection > 0 ? "#16a34a" : "#dc2626", fontWeight: 800 }}>
                      {bestDirection > 0 ? "\u2191" : "\u2193"}
                    </Box>
                  ) : null}
                </Typography>
              </Box>
              <Box>
                <Typography sx={fieldLabelSx}>{"\u0417\u0430\u043f\u0438\u0441\u0435\u0439"}</Typography>
                <Typography sx={fieldValueSx}>{points.length}</Typography>
              </Box>
              <Box>
                <Typography sx={fieldLabelSx}>{"\u041b\u0443\u0447\u0448\u0430\u044f"}</Typography>
                <Typography sx={fieldValueSx}>{minPosition}</Typography>
              </Box>
              <Box>
                <Typography sx={fieldLabelSx}>{"\u0425\u0443\u0434\u0448\u0430\u044f"}</Typography>
                <Typography sx={fieldValueSx}>{maxPosition}</Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

const renderTimeline = (timelines: CatalogAdStatusTimeline[]) => {
  if (!timelines.length || timelines.every((item) => !item.events.length)) {
    return (
      <Typography sx={{ fontSize: 14, color: "#64748b" }}>
        {"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0441\u0442\u0430\u0442\u0443\u0441\u043e\u0432 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430."}
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {timelines.map((timeline, timelineIndex) => {
        const firstEvent = timeline.events[0];
        const searchUrl = firstEvent
          ? "/ads?statusId=0&templateId=" + firstEvent.templateId + "&adId=" + encodeURIComponent(timeline.externalAdId)
          : null;

        return (
          <Box key={timeline.catalogAdId}>
            <Box sx={{ mb: 1 }}>
              <Tooltip title={kolesaAdTooltip} arrow>
                <Typography
                  component="a"
                  href={timeline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-block",
                    fontSize: 13,
                    lineHeight: "17px",
                    fontWeight: 700,
                    ...linkSx,
                  }}
                >
                  {timeline.title || timeline.externalAdId}
                </Typography>
              </Tooltip>
              <Typography sx={{ mt: 0.25, fontSize: 12, lineHeight: "16px", color: "#64748b" }}>
                ID: {timeline.externalAdId}
              </Typography>
              {firstEvent && searchUrl ? (
                <Tooltip title={systemAdTooltip} arrow>
                  <Typography
                    component="a"
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      mt: 0.25,
                      display: "block",
                      fontSize: 12,
                      lineHeight: "16px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      ...linkSx,
                    }}
                  >
                    {firstEvent.templateName || "Template ID: " + firstEvent.templateId}
                  </Typography>
                </Tooltip>
              ) : null}
            </Box>

            <Stack spacing={1.25}>
              {timeline.events.map((event, index) => (
                <Box
                  key={timeline.catalogAdId + "-" + event.templateId + "-" + event.capturedAt + "-" + index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "14px minmax(0, 1fr)",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      mt: "6px",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#2563eb",
                      boxShadow: "0 0 0 3px #dbeafe",
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Box sx={statusSx}>{event.statusName}</Box>
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                        {formatDateTime(event.capturedAt)}
                      </Typography>
                    </Box>
                    {formatStatusReason(event.statusReason) ? (
                      <Typography sx={{ mt: 0.25, fontSize: 12, lineHeight: "16px", color: "#64748b" }}>
                        {formatStatusReason(event.statusReason)}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              ))}
            </Stack>

            {timelineIndex < timelines.length - 1 ? <ChainConnector /> : null}
          </Box>
        );
      })}
    </Stack>
  );
};
const CatalogAdDuplicateHistoryDrawer = ({
  open,
  adId,
  externalAdId,
  templateId,
  onClose,
}: Props) => {
  const fetchWithAuth = useFetchWithAuth({ trackLoading: false });
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [drawerPaperEntered, setDrawerPaperEntered] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const openDetail = useCallback(
    (nextDetail: DetailState) => {
      clearCloseTimer();
      setDetail(nextDetail);
      if (detailVisible) {
        return;
      }

      setDetailVisible(false);
      openTimerRef.current = setTimeout(() => {
        setDetailVisible(true);
        openTimerRef.current = null;
      }, 30);
    },
    [clearCloseTimer, detailVisible],
  );

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setDetail(null);
      closeTimerRef.current = null;
    }, 280);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!open) {
      setDrawerPaperEntered(false);
      return undefined;
    }

    const frameId = requestAnimationFrame(() => {
      setDrawerPaperEntered(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [open]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const query = useQuery({
    queryKey: ["catalog-ad-duplicate-history", adId, templateId ?? null],
    queryFn: () => getCatalogAdDuplicateHistory(adId as number, templateId, fetchWithAuth),
    enabled: open && typeof adId === "number",
    retry: false,
  });

  const adStatusQuery = useQuery({
    queryKey: [
      "catalog-ad-status-history",
      detail?.mode === "ad" ? detail.adId : null,
      detail?.mode === "ad" ? detail.templateId : null,
    ],
    queryFn: () => {
      const adDetail = detail as Extract<DetailState, { mode: "ad" }>;
      return getCatalogAdStatusHistory(adDetail.adId, adDetail.templateId, fetchWithAuth);
    },
    enabled: open && detail?.mode === "ad",
    retry: false,
  });

  const chainStatusQuery = useQuery({
    queryKey: [
      "catalog-ad-chain-status-history",
      adId,
      detail?.mode === "chain" ? detail.templateId : null,
    ],
    queryFn: () => {
      const chainDetail = detail as Extract<DetailState, { mode: "chain" }>;
      return getCatalogAdDuplicateChainStatusHistory(adId as number, chainDetail.templateId, fetchWithAuth);
    },
    enabled: open && detail?.mode === "chain" && typeof adId === "number",
    retry: false,
  });

  const positionHistoryQuery = useQuery({
    queryKey: [
      "catalog-ad-position-history",
      adId,
      detail?.mode === "positions" ? detail.templateId : null,
    ],
    queryFn: () => {
      const positionDetail = detail as Extract<DetailState, { mode: "positions" }>;
      return getCatalogAdPositionHistory(positionDetail.adId, positionDetail.templateId, fetchWithAuth);
    },
    enabled: open && detail?.mode === "positions" && typeof adId === "number",
    retry: false,
  });

  const detailTitle = useMemo(() => {
    if (!detail) {
      return null;
    }

    return detail.mode === "chain"
      ? "История всей цепочки"
      : `${"\u0418\u0441\u0442\u043e\u0440\u0438\u044f"} ${detail.title || detail.externalAdId}`;
  }, [detail]);

  const detailContent = (() => {
    if (!detail) {
      return (
        <Typography sx={{ fontSize: 14, color: "#64748b" }}>
          Выберите объявление или всю цепочку, чтобы посмотреть историю статусов.
        </Typography>
      );
    }

    if (detail.mode === "ad") {
      if (adStatusQuery.isLoading) {
        return <TimelineSkeleton />;
      }

      if (adStatusQuery.isError) {
        return (
          <Typography sx={{ fontSize: 14, color: "#b91c1c", fontWeight: 600 }}>
            Не удалось загрузить историю объявления.
          </Typography>
        );
      }

      return adStatusQuery.data ? renderTimeline([adStatusQuery.data]) : null;
    }

    if (detail.mode === "positions") {
      if (positionHistoryQuery.isLoading) {
        return <PositionChartSkeleton />;
      }

      if (positionHistoryQuery.isError) {
        return (
          <Typography sx={{ fontSize: 14, color: "#b91c1c", fontWeight: 600 }}>
            {"\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0441\u0442\u043e\u0440\u0438\u044e \u043f\u043e\u0437\u0438\u0446\u0438\u0439."}
          </Typography>
        );
      }

      return renderPositionChart(positionHistoryQuery.data ?? []);
    }

    if (chainStatusQuery.isLoading) {
      return <TimelineSkeleton />;
    }

    if (chainStatusQuery.isError) {
      return (
        <Typography sx={{ fontSize: 14, color: "#b91c1c", fontWeight: 600 }}>
          Не удалось загрузить историю цепочки.
        </Typography>
      );
    }

    return renderTimeline(chainStatusQuery.data ?? []);
  })();

  const detailMounted = Boolean(detail);
  const detailExpanded = Boolean(detail && detailVisible);
  const drawerPaperTransform = detailExpanded
    ? "translateX(0)"
    : drawerPaperEntered
      ? "translateX(440px)"
      : "translateX(100%)";

  const handleClose = () => {
    clearCloseTimer();
    setDetailVisible(false);
    setDetail(null);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f"}
      subtitle={externalAdId ? `ID объявления: ${externalAdId}` : undefined}
      width={900}
      paperStyle={{
        transform: drawerPaperTransform,
        transition: "transform 225ms cubic-bezier(0, 0, 0.2, 1)",
      }}
      sx={{
        transform: {
          xs: "translateX(0) !important",
          sm: drawerPaperTransform + " !important",
        },
        transition: "transform 225ms cubic-bezier(0, 0, 0.2, 1) !important",
        willChange: "transform",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: "100%",
          gap: 2.5,
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
                <Box
                  sx={{
                    minWidth: 0,
                    flex: "0 0 auto",
                    width: { xs: "100%", md: 420 },
                  }}
                >
          {query.isLoading ? (
            <Stack spacing={1.25}>
              <HistoryCardSkeleton />
              <HistoryCardSkeleton />
            </Stack>
          ) : query.isError ? (
            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: 13,
                lineHeight: "18px",
                fontWeight: 600,
              }}
            >
              Не удалось загрузить историю цепочки.
            </Box>
          ) : !query.data?.length ? (
            <Typography sx={{ fontSize: 14, color: "#64748b" }}>
              Связанных дубликатов нет.
            </Typography>
          ) : (
            <Stack spacing={0}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  mb: 1,
                  p: 1.25,
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  background: detail?.mode === "chain" ? "#eff6ff" : "#f8fafc",
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 13, lineHeight: "18px", fontWeight: 800, color: "#0f172a" }}>
                    {"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u0435\u0440\u0435\u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0439"}
                  </Typography>
                  <Typography sx={{ mt: 0.25, fontSize: 12, lineHeight: "16px", color: "#64748b" }}>
                    {`${query.data.length} \u043e\u0431\u044a\u044f\u0432\u043b. \u0432 \u0441\u0432\u044f\u0437\u0438`}
                  </Typography>
                </Box>
                <Tooltip title={"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0432\u0441\u0435\u0439 \u0446\u0435\u043f\u043e\u0447\u043a\u0438"} arrow>
                  <IconButton
                    aria-label={"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0432\u0441\u0435\u0439 \u0446\u0435\u043f\u043e\u0447\u043a\u0438"}
                    size="small"
                    sx={iconButtonSx}
                    onClick={() => adId && openDetail({ mode: "chain", adId, templateId })}
                  >
                    <TimelineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u043e\u0437\u0438\u0446\u0438\u0439"} arrow>
                  <IconButton
                    aria-label={"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043f\u043e\u0437\u0438\u0446\u0438\u0439"}
                    size="small"
                    sx={chartIconButtonSx}
                    onClick={() =>
                      adId &&
                      openDetail({
                        mode: "positions",
                        adId,
                        externalAdId,
                        title: "\u043f\u043e\u0437\u0438\u0446\u0438\u0439",
                        templateId,
                      })
                    }
                  >
                    <ShowChartRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {query.data.map((item, index) => {
                const adFilterUrl = `/ads?statusId=0&adId=${encodeURIComponent(item.externalAdId)}&templateId=${item.templateId}`;
                const isSelected =
                  detail?.mode === "ad" && detail.externalAdId === item.externalAdId;

                return (
                  <Box key={`${item.catalogAdId}-${item.templateId}`}>
                    <Box
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: isSelected ? "#93c5fd" : "#e2e8f0",
                        borderRadius: "8px",
                        background: isSelected ? "#f8fbff" : "#ffffff",
                        boxShadow: isSelected ? "0 0 0 2px rgba(37, 99, 235, 0.10)" : "none",
                        transition: "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Tooltip title={kolesaAdTooltip} arrow>
                            <Typography
                              component="a"
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display: "block",
                                fontSize: 13,
                                lineHeight: "18px",
                                fontWeight: 700,
                                ...linkSx,
                              }}
                            >
                              {item.title || item.externalAdId}
                            </Typography>
                          </Tooltip>
                          <Typography sx={{ mt: 0.25, fontSize: 12, lineHeight: "16px", color: "#64748b" }}>
                            ID: {item.externalAdId}
                          </Typography>
                          <Tooltip title={systemAdTooltip} arrow>
                            <Typography
                              component="a"
                              href={adFilterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                mt: 0.25,
                                display: "block",
                                fontSize: 12,
                                lineHeight: "16px",
                                ...linkSx,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.templateName || `Template ID: ${item.templateId}`}
                            </Typography>
                          </Tooltip>
                        </Box>
                        <Box sx={statusSx}>{item.currentStatusName}</Box>
                      </Box>

                      <Box
                        sx={{
                          mt: 1.5,
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1.25,
                        }}
                      >
                        <Box>
                          <Typography sx={fieldLabelSx}>Первое обнаружение</Typography>
                          <Typography sx={fieldValueSx}>
                            {formatDateTime(item.firstSeenAt)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={fieldLabelSx}>Статус с</Typography>
                          <Typography sx={fieldValueSx}>
                            {formatDateTime(item.currentStatusSince)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={fieldLabelSx}>Последняя проверка</Typography>
                          <Typography sx={fieldValueSx}>
                            {formatDateTime(item.lastCheckDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={fieldLabelSx}>Template ID</Typography>
                          <Typography sx={fieldValueSx}>{item.templateId}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 1.25, display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title={"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f"} arrow>
                          <IconButton
                            aria-label={"\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f"}
                            size="small"
                            sx={iconButtonSx}
                            onClick={() =>
                              openDetail({
                                mode: "ad",
                                adId: Number(item.externalAdId) || item.catalogAdId,
                                externalAdId: item.externalAdId,
                                title: item.title,
                                templateId: item.templateId,
                              })
                            }
                          >
                            <HistoryRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {index < (query.data?.length ?? 0) - 1 ? (
                      <ChainConnector height={24} />
                    ) : null}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {detailMounted ? (
          <Box
            sx={{
              minWidth: 0,
              flex: "0 0 auto",
              width: { xs: "100%", md: 420 },
              boxSizing: "border-box",
              overflow: "hidden",
              pl: { xs: 0, md: 2 },
              borderLeft: {
                xs: "none",
                md: "1px solid #e2e8f0",
              },
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                width: "100%",
                boxSizing: "border-box",
                p: 1.5,
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "#ffffff",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
              }}
            >
              <Box
                sx={{
                  mb: 1.5,
                  pb: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
              <Typography
                sx={{
                  minWidth: 0,
                  flex: 1,
                  fontSize: 14,
                  lineHeight: "18px",
                  fontWeight: 800,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {detailTitle}
              </Typography>
              <Tooltip title={"\u0421\u043a\u0440\u044b\u0442\u044c"} arrow>
                <IconButton
                  aria-label={"\u0421\u043a\u0440\u044b\u0442\u044c"}
                  size="small"
                  sx={quietIconButtonSx}
                  onClick={closeDetail}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
              <Box
                sx={{
                  maxHeight: { xs: "none", md: "calc(100vh - 190px)" },
                  overflowY: { xs: "visible", md: "auto" },
                  pr: { xs: 0, md: 0.5 },
                }}
              >
                {detailContent}
              </Box>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Drawer>
  );
};

export default CatalogAdDuplicateHistoryDrawer;
