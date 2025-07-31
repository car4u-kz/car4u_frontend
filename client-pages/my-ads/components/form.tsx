"use client";

import { Stack, SelectChangeEvent, Alert } from "@mui/material";
import { Select, TextInput } from "@/components/form";

import type { AdFormData } from "../types";
import { Typography } from "@/components";

type Props = {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof AdFormData
  ) => void;
  handleSelect: (e: SelectChangeEvent, key: keyof AdFormData) => void;
  formData: AdFormData;
  error?: string | null;
  parsingTemplateDataOptions: { value: number; label: string }[];
};

const Form = ({
  handleChange,
  handleSelect,
  parsingTemplateDataOptions,
  formData,
  error,
}: Props) => {
  return (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextInput
        label="Наименование Объявления"
        value={formData.name}
        onChange={(e) => handleChange(e, "name")}
      />
      <Select
        value={formData.parsingTemplateId}
        placeholder="Parsing Template ID"
        handleChange={(e) => handleSelect(e, "parsingTemplateId")}
        menuItems={parsingTemplateDataOptions}
      />
      <TextInput
        label="URL"
        value={formData.url}
        onChange={(e) => handleChange(e, "url")}
      />

      <TextInput
        label="Локальний путь к фотографии на сервере"
        value={formData.mainImagePath}
        onChange={(e) => handleChange(e, "mainImagePath")}
      />
      <Typography>Параметры мониторинга Объявления</Typography>
      <TextInput
        type="number"
        label="Количество проходов необнаружения Объявления"
        value={formData.notDetectedCount}
        onChange={(e) => handleChange(e, "notDetectedCount")}
      />
      <Select
        value={formData.depthOfMonitoring}
        placeholder="Глубина мониторинга Объявления (стр.)"
        handleChange={(e) => handleSelect(e, "depthOfMonitoring")}
        menuItems={[
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "ВСЕ", label: "ALL" },
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
    </Stack>
  );
};

export default Form;
