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

const formatCompactFromNow = (date: string) => {
  const value = dayjs(date);
  const diffMinutes = dayjs().diff(value, "minute");

  if (diffMinutes < 1) {
    return "только что";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} мин. назад`;
  }

  const diffHours = dayjs().diff(value, "hour");
  if (diffHours < 24) {
    return `${diffHours} ч. назад`;
  }

  const diffDays = dayjs().diff(value, "day");
  if (diffDays < 30) {
    return `${diffDays} дн. назад`;
  }

  return value.format("D MMMM");
};

const DateTimeTypography = ({ date, carSearchParam }: Props) => {
  const time = dayjs(date).format("HH:mm");
  const dateFormated = dayjs(date).format("D MMMM");

  const fromNow = formatCompactFromNow(date);

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
