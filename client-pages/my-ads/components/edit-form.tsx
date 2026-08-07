"use client";

import {
  Alert,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  SelectChangeEvent,
  Stack,
} from "@mui/material";

import { Select, TextInput } from "@/components/form";
import { Typography } from "@/components";

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

      <TextInput
        label="Локальный путь к фотографии на сервере"
        value={formData.mainImagePath}
        onChange={(e) => handleChange(e, "mainImagePath")}
      />

      <Typography>Параметры мониторинга объявления</Typography>

      <TextInput
        type="number"
        label="Количество проходов необнаружения объявления"
        value={formData.notDetectedCount}
        onChange={(e) => handleChange(e, "notDetectedCount")}
      />

      <RadioGroup
        row
        value={formData.monitoringBoundaryType}
        onChange={(e) =>
          handleBoundaryTypeChange(
            e.target.value as AdFormData["monitoringBoundaryType"],
          )
        }
      >
        <FormControlLabel value="page" control={<Radio />} label="Страница" />
        <FormControlLabel value="position" control={<Radio />} label="Позиция" />
      </RadioGroup>

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
        label="Интервал между проходами (сек.)"
        value={formData.intervalSeconds}
        onChange={(e) => handleChange(e, "intervalSeconds")}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.timingRepublishingEnabled}
            onChange={(e) =>
              handleBooleanChange(e.target.checked, "timingRepublishingEnabled")
            }
          />
        }
        label="Перепубликация по таймингу"
      />

      {formData.timingRepublishingEnabled && (
        <TextInput
          type="number"
          min={1}
          label="Перепубликовывать через (час.)"
          value={formData.timingRepublishingIntervalHours}
          onChange={(e) => handleChange(e, "timingRepublishingIntervalHours")}
        />
      )}

      <TextInput
        max={99}
        type="number"
        label="Длительность мониторинга (дней)"
        value={formData.monitoringDurationDays}
        onChange={(e) => handleChange(e, "monitoringDurationDays")}
      />

      <Typography>Данные объявления</Typography>

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
      />

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

      <TextInput
        label="Описание"
        value={formData.description}
        disabled={!formData.hasDetails}
        multiline
        minRows={4}
        maxRows={8}
        sx={{
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
    </Stack>
  );
};

export default EditForm;
