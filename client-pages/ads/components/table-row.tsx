"use client";

import { Box, TableCell, TableRow, Typography } from "@mui/material";

import { CarTitleHoverPreview, DateTimeTypography, IconButton } from "@/components";
import {
  formatDistance,
  formatPrice,
  getAdIdFromUrl,
} from "@/utils/formatters";

import { SEARCH_QUERY as SQ } from "@/constants";
import { CarAd } from "@/types";
import GeneratePDFDropdown from "@/components/generate-pdf/generate-pdf";

type Props = {
  items: CarAd[];
  statusId: SQ;
  onUpdate: (itemGlobalIndex: number) => Promise<void>;
  onAccountClick: (accountId: string) => void;
};

const getDisplayDate = (item: CarAd, statusId: SQ): string => {
  switch (statusId) {
    case SQ.all:
      return item.publicationDate as string;
    case SQ.new:
    case SQ.pendingArchiveValidation:
    case SQ.notFound404:
      return item.lastCheckDate as string;
    case SQ.archived:
    default:
      return item.latestAdUpdateDate as string;
  }
};

const baseCellSx = {
  height: 64,
  px: "14px",
  py: "10px",
  borderBottom: "1px solid #edf2f7",
  fontSize: 13,
  lineHeight: "18px",
  color: "#0f172a",
  verticalAlign: "middle",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const subtleCellSx = {
  ...baseCellSx,
  color: "#334155",
};

const TableRows = ({ statusId, items, onUpdate, onAccountClick }: Props) => {
  return (
    <>
      {items?.map((item, idx) => {
        const adExternalId = getAdIdFromUrl(item.adUrl);

        return (
          <TableRow
            key={`${item.adId}-${idx}`}
            hover
            sx={{
              backgroundColor: "#ffffff",
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "#f8fafc",
              },
              opacity: item.isViewed ? 0.55 : 1,
            }}
          >
            <TableCell className="published-col" sx={{ ...subtleCellSx, whiteSpace: "nowrap" }}>
              <DateTimeTypography
                carSearchParam={statusId}
                date={getDisplayDate(item, statusId)}
              />
            </TableCell>

            <TableCell className="car-col" sx={baseCellSx}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: item.firstPhotoLink ? "12px" : 0,
                  minWidth: 0,
                }}
              >
                {item.firstPhotoLink ? (
                  <Box
                    component="img"
                    src={item.firstPhotoLink}
                    alt={item.adTitle}
                    sx={{
                      width: 56,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: "7px",
                      border: "1px solid #e2e8f0",
                      background: "#f1f5f9",
                      flexShrink: 0,
                    }}
                  />
                ) : null}

                <Box
                  sx={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: 230,
                      "& .MuiTypography-root": {
                        display: "inline-block",
                        maxWidth: "100%",
                      },
                      "& a": {
                        display: "inline-block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 14,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#2563eb",
                        textDecoration: "none",
                      },
                      "& a:hover": {
                        color: "#1d4ed8",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    <CarTitleHoverPreview
                      src={item.firstPhotoLink}
                      shortDescription={item.shortDescription}
                      adUrl={item.adUrl}
                      isViewed={item.isViewed}
                      adId={item.adId}
                      onUpdate={onUpdate}
                      index={idx}
                    >
                      {item.adTitle}
                    </CarTitleHoverPreview>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: 12,
                      lineHeight: "16px",
                      fontWeight: 500,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>ID: {adExternalId}</span>
                    <span>
                      Account:{" "}
                      {item.sellerUserId ? (
                        <button
                          type="button"
                          onClick={() => onAccountClick(item.sellerUserId!)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#2563eb",
                            cursor: "pointer",
                            font: "inherit",
                          }}
                        >
                          {item.sellerUserId}
                        </button>
                      ) : (
                        "—"
                      )}
                    </span>
                  </Box>
                </Box>
              </Box>
            </TableCell>

            <TableCell className="year-col" sx={subtleCellSx}>
              {item.adYear}
            </TableCell>

            <TableCell
              className="price-col"
              sx={{
                ...baseCellSx,
                fontWeight: 700,
                color: "#0f172a",
                whiteSpace: "nowrap",
              }}
            >
              {formatPrice(item.dynamicPrice)}
            </TableCell>

            <TableCell className="mileage-col" sx={subtleCellSx}>
              {formatDistance(item.mileage)}
            </TableCell>

            <TableCell className="engine-col" sx={subtleCellSx}>
              {item.engineVolume} {item.fuelType}
            </TableCell>

            <TableCell className="gearbox-col" sx={subtleCellSx}>
              {item.transmission}
            </TableCell>

            <TableCell className="body-col" sx={subtleCellSx}>
              {item.bodyType}
            </TableCell>

            <TableCell
              className="region-col"
              sx={{
                ...subtleCellSx,
                maxWidth: 180,
              }}
            >
              {item.region}
            </TableCell>

            <GeneratePDFDropdown index={idx} itemId={item.adId} variant="ads" />
          </TableRow>
        );
      })}
    </>
  );
};

export default TableRows;
