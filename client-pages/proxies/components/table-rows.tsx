"use client";

import { TableRow, Typography, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";

import TableCell from "@/components/table/table-cell";
import type { ProxyListItem } from "../types";

type Props = {
  items: ProxyListItem[];
  onCheck: (item: ProxyListItem) => void;
  onDelete: (item: ProxyListItem) => void;
  formatServiceName: (serviceName: string) => string;
};

const TableRows = ({
  items,
  onCheck,
  onDelete,
  formatServiceName,
}: Props) => {
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
          <TableCell align="right" sx={{ width: 96 }}>
            <IconButton size="small" onClick={() => onCheck(item)}>
              <HealthAndSafetyOutlinedIcon fontSize="small" />
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
