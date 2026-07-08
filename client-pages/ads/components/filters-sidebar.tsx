"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";

import { Button, IconButton } from "@/components";
import { Select, TextInput } from "@/components/form";

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
};

const FiltersSidebar = ({ onCollapse, regions }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [adId, setAdId] = useState(searchParams.get("adId") ?? "");
  const [accountId, setAccountId] = useState(searchParams.get("accountId") ?? "");
  const [publishedFrom, setPublishedFrom] = useState(
    searchParams.get("publishedFrom") ?? "",
  );
  const [publishedTo, setPublishedTo] = useState(
    searchParams.get("publishedTo") ?? "",
  );
  const [priceFrom, setPriceFrom] = useState(searchParams.get("priceFrom") ?? "");
  const [priceTo, setPriceTo] = useState(searchParams.get("priceTo") ?? "");
  const [mileageFrom, setMileageFrom] = useState(
    searchParams.get("mileageFrom") ?? "",
  );
  const [mileageTo, setMileageTo] = useState(searchParams.get("mileageTo") ?? "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("yearFrom") ?? "");
  const [yearTo, setYearTo] = useState(searchParams.get("yearTo") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");

  useEffect(() => {
    setAdId(searchParams.get("adId") ?? "");
    setAccountId(searchParams.get("accountId") ?? "");
    setPublishedFrom(searchParams.get("publishedFrom") ?? "");
    setPublishedTo(searchParams.get("publishedTo") ?? "");
    setPriceFrom(searchParams.get("priceFrom") ?? "");
    setPriceTo(searchParams.get("priceTo") ?? "");
    setMileageFrom(searchParams.get("mileageFrom") ?? "");
    setMileageTo(searchParams.get("mileageTo") ?? "");
    setYearFrom(searchParams.get("yearFrom") ?? "");
    setYearTo(searchParams.get("yearTo") ?? "");
    setRegion(searchParams.get("region") ?? "");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    const setOrDelete = (key: string, value: string) => {
      if (value.trim()) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    };

    setOrDelete("adId", adId);
    setOrDelete("accountId", accountId);
    setOrDelete("publishedFrom", publishedFrom);
    setOrDelete("publishedTo", publishedTo);
    setOrDelete("priceFrom", priceFrom);
    setOrDelete("priceTo", priceTo);
    setOrDelete("mileageFrom", mileageFrom);
    setOrDelete("mileageTo", mileageTo);
    setOrDelete("yearFrom", yearFrom);
    setOrDelete("yearTo", yearTo);
    setOrDelete("region", region);
    params.delete("page");

    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const resetFilters = () => {
    setAdId("");
    setAccountId("");
    setPublishedFrom("");
    setPublishedTo("");
    setPriceFrom("");
    setPriceTo("");
    setMileageFrom("");
    setMileageTo("");
    setYearFrom("");
    setYearTo("");
    setRegion("");

    const params = new URLSearchParams(searchParams);
    [
      "adId",
      "accountId",
      "publishedFrom",
      "publishedTo",
      "priceFrom",
      "priceTo",
      "mileageFrom",
      "mileageTo",
      "yearFrom",
      "yearTo",
      "region",
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
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder="От"
              max={999999999}
              sx={inputSx}
            />
            <TextInput
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              placeholder="До"
              max={999999999}
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
      </Box>

      <Box
        sx={{
          px: "20px",
          py: "20px",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr" },
          gap: "20px",
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

export default FiltersSidebar;
