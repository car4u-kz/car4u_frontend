import { Box } from "@mui/material";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

import { Typography } from "../common";

import { SEARCH_QUERY as SQ } from "@/constants";

dayjs.extend(relativeTime);
dayjs.locale("ru");

type Props = {
  date: string;
  carSearchParam: SQ;
};

const DateTimeTypography = ({ date, carSearchParam }: Props) => {
  const time = dayjs(date).format("HH:mm");
  const dateFormated = dayjs(date).format("D MMMM");

  const fromNow = dayjs(date).fromNow();

  const fontWeight = "bold";

  if ([SQ.all, SQ.archived].includes(carSearchParam)) {
    return <Typography>{fromNow}</Typography>;
  }

  return (
    <Box>
      <Typography fontWeight={fontWeight}>{time}</Typography>
      <Typography fontWeight={fontWeight} color="grey" fontSize="0.65rem">
        {dateFormated}
      </Typography>
    </Box>
  );
};

export default DateTimeTypography;
