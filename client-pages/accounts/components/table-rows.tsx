"use client";

import {
  Chip,
  IconButton,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import TableCell from "@/components/table/table-cell";
import type { AccountManagementItem } from "@/services/account-services";

type Props = {
  items: AccountManagementItem[];
  onDelete: (item: AccountManagementItem) => void;
};

const TableRows = ({ items, onDelete }: Props) => {
  return (
    <>
      {items.map((item) => {
        const activeAdLabel =
          item.activeOurAdName?.trim() ||
          item.activeOurAdExternalId?.trim() ||
          "Активное объявление";

        return (
          <TableRow key={item.id}>
            <TableCell sx={{ width: 120 }}>
              <Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>
                {item.id}
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: "left" }}>
              <Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>
                {item.login}
              </Typography>
            </TableCell>
            <TableCell sx={{ width: 260 }}>
              {item.hasActiveOurAd ? (
                <Tooltip
                  title={
                    item.activeOurAdsCount > 1
                      ? `Активных объявлений: ${item.activeOurAdsCount}`
                      : activeAdLabel
                  }
                >
                  <Chip
                    color="success"
                    size="small"
                    label={
                      item.activeOurAdsCount > 1
                        ? `Да, ${item.activeOurAdsCount}`
                        : "Да"
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </Tooltip>
              ) : (
                <Chip size="small" label="Нет" variant="outlined" />
              )}
            </TableCell>
            <TableCell sx={{ maxWidth: 320 }}>
              {item.hasActiveOurAd ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={activeAdLabel}
                >
                  {activeAdLabel}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  -
                </Typography>
              )}
            </TableCell>
            <TableCell align="right" sx={{ width: 92 }}>
              {item.activeOurAdExternalId ? (
                <Tooltip title="Открыть объявление на kolesa.kz">
                  <IconButton
                    size="small"
                    href={`https://kolesa.kz/a/show/${item.activeOurAdExternalId}`}
                    target="_blank"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
              <Tooltip title="Удалить аккаунт">
                <IconButton size="small" onClick={() => onDelete(item)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default TableRows;
