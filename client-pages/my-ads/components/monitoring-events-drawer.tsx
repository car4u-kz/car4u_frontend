"use client";

import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { Drawer } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { getOurAdMonitoringEvents } from "@/services/ad-services";

type Props = {
  open: boolean;
  adId: number | null;
  title?: string | null;
  onClose: () => void;
};

const eventLabels: Record<string, string> = {
  monitoring_created: "Мониторинг создан",
  monitoring_updated: "Настройки обновлены",
  monitoring_started: "Мониторинг запущен",
  monitoring_stopped: "Мониторинг остановлен",
  monitoring_completed: "Мониторинг завершен",
  monitoring_error: "Ошибка мониторинга",
  monitoring_stopped_error: "Мониторинг остановлен с ошибкой",
  delete_requested: "Запрошено удаление",
  republish_started: "Перепубликация запущена",
  republish_retry: "Повторная попытка",
  republish_skipped: "Перепубликация отложена",
  republish_completed: "Перепубликация выполнена",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDetails = (value?: string | null) => {
  if (!value) return null;

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const MonitoringEventsDrawer = ({ open, adId, title, onClose }: Props) => {
  const fetchWithAuth = useFetchWithAuth();
  const query = useQuery({
    queryKey: ["my-ads", adId, "monitoring-events"],
    queryFn: () => getOurAdMonitoringEvents(adId!, fetchWithAuth),
    enabled: open && !!adId,
    retry: false,
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Журнал объявления"
      subtitle={title}
      width={520}
    >
      {query.isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={86} />
          ))}
        </Stack>
      ) : query.isError ? (
        <Typography sx={{ color: "#b91c1c", fontSize: 14 }}>
          Не удалось загрузить журнал объявления.
        </Typography>
      ) : !query.data?.length ? (
        <Typography sx={{ color: "#64748b", fontSize: 14 }}>
          Для этой цепочки объявлений пока нет записей журнала.
        </Typography>
      ) : (
        <Stack spacing={0}>
          {query.data.map((event, index) => {
            const details = formatDetails(event.detailsJson);

            return (
              <Box
                key={event.id}
                sx={{
                  position: "relative",
                  pl: 3,
                  pb: index === query.data.length - 1 ? 0 : 2.25,
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: 6,
                    top: 18,
                    bottom: 0,
                    width: "1px",
                    background:
                      index === query.data.length - 1 ? "transparent" : "#e2e8f0",
                  },
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 6,
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "2px solid #2563eb",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    {eventLabels[event.eventType] ?? event.eventType}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                    {formatDateTime(event.createdAt)}
                  </Typography>
                </Box>

                <Typography sx={{ mt: 0.5, fontSize: 13, color: "#334155", lineHeight: "18px" }}>
                  {event.message}
                </Typography>

                <Typography sx={{ mt: 0.5, fontSize: 12, color: "#64748b" }}>
                  ID: {event.externalAdId}
                  {event.reason ? ` · Причина: ${event.reason}` : ""}
                </Typography>

                {details ? (
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 1,
                      maxHeight: 160,
                      overflow: "auto",
                      borderRadius: "6px",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: 11,
                      lineHeight: "16px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {details}
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Stack>
      )}
    </Drawer>
  );
};

export default MonitoringEventsDrawer;
