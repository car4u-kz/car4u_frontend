"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button, Modal, Table } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import {
  addProxies,
  checkProxy,
  deleteProxy,
  getProxies,
  getProxyServices,
} from "@/services/proxy-services";

import TableRows from "./components/table-rows";
import type {
  ProxyBatchCreatePayload,
  ProxyBatchCreateResult,
  ProxyCheckResult,
  ProxyListItem,
} from "./types";

const headerLabels = ["РџСЂРѕРєСЃРё", "РЎРµСЂРІРёСЃ", ""];

const initialFormData: ProxyBatchCreatePayload = {
  serviceName: "",
  proxiesText: "",
};

const ProxiesPage = () => {
  const fetchWithAuth = useFetchWithAuth();
  const [open, setOpen] = useState<"add" | "delete" | "check" | false>(false);
  const [formData, setFormData] =
    useState<ProxyBatchCreatePayload>(initialFormData);
  const [selectedProxy, setSelectedProxy] = useState<ProxyListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyBatchCreateResult | null>(null);
  const [checkResult, setCheckResult] = useState<ProxyCheckResult | null>(null);

  const proxiesQuery = useQuery({
    queryKey: ["proxies"],
    queryFn: () => getProxies(fetchWithAuth),
    retry: false,
  });

  const servicesQuery = useQuery({
    queryKey: ["proxy-services"],
    queryFn: () => getProxyServices(fetchWithAuth),
    retry: false,
  });

  const addMutation = useMutation({
    mutationFn: (payload: ProxyBatchCreatePayload) =>
      addProxies(payload, fetchWithAuth),
    onSuccess: async (response) => {
      setResult(response);
      setError(null);
      setFormData((prev) => ({ ...prev, proxiesText: "" }));
      await proxiesQuery.refetch();
    },
    onError: (mutationError: Error) => {
      setResult(null);
      setError(mutationError.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (proxy: string) => deleteProxy(proxy, fetchWithAuth),
    onSuccess: async () => {
      handleClose();
      await proxiesQuery.refetch();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  const checkMutation = useMutation({
    mutationFn: (proxy: string) => checkProxy(proxy, fetchWithAuth),
    onSuccess: (response) => {
      setError(null);
      setCheckResult(response);
    },
    onError: (mutationError: Error) => {
      setCheckResult(null);
      setError(mutationError.message);
    },
  });

  const sortedItems = useMemo(
    () =>
      [...(proxiesQuery.data ?? [])].sort((a, b) =>
        `${a.serviceName}:${a.proxy}`.localeCompare(
          `${b.serviceName}:${b.proxy}`,
          "ru",
        ),
      ),
    [proxiesQuery.data],
  );

  const handleClose = () => {
    setOpen(false);
    setSelectedProxy(null);
    setFormData(initialFormData);
    setError(null);
    setResult(null);
    setCheckResult(null);
  };

  const handleOpenAdd = () => {
    setOpen("add");
    setError(null);
    setResult(null);
    setCheckResult(null);
    setFormData((prev) => ({
      ...prev,
      serviceName: prev.serviceName || servicesQuery.data?.[0] || "",
    }));
  };

  const handleOpenDelete = (item: ProxyListItem) => {
    setSelectedProxy(item);
    setOpen("delete");
    setError(null);
    setCheckResult(null);
  };

  const handleOpenCheck = (item: ProxyListItem) => {
    setSelectedProxy(item);
    setOpen("check");
    setError(null);
    setCheckResult(null);
    checkMutation.mutate(item.proxy);
  };

  const handleSubmit = async () => {
    if (open === "add") {
      return addMutation.mutate(formData);
    }

    if (open === "delete" && selectedProxy) {
      return deleteMutation.mutate(selectedProxy.proxy);
    }
  };

  const renderAddModal = () => (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {result && (
        <Alert severity={result.addedCount > 0 ? "success" : "info"}>
          <div>Р”РѕР±Р°РІР»РµРЅРѕ: {result.addedCount}</div>
          <div>Р”СѓР±Р»РёРєР°С‚С‹: {result.duplicateCount}</div>
          <div>РќРµРІР°Р»РёРґРЅС‹Рµ СЃС‚СЂРѕРєРё: {result.invalidCount}</div>
        </Alert>
      )}
      <Select
        size="small"
        fullWidth
        value={formData.serviceName}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            serviceName: e.target.value,
          }))
        }
      >
        {(servicesQuery.data ?? []).map((serviceName) => (
          <MenuItem key={serviceName} value={serviceName}>
            {serviceName}
          </MenuItem>
        ))}
      </Select>
      <TextField
        label="РџСЂРѕРєСЃРё"
        value={formData.proxiesText}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            proxiesText: e.target.value,
          }))
        }
        multiline
        minRows={8}
        placeholder="185.176.27.31:8000:kUDg7v:qFfExm"
        helperText="РџРѕ РѕРґРЅРѕРјСѓ РїСЂРѕРєСЃРё РІ СЃС‚СЂРѕРєРµ РІ С„РѕСЂРјР°С‚Рµ ip:port:login:password"
        fullWidth
      />
      {result?.duplicateProxies?.length ? (
        <Alert severity="warning">
          Р”СѓР±Р»РёРєР°С‚С‹: {result.duplicateProxies.slice(0, 10).join(", ")}
          {result.duplicateProxies.length > 10 ? " ..." : ""}
        </Alert>
      ) : null}
      {result?.invalidLines?.length ? (
        <Alert severity="warning">
          РќРµРІР°Р»РёРґРЅС‹Рµ СЃС‚СЂРѕРєРё: {result.invalidLines.slice(0, 10).join(", ")}
          {result.invalidLines.length > 10 ? " ..." : ""}
        </Alert>
      ) : null}
    </Stack>
  );

  const renderDeleteModal = () => (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography>
        РЈРґР°Р»РёС‚СЊ РїСЂРѕРєСЃРё <strong>{selectedProxy?.proxy}</strong>?
      </Typography>
    </Box>
  );

  const renderCheckModal = () => (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && checkResult && (
        <Alert
          severity={
            checkResult.success
              ? "success"
              : checkResult.isBlocked
                ? "warning"
                : "error"
          }
        >
          {checkResult.message}
        </Alert>
      )}
      <Typography>
        <strong>Прокси:</strong> {selectedProxy?.proxy}
      </Typography>
      {checkResult && (
        <>
          <Typography>
            <strong>URL:</strong> {checkResult.url}
          </Typography>
          <Typography>
            <strong>HTTP status:</strong> {checkResult.statusCode ?? "-"}
          </Typography>
          <Typography>
            <strong>Время ответа:</strong> {checkResult.responseTimeMs} мс
          </Typography>
          <Typography>
            <strong>Блокировка:</strong> {checkResult.isBlocked ? "Да" : "Нет"}
          </Typography>
          {checkResult.snippet ? (
            <Alert severity="info">{checkResult.snippet}</Alert>
          ) : null}
        </>
      )}
    </Stack>
  );

  return (
    <>
      <Table
        isFetching={proxiesQuery.isPending}
        headerLabels={headerLabels}
        tableButtons={
          <Box sx={{ p: 0.5, pl: 1 }}>
            <Button
              disableRipple
              sx={{ color: "white" }}
              size="small"
              onClick={handleOpenAdd}
              startIcon={<AddCircleOutlineIcon fontSize="small" />}
            >
              Р”РѕР±Р°РІРёС‚СЊ РїСЂРѕРєСЃРё
            </Button>
          </Box>
        }
        tableRows={
          <TableRows
            items={sortedItems}
            onCheck={handleOpenCheck}
            onDelete={handleOpenDelete}
          />
        }
      />

      <Modal
        isLoading={
          addMutation.isPending ||
          checkMutation.isPending ||
          deleteMutation.isPending ||
          servicesQuery.isPending
        }
        onClose={handleClose}
        open={!!open}
        title={
          open === "add"
            ? "Р”РѕР±Р°РІРёС‚СЊ РїСЂРѕРєСЃРё"
            : open === "delete"
              ? "РЈРґР°Р»РёС‚СЊ РїСЂРѕРєСЃРё"
              : "РџСЂРѕРІРµСЂРёС‚СЊ РїСЂРѕРєСЃРё"
        }
        submitLabel={open === "add" ? "РЎРѕС…СЂР°РЅРёС‚СЊ" : "РЈРґР°Р»РёС‚СЊ"}
        onSubmit={handleSubmit}
        hideFooter={open === "check"}
      >
        {open === "add"
          ? renderAddModal()
          : open === "delete"
            ? renderDeleteModal()
            : renderCheckModal()}
      </Modal>
    </>
  );
};

export default ProxiesPage;
