"use client";

import { useState } from "react";
import { Box, SelectChangeEvent, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button, Modal, Table } from "@/components";
import TableRows from "./components/table-rows";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import AddNewAdForm from "./components/add-new-ad-form";
import AddNewAccountForm from "./components/add-new-account-form";

import {
  postAd,
  getAds,
  deleteAd,
  changeAdState,
  getParsingTemplates,
} from "@/services/ad-services";
import { getAccounts, addAccount } from "@/services/account-services";

import type { AdFormData, ActionPayloadType } from "./types";
import { MenuItemAction } from "@/constants";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

type Props = {};

const headerLabels = ["Название", "Статус", "Действие"];

const initialAdData: AdFormData = {
  accountId: 0,
  name: "",
  parsingTemplateId: "",
  url: "",
  mainImagePath: "",
  notDetectedCount: "",
  depthOfMonitoring: "",
  intervalSeconds: "",
  monitoringDurationDays: "",
};

const initialAccountData = {
  login: "",
  password: "",
};

const Confirmation = () => {
  return (
    <Box>
      <Typography>Ви уверени что хотите запустить Действие?</Typography>
    </Box>
  );
};

const MyAds = ({}: Props) => {
  const [open, setOpen] = useState<"addNewAd" | "confirmation" | false>(false);
  const [openAddAccountModal, setOpenAddAccountModal] = useState(false);

  const [adError, setAdError] = useState<string | null>(null);
  const [adFormData, setAdFormData] = useState<AdFormData>(initialAdData);

  const [accountFormData, setAccountFormData] = useState(initialAccountData);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [action, setAction] = useState<ActionPayloadType | null>(null);

  const fetchWithAuth = useFetchWithAuth();

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

  const accountQuery = useQuery({
    queryKey: ["account"],
    queryFn: () => getAccounts(fetchWithAuth),
    retry: false,
  });

  const postAdMutation = useMutation({
    mutationFn: async (formData: AdFormData) => {
      await postAd(formData, fetchWithAuth);
    },
    onSuccess: () => {
      setOpen(false);
      setAdFormData(initialAdData);
      query.refetch();
    },
    onError: (error: Error) => {
      setAdError(error.message);
    },
  });

  const postAccountMutation = useMutation({
    mutationFn: async (formData: { login: string; password: string }) => {
      await addAccount(formData, fetchWithAuth);
    },
    onSuccess: () => {
      setOpenAddAccountModal(false);
      accountQuery.refetch();
    },
    onError: (error: Error) => {
      setAccountError(error.message);
    },
  });

  const handleAdChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof AdFormData
  ) => setAdFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAccountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: "login" | "password"
  ) => setAccountFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSelect = (e: SelectChangeEvent, key: keyof AdFormData) =>
    setAdFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async () => {
    if (openAddAccountModal) {
      return postAccountMutation.mutate(accountFormData);
    }

    if (open === "addNewAd") {
      return postAdMutation.mutate(adFormData);
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
    setAdFormData(initialAdData);
    setAdError(null);
  };

  const parsingTemplateDataOptions = (parsingTemplateQuery?.data ?? []).map(
    ({ id, name }: { id: string | number; name: string }) => ({
      value: id,
      label: name,
    })
  );

  const accountOptions = accountQuery?.data?.map(
    (item: { login: string; id: number }) => ({
      label: item.login,
      value: item.id,
    })
  );

  const modalComponent =
    open === "addNewAd" ? (
      <AddNewAdForm
        error={adError}
        handleChange={handleAdChange}
        handleSelect={handleSelect}
        openAddAccountModal={() => setOpenAddAccountModal(true)}
        formData={adFormData}
        parsingTemplateDataOptions={parsingTemplateDataOptions}
        accountOptions={accountOptions}
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
              onClick={() => setOpen("addNewAd")}
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
        isLoading={postAdMutation.isPending || query.isFetching}
        sx={{ width: 550, zIndex: 10 }}
        onClose={handleModalClose}
        open={!!open}
        title={open === "addNewAd" ? "Создать новое Объявления" : ""}
        onSubmit={onSubmit}
        isSubmitDisabled={!accountOptions?.length}
        helperText={
          !accountOptions?.length ? "Сначала вам нужно добавить аккаунт" : ""
        }
      >
        {modalComponent}
      </Modal>
      <Modal
        isLoading={postAccountMutation.isPending}
        sx={{ width: 550, zIndex: 20 }}
        onClose={() => {
          setOpenAddAccountModal(false);
          setAccountFormData(initialAccountData);
        }}
        open={openAddAccountModal}
        title="Создать новый Аккаунт"
        onSubmit={onSubmit}
      >
        <AddNewAccountForm
          error={accountError}
          formData={accountFormData}
          handleChange={handleAccountChange}
        />
      </Modal>
    </>
  );
};
export default MyAds;
