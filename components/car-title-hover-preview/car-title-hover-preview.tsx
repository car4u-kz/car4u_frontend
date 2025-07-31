"use client";

import { Stack, Box } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { Tooltip, Typography, Image, Link } from "../common";

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
};

export default function ({ children, shortDescription, src, adUrl }: Props) {
  const classes = useStyles();
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
      <Typography color="primary.main" sx={{ display: "inline-block" }}>
        <Link href={adUrl}>{children}</Link>
      </Typography>
    </Tooltip>
  );
}
