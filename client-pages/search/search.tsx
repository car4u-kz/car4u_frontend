"use client";

import { useState } from "react";
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
  deleteParsingTemplate,
} from "@/services/search-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { MenuItemAction } from "@/constants";

const headerLabels = [
  "Название",
  "Статус",
  "Действие",
  "Дата создания",
  "Источник",
  "",
];

const initialData: SearchFormData = {
  source: "",
  url: "",
  searchName: "",
  intervalSeconds: "",
  searchDurationDays: "",
};

const Confirmation = ({
  method,
}: {
  method?: ActionPayloadType["method"];
}) => {
  const text =
    method === MenuItemAction.delete
      ? "Вы уверены, что хотите удалить поиск? Будут удалены и все связанные объявления."
      : "Вы уверены, что хотите выполнить это действие?";

  return (
    <Box>
      <Typography>{text}</Typography>
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
    mutationFn: async (payload: SearchFormData | ActionPayloadType) => {
      if ("searchName" in payload) {
        return postSearch(payload, fetchWithAuth);
      }

      if (payload.id == null || payload.method == null) {
        return Promise.reject(new Error("Некорректное действие для поиска"));
      }

      if (payload.method === MenuItemAction.delete) {
        return deleteParsingTemplate(payload.id, fetchWithAuth);
      }

      return changeParsingTemplateState(
        { id: payload.id, action: payload.method },
        fetchWithAuth,
      );
    },
    onSuccess: async () => {
      setOpen(false);
      setFormData(initialData);
      setAction(null);
      await query.refetch();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof SearchFormData,
  ) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSelect = (e: SelectChangeEvent) =>
    setFormData((prev) => ({ ...prev, source: e.target.value }));

  const onSubmit = async () => {
    if (open === "add") {
      return mutation.mutate(formData);
    }

    if (open === "confirmation" && action) {
      return mutation.mutate(action);
    }
  };

  const onButtonClick = (nextAction: ActionPayloadType) => {
    setError(null);
    setOpen("confirmation");
    setAction(nextAction);
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormData(initialData);
    setError(null);
    setAction(null);
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
      <Confirmation method={action?.method} />
    );

  const confirmationTitle =
    action?.method === MenuItemAction.delete ? "Удалить поиск" : "Подтверждение";

  const submitLabel =
    action?.method === MenuItemAction.delete ? "Удалить" : "Подтвердить";

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
        title={open === "add" ? "Создать поиск" : confirmationTitle}
        submitLabel={open === "add" ? undefined : submitLabel}
        onSubmit={onSubmit}
      >
        {modalComponent}
      </Modal>
    </>
  );
};

export default SearchPage;
