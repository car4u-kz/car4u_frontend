"use client";

import { useEffect, useState } from "react";
import { Box, SelectChangeEvent, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useMutation, useQuery } from "@tanstack/react-query";

import TableRows from "./components/table-rows";
import Form from "./components/form";
import { Button, Table, Modal } from "@/components";

import type { ActionPayloadType, SearchFormData } from "./types";
import {
  postSearch,
  getParsingTemplates,
  changeParsingTemplateState,
} from "@/services/search-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

const headerLabels = [
  "Название",
  "Статус",
  "Действие",
  "Дата создания",
  "Источник",
];

const initialData: SearchFormData = {
  source: "",
  url: "",
  searchName: "",
  intervalSeconds: "",
  searchDurationDays: "",
};

const Confirmation = () => {
  return (
    <Box>
      <Typography>Ви уверени что хотите запустить Действие?</Typography>
    </Box>
  );
};

const SearchPage = () => {
  const [open, setOpen] = useState<"add" | "confirmation" | false>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SearchFormData>(initialData);
  const [action, setAction] = useState<ActionPayloadType | null>(null);

  const fetchWithAuth = useFetchWithAuth();
  const query = useQuery({
    queryKey: ["parsing-templates"],
    queryFn: () => getParsingTemplates(fetchWithAuth),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (formData: SearchFormData) => {
      await postSearch(formData, fetchWithAuth);
    },
    onSuccess: () => {
      setOpen(false);
      setFormData(initialData);
      query.refetch();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof SearchFormData
  ) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSelect = (e: SelectChangeEvent) =>
    setFormData((prev) => ({ ...prev, source: e.target.value }));

  const onSubmit = async () => {
    if (open === "add") return mutation.mutate(formData);

    if (open === "confirmation") {
      const { method, id } = action!;

      // @ts-ignore
      await changeParsingTemplateState({ id, action: method }, fetchWithAuth);
      await query.refetch();
      setOpen(false);
    }
  };
  const onButtonClick = (action: ActionPayloadType) => {
    setOpen("confirmation");
    setAction(action);
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormData(initialData);
    setError(null);
  };

  const modalComponent =
    open === "add" ? (
      <Form
        error={error}
        handleChange={handleChange}
        handleSelect={handleSelect}
        formData={formData}
      />
    ) : (
      <Confirmation />
    );

  return (
    <>
      <Table
        tableButtons={
          <Box sx={{ p: 0.5, pl: 1 }}>
            <Button
              disableRipple
              sx={{ color: "white" }}
              size="small"
              onClick={() => setOpen("add")}
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
            >
              Новый поиск
            </Button>
          </Box>
        }
        tableRows={<TableRows onClick={onButtonClick} items={query?.data} />}
        headerLabels={headerLabels}
      />
      <Modal
        isLoading={mutation.isPending || query.isPending}
        onClose={handleModalClose}
        open={!!open}
        title={open === "add" ? "Создать Поиск" : ""}
        onSubmit={onSubmit}
      >
        {modalComponent}
      </Modal>
    </>
  );
};

export default SearchPage;
