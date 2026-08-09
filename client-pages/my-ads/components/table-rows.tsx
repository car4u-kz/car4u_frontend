"use client";

import { TableRow } from "@mui/material";

import TableCell from "@/components/table/table-cell";
import { SplitButton } from "@/components";
import GeneratePDFDropdown from "@/components/generate-pdf/generate-pdf";
import { Status, statusLabels, MenuItemAction } from "@/constants";

import { ActionPayloadType, MenuItemConfig, OurAdItem } from "../types";

const menuItems: Record<string, MenuItemConfig> = {
  start: {
    label: "Запустить мониторинг",
    value: MenuItemAction.start,
  },
  stop: {
    label: "Завершить",
    value: MenuItemAction.stop,
  },
  edit: {
    label: "Редактировать",
    value: MenuItemAction.edit,
  },
  delete: {
    label: "Удалить",
    value: MenuItemAction.delete,
  },
  log: {
    label: "Журнал",
    value: MenuItemAction.log,
  },
};

const statusActionsMap: Partial<Record<Status, MenuItemConfig[]>> = {
  [Status.started]: [menuItems.stop, menuItems.edit, menuItems.log],
  [Status.stopped]: [menuItems.start, menuItems.edit, menuItems.delete, menuItems.log],
  [Status.monitoringCompleted]: [
    menuItems.start,
    menuItems.edit,
    menuItems.delete,
    menuItems.log,
  ],
  [Status.awaitingDeletion]: [menuItems.log],
  [Status.deleted]: [menuItems.log],
  [Status.error]: [menuItems.start, menuItems.edit, menuItems.log],
};

type Props = {
  onClick: (action: ActionPayloadType) => void;
  onEdit: (ad: OurAdItem) => void;
  onLog: (ad: OurAdItem) => void;
  items: OurAdItem[];
};

const TableRows = ({ items, onClick, onEdit, onLog }: Props) => {
  return (
    <>
      {items?.map((item, id) => {
        const status = item?.status as Status;
        const rowMenuItems = statusActionsMap[status] ?? [menuItems.log];

        return (
          <TableRow key={`${id}-${item.status}`}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{statusLabels[status]}</TableCell>
            <TableCell>
              <SplitButton
                menuItems={rowMenuItems}
                onClick={(action) => {
                  if (action.method === MenuItemAction.edit) {
                    onEdit(item);
                    return;
                  }

                  if (action.method === MenuItemAction.log) {
                    onLog(item);
                    return;
                  }

                  onClick({ ...action, id: item.id });
                }}
              />
            </TableCell>
            <GeneratePDFDropdown index={id} itemId={item.id} isOurAd />
          </TableRow>
        );
      })}
    </>
  );
};

export default TableRows;
