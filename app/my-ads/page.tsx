import { Box } from "@mui/material";

import MyAdsPage from "@/client-pages/my-ads/my-ads";

export default async function MyAds() {
  return (
    <Box sx={{ width: "100%", py: 5, px: 15 }}>
      <MyAdsPage />
    </Box>
  );
}
