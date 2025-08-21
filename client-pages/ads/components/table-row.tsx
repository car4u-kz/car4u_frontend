"use client";
import { useState } from "react";
import { IconButton, Menu, MenuItem, TableRow } from "@mui/material";

import TableCell from "@/components/table/table-cell";
import { CarTitleHoverPreview, DateTimeTypography } from "@/components";
import {
  formatDistance,
  formatPrice,
  getAdIdFromUrl,
} from "@/utils/formatters";
import { MoreVert } from "@mui/icons-material";

import { SEARCH_QUERY as SQ } from "@/constants";
import { CarAd } from "@/types";
import { generateReport } from "@/services/ad-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

type Props = {
  items: CarAd[];
  statusId: SQ;
};

const menuItems = [{ label: "Сформировать отчёт", value: "generateReport" }];

const TableRows = ({ statusId, items }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const fetchWithAuth = useFetchWithAuth();

  const open = Boolean(anchorEl);
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    idx: number
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
    adId: number;
  }) => {
    if (item.value === "generateReport") {
      await generateReport(item.adId, fetchWithAuth);
    }
    handleMenuClose();
  };
  return (
    <>
      {items?.map((item, idx) => (
        <TableRow
          key={`${item.adId}-${idx}`}
          sx={{
            transition: "background-color .25s ease",
            backgroundColor: idx % 2 === 0 ? "white" : "grey.200",
            "&:hover": {
              backgroundColor: "#f5f9ff",
            },
          }}
        >
          <TableCell>
            <DateTimeTypography
              carSearchParam={statusId}
              date={
                statusId === SQ.all
                  ? (item.publicationDate as string)
                  : (item.latestAdUpdateDate as string)
              }
            />
          </TableCell>
          <TableCell>ID объявления: {getAdIdFromUrl(item.adUrl)}</TableCell>
          <TableCell sx={{ maxWidth: "350px" }}>
            <CarTitleHoverPreview
              src={item.firstPhotoLink}
              shortDescription={item.shortDescription}
              adUrl={item.adUrl}
            >
              {item.adTitle}
            </CarTitleHoverPreview>
          </TableCell>
          <TableCell>{item.adYear}</TableCell>
          <TableCell>{formatPrice(item.dynamicPrice)}</TableCell>
          <TableCell>{formatDistance(item.mileage)}</TableCell>
          <TableCell>
            {item.engineVolume} {item.fuelType}
          </TableCell>
          <TableCell>{item.transmission}</TableCell>
          <TableCell>{item.bodyType}</TableCell>
          <TableCell>{item.region}</TableCell>
          <TableCell>
            <IconButton onClick={(e) => handleMenuOpen(e, idx)}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open && selectedRow === idx}
              onClose={handleMenuClose}
            >
              {menuItems.map((menuItem, i) => (
                <MenuItem
                  key={i}
                  onClick={() =>
                    handleMenuItemClick({ ...menuItem, adId: item.adId })
                  }
                >
                  {menuItem.label}
                </MenuItem>
              ))}
            </Menu>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default TableRows;
