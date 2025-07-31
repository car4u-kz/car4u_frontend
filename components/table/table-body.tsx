"use client";

import {
  TableBody as MUITableBody,
  TableRow,
  LinearProgress,
} from "@mui/material";
import TableCell from "./table-cell";
import { ReactNode } from "react";

type Props = {
  initialFetch: boolean;
  colSpan: number;
  children: ReactNode;
};

// TODO: Ask about further reusability of this part.
const TableBody = ({ initialFetch, children, colSpan }: Props) => {
  if (initialFetch) {
    return (
      <MUITableBody>
        <TableRow>
          <TableCell colSpan={colSpan}>
            <LinearProgress />
          </TableCell>
        </TableRow>
      </MUITableBody>
    );
  }

  return <MUITableBody>{children}</MUITableBody>;
};

export default TableBody;
