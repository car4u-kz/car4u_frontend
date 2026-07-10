"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";

import { Button, IconButton } from "@/components";
import { Select, TextInput } from "@/components/form";
import { AdLookupOption, AdModelLookupOption } from "@/types";

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
  bodyTypes: AdLookupOption[];
  onExport: () => void;
  isExporting?: boolean;
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const formatIntegerWithSpaces = (value: string) => {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const FiltersSidebar = ({
  onCollapse,
  regions,
  brands,
  models,
  bodyTypes,
  onExport,
  isExporting = false,
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [adId, setAdId] = useState(searchParams.get("adId") ?? "");
  const [accountId, setAccountId] = useState(searchParams.get("accountId") ?? "");
  const [accountAdsFrom, setAccountAdsFrom] = useState(searchParams.get("accountAdsFrom") ?? "");
  const [accountAdsTo, setAccountAdsTo] = useState(searchParams.get("accountAdsTo") ?? "");
  const [publishedFrom, setPublishedFrom] = useState(searchParams.get("publishedFrom") ?? "");
  const [publishedTo, setPublishedTo] = useState(searchParams.get("publishedTo") ?? "");
  const [priceFrom, setPriceFrom] = useState(
    formatIntegerWithSpaces(searchParams.get("priceFrom") ?? ""),
  );
  const [priceTo, setPriceTo] = useState(
    formatIntegerWithSpaces(searchParams.get("priceTo") ?? ""),
  );
  const [mileageFrom, setMileageFrom] = useState(searchParams.get("mileageFrom") ?? "");
  const [mileageTo, setMileageTo] = useState(searchParams.get("mileageTo") ?? "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("yearFrom") ?? "");
  const [yearTo, setYearTo] = useState(searchParams.get("yearTo") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [brandId, setBrandId] = useState(searchParams.get("brandId") ?? "");
  const [modelId, setModelId] = useState(searchParams.get("modelId") ?? "");
  const [bodyTypeId, setBodyTypeId] = useState(searchParams.get("bodyTypeId") ?? "");

  useEffect(() => {
    setAdId(searchParams.get("adId") ?? "");
    setAccountId(searchParams.get("accountId") ?? "");
    setAccountAdsFrom(searchParams.get("accountAdsFrom") ?? "");
    setAccountAdsTo(searchParams.get("accountAdsTo") ?? "");
    setPublishedFrom(searchParams.get("publishedFrom") ?? "");
    setPublishedTo(searchParams.get("publishedTo") ?? "");
    setPriceFrom(formatIntegerWithSpaces(searchParams.get("priceFrom") ?? ""));
    setPriceTo(formatIntegerWithSpaces(searchParams.get("priceTo") ?? ""));
    setMileageFrom(searchParams.get("mileageFrom") ?? "");
    setMileageTo(searchParams.get("mileageTo") ?? "");
    setYearFrom(searchParams.get("yearFrom") ?? "");
    setYearTo(searchParams.get("yearTo") ?? "");
    setRegion(searchParams.get("region") ?? "");
    setBrandId(searchParams.get("brandId") ?? "");
    setModelId(searchParams.get("modelId") ?? "");
    setBodyTypeId(searchParams.get("bodyTypeId") ?? "");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    const setOrDelete = (key: string, value: string | number) => {
      const normalizedValue = String(value).trim();

      if (normalizedValue) {
        params.set(key, normalizedValue);
      } else {
        params.delete(key);
      }
    };

    setOrDelete("adId", adId);
    setOrDelete("accountId", accountId);
    setOrDelete("accountAdsFrom", accountAdsFrom);
    setOrDelete("accountAdsTo", accountAdsTo);
    setOrDelete("publishedFrom", publishedFrom);
    setOrDelete("publishedTo", publishedTo);
    setOrDelete("priceFrom", digitsOnly(priceFrom));
    setOrDelete("priceTo", digitsOnly(priceTo));
    setOrDelete("mileageFrom", mileageFrom);
    setOrDelete("mileageTo", mileageTo);
    setOrDelete("yearFrom", yearFrom);
    setOrDelete("yearTo", yearTo);
    setOrDelete("region", region);
    setOrDelete("brandId", brandId);
    setOrDelete("modelId", modelId);
    setOrDelete("bodyTypeId", bodyTypeId);
    params.delete("page");

    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const resetFilters = () => {
    setAdId("");
    setAccountId("");
    setAccountAdsFrom("");
    setAccountAdsTo("");
    setPublishedFrom("");
    setPublishedTo("");
    setPriceFrom("");
    setPriceTo("");
    setMileageFrom("");
    setMileageTo("");
    setYearFrom("");
    setYearTo("");
    setRegion("");
    setBrandId("");
    setModelId("");
    setBodyTypeId("");

    const params = new URLSearchParams(searchParams);
    [
      "adId",
      "accountId",
      "accountAdsFrom",
      "accountAdsTo",
      "publishedFrom",
      "publishedTo",
      "priceFrom",
      "priceTo",
      "mileageFrom",
      "mileageTo",
      "yearFrom",
      "yearTo",
      "region",
      "brandId",
      "modelId",
      "bodyTypeId",
      "page",
    ].forEach((key) => params.delete(key));

    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const regionOptions = [
    { value: "", label: "All regions" },
    ...regions.map((item) => ({
      value: item,
      label: item,
    })),
  ];

  const brandOptions = [
    { value: "", label: "All brands" },
    ...brands.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  const filteredModels = brandId
    ? models.filter((item) => item.brandId === Number(brandId))
    : models;

  const modelOptions = [
    { value: "", label: "All models" },
    ...filteredModels.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  const bodyTypeOptions = [
    { value: "", label: "All body types" },
    ...bodyTypes.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

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
          <Typography sx={filterLabelSx}>Ad ID</Typography>
          <TextInput
            value={adId}
            onChange={(e) => setAdId(e.target.value)}
            placeholder="Ad ID"
            sx={inputSx}
          />
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Account ID</Typography>
          <TextInput
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Account ID"
            sx={inputSx}
          />
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Ads on account</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              type="number"
              value={accountAdsFrom}
              onChange={(e) => setAccountAdsFrom(e.target.value)}
              placeholder="От"
              max={999999}
              sx={inputSx}
            />
            <TextInput
              type="number"
              value={accountAdsTo}
              onChange={(e) => setAccountAdsTo(e.target.value)}
              placeholder="До"
              max={999999}
              sx={inputSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Дата публикации</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              label="From"
              type="date"
              value={publishedFrom}
              onChange={(e) => setPublishedFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
            <TextInput
              label="To"
              type="date"
              value={publishedTo}
              onChange={(e) => setPublishedTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Цена</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              type="text"
              value={priceFrom}
              onChange={(e) => setPriceFrom(formatIntegerWithSpaces(e.target.value))}
              placeholder="От"
              inputMode="numeric"
              sx={inputSx}
            />
            <TextInput
              type="text"
              value={priceTo}
              onChange={(e) => setPriceTo(formatIntegerWithSpaces(e.target.value))}
              placeholder="До"
              inputMode="numeric"
              sx={inputSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Пробег</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              type="number"
              value={mileageFrom}
              onChange={(e) => setMileageFrom(e.target.value)}
              placeholder="От"
              max={9999999}
              sx={inputSx}
            />
            <TextInput
              type="number"
              value={mileageTo}
              onChange={(e) => setMileageTo(e.target.value)}
              placeholder="До"
              max={9999999}
              sx={inputSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Год выпуска</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="От"
              max={9999}
              sx={inputSx}
            />
            <TextInput
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="До"
              max={9999}
              sx={inputSx}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Регион</Typography>
          <Box sx={selectWrapperSx}>
            <Select
              value={region}
              handleChange={(e) => setRegion(e.target.value)}
              menuItems={regionOptions}
              placeholder="All regions"
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
              placeholder="All brands"
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
              placeholder="All models"
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: "8px" }}>
          <Typography sx={filterLabelSx}>Кузов</Typography>
          <Box sx={selectWrapperSx}>
            <Select
              value={bodyTypeId}
              handleChange={(e) => setBodyTypeId(String(e.target.value))}
              menuItems={bodyTypeOptions}
              placeholder="All body types"
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

        <Button
          onClick={onExport}
          disabled={isExporting}
          startIcon={<ArchiveOutlinedIcon fontSize="small" />}
          sx={{
            height: 40,
            gridColumn: "1 / -1",
            borderRadius: "8px",
            border: "1px solid #dbe1ea",
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
            "&.Mui-disabled": {
              background: "#f8fafc",
              color: "#94a3b8",
              borderColor: "#e2e8f0",
            },
          }}
        >
          {isExporting ? "Выгрузка..." : "Выгрузить результаты"}
        </Button>
      </Box>
    </Paper>
  );
};

export default FiltersSidebar;
