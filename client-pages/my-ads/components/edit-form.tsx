"use client";

import {
  Alert,
  Checkbox,
  FormControlLabel,
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
  formData: AdFormData;
  error?: string | null;
};

const EditForm = ({
  handleChange,
  handleSelect,
  handleBooleanChange,
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
      <Select
        value={formData.depthOfMonitoring}
        placeholder="Глубина мониторинга объявления (стр.)"
        handleChange={(e) => handleSelect(e, "depthOfMonitoring")}
        menuItems={[
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
        ]}
      />
      <TextInput
        type="number"
        max={60 * 99}
        label="Интервал между проходами (сек.)"
        value={formData.intervalSeconds}
        onChange={(e) => handleChange(e, "intervalSeconds")}
      />
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
        helperText={
          formData.hasDetails
            ? undefined
            : "Данные объявления еще не получены обработчиком"
        }
        onChange={(e) => handleChange(e, "description")}
      />
    </Stack>
  );
};

export default EditForm;
