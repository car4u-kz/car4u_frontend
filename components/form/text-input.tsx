"use client";
import * as React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type Props = {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  error?: boolean;
  min?: number;
  max?: number;
} & TextFieldProps;

const validateNumber = (value: number, min = 1, max = 99) =>
  value >= min && value <= max;

const TextInput = ({
  label,
  value,
  onChange,
  helperText,
  error = false,
  type,
  size = "small",
  min = 1,
  max = 99,
  inputProps,
  ...props
}: Props) => {
  return (
    <TextField
      label={label}
      type={type}
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
          (/^\d+$/.test(e.target.value) &&
            validateNumber(Number(e.target.value), min, max)) ||
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
      inputProps={{ min, max, ...inputProps }}
    />
  );
};

export default TextInput;
