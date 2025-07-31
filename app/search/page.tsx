import { Box } from "@mui/material";

import SearchPage from "@/client-pages/search/search";

export default async function Search() {
  return (
    <Box sx={{ width: "100%", py: 5, px: 15 }}>
      <SearchPage />
    </Box>
  );
}
