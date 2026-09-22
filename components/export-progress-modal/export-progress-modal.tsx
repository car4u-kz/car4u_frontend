"use client";

import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  LinearProgress,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

type Props = {
  open: boolean;
  progressPercent: number;
  message: string;
  status?: "queued" | "running" | "completed" | "failed";
};

export default function ExportProgressModal({
  open,
  progressPercent,
  message,
  status = "running",
}: Props) {
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const progress = Math.max(0, Math.min(100, progressPercent || 0));

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.24)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: "28px",
          display: "grid",
          gap: "18px",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: isFailed
              ? "#fef2f2"
              : isCompleted
                ? "#ecfdf3"
                : "#eff6ff",
            color: isFailed ? "#dc2626" : isCompleted ? "#16a34a" : "#2563eb",
          }}
        >
          {isFailed ? (
            <ErrorOutlineRoundedIcon fontSize="large" />
          ) : isCompleted ? (
            <CheckCircleRoundedIcon fontSize="large" />
          ) : (
            <CircularProgress size={34} thickness={4} color="inherit" />
          )}
        </Box>

        <Box sx={{ display: "grid", gap: "6px" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            {isFailed
              ? "Выгрузка не удалась"
              : isCompleted
                ? "Выгрузка готова"
                : "Готовим выгрузку"}
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: "20px", color: "#64748b" }}>
            {message || "Пожалуйста, подождите. Файл формируется в фоне."}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 999,
              background: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                background: isFailed ? "#dc2626" : "#2563eb",
              },
            }}
          />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
            {progress}%
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
