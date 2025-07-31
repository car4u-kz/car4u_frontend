"use client";

import { Stack, SelectChangeEvent, Alert } from "@mui/material";
import { Select, TextInput } from "@/components/form";

import type { SearchFormData } from "../types";

type Props = {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof SearchFormData
  ) => void;
  handleSelect: (e: SelectChangeEvent) => void;
  formData: SearchFormData;
  error?: string | null;
};

const Form = ({ handleChange, handleSelect, formData, error }: Props) => {
  return (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Select
        value={formData.source}
        placeholder="Источник поиска"
        handleChange={handleSelect}
        menuItems={[{ value: "https://kolesa.kz", label: "https://kolesa.kz" }]}
      />
      <TextInput
        label="URL"
        value={formData.url}
        onChange={(e) => handleChange(e, "url")}
      />
      <TextInput
        label="Название Поиска"
        value={formData.searchName}
        onChange={(e) => handleChange(e, "searchName")}
      />
      <TextInput
        type="number"
        max={60 * 99}
        label="Интервалы между проходами (сек.)"
        value={formData.intervalSeconds}
        onChange={(e) => handleChange(e, "intervalSeconds")}
      />
      <TextInput
        type="number"
        label="Длительность поиска (дней)"
        value={formData.searchDurationDays}
        onChange={(e) => handleChange(e, "searchDurationDays")}
      />
    </Stack>
  );
};

export default Form;
