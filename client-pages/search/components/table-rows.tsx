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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import StopOutlinedIcon from "@mui/icons-material/StopOutlined";
import Link from "next/link";

import TableCell from "@/components/table/table-cell";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { exportAdsArchive } from "@/services/search-services";
import { Status, statusLabels, MenuItemAction } from "@/constants";
import {
  ActionPayloadType,
  MenuItemConfig,
  ParsingTemplateItem,
} from "../types";

const menuItems: Record<string, MenuItemConfig> = {
  start: {
    label: "Запустить",
    value: MenuItemAction.start,
  },
  stop: {
    label: "Остановить",
    value: MenuItemAction.stop,
  },
  delete: {
    label: "Удалить",
    value: MenuItemAction.delete,
  },
};

const statusActionsMap: Partial<Record<Status, MenuItemConfig[]>> = {
  [Status.started]: [menuItems.stop],
  [Status.stopped]: [menuItems.start],
};

type Props = {
  onClick: (action: ActionPayloadType) => void;
  onEdit: (template: ParsingTemplateItem) => void;
  items: ParsingTemplateItem[];
};

const formatCreatedAt = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("ru-RU");
};

const TableRows = ({ items, onClick, onEdit }: Props) => {
  const fetchWithAuth = useFetchWithAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ParsingTemplateItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    template: ParsingTemplateItem,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleExportArchive = async () => {
    if (!selectedTemplate) return;

    try {
      setIsExporting(true);
      await exportAdsArchive(selectedTemplate.id, fetchWithAuth);
    } catch (error) {
      console.error("Ошибка при выгрузке архива", error);
    } finally {
      setIsExporting(false);
      handleMenuClose();
    }
  };

  const handleDeleteClick = () => {
    if (selectedTemplate) {
      onClick({ id: selectedTemplate.id, method: MenuItemAction.delete });
    }
    handleMenuClose();
  };

  const handleEditClick = () => {
    if (selectedTemplate) {
      onEdit(selectedTemplate);
    }
    handleMenuClose();
  };

  const handleStateActionClick = () => {
    if (!selectedTemplate) return;

    const status = selectedTemplate.status as Status;
    const stateAction = statusActionsMap[status]?.[0];

    if (!stateAction) return;

    onClick({ id: selectedTemplate.id, method: stateAction.value });
    handleMenuClose();
  };

  const selectedTemplateStatusAction = selectedTemplate
    ? statusActionsMap[selectedTemplate.status as Status]?.[0]
    : undefined;

  return (
    <>
      {items.map((item, id) => {
        const status = item.status as Status;

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

            <TableCell>{formatCreatedAt(item.createdAt)}</TableCell>

            <TableCell>{item.source}</TableCell>

            <TableCell align="right" sx={{ width: 56 }}>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, item)}
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
        {selectedTemplateStatusAction && (
          <MenuItem onClick={handleStateActionClick}>
            <ListItemIcon>
              {selectedTemplateStatusAction.value === MenuItemAction.start ? (
                <PlayArrowOutlinedIcon fontSize="small" />
              ) : (
                <StopOutlinedIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{selectedTemplateStatusAction.label}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать поиск</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportArchive} disabled={isExporting}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {isExporting ? "Выгрузка..." : "Выгрузить результаты"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Удалить поиск</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default TableRows;
