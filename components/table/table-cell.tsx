import { TableCell as MUITableCell, TableCellProps } from "@mui/material";

const TableCell = ({ sx, children, colSpan }: TableCellProps) => {
  return (
    <MUITableCell
      colSpan={colSpan}
      sx={{
        p: 1,
        textAlign: "center",
        ...sx,
      }}
    >
      {children}
    </MUITableCell>
  );
};

export default TableCell;
