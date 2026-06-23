"use client";

import { TableRow, Typography, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import TableCell from "@/components/table/table-cell";
import type { ProxyListItem } from "../types";

type Props = {
  items: ProxyListItem[];
  onDelete: (item: ProxyListItem) => void;
};

const TableRows = ({ items, onDelete }: Props) => {
  return (
    <>
      {items.map((item) => (
        <TableRow key={`${item.serviceName}-${item.proxy}`}>
          <TableCell sx={{ textAlign: "left" }}>
            <Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>
              {item.proxy}
            </Typography>
          </TableCell>
          <TableCell>{item.serviceName}</TableCell>
          <TableCell align="right" sx={{ width: 56 }}>
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
