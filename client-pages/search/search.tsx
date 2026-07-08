"use client";

import { useState } from "react";
import { Box, SelectChangeEvent, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useMutation, useQuery } from "@tanstack/react-query";

import TableRows from "./components/table-rows";
import Form from "./components/form";
import { Button, Table, Modal } from "@/components";

import type {
  ActionPayloadType,
  ParsingTemplateItem,
  SearchFormData,
} from "./types";
import {
  postSearch,
  putSearch,
  getParsingTemplates,
  changeParsingTemplateState,
  deleteParsingTemplate,
} from "@/services/search-services";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { MenuItemAction } from "@/constants";

const headerLabels = ["Название", "Статус", "Дата создания", "Источник", ""];

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

const mapTemplateToFormData = (
  template: ParsingTemplateItem,
): SearchFormData => ({
  source: template.source,
  url: template.url,
  searchName: template.searchName,
  intervalSeconds: template.intervalSeconds,
  searchDurationDays: template.searchDurationDays,
});

const SearchPage = () => {
  const [open, setOpen] = useState<"add" | "edit" | "confirmation" | false>(
    false,
  );
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SearchFormData>(initialData);
  const [action, setAction] = useState<ActionPayloadType | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(
    null,
  );

  const fetchWithAuth = useFetchWithAuth();
  const query = useQuery({
    queryKey: ["parsing-templates"],
    queryFn: () => getParsingTemplates(fetchWithAuth),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (
      payload:
        | { type: "create"; formData: SearchFormData }
        | { type: "edit"; id: number; formData: SearchFormData }
        | { type: "action"; action: ActionPayloadType },
    ) => {
      if (payload.type === "create") {
        return postSearch(payload.formData, fetchWithAuth);
      }

      if (payload.type === "edit") {
        return putSearch(payload.id, payload.formData, fetchWithAuth);
      }

      if (payload.action.id == null || payload.action.method == null) {
        return Promise.reject(new Error("Некорректное действие для поиска"));
      }

      if (payload.action.method === MenuItemAction.delete) {
        return deleteParsingTemplate(payload.action.id, fetchWithAuth);
      }

      return changeParsingTemplateState(
        { id: payload.action.id, action: payload.action.method },
        fetchWithAuth,
      );
    },
    onSuccess: async () => {
      handleModalClose();
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
      return mutation.mutate({ type: "create", formData });
    }

    if (open === "edit" && editingTemplateId != null) {
      return mutation.mutate({ type: "edit", id: editingTemplateId, formData });
    }

    if (open === "confirmation" && action) {
      return mutation.mutate({ type: "action", action });
    }
  };

  const onButtonClick = (nextAction: ActionPayloadType) => {
    setError(null);
    setOpen("confirmation");
    setAction(nextAction);
  };

  const onEditClick = (template: ParsingTemplateItem) => {
    setError(null);
    setAction(null);
    setEditingTemplateId(template.id);
    setFormData(mapTemplateToFormData(template));
    setOpen("edit");
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormData(initialData);
    setError(null);
    setAction(null);
    setEditingTemplateId(null);
  };

  const modalComponent =
    open === "add" || open === "edit" ? (
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
    action?.method === MenuItemAction.delete
      ? "Удалить поиск"
      : "Подтверждение";

  const modalTitle =
    open === "add"
      ? "Создать поиск"
      : open === "edit"
        ? "Редактировать поиск"
        : confirmationTitle;

  const submitLabel =
    open === "add"
      ? "Создать"
      : open === "edit"
        ? "Сохранить"
        : action?.method === MenuItemAction.delete
          ? "Удалить"
          : "Подтвердить";

  return (
    <>
      <Table
        title="Поиски"
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
        tableRows={
          <TableRows
            onClick={onButtonClick}
            onEdit={onEditClick}
            items={query.data ?? []}
          />
        }
        headerLabels={headerLabels}
      />
      <Modal
        isLoading={mutation.isPending || query.isPending}
        onClose={handleModalClose}
        open={!!open}
        title={modalTitle}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
      >
        {modalComponent}
      </Modal>
    </>
  );
};

export default SearchPage;
