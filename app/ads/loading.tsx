import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 15 }}>
      <CircularProgress size={50} />
    </Box>
  );
}
