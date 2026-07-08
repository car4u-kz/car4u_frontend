"use client";

import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  TableContainer,
  Table as MUITable,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";

import { IconButton, Typography } from "@/components";

import TableBody from "./table-body";
import TableCell from "./table-cell";

type Props = {
  headerLabels: any[];
  dataLength?: number;
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onFetchNext?: () => void;
  visiblePages?: number;
  tableRows: React.ReactElement;
  tableButtons?: React.ReactElement;
};

const Table = ({
  dataLength = 0,
  isFetching = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onFetchNext,
  visiblePages = 0,
  headerLabels,
  tableRows,
  tableButtons,
}: Props) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showScrollToTop = visiblePages >= 3 && showScrollTop;

  const handleScroll = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setShowScrollTop(false);
    }, 300);
  };

  return (
    <InfiniteScroll
      hasMore={hasNextPage}
      next={() => {
        if (typeof onFetchNext === "function") {
          onFetchNext();
        }
      }}
      loader={<LinearProgress sx={{ opacity: isFetching ? 1 : 0 }} />}
      dataLength={dataLength}
      scrollThreshold={0.9}
      style={{ position: "relative" }}
    >
      <TableContainer
        sx={{
          width: "100%",
          maxWidth: "100%",
          minHeight: 520,
          bgcolor: "grey",
          margin: "0 auto",
          overflow: "visible",
        }}
      >
        {!!tableButtons && tableButtons}
        <MUITable sx={{ bgcolor: "white" }} stickyHeader>
          <TableHead>
            <TableRow sx={{ height: "55px" }}>
              {headerLabels?.map((label, idx) => (
                <TableCell key={idx}>
                  <Typography>{label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody
            initialFetch={isFetching && !isFetchingNextPage}
            colSpan={headerLabels?.length}
          >
            {!!tableRows && tableRows}
          </TableBody>
        </MUITable>
        {showScrollToTop && (
          <IconButton
            size="small"
            onClick={handleScroll}
            sx={{
              position: "absolute",
              right: 40,
              bottom: 25,
            }}
          >
            <ArrowUpward />
          </IconButton>
        )}
      </TableContainer>
    </InfiniteScroll>
  );
};
export default Table;
