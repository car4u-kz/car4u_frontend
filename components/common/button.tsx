"use client";
import { Button as MUIButton, ButtonProps } from "@mui/material";

type Props = {} & ButtonProps;

const Button = ({ children, ...rest }: Props) => {
  return <MUIButton {...rest}>{children}</MUIButton>;
};

export default Button;
