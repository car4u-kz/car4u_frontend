"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";

import { Button, IconButton } from "@/components";
import { Select, TextInput } from "@/components/form";
import type { AdLookupOption, AdModelLookupOption } from "@/types";

const filterLabelSx = {
  fontSize: 13,
  lineHeight: "18px",
  fontWeight: 700,
  color: "#0f172a",
};

const fieldGridSx = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const inputSx = {
  "& .MuiInputBase-root": {
    height: 38,
    borderRadius: "8px",
    background: "#ffffff",
    fontSize: 13,
    fontWeight: 500,
    color: "#0f172a",
  },
  "& .MuiInputBase-input": {
    height: 38,
    boxSizing: "border-box",
    px: "12px",
    py: 0,
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#94a3b8",
    opacity: 1,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#dbe1ea",
  },
  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#cbd5e1",
  },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563eb",
    borderWidth: 1,
  },
  "& .MuiInputBase-root.Mui-focused": {
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
  },
  "& .MuiInputLabel-root": {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2563eb",
  },
};

const selectWrapperSx = {
  minWidth: 0,
  "& .MuiFormControl-root": {
    width: "100%",
  },
  "& .MuiInputLabel-root": {
    display: "none",
  },
  "& .MuiInputBase-root": {
    height: 38,
    borderRadius: "8px",
    background: "#ffffff",
    fontSize: 13,
    fontWeight: 500,
    color: "#0f172a",
  },
  "& .MuiSelect-select": {
    height: 38,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    px: "12px",
    py: 0,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#dbe1ea",
  },
  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#cbd5e1",
  },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563eb",
    borderWidth: 1,
  },
  "& .MuiInputBase-root.Mui-focused": {
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
  },
};

const resetButtonSx = {
  height: 40,
  borderRadius: "8px",
  borderColor: "#dbe1ea",
  background: "#ffffff",
  color: "#0f172a",
  textTransform: "none",
  fontSize: 13,
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": {
    background: "#f8fafc",
    borderColor: "#cbd5e1",
    boxShadow: "none",
  },
};

const applyButtonSx = {
  height: 40,
  borderRadius: "8px",
  borderColor: "#24a342",
  background: "#2faa49",
  color: "#ffffff",
  textTransform: "none",
  fontSize: 13,
  fontWeight: 700,
  boxShadow: "0 6px 14px rgba(47, 170, 73, 0.22)",
  "&:hover": {
    background: "#279740",
    borderColor: "#279740",
    boxShadow: "0 8px 18px rgba(47, 170, 73, 0.26)",
  },
};

type Props = {
  onCollapse: () => void;
  regions: string[];
  brands: AdLookupOption[];
  models: AdModelLookupOption[];
};

const categoryOptions = [
  { value: "", label: "Все категории" },
  { value: "Автосалон", label: "Автосалон" },
  { value: "Перекуп", label: "Перекуп" },
  { value: "Автоплощадка", label: "Автоплощадка" },
  { value: "Частное лицо", label: "Частное лицо" },
];

const CounterpartiesFiltersSidebar = ({
  onCollapse,
  regions,
  brands,
  models,
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allAdsFrom, setAllAdsFrom] = useState(searchParams.get("allAdsFrom") ?? "2");
  const [allAdsTo, setAllAdsTo] = useState(searchParams.get("allAdsTo") ?? "");
  const [archivedAdsFrom, setArchivedAdsFrom] = useState(searchParams.get("archivedAdsFrom") ?? "2");
  const [archivedAdsTo, setArchivedAdsTo] = useState(searchParams.get("archivedAdsTo") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [brandId, setBrandId] = useState(searchParams.get("brandId") ?? "");
  const [modelId, setModelId] = useState(searchParams.get("modelId") ?? "");

  useEffect(() => {
    setAllAdsFrom(searchParams.get("allAdsFrom") ?? "2");
    setAllAdsTo(searchParams.get("allAdsTo") ?? "");
    setArchivedAdsFrom(searchParams.get("archivedAdsFrom") ?? "2");
    setArchivedAdsTo(searchParams.get("archivedAdsTo") ?? "");
    setCategory(searchParams.get("category") ?? "");
    setRegion(searchParams.get("region") ?? "");
    setBrandId(searchParams.get("brandId") ?? "");
    setModelId(searchParams.get("modelId") ?? "");
  }, [searchParams]);

  const filteredModels = useMemo(
    () =>
      brandId
        ? models.filter((item) => item.brandId === Number(brandId))
        : models,
    [brandId, models],
  );

  const regionOptions = [
    { value: "", label: "Все регионы" },
    ...regions.map((item) => ({ value: item, label: item })),
  ];

  const brandOptions = [
    { value: "", label: "Все марки" },
    ...brands.map((item) => ({ value: String(item.id), label: item.name })),
  ];

  const modelOptions = [
    { value: "", label: "Все модели" },
    ...filteredModels.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    const setOrDelete = (key: string, value: string) => {
      const normalizedValue = value.trim();
      if (normalizedValue) {
        params.set(key, normalizedValue);
      } else {
        params.delete(key);
      }
    };

    setOrDelete("allAdsFrom", allAdsFrom);
    setOrDelete("allAdsTo", allAdsTo);
    setOrDelete("archivedAdsFrom", archivedAdsFrom);
    setOrDelete("archivedAdsTo", archivedAdsTo);
    setOrDelete("category", category);
    setOrDelete("region", region);
    setOrDelete("brandId", brandId);
    setOrDelete("modelId", modelId);
    params.delete("page");

    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const resetFilters = () => {
    setAllAdsFrom("2");
    setAllAdsTo("");
    setArchivedAdsFrom("2");
    setArchivedAdsTo("");
    setCategory("");
    setRegion("");
    setBrandId("");
    setModelId("");

    const params = new URLSearchParams(searchParams);
    [
      "allAdsFrom",
      "allAdsTo",
      "archivedAdsFrom",
      "archivedAdsTo",
      "category",
      "region",
      "brandId",
      "modelId",
      "page",
    ].forEach((key) => params.delete(key));

    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: { xs: "static", lg: "sticky" },
        top: 16,
        borderRadius: "14px",
        border: "1px solid #e6eaf0",
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box
        sx={{
          px: "20px",
          py: "18px",
          borderBottom: "1px solid #e6eaf0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <Typography
          sx={{
            fontSize: 20,
            lineHeight: "26px",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Фильтры
        </Typography>

        <IconButton
          size="small"
          onClick={onCollapse}
          aria-label="Свернуть фильтры"
          sx={{
            width: 34,
            height: 34,
            borderRadius: "8px",
            border: "1px solid #dbe1ea",
            background: "#ffffff",
            color: "#2563eb",
            transition: "background-color 160ms ease, transform 160ms ease",
            "&:hover": {
              background: "#f8fafc",
              transform: "translateX(1px)",
            },
          }}
        >
          <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: "20px",
          display: { xs: "grid", lg: "flex" },
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Количество объявлений</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              type="number"
              value={allAdsFrom}
              onChange={(e) => setAllAdsFrom(e.target.value)}
              placeholder="От"
              max={999999}
              sx={inputSx}
            />
            <TextInput
              type="number"
              value={allAdsTo}
              onChange={(e) => setAllAdsTo(e.target.value)}
              placeholder="До"
              max={999999}
              sx={inputSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Архивные</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              type="number"
              value={archivedAdsFrom}
              onChange={(e) => setArchivedAdsFrom(e.target.value)}
              placeholder="От"
              max={999999}
              sx={inputSx}
            />
            <TextInput
              type="number"
              value={archivedAdsTo}
              onChange={(e) => setArchivedAdsTo(e.target.value)}
              placeholder="До"
              max={999999}
              sx={inputSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Категория</Typography>
          <Box sx={selectWrapperSx}>
            <Select
              value={category}
              handleChange={(e) => setCategory(String(e.target.value))}
              menuItems={categoryOptions}
              placeholder="Все категории"
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Регион</Typography>
          <Box sx={selectWrapperSx}>
            <Select
              value={region}
              handleChange={(e) => setRegion(String(e.target.value))}
              menuItems={regionOptions}
              placeholder="Все регионы"
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Марка</Typography>
          <Box sx={selectWrapperSx}>
            <Select
              value={brandId}
              handleChange={(e) => {
                const nextBrandId = String(e.target.value);
                setBrandId(nextBrandId);
                setModelId("");
              }}
              menuItems={brandOptions}
              placeholder="Все марки"
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Модель</Typography>
          <Box sx={selectWrapperSx}>
            <Select
              value={modelId}
              handleChange={(e) => setModelId(String(e.target.value))}
              menuItems={modelOptions}
              placeholder="Все модели"
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: "20px",
          py: "20px",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr" },
          gap: "14px",
          background: "#ffffff",
        }}
      >
        <Button variant="outlined" onClick={resetFilters} sx={resetButtonSx}>
          Сбросить
        </Button>

        <Button onClick={applyFilters} sx={applyButtonSx}>
          Применить
        </Button>
      </Box>
    </Paper>
  );
};

export default CounterpartiesFiltersSidebar;
