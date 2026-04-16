"use client";

import { useState } from "react";
import {
  TableRow,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArchiveIcon from "@mui/icons-material/Archive";

import { SplitButton } from "@/components";
import TableCell from "@/components/table/table-cell";

import { Status, statusLabels, MenuItemAction } from "@/constants";
import { ActionPayloadType, MenuItemConfig } from "../types";
import Link from "next/link";
import { exportAdsArchive } from "@/services/search-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

const menuItems: Record<string, MenuItemConfig> = {
  start: {
    label: "Запустить",
    value: MenuItemAction.start,
  },
  stop: {
    label: "Завершить",
    value: MenuItemAction.stop,
  },
};

const statusActionsMap: Partial<Record<Status, MenuItemConfig[]>> = {
  [Status.started]: [menuItems.stop],
  [Status.stopped]: [menuItems.start],
};

type Props = {
  onClick: (action: ActionPayloadType) => void;
  items: any[];
};

const TableRows = ({ items, onClick }: Props) => {
  const fetchWithAuth = useFetchWithAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    templateId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplateId(templateId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplateId(null);
  };

  const handleExportArchive = async () => {
    if (!selectedTemplateId) return;

    try {
      setIsExporting(true);
      await exportAdsArchive(selectedTemplateId, fetchWithAuth);
    } catch (error) {
      console.error("Ошибка при выгрузке архива", error);
    } finally {
      setIsExporting(false);
      handleMenuClose();
    }
  };

  return (
    <>
      {items?.map((item, id) => {
        const status = item?.status as Status;
        const rowMenuItems = statusActionsMap[status];

        return (
          <TableRow key={`${id}-${item.status}`}>
            <TableCell>
              <Typography color="primary.main" sx={{ display: "inline-block" }}>
                <Link href={`/ads?statusId=0&templateId=${item.id}`}>
                  {item.searchName}
                </Link>
              </Typography>
            </TableCell>

            <TableCell>{statusLabels[status]}</TableCell>

            <TableCell>
              <SplitButton
                menuItems={rowMenuItems}
                onClick={(action) => onClick({ ...action, id: item.id })}
              />
            </TableCell>

            <TableCell>-</TableCell>

            <TableCell>{item.source}</TableCell>

            <TableCell align="right" sx={{ width: 56 }}>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, item.id)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        );
      })}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleExportArchive} disabled={isExporting}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {isExporting ? "Выгрузка..." : "Выгрузить архив"}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default TableRows;