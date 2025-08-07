import React from "react";
import { Modal, Button, Box, Typography } from "@mui/material";
import { UserStatus } from "@/types/user";

export function AuthErrorModal({
  errorStatus,
  onClose,
}: {
  errorStatus: UserStatus | null;
  onClose: () => void;
}) {
  if (!errorStatus) return null;

  let title = "";
  let message = "";

  switch (errorStatus) {
    case UserStatus.Unconfirmed:
      title = "Пользователь не подтверждён";
      message =
        "Доступ к ресурсу будет предоставлен после того, как администратор подтвердит вашу учетную запись.";
      break;
    case UserStatus.AccessDenied:
      title = "Доступ запрещён";
      message = "У вас нет прав доступа к этому ресурсу.";
      break;
    case UserStatus.Deleted:
      title = "Пользователь удалён";
      message = "Ваш аккаунт был удалён. Пожалуйста, обратитесь в поддержку.";
      break;
    default:
      title = "Ошибка";
      message = "Произошла неизвестная ошибка.";
      break;
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="auth-error-modal-title"
      aria-describedby="auth-error-modal-description"
    >
      <Box
        sx={{
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          width: { xs: "90%", sm: 400 },
          outline: "none",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          textAlign: "center",
        }}
      >
        <Typography id="auth-error-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography id="auth-error-modal-description" variant="body1">
          {message}
        </Typography>
        <Button variant="contained" onClick={onClose}>
          Ок
        </Button>
      </Box>
    </Modal>
  );
}
