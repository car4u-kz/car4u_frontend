"use client";
import { TableRow } from "@mui/material";

import TableCell from "@/components/table/table-cell";
import { CarTitleHoverPreview, DateTimeTypography } from "@/components";
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
  onRefetch: (itemGlobalIndex: number) => Promise<void>
};

const TableRows = ({ statusId, items, onRefetch }: Props) => {
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
            opacity: item.isViewed ? '0.5' : '1'
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
              isViewed={item.isViewed}
              adId={item.adId}
              onRefetch={onRefetch}
              index={idx}
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
          <GeneratePDFDropdown index={idx} itemId={item.adId} />
        </TableRow>
      ))}
    </>
  );
};

export default TableRows;
