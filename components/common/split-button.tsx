"use client";

import { useState } from "react";
import {
  Box,
  ButtonProps,
  Divider,
  Menu,
  MenuItem as MUIMenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import Button from "./button";

import type {
  MenuItemConfig,
  ActionPayloadType,
} from "@/client-pages/search/types";

export type SplitButtonProps = {
  menuItems?: MenuItemConfig[];
  onClick: (value: ActionPayloadType) => void;
} & Omit<ButtonProps, "onClick">;

const colors: Record<string, "success" | "error" | "primary"> = {
  0: "success",
  1: "primary",
  2: "error",
};

const SplitButton = ({
  menuItems = [],
  onClick,
  disabled,
  sx,
}: SplitButtonProps) => {
  const [menuItemAction, setMenuItemAction] = useState<MenuItemConfig>(
    menuItems[0]
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = !!anchorEl;

  const pickedColor = colors[menuItemAction?.value] ?? "primary";

  return (
    <>
      <Button
        sx={{ minWidth: 166, ...sx }}
        onClick={() =>
          onClick({ method: menuItemAction?.value, state: "activate" })
        }
        disabled={disabled}
        size="small"
        endIcon={
          <ArrowDropDownIcon
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget as unknown as HTMLElement);
            }}
          />
        }
        color={pickedColor}
        variant="contained"
      >
        <Box display="flex" alignItems="center">
          <Box sx={{ minWidth: 100 }}>
            {menuItemAction?.label ?? menuItems?.[0]?.label}
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, width: 2, bgcolor: "rgba(255,255,255,0.5)" }}
          />
        </Box>
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {menuItems?.map((item, i) => (
          <MUIMenuItem
            key={i}
            onClick={() => {
              setAnchorEl(null);
              setMenuItemAction(item);
              onClick({ method: item.value, state: "select" });
            }}
          >
            {item.label}
          </MUIMenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SplitButton;
