"use client";

import { Stack, SelectChangeEvent, Alert } from "@mui/material";
import { Select, TextInput } from "@/components/form";

import { Typography } from "@/components";
// add login and password
type Props = {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: "password" | "login"
  ) => void;
  formData: {
    login: string;
    password: string;
  };
  error?: string | null;
};

const Form = ({ handleChange, formData, error }: Props) => {
  return (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextInput
        label="Логин"
        value={formData.login}
        onChange={(e) => handleChange(e, "login")}
      />

      <TextInput
        label="Пароль"
        value={formData.password}
        type="password"
        onChange={(e) => handleChange(e, "password")}
      />
    </Stack>
  );
};

export default Form;
