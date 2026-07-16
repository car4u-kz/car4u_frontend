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
};

const statusActionsMap: Partial<Record<Status, MenuItemConfig[]>> = {
  [Status.started]: [menuItems.stop, menuItems.edit],
  [Status.stopped]: [menuItems.start, menuItems.edit, menuItems.delete],
  [Status.monitoringCompleted]: [
    menuItems.start,
    menuItems.edit,
    menuItems.delete,
  ],
};

type Props = {
  onClick: (action: ActionPayloadType) => void;
  onEdit: (ad: OurAdItem) => void;
  items: OurAdItem[];
};

const TableRows = ({ items, onClick, onEdit }: Props) => {
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
                onClick={(action) => {
                  if (action.method === MenuItemAction.edit) {
                    onEdit(item);
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
