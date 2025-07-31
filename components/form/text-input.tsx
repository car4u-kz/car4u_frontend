"use client";
import * as React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type Props = {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  error?: boolean;
  max?: number;
} & TextFieldProps;

const validateNumber = (value: number, max = 99) => value <= max;

const TextInput = ({
  label,
  value,
  onChange,
  helperText,
  error = false,
  type,
  size = "small",
  max = 99,
  ...props
}: Props) => {
  return (
    <TextField
      label={label}
      value={value}
      onKeyDown={(e) => {
        if (
          type === "number" &&
          [".", ",", "-", "+", "e"].includes(e.key.toLowerCase())
        ) {
          e.preventDefault();
        }
      }}
      onChange={(e) => {
        if (type !== "number") return onChange(e);

        if (
          (/^[1-9]\d*$/.test(e.target.value) &&
            validateNumber(Number(e.target.value), max)) ||
          e.target.value === ""
        ) {
          return onChange(e);
        }
      }}
      helperText={helperText}
      error={error}
      variant="outlined"
      fullWidth
      size={size}
      {...props}
    />
  );
};

export default TextInput;
