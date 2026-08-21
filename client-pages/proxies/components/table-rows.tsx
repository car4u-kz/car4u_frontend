"use client";

import { Box, Chip, Stack, TableRow, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import TableCell from "@/components/table/table-cell";
import type { ProxyListItem } from "../types";

type Props = {
  items: ProxyListItem[];
  onCheck: (item: ProxyListItem) => void;
  onDelete: (item: ProxyListItem) => void;
  onEdit: (item: ProxyListItem) => void;
  formatServiceName: (serviceName: string) => string;
};

const TableRows = ({
  items,
  onCheck,
  onDelete,
  onEdit,
  formatServiceName,
}: Props) => {
  const formatPause = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) {
      return null;
    }

    if (seconds < 60) {
      return `${Math.ceil(seconds)} сек`;
    }

    return `${Math.ceil(seconds / 60)} мин`;
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) {
      return null;
    }

    if (seconds < 60) {
      return `${Math.ceil(seconds)} сек`;
    }

    if (seconds < 3600) {
      return `${Math.ceil(seconds / 60)} мин`;
    }

    return `${Math.ceil(seconds / 3600)} ч`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ready":
        return "Активен";
      case "active":
        return "Используется";
      case "cooling_down":
        return "Пауза";
      case "quarantined":
        return "Карантин";
      default:
        return "Нет данных";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "success";
      case "active":
        return "info";
      case "cooling_down":
        return "warning";
      case "quarantined":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      {items.map((item) => (
        <TableRow
          key={item.proxy}
          sx={{
            "&:hover": {
              bgcolor: "rgba(15, 23, 42, 0.025)",
            },
          }}
        >
          <TableCell sx={{ textAlign: "left", width: 270, verticalAlign: "top" }}>
            <Typography
              sx={{
                display: "inline-flex",
                maxWidth: "100%",
                px: 0.75,
                py: 0.35,
                borderRadius: 1,
                bgcolor: "grey.50",
                fontFamily: "monospace",
                fontSize: 12.5,
                lineHeight: 1.35,
                overflowWrap: "anywhere",
              }}
            >
              {item.proxy}
            </Typography>
          </TableCell>
          <TableCell sx={{ width: 180, verticalAlign: "top" }}>
            <Stack direction="row" gap={0.5} flexWrap="wrap" justifyContent="center">
              {item.serviceNames.map((serviceName) => (
                <Chip
                  key={serviceName}
                  size="small"
                  variant="outlined"
                  label={formatServiceName(serviceName)}
                  sx={{ height: 22, fontSize: 12 }}
                />
              ))}
            </Stack>
          </TableCell>
          <TableCell sx={{ minWidth: 300, verticalAlign: "top" }}>
            <Stack direction="column" gap={0.75}>
              {item.runtimeStatuses?.length ? (
                item.runtimeStatuses.map((status) => {
                  const pause = formatPause(status.pauseRemainingSeconds);
                  return (
                    <Stack
                      key={`${item.proxy}-${status.serviceName}`}
                      direction="column"
                      gap={0.5}
                      sx={{
                        py: 0.5,
                        px: 0.75,
                        borderRadius: 1,
                        bgcolor: "grey.50",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {formatServiceName(status.serviceName)}
                        </Typography>
                        <Chip
                          size="small"
                          color={getStatusColor(status.status)}
                          label={
                            pause
                              ? `${getStatusLabel(status.status)} · ${pause}`
                              : getStatusLabel(status.status)
                          }
                          sx={{ height: 22, fontSize: 12 }}
                        />
                      </Stack>
                      {status.recentTotalCount > 0 || status.penaltyCooldownSeconds > 0 ? (
                        <Stack direction="row" gap={0.75} flexWrap="wrap">
                          <Typography variant="caption" color="text.secondary">
                            Ошибки: {status.recentFailureCount}/{status.recentTotalCount}
                            {status.recentTotalCount > 0
                              ? ` · ${Math.round(status.errorRatePercent)}%`
                              : ""}
                          </Typography>
                          {status.consecutiveFailureCount > 0 ? (
                            <Typography variant="caption" color="warning.main">
                              подряд: {status.consecutiveFailureCount}
                            </Typography>
                          ) : null}
                          {status.penaltyCooldownSeconds > 0 ? (
                            <Typography variant="caption" color="error.main">
                              штраф: {formatDuration(status.penaltyCooldownSeconds)}
                            </Typography>
                          ) : null}
                          {status.penaltyCooldownSeconds > 0 ? (
                            <Typography variant="caption" color="text.secondary">
                              стабильно: {status.stableSuccessCount}/{status.stableSuccessesToDecreasePenalty}
                            </Typography>
                          ) : null}
                        </Stack>
                      ) : null}
                    </Stack>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Нет данных
                </Typography>
              )}
            </Stack>
          </TableCell>
          <TableCell sx={{ maxWidth: 260, verticalAlign: "top" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={item.comment ?? ""}
            >
              {item.comment?.trim() || "-"}
            </Typography>
          </TableCell>
          <TableCell align="right" sx={{ width: 132, verticalAlign: "top" }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.25 }}>
              <Tooltip title="Проверить прокси">
                <IconButton size="small" onClick={() => onCheck(item)}>
                  <HealthAndSafetyOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Редактировать">
                <IconButton size="small" onClick={() => onEdit(item)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton size="small" color="error" onClick={() => onDelete(item)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default TableRows;
