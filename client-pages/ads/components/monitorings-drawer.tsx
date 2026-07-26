"use client";

import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { Drawer } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { getCatalogAdMonitorings } from "@/services/ad-services";

type Props = {
  open: boolean;
  adId: number | null;
  externalAdId?: string | null;
  onClose: () => void;
};

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

const renderPosition = (
  position?: number | null,
  previousPosition?: number | null
) => {
  if (typeof position !== "number") {
    return "—";
  }

  if (typeof previousPosition !== "number" || previousPosition === position) {
    return position;
  }

  const movedUp = position < previousPosition;
  const diff = Math.abs(previousPosition - position);

  return (
    <Box
      component="span"
      title={`Предыдущая позиция: ${previousPosition}`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
      }}
    >
      <Box
        component="span"
        sx={{
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {position}
      </Box>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.35,
          color: movedUp ? "#15803d" : "#b91c1c",
          fontSize: 12,
          lineHeight: 1,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          {movedUp ? "↑" : "↓"}
        </Box>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          {diff}
        </Box>
      </Box>
    </Box>
  );
};

const MonitoringCardSkeleton = () => (
  <Box
    sx={{
      p: 1.5,
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      background: "#ffffff",
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
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" width="72%" height={22} />
        <Skeleton variant="text" width="38%" height={18} />
      </Box>
      <Skeleton variant="rounded" width={74} height={24} sx={{ borderRadius: "999px" }} />
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
        <Skeleton variant="text" width="62%" height={16} />
        <Skeleton variant="text" width="82%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="70%" height={16} />
        <Skeleton variant="text" width="78%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="66%" height={16} />
        <Skeleton variant="text" width="74%" height={20} />
      </Box>
      <Box>
        <Skeleton variant="text" width="44%" height={16} />
        <Skeleton variant="text" width="34%" height={20} />
      </Box>
    </Box>
  </Box>
);

const CatalogAdMonitoringsDrawer = ({
  open,
  adId,
  externalAdId,
  onClose,
}: Props) => {
  const fetchWithAuth = useFetchWithAuth({ trackLoading: false });
  const adFilterUrl = externalAdId
    ? `/ads?statusId=0&adId=${encodeURIComponent(externalAdId)}`
    : "/ads?statusId=0";

  const query = useQuery({
    queryKey: ["catalog-ad-monitorings", adId],
    queryFn: () => getCatalogAdMonitorings(adId as number, fetchWithAuth),
    enabled: open && typeof adId === "number",
    retry: false,
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Мониторинг по поискам"
      subtitle={externalAdId ? `ID объявления: ${externalAdId}` : undefined}
      width={460}
    >
      {query.isLoading ? (
        <Stack spacing={1.5}>
          <MonitoringCardSkeleton />
          <MonitoringCardSkeleton />
          <MonitoringCardSkeleton />
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
          Не удалось загрузить мониторинги объявления.
        </Box>
      ) : !query.data?.length ? (
        <Typography sx={{ fontSize: 14, color: "#64748b" }}>
          Мониторинги для этого объявления не найдены.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {query.data.map((item) => (
            <Box
              key={item.catalogAdTemplateId}
              sx={{
                p: 1.5,
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "#ffffff",
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
                  <Typography
                    component="a"
                    href={item.templateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "block",
                      fontSize: 14,
                      lineHeight: "18px",
                      fontWeight: 700,
                      ...linkSx,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.templateName}
                  </Typography>
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
                    }}
                  >
                    Template ID: {item.templateId}
                  </Typography>
                </Box>
                <Box sx={statusSx}>{item.statusName}</Box>
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
                  <Typography sx={fieldLabelSx}>Дата обнаружения</Typography>
                  <Typography sx={fieldValueSx}>
                    {formatDateTime(item.firstSeenAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={fieldLabelSx}>Последняя синхронизация</Typography>
                  <Typography sx={fieldValueSx}>
                    {formatDateTime(item.lastCheckDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={fieldLabelSx}>Последнее наличие</Typography>
                  <Typography sx={fieldValueSx}>
                    {formatDateTime(item.lastSeenAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={fieldLabelSx}>Позиция</Typography>
                  <Typography sx={fieldValueSx}>
                    {renderPosition(item.position, item.previousPosition)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
};

export default CatalogAdMonitoringsDrawer;
