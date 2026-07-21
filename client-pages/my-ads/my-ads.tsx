"use client";

import { useEffect, useState } from "react";
import { Box, SelectChangeEvent, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button, Modal, Table } from "@/components";
import TableRows from "./components/table-rows";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import {
  postAd,
  putAd,
  getAds,
  deleteAd,
  changeAdState,
  getParsingTemplates,
} from "@/services/ad-services";

import {
  deleteSession,
  getOurAdsSession,
} from "@/services/our-ads-sessions-services";
import { getAccounts } from "@/services/account-services";

import type { AdFormData, ActionPayloadType, OurAdItem } from "./types";
import { MenuItemAction } from "@/constants";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import AdWizard from "./components/ad-wizard";
import EditForm from "./components/edit-form";

type Props = {};

const headerLabels = ["Название", "Статус", "Действие", ""];

const initialData: AdFormData = {
  name: "",
  parsingTemplateId: "",
  url: "",
  mainImagePath: "",
  notDetectedCount: "",
  depthOfMonitoring: "",
  intervalSeconds: "",
  monitoringDurationDays: "",
  price: "",
  isNewAuto: false,
  description: "",
  hasDetails: false,
  sessionId: "",
  accountId: "",
};

const mapAdToFormData = (ad: OurAdItem): AdFormData => ({
  name: ad.name,
  parsingTemplateId: ad.parsingTemplateId,
  url: ad.url,
  mainImagePath: ad.mainImagePath,
  notDetectedCount: ad.notDetectedCount,
  depthOfMonitoring: ad.depthOfMonitoring,
  intervalSeconds: ad.intervalSeconds,
  monitoringDurationDays: ad.monitoringDurationDays,
  price: ad.price ?? "",
  isNewAuto: ad.isNewAuto ?? false,
  description: ad.description ?? ad.desctiption ?? ad.Description ?? "",
  hasDetails: ad.hasDetails,
  sessionId: "",
  accountId: "",
});

const Confirmation = () => {
  return (
    <Box>
      <Typography>Ви уверени что хотите запустить Действие?</Typography>
    </Box>
  );
};

const MyAds = ({}: Props) => {
  const [open, setOpen] = useState<"add" | "edit" | "confirmation" | false>(
    false,
  );
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdFormData>(initialData);
  const [action, setAction] = useState<ActionPayloadType | null>(null);
  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<{ value: string; label: string }[]>(
    []
  );

  const fetchWithAuth = useFetchWithAuth();

  useEffect(() => {
    if (!open || open !== "add") return;
    if (!formData.sessionId) return;

    const handler = async () => {
      try {
        await deleteSession(fetchWithAuth, formData.sessionId);
      } catch {}
    };

    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [open, formData.sessionId]);

  const handleOpenAdd = async () => {
    setError(null);

    try {
      const [sessionRes, accountsRes] = await Promise.all([
        getOurAdsSession(fetchWithAuth),
        getAccounts(fetchWithAuth),
      ]);

      const accountsOptions = accountsRes.map((a) => ({
        value: String(a.id),
        label: a.login,
      }));

      setAccounts(accountsOptions);

      setFormData((prev) => ({
        ...initialData,
        sessionId: sessionRes.sessionId,
        accountId: accountsOptions[0]?.value ?? "",
      }));

      setOpen("add");
    } catch (e: any) {
      setError(e.message ?? "Не удалось открыть форму");
    }
  };

  const query = useQuery({
    queryKey: ["my-ads"],
    queryFn: () => getAds(fetchWithAuth),
    retry: false,
  });

  const parsingTemplateQuery = useQuery({
    queryKey: ["my-ads/parsing-template/lookup"],
    queryFn: () => getParsingTemplates(fetchWithAuth),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (
      payload:
        | { type: "create"; formData: AdFormData }
        | { type: "edit"; id: number; formData: AdFormData },
    ) => {
      if (payload.type === "edit") {
        return putAd(payload.id, payload.formData, fetchWithAuth);
      }

      return postAd(payload.formData, fetchWithAuth);
    },
    onSuccess: () => {
      setOpen(false);
      setFormData(initialData);
      setEditingAdId(null);
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

  const handleBooleanChange = (value: boolean, key: keyof AdFormData) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    if (open === "add") {
      return mutation.mutate({ type: "create", formData });
    }

    if (open === "edit" && editingAdId != null) {
      return mutation.mutate({ type: "edit", id: editingAdId, formData });
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

  const onEditClick = (ad: OurAdItem) => {
    setError(null);
    setAction(null);
    setEditingAdId(ad.id);
    setFormData(mapAdToFormData(ad));
    setOpen("edit");
  };

  const handleModalClose = () => {
    setOpen(false);
    setFormData(initialData);
    setError(null);
    setAction(null);
    setEditingAdId(null);
  };

  const parsingTemplateDataOptions = (parsingTemplateQuery?.data ?? []).map(
    ({ id, name }: { id: string | number; name: string }) => ({
      value: id,
      label: name,
    })
  );

  const isAdd = open === "add";
  const isEdit = open === "edit";
  const modalComponent = isAdd ? (
    <AdWizard
      fetchWithAuth={fetchWithAuth}
      sessionId={formData.sessionId}
      accounts={accounts}
      formData={formData}
      setFormData={setFormData}
      parsingTemplateDataOptions={parsingTemplateDataOptions}
      onSubmitAd={async (data) => {
        try {
          await mutation.mutateAsync({ type: "create", formData: data });
          return { ok: true as const };
        } catch (e: any) {
          return {
            ok: false as const,
            error: e?.message ?? "Ошибка сохранения",
          };
        }
      }}
      // закрытие модалки
      onClose={handleModalClose}
    />
  ) : isEdit ? (
    <EditForm
      error={error}
      handleChange={handleChange}
      handleSelect={handleSelect}
      handleBooleanChange={handleBooleanChange}
      formData={formData}
    />
  ) : (
    <Confirmation />
  );

  return (
    <>
      <Table
        title="Мои объявления"
        tableButtons={
          <Box sx={{ p: 0.5, pl: 1 }}>
            <Button
              disableRipple
              variant="contained"
              sx={{ bgcolor: "common.black", color: "white" }}
              size="small"
              onClick={handleOpenAdd}
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
            >
              Добавить Объявления
            </Button>
          </Box>
        }
        tableRows={
          <TableRows
            items={query?.data ?? []}
            onClick={onButtonClick}
            onEdit={onEditClick}
          />
        }
        headerLabels={headerLabels}
      />
      <Modal
        isLoading={mutation.isPending || query.isFetching}
        sx={{ width: 550 }}
        onClose={handleModalClose}
        open={!!open}
        title={
          isAdd
            ? "Создать новое Объявления"
            : isEdit
              ? "Редактировать объявление"
              : ""
        }
        submitLabel={isEdit ? "Сохранить" : undefined}
        onSubmit={onSubmit}
        hideFooter={isAdd}
      >
        {modalComponent}
      </Modal>
    </>
  );
};
export default MyAds;
