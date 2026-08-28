"use client";

import {
  Modal as MuiModal,
  Box,
  IconButton,
  Typography,
  SxProps,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";

import { Button } from "@/components";

const style: SxProps = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 2.5,
};

type Props = {
  open: boolean;
  title?: string;
  children: React.ReactElement;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: () => void;
  onClose: () => void;
  isLoading?: boolean;
  sx?: SxProps;
};

const Modal = ({
  open = true,
  title,
  children,
  submitLabel = "Сохранить",
  cancelLabel = "Отменить",
  onSubmit = () => {},
  onClose = () => {},
  isLoading,
  sx,
  hideFooter = false,
}: Props & { hideFooter?: boolean }) => {
  const handleClose = (
    _event: {},
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (isLoading || reason === "backdropClick") return;
    onClose();
  };

  return (
    <MuiModal open={open} onClose={handleClose}>
      <Box sx={{ ...style, ...sx }}>
        {!!title && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              pb: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            <IconButton
              size="small"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Закрыть"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Box
          sx={{
            mt: 2,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            flex: 1,
          }}
        >
          {isLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            children
          )}
        </Box>
        {!hideFooter && (
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="contained"
              size="small"
              color="error"
            >
              {cancelLabel}
            </Button>
            <Button
              disabled={isLoading}
              onClick={onSubmit}
              variant="contained"
              size="small"
              sx={{ ml: 1.5 }}
            >
              {submitLabel}
            </Button>
          </Box>
        )}
      </Box>
    </MuiModal>
  );
};

export default Modal;
