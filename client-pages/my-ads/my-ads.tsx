"use client";

import { useEffect, useState } from "react";
import { Box, SelectChangeEvent, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button, Modal, Table } from "@/components";
import TableRows from "./components/table-rows";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Form from "./components/form";

import {
  postAd,
  getAds,
  deleteAd,
  changeAdState,
  getParsingTemplates,
} from "@/services/ad-services";

import type { AdFormData, ActionPayloadType } from "./types";
import { MenuItemAction, Status } from "@/constants";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { useLoading } from "@/context/loading-context";

type Props = {};

const headerLabels = ["Название", "Статус", "Действие"];

const initialData: AdFormData = {
  name: "",
  parsingTemplateId: "",
  url: "",
  mainImagePath: "",
  notDetectedCount: "",
  depthOfMonitoring: "",
  intervalSeconds: "",
  monitoringDurationDays: "",
};

const Confirmation = () => {
  return (
    <Box>
      <Typography>Ви уверени что хотите запустить Действие?</Typography>
    </Box>
  );
};

const MyAds = ({}: Props) => {
  const { startLoading, stopLoading } = useLoading();

  const [open, setOpen] = useState<"add" | "confirmation" | false>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdFormData>(initialData);
  const [action, setAction] = useState<ActionPayloadType | null>(null);
  
  const fetchWithAuth = useFetchWithAuth();

  const query = useQuery({
    queryKey: ["my-ads"],
    queryFn: () => getAds(fetchWithAuth),
    retry: false,
  });

  useEffect(() => {
    if (query.isFetching) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [query.isFetching, startLoading, stopLoading]);

  const parsingTemplateQuery = useQuery({
    queryKey: ["my-ads/parsing-template/lookup"],
    queryFn: () => getParsingTemplates(fetchWithAuth),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (formData: AdFormData) => {
      const fetchWithAuth = useFetchWithAuth();
      await postAd(formData, fetchWithAuth);
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
    key: keyof AdFormData
  ) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSelect = (e: SelectChangeEvent, key: keyof AdFormData) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async () => {
    const fetchWithAuth = useFetchWithAuth();

    if (open === "add") {
      return mutation.mutate(formData);
    }

    if (open === "confirmation") {
      const { method, id } = action!;

      // @ts-ignore
      if (method === MenuItemAction.delete) {
        await deleteAd(id as number, fetchWithAuth);
      } else {
        // @ts-ignore
        await changeAdState({ id, action: method }, fetchWithAuth);
      }

      await query.refetch();
      setOpen(false);
    }
  };

  const onButtonClick = (action: ActionPayloadType) => {
    setAction(action);
    if (action.state === "activate") {
      setOpen("confirmation");
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormData(initialData);
    setError(null);
  };

  const parsingTemplateDataOptions = (parsingTemplateQuery?.data ?? []).map(
    ({ id, name }: { id: string | number; name: string }) => ({
      value: id,
      label: name,
    })
  );

  const modalComponent =
    open === "add" ? (
      <Form
        error={error}
        handleChange={handleChange}
        handleSelect={handleSelect}
        formData={formData}
        parsingTemplateDataOptions={parsingTemplateDataOptions}
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
              Добавить Объявления
            </Button>
          </Box>
        }
        tableRows={<TableRows items={query?.data} onClick={onButtonClick} />}
        headerLabels={headerLabels}
      />
      <Modal
        isLoading={mutation.isPending || query.isFetching}
        sx={{ width: 550 }}
        onClose={handleModalClose}
        open={!!open}
        title={open === "add" ? "Создать новое Объявления" : ""}
        onSubmit={onSubmit}
      >
        {modalComponent}
      </Modal>
    </>
  );
};
export default MyAds;
