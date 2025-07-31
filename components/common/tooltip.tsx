import { Tooltip as MUITooltip, TooltipProps } from "@mui/material";

type Props = {} & TooltipProps;

export default function ({ children, ...rest }: Props) {
  return <MUITooltip {...rest}>{children}</MUITooltip>;
}
