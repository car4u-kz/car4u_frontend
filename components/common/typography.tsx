import { Typography as MUITypography, TypographyProps } from "@mui/material";

type Props = {} & TypographyProps;

const Typography = ({ children, ...rest }: Props) => {
  return <MUITypography {...rest}>{children}</MUITypography>;
};

export default Typography;
