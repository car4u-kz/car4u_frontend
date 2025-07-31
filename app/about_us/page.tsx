import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function Page() {
  return (
    <Box
      sx={{
        px: {
          sm: 5,
          md: 10,
          lg: 30,
        },
        pb: 5,
      }}
    >
      <Typography>
        Товарищество с ограниченной ответственностью{" "}
        <Link href="/" style={{ textDecoration: "underline", color: "blue" }}>
          “Car4U.kz”
        </Link>
      </Typography>
      <Typography>БИН 200840027507</Typography>
      <Typography>Индекс: 050000</Typography>
      <Typography>
        Адрес: Республика Казахстан, г. Алматы, пр. Суюнбая, 211
      </Typography>
      <Typography>Тел: +77011277607</Typography>
      <Typography>e-mail: dvorkoles@gmail.com</Typography>
    </Box>
  );
}
