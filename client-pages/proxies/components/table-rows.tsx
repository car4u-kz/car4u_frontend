"use client";

import { Chip, Stack, TableRow, Typography, IconButton } from "@mui/material";
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
        <TableRow key={item.proxy}>
          <TableCell sx={{ textAlign: "left" }}>
            <Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>
              {item.proxy}
            </Typography>
          </TableCell>
          <TableCell>
            {item.serviceNames.map(formatServiceName).join(", ")}
          </TableCell>
          <TableCell sx={{ minWidth: 210 }}>
            <Stack direction="column" gap={0.75}>
              {item.runtimeStatuses?.length ? (
                item.runtimeStatuses.map((status) => {
                  const pause = formatPause(status.pauseRemainingSeconds);
                  return (
                    <Stack
                      key={`${item.proxy}-${status.serviceName}`}
                      direction="column"
                      gap={0.25}
                    >
                      <Stack direction="row" alignItems="center" gap={0.75}>
                        <Typography variant="caption" color="text.secondary">
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
                        <Typography variant="caption" color="text.secondary">
                          Ошибки: {status.recentFailureCount}/{status.recentTotalCount}
                          {status.recentTotalCount > 0
                            ? ` · ${Math.round(status.errorRatePercent)}%`
                            : ""}
                          {status.penaltyCooldownSeconds > 0
                            ? ` · штраф: ${formatDuration(status.penaltyCooldownSeconds)}`
                            : ""}
                          {status.penaltyCooldownSeconds > 0
                            ? ` · стабильно: ${status.stableSuccessCount}/${status.stableSuccessesToDecreasePenalty}`
                            : ""}
                        </Typography>
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
          <TableCell sx={{ maxWidth: 260 }}>
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
          <TableCell align="right" sx={{ width: 132 }}>
            <IconButton size="small" onClick={() => onCheck(item)}>
              <HealthAndSafetyOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(item)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(item)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default TableRows;
