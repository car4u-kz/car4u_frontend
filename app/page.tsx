import {
  Box,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { Button, Link, Typography } from "@/components";

const featuresA = [
  "Автоматизируем мониторинг объявлений",
  "Проверим достоверность данных указанных в объявлении",
  "Осмотрим и продиагностируем выбранный автомобиль",
  "Соберем данные об истории эксплуатации автомобиля",
  "Предоставим онлайн доступ к данным и результатам",
  "Составим и разместим объявление на классифайдах",
  "Предоставим возможность быстрого выкупа автомобиля",
];

const featuresB = [
  "Исключим из поиска неподходящие авто с помощью фильтров",
  "Проведем анализ рынка",
  "Проведем студийную фотосъемку автомобиля",
  "Оцифруем все собранные данные об автомобиле",
  "Поможем определить рыночную стоимость авто",
  "Применим уникальные автостратегии на классифайдах",
  "Возьмем на себя все хлопоты общения с потенциальными клиентами",
];

const ListItemWrapped = ({ text }: { text: string }) => (
  <ListItem dense disableGutters>
    <ListItemIcon sx={{ maxWidth: 40, minHeight: 48 }}>
      <CheckIcon sx={{ color: "black" }} />
    </ListItemIcon>
    <ListItemText sx={{ minHeight: "48px" }}>{text}</ListItemText>
  </ListItem>
);

export default async function Page() {
  const color = "grey.700";
  return (
    <Box>
      <Box maxWidth={800} margin="0 auto">
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Car4U - ваш помощник в бизнес-процессах выкупа и продажи автомобилей
        </Typography>
        <Typography color={color} width="670px" variant="h6">
          Зарабатывайте и экономьте на сделках с автомобилями вместе с Car4U
        </Typography>
        <Button variant="contained" sx={{ my: 4, bgcolor: "common.black" }}>
          Подай заявку на получение доступа
        </Button>
        <Typography sx={{ fontStyle: "italic" }} color={color}>
          Доступ к сервису только для профессионалов автомобильного рынка
        </Typography>
      </Box>
      <Box sx={{ p: 6 }} bgcolor="grey.50" my={10} mx="auto" maxWidth={750}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Наши услуги
        </Typography>
        <Stack direction="row" gap={5}>
          <List disablePadding dense>
            {featuresA.map((text) => (
              <ListItemWrapped key={text} text={text} />
            ))}
          </List>
          <List disablePadding dense>
            {featuresB.map((text) => (
              <ListItemWrapped key={text} text={text} />
            ))}
          </List>
        </Stack>
      </Box>
      <Stack component="section" mb={10} alignItems="center">
        <Typography textAlign="center" variant="h4" my={2}>
          Начните работать с Car4U уже сегодня
        </Typography>
        <Button variant="contained" sx={{ my: 4, bgcolor: "common.black" }}>
          Подай заявку на получение доступа
        </Button>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-around"
        py={2.5}
        component="footer"
        sx={{ borderTop: "1px solid", borderColor: "grey.400" }}
      >
        <Typography color={color}>© 2025 Car4U. Все права защищены.</Typography>
        <Stack
          direction="row"
          gap={2}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Typography color={color}>
            <Link target="_self" href="/about_us">
              О компании
            </Link>
          </Typography>
          <Typography color={color}>
            <Link target="_self" href="/terms_of_use">
              Пользовательское соглашение
            </Link>
          </Typography>
          <Typography color={color}>
            <Link target="_self" href="/privacy_policy">
              Политика конфиденциальности
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
