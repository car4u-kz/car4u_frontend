import { Box } from "@mui/material";

import AccountsPage from "@/client-pages/accounts/accounts";

export default function Page() {
  return (
    <Box sx={{ width: "100%", py: 5, px: 15 }}>
      <AccountsPage />
    </Box>
  );
}
