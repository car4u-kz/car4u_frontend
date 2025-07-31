"use client";

import { useSearchParams, usePathname } from "next/navigation";

import { Box, SxProps } from "@mui/material";
import { Button } from "@/components";
import { Select, SelectProps } from "@/components/form";
import { SEARCH_QUERY as SQ } from "@/constants";

type Props = {
  selectProps: SelectProps;
};

const TableButtons = ({ selectProps }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusId = searchParams.get("statusId") as string;

  const onClick = (btnType: SQ) => {
    const templateId = searchParams.get("templateId") as string;

    const query = new URLSearchParams({
      statusId: btnType,
    });

    if (!!templateId) {
      query.set("templateId", templateId);
    }

    const url = `${pathname}?${query.toString()}`;

    window.history.pushState({}, "", url);
  };

  const sxProps = (btnName: string): SxProps => ({
    backgroundColor: btnName === statusId ? "white" : "black",
    color: btnName === statusId ? "black" : "white",
  });

  return (
    <Box padding={2}>
      <Box display="flex" gap={2}>
        <Button
          size="small"
          sx={sxProps(SQ.all)}
          onClick={() => onClick(SQ.all)}
        >
          Все
        </Button>
        <Button
          size="small"
          sx={sxProps(SQ.new)}
          onClick={() => onClick(SQ.new)}
        >
          Новые
        </Button>
        <Button
          size="small"
          sx={sxProps(SQ.archived)}
          onClick={() => onClick(SQ.archived)}
        >
          Архивные
        </Button>
      </Box>
      <Box mt={2}>
        <Select {...selectProps} />
      </Box>
    </Box>
  );
};

export default TableButtons;
