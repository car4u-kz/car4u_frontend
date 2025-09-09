"use client";

import { Stack, Box } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { Tooltip, Typography, Image, Link } from "../common";
import { markAdAsViewed } from "@/services/ad-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

const useStyles = makeStyles(() => ({
  tooltip: {
    maxWidth: "400px",
    backgroundColor: "darkgrey",
    color: "black",
    padding: "8px",
  },
}));

type Props = {
  children: string | React.ReactElement;
  shortDescription?: string;
  src: string;
  adUrl: string;
  isViewed: boolean,
  adId: number,
  index: number,
  onRefetch: (itemGlobalIndex: number) => Promise<void>
};

export default function ({ children, shortDescription, src, adUrl, isViewed, adId, onRefetch, index }: Props) {
  const classes = useStyles();
  const fetchWithAuth = useFetchWithAuth();

  const handleView = async () => {
    if (!isViewed) {
      await markAdAsViewed(adId, fetchWithAuth);
      await onRefetch(index);
    }
  }

  return (
    <Tooltip
      title={
        <Stack direction="row" gap={1}>
          <Image src={src} />
          <Typography variant="body2">{shortDescription}</Typography>
        </Stack>
      }
      placement="right"
      classes={{ tooltip: classes.tooltip }}
    >
      <Typography 
        color={isViewed ? '#FFC107' : "primary.main"} 
        sx={{ display: "inline-block" }} 
        onClick={handleView}
      >
        <Link href={adUrl}>{children}</Link>
      </Typography>
    </Tooltip>
  );
}
