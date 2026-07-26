"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Drawer as MuiDrawer,
  IconButton,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  sx?: SxProps<Theme>;
};

const Drawer = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  width = 420,
  sx,
}: Props) => (
  <MuiDrawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: "100%", sm: width },
        maxWidth: "100vw",
        background: "#ffffff",
        borderLeft: "1px solid #e2e8f0",
        boxShadow: "-16px 0 40px rgba(15, 23, 42, 0.14)",
        ...sx,
      },
    }}
  >
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 18,
              lineHeight: "24px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                lineHeight: "18px",
                color: "#64748b",
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <IconButton
          aria-label="Закрыть"
          onClick={onClose}
          size="small"
          sx={{
            width: 34,
            height: 34,
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            color: "#475569",
            flexShrink: 0,
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2.5 }}>
        {children}
      </Box>
    </Box>
  </MuiDrawer>
);

export default Drawer;
