"use client";

import { TableRow } from "@mui/material";

import TableCell from "@/components/table/table-cell";

import { ActionPayloadType, MenuItemConfig } from "../types";

import { Status, statusLabels, MenuItemAction } from "@/constants";
import { SplitButton } from "@/components";

const menuItems: Record<string, MenuItemConfig> = {
  start: {
    label: "Запустить мониторинг",
    value: MenuItemAction.start,
  },
  stop: {
    label: "Завершить",
    value: MenuItemAction.stop,
  },
  delete: {
    label: "Удалить",
    value: MenuItemAction.delete,
  },
};

const statusActionsMap: Partial<Record<Status, MenuItemConfig[]>> = {
  [Status.started]: [menuItems.stop],
  [Status.stopped]: [menuItems.start, menuItems.delete],
  [Status.monitoringCompleted]: [menuItems.start, menuItems.delete],
};

type Props = {
  onClick: (action: ActionPayloadType) => void;
  items: any[];
};

const TableRows = ({ items, onClick }: Props) => {
  return (
    <>
      {items?.map((item, id) => {
        const status = item?.status as Status;
        const menuItems = statusActionsMap[status];

        return (
          <TableRow key={`${id}-${item.status}`}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{statusLabels[status]}</TableCell>
            <TableCell>
              <SplitButton
                menuItems={menuItems}
                onClick={(action) => onClick({ ...action, id: item.id })}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};
export default TableRows;
