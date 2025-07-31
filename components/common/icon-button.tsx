import { IconButton as MUIIconButton, IconButtonProps } from "@mui/material";

type Props = {} & IconButtonProps;

const IconButton = ({ children, ...rest }: Props) => {
  return <MUIIconButton {...rest}>{children}</MUIIconButton>;
};

export default IconButton;
