"use client";

import { Modal as MuiModal, Box, Typography, SxProps } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

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
  isSubmitDisabled?: boolean;
  sx?: SxProps;
  helperText?: string;
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
  isSubmitDisabled,
  helperText = "",
}: Props) => {
  return (
    <MuiModal open={open}>
      <Box sx={{ ...style, ...sx }}>
        {!!title && (
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            children
          )}
        </Box>
        {!!helperText && (
          <Box sx={{ my: 1, textAlign: "right", color: "grey" }}>
            <Typography variant="body2">{helperText}</Typography>
          </Box>
        )}
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
            disabled={isLoading || isSubmitDisabled}
            onClick={onSubmit}
            variant="contained"
            size="small"
            sx={{ ml: 1.5 }}
          >
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </MuiModal>
  );
};

export default Modal;
