import { MoreVert } from "@mui/icons-material";
import { Menu, MenuItem, TableCell } from "@mui/material";
import React, { useState } from "react";

import { IconButton } from "..";
import { generateReport } from "@/services/ad-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

const menuItems = [
  { label: "Сформировать отчёт", value: "generateReport" },
];

interface Props {
  index: number;
  itemId: number;
  isOurAd?: boolean;
  variant?: "default" | "ads";
}

export default function GeneratePDFDropdown({
  index,
  itemId,
  isOurAd,
  variant = "default",
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const fetchWithAuth = useFetchWithAuth();

  const open = Boolean(anchorEl);
  const isAdsVariant = variant === "ads";

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    idx: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(idx);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleMenuItemClick = async (item: {
    label: string;
    value: string;
    id: number;
  }) => {
    if (item.value === "generateReport") {
      await generateReport(item.id, fetchWithAuth, isOurAd);
    }
    handleMenuClose();
  };

  return (
    <TableCell
      className={isAdsVariant ? "actions-col" : undefined}
      sx={{
        p: 0,
        height: isAdsVariant ? 64 : undefined,
        borderBottom: isAdsVariant ? "1px solid #edf2f7" : undefined,
        textAlign: isAdsVariant ? "right" : undefined,
        verticalAlign: "middle",
      }}
    >
      <IconButton
        onClick={(e) => handleMenuOpen(e, index)}
        aria-label="Actions"
        sx={
          isAdsVariant
            ? {
                width: 32,
                height: 32,
                mr: 1,
                borderRadius: "8px",
                background: "transparent",
                color: "#64748b",
                "&:hover": {
                  background: "#f1f5f9",
                  color: "#0f172a",
                },
              }
            : undefined
        }
      >
        <MoreVert fontSize={isAdsVariant ? "small" : "medium"} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open && selectedRow === index}
        onClose={handleMenuClose}
      >
        {menuItems.map((menuItem, i) => (
          <MenuItem
            key={i}
            onClick={() => handleMenuItemClick({ ...menuItem, id: itemId })}
          >
            {menuItem.label}
          </MenuItem>
        ))}
      </Menu>
    </TableCell>
  );
}
