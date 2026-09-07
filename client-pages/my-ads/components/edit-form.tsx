"use client";

import {
  Alert,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  SelectChangeEvent,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import TuneIcon from "@mui/icons-material/Tune";

import { Select, TextInput } from "@/components/form";

import type { AdFormData } from "../types";

type Props = {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof AdFormData,
  ) => void;
  handleSelect: (e: SelectChangeEvent, key: keyof AdFormData) => void;
  handleBooleanChange: (value: boolean, key: keyof AdFormData) => void;
  handleBoundaryTypeChange: (value: AdFormData["monitoringBoundaryType"]) => void;
  formData: AdFormData;
  error?: string | null;
};

const sectionSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1.5,
  p: 2,
  bgcolor: "background.paper",
};

const gridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
  gap: 2,
};

const sectionTitleSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 1.5,
};

const getFileName = (path: string) => {
  const normalized = path.replace(/\\/g, "/");
  return normalized.split("/").filter(Boolean).pop() || "Файл не выбран";
};

const boundaryButtonSx = (selected: boolean) => ({
  flex: 1,
  gap: 1,
  py: 1.1,
  border: 0,
  borderRadius: 0,
  color: selected ? "primary.contrastText" : "text.primary",
  bgcolor: selected ? "primary.main" : "transparent",
  fontWeight: 700,
  textTransform: "none",
  "&:hover": {
    bgcolor: selected ? "primary.dark" : "action.hover",
  },
  "&.Mui-selected, &.Mui-selected:hover": {
    bgcolor: selected ? "primary.main" : "transparent",
    color: selected ? "primary.contrastText" : "text.primary",
  },
});

const EditForm = ({
  handleChange,
  handleSelect,
  handleBooleanChange,
  handleBoundaryTypeChange,
  formData,
  error,
}: Props) => {
  return (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Stack gap={2}>
          <Box sx={sectionSx}>
            <Box sx={sectionTitleSx}>
              <TuneIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                Параметры мониторинга
              </Typography>
            </Box>

            <Stack gap={1.5}>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={formData.monitoringBoundaryType}
                onChange={(_, value) => {
                  if (value) {
                    handleBoundaryTypeChange(
                      value as AdFormData["monitoringBoundaryType"],
                    );
                  }
                }}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                  mb: 0.75,
                  "& .MuiToggleButton-root + .MuiToggleButton-root": {
                    borderLeft: "1px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <ToggleButton
                  value="page"
                  selected={formData.monitoringBoundaryType === "page"}
                  sx={boundaryButtonSx(
                    formData.monitoringBoundaryType === "page",
                  )}
                >
                  <DescriptionOutlinedIcon fontSize="small" />
                  Страница
                </ToggleButton>
                <ToggleButton
                  value="position"
                  selected={formData.monitoringBoundaryType === "position"}
                  sx={boundaryButtonSx(
                    formData.monitoringBoundaryType === "position",
                  )}
                >
                  <LeaderboardOutlinedIcon fontSize="small" />
                  Позиция
                </ToggleButton>
              </ToggleButtonGroup>

              <Box sx={gridSx}>
                <TextInput
                  type="number"
                  label="Не обнаружено, проходов"
                  value={formData.notDetectedCount}
                  onChange={(e) => handleChange(e, "notDetectedCount")}
                />

                {formData.monitoringBoundaryType === "page" ? (
                  <Select
                    value={formData.depthOfMonitoring}
                    placeholder="Граничная страница"
                    handleChange={(e) => handleSelect(e, "depthOfMonitoring")}
                    menuItems={[
                      { value: "1", label: "1" },
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "4", label: "4" },
                      { value: "5", label: "5" },
                    ]}
                  />
                ) : (
                  <TextInput
                    type="number"
                    min={1}
                    label="Граничная позиция"
                    value={formData.depthOfMonitoring}
                    onChange={(e) => handleChange(e, "depthOfMonitoring")}
                  />
                )}

                <TextInput
                  type="number"
                  max={60 * 99}
                  label="Интервал проверок"
                  value={formData.intervalSeconds}
                  onChange={(e) => handleChange(e, "intervalSeconds")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">сек.</InputAdornment>
                    ),
                  }}
                />

                <TextInput
                  max={99}
                  type="number"
                  label="Длительность мониторинга"
                  value={formData.monitoringDurationDays}
                  onChange={(e) => handleChange(e, "monitoringDurationDays")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">дней</InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Divider />

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    Автоперепубликация
                  </Typography>
                  <Switch
                    checked={formData.timingRepublishingEnabled}
                    onChange={(e) =>
                      handleBooleanChange(
                        e.target.checked,
                        "timingRepublishingEnabled",
                      )
                    }
                  />
                </Box>

                <Box sx={gridSx}>
                  <TextInput
                    type="number"
                    min={1}
                    label="Через"
                    value={formData.timingRepublishingIntervalHours}
                    disabled={!formData.timingRepublishingEnabled}
                    onChange={(e) =>
                      handleChange(e, "timingRepublishingIntervalHours")
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">час.</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box sx={sectionSx}>
            <Box sx={sectionTitleSx}>
              <ImageOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                Фото
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                p: 1.25,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "grey.50",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  bgcolor: "common.white",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 auto",
                  color: "text.secondary",
                }}
              >
                <ImageOutlinedIcon fontSize="small" />
              </Box>
              <Stack gap={1} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {getFileName(formData.mainImagePath)}
                </Typography>
                <TextInput
                  label="Путь к фото"
                  value={formData.mainImagePath}
                  onChange={(e) => handleChange(e, "mainImagePath")}
                  sx={{
                    bgcolor: "common.white",
                    "& .MuiInputBase-input": {
                      py: 0.75,
                      fontSize: 13,
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: 13,
                    },
                  }}
                />
              </Stack>
            </Box>
          </Box>
        </Stack>

        <Box sx={sectionSx}>
          <Box sx={sectionTitleSx}>
            <ArticleOutlinedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              Данные объявления
            </Typography>
          </Box>

          <Stack gap={1.5}>
            <TextInput
              label="Название"
              value={formData.name}
              onChange={(e) => handleChange(e, "name")}
            />

            <TextInput
              label="Описание"
              value={formData.description}
              disabled={!formData.hasDetails}
              multiline
              minRows={6}
              maxRows={9}
              sx={{
                mb: 0.75,
                "& textarea": {
                  overflowY: "auto",
                },
              }}
              helperText={
                formData.hasDetails
                  ? undefined
                  : "Данные объявления еще не получены обработчиком"
              }
              onChange={(e) => handleChange(e, "description")}
            />

            <Box sx={gridSx}>
              <TextInput
                type="number"
                max={999999999}
                label="Цена"
                value={formData.price}
                disabled={!formData.hasDetails}
                helperText={
                  formData.hasDetails
                    ? undefined
                    : "Данные объявления еще не получены обработчиком"
                }
                onChange={(e) => handleChange(e, "price")}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₸</InputAdornment>,
                }}
              />

              <TextInput
                type="number"
                max={9999999}
                label="Пробег"
                value={formData.mileage}
                disabled={!formData.hasDetails}
                helperText={
                  formData.hasDetails
                    ? undefined
                    : "Данные объявления еще не получены обработчиком"
                }
                onChange={(e) => handleChange(e, "mileage")}
                InputProps={{
                  endAdornment: <InputAdornment position="end">км</InputAdornment>,
                }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isNewAuto}
                    disabled={!formData.hasDetails}
                    onChange={(e) =>
                      handleBooleanChange(e.target.checked, "isNewAuto")
                    }
                  />
                }
                label="Новое авто"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.toOrder}
                    disabled={!formData.hasDetails}
                    onChange={(e) =>
                      handleBooleanChange(e.target.checked, "toOrder")
                    }
                  />
                }
                label="На заказ"
              />
            </Box>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};

export default EditForm;
