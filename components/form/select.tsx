"use client";

import {
  Select as MUISelect,
  MenuItem,
  SelectChangeEvent,
  InputLabel,
  FormControl,
  SxProps,
  Box,
  FormHelperText,
} from "@mui/material";

export type SelectProps = {
  value: string;
  handleChange: (e: SelectChangeEvent) => void;
  menuItems?: { value: string | number; label: string }[];
  placeholder?: string;
  sx?: SxProps;
  size?: "small" | "medium";
  helperText?: string;
  shrink?: boolean;
  displayEmpty?: boolean;
};

const Select = ({
  value,
  handleChange,
  menuItems,
  placeholder,
  sx,
  helperText,
  shrink = true,
  displayEmpty = true,
  ...rest
}: SelectProps) => {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel shrink={shrink} size="small">
          {placeholder}
        </InputLabel>
        <MUISelect
          sx={{ ...sx }}
          value={value}
          label={placeholder}
          onChange={handleChange}
          displayEmpty={displayEmpty}
          size="small"
          {...rest}
        >
          {menuItems?.map((item) => (
            <MenuItem key={item.label} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </MUISelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default Select;
