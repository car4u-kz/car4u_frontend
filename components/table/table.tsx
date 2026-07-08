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
    const container = document.getElementById("scrollableDiv");
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 1600);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const showScrollToTop = visiblePages >= 3 && showScrollTop;

  const handleScroll = () => {
    const scrollContainer = document.getElementById("scrollableDiv");
    scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setShowScrollTop(false);
    }, 300);
  };

  return (
    <InfiniteScroll
      scrollableTarget="scrollableDiv"
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
        id="scrollableDiv"
        sx={{
          width: "100%",
          maxWidth: "100%",
          maxHeight: { xs: "none", xl: "calc(100vh - 220px)" },
          minHeight: { xs: 520, xl: "calc(100vh - 220px)" },
          bgcolor: "grey.100",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.300",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
          margin: "0 auto",
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
