"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, Chip, Divider, Paper, Typography } from "@mui/material";

import { Button } from "@/components";
import { Select, TextInput } from "@/components/form";

const REGION_OPTIONS = [
  { value: "", label: "All regions" },
  { value: "almaty", label: "Almaty" },
  { value: "astana", label: "Astana" },
  { value: "shymkent", label: "Shymkent" },
  { value: "karaganda", label: "Karaganda" },
  { value: "aktobe", label: "Aktobe" },
  { value: "atyrau", label: "Atyrau" },
  { value: "taraz", label: "Taraz" },
  { value: "kostanay", label: "Kostanay" },
  { value: "pavlodar", label: "Pavlodar" },
  { value: "kokshetau", label: "Kokshetau" },
];

const sectionTitleSx = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "text.secondary",
};

const fieldGridSx = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 1.25,
};

const FiltersSidebar = () => {
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

  const activeFiltersCount = useMemo(
    () =>
      [
        adId,
        accountId,
        publishedFrom,
        publishedTo,
        priceFrom,
        priceTo,
        mileageFrom,
        mileageTo,
        yearFrom,
        yearTo,
        region,
      ].filter(Boolean).length,
    [
      accountId,
      adId,
      mileageFrom,
      mileageTo,
      priceFrom,
      priceTo,
      publishedFrom,
      publishedTo,
      region,
      yearFrom,
      yearTo,
    ],
  );

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
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: { xs: "static", xl: "sticky" },
        top: 16,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.300",
        background:
          "linear-gradient(180deg, rgba(248,249,251,1) 0%, rgba(255,255,255,1) 100%)",
        overflow: "hidden",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.25,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Фильтры
          </Typography>
        </Box>
        <Chip
          label={`${activeFiltersCount} active`}
          size="small"
          color={activeFiltersCount > 0 ? "primary" : "default"}
          variant={activeFiltersCount > 0 ? "filled" : "outlined"}
        />
      </Box>

      <Box sx={{ p: 2.5, display: "grid", gap: 2.25 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            backgroundColor: "rgba(17, 24, 39, 0.03)",
            border: "1px solid",
            borderColor: "grey.200",
            display: "grid",
            gap: 1.25,
          }}
        >
          <Typography sx={sectionTitleSx}>Quick Search</Typography>
          <TextInput
            label="Ad ID"
            value={adId}
            onChange={(e) => setAdId(e.target.value)}
            placeholder="225204584"
          />
          <TextInput
            label="Account ID"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="26255863"
          />
        </Box>

        <Divider />

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Typography sx={sectionTitleSx}>Publication Date</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              label="From"
              type="date"
              value={publishedFrom}
              onChange={(e) => setPublishedFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextInput
              label="To"
              type="date"
              value={publishedTo}
              onChange={(e) => setPublishedTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Typography sx={sectionTitleSx}>Price</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              label="From"
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder="2000000"
              max={999999999}
            />
            <TextInput
              label="To"
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              placeholder="5000000"
              max={999999999}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Typography sx={sectionTitleSx}>Mileage</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              label="From"
              type="number"
              value={mileageFrom}
              onChange={(e) => setMileageFrom(e.target.value)}
              placeholder="0"
              max={9999999}
            />
            <TextInput
              label="To"
              type="number"
              value={mileageTo}
              onChange={(e) => setMileageTo(e.target.value)}
              placeholder="300000"
              max={9999999}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Typography sx={sectionTitleSx}>Production Year</Typography>
          <Box sx={fieldGridSx}>
            <TextInput
              label="From"
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="2012"
              max={9999}
            />
            <TextInput
              label="To"
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="2020"
              max={9999}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Typography sx={sectionTitleSx}>Region</Typography>
          <Select
            value={region}
            handleChange={(e) => setRegion(e.target.value)}
            menuItems={REGION_OPTIONS}
            placeholder="Region"
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.25,
            pt: 0.5,
          }}
        >
          <Button size="small" onClick={applyFilters}>
            Apply
          </Button>
          <Button size="small" onClick={resetFilters}>
            Reset
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FiltersSidebar;
