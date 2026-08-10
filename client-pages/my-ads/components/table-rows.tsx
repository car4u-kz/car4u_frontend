"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Menu, MenuItem, TableRow } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopCircleIcon from "@mui/icons-material/StopCircle";

import TableCell from "@/components/table/table-cell";
import { Button, IconButton } from "@/components";
import { Status, statusLabels, MenuItemAction } from "@/constants";
import { generateReport } from "@/services/ad-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

import { ActionPayloadType, OurAdItem } from "../types";

type RowMenuAction = "report" | MenuItemAction.edit | MenuItemAction.delete | MenuItemAction.log;

type RowMenuItem = {
  label: string;
  value: RowMenuAction;
  color?: string;
};

const rowMenuItems: Record<string, RowMenuItem> = {
  report: {
    label: "Сформировать отчет",
    value: "report",
  },
  edit: {
    label: "Редактировать",
    value: MenuItemAction.edit,
  },
  delete: {
    label: "Удалить",
    value: MenuItemAction.delete,
    color: "#b91c1c",
  },
  log: {
    label: "Журнал",
    value: MenuItemAction.log,
  },
};

const statusMenuActionsMap: Partial<Record<Status, RowMenuItem[]>> = {
  [Status.started]: [rowMenuItems.report, rowMenuItems.edit, rowMenuItems.log],
  [Status.stopped]: [
    rowMenuItems.report,
    rowMenuItems.edit,
    rowMenuItems.delete,
    rowMenuItems.log,
  ],
  [Status.monitoringCompleted]: [
    rowMenuItems.report,
    rowMenuItems.edit,
    rowMenuItems.delete,
    rowMenuItems.log,
  ],
  [Status.awaitingDeletion]: [rowMenuItems.report, rowMenuItems.log],
  [Status.deleted]: [rowMenuItems.report, rowMenuItems.log],
  [Status.error]: [rowMenuItems.report, rowMenuItems.edit, rowMenuItems.log],
};

const getPrimaryAction = (status: Status): { label: string; value: MenuItemAction; icon: ReactNode } | null => {
  if (status === Status.started) {
    return {
      label: "Остановить",
      value: MenuItemAction.stop,
      icon: <StopCircleIcon fontSize="small" />,
    };
  }

  if (
    status === Status.stopped ||
    status === Status.monitoringCompleted ||
    status === Status.error
  ) {
    return {
      label: "Запустить",
      value: MenuItemAction.start,
      icon: <PlayArrowIcon fontSize="small" />,
    };
  }

  return null;
};

type Props = {
  onClick: (action: ActionPayloadType) => void;
  onEdit: (ad: OurAdItem) => void;
  onLog: (ad: OurAdItem) => void;
  items: OurAdItem[];
};

const TableRows = ({ items, onClick, onEdit, onLog }: Props) => {
  const fetchWithAuth = useFetchWithAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, adId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdId(adId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAdId(null);
  };

  const handleMenuAction = async (action: RowMenuAction, item: OurAdItem) => {
    handleMenuClose();

    if (action === "report") {
      await generateReport(item.id, fetchWithAuth, true);
      return;
    }

    if (action === MenuItemAction.edit) {
      onEdit(item);
      return;
    }

    if (action === MenuItemAction.log) {
      onLog(item);
      return;
    }

    onClick({ id: item.id, method: action, state: "activate" });
  };

  return (
    <>
      {items?.map((item, id) => {
        const status = item?.status as Status;
        const primaryAction = getPrimaryAction(status);
        const menuActions = statusMenuActionsMap[status] ?? [
          rowMenuItems.report,
          rowMenuItems.log,
        ];
        const isMenuOpen = selectedAdId === item.id;

        return (
          <TableRow key={`${id}-${item.status}`}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{statusLabels[status]}</TableCell>
            <TableCell>
              {primaryAction ? (
                <Button
                  size="small"
                  variant="contained"
                  color={primaryAction.value === MenuItemAction.start ? "success" : "primary"}
                  startIcon={primaryAction.icon}
                  sx={{ minWidth: 128 }}
                  onClick={() =>
                    onClick({
                      id: item.id,
                      method: primaryAction.value,
                      state: "activate",
                    })
                  }
                >
                  {primaryAction.label}
                </Button>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <IconButton
                aria-label="Действия"
                onClick={(event) => handleMenuOpen(event, item.id)}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && isMenuOpen}
                onClose={handleMenuClose}
              >
                {menuActions.map((action) => (
                  <MenuItem
                    key={action.value}
                    onClick={() => handleMenuAction(action.value, item)}
                    sx={action.color ? { color: action.color } : undefined}
                  >
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default TableRows;
