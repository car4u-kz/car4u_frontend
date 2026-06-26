"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Checkbox,
  ListItemText,
  MenuItem,
  OutlinedInput,
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
  updateProxy,
} from "@/services/proxy-services";

import TableRows from "./components/table-rows";
import type {
  ProxyBatchCreatePayload,
  ProxyBatchCreateResult,
  ProxyCheckResult,
  ProxyListItem,
  ProxyUpdatePayload,
} from "./types";

const headerLabels = ["Прокси", "Назначение", "Комментарий", ""];
const hiddenServiceNames = new Set(["CatalogMonitor"]);
const serviceLabelMap: Record<string, string> = {
  PendingArchiveValidationProcessor: "Проверка архива",
  TemplateMode1Processor: "Парсинг каталога",
  TemplateMode2Processor: "Мои объявления",
};

const initialFormData: ProxyBatchCreatePayload = {
  serviceNames: [],
  proxiesText: "",
  comment: "",
};

const initialEditFormData: ProxyUpdatePayload = {
  proxy: "",
  serviceNames: [],
  comment: "",
};

const normalizeEditableServiceNames = (serviceNames: string[]) =>
  serviceNames.filter((serviceName) => !hiddenServiceNames.has(serviceName));

const ProxiesPage = () => {
  const fetchWithAuth = useFetchWithAuth();
  const [open, setOpen] = useState<"add" | "edit" | "delete" | "check" | false>(false);
  const [formData, setFormData] =
    useState<ProxyBatchCreatePayload>(initialFormData);
  const [editFormData, setEditFormData] =
    useState<ProxyUpdatePayload>(initialEditFormData);
  const [selectedProxy, setSelectedProxy] = useState<ProxyListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyBatchCreateResult | null>(null);
  const [checkResult, setCheckResult] = useState<ProxyCheckResult | null>(null);

  const formatServiceName = (serviceName: string) =>
    serviceLabelMap[serviceName] ?? serviceName;

  const proxiesQuery = useQuery({
    queryKey: ["proxies"],
    queryFn: () => getProxies(fetchWithAuth),
    retry: false,
  });

  const servicesQuery = useQuery({
    queryKey: ["proxy-services"],
    queryFn: () => getProxyServices(fetchWithAuth),
    select: (serviceNames: string[]) =>
      serviceNames.filter((serviceName) => !hiddenServiceNames.has(serviceName)),
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

  const updateMutation = useMutation({
    mutationFn: (payload: ProxyUpdatePayload) => updateProxy(payload, fetchWithAuth),
    onSuccess: async () => {
      handleClose();
      await proxiesQuery.refetch();
    },
    onError: (mutationError: Error) => {
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
        `${a.serviceNames.join("|")}:${a.proxy}`.localeCompare(
          `${b.serviceNames.join("|")}:${b.proxy}`,
          "ru",
        ),
      ),
    [proxiesQuery.data],
  );

  const handleClose = () => {
    setOpen(false);
    setSelectedProxy(null);
    setFormData(initialFormData);
    setEditFormData(initialEditFormData);
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
      serviceNames:
        prev.serviceNames.length > 0
          ? prev.serviceNames
          : servicesQuery.data?.[0]
            ? [servicesQuery.data[0]]
            : [],
    }));
  };

  const handleOpenEdit = (item: ProxyListItem) => {
    setSelectedProxy(item);
    setEditFormData({
      proxy: item.proxy,
      serviceNames: normalizeEditableServiceNames(item.serviceNames),
      comment: item.comment ?? "",
    });
    setOpen("edit");
    setError(null);
    setCheckResult(null);
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
      return addMutation.mutate({
        ...formData,
        serviceNames: normalizeEditableServiceNames(formData.serviceNames),
      });
    }

    if (open === "edit") {
      return updateMutation.mutate({
        ...editFormData,
        serviceNames: normalizeEditableServiceNames(editFormData.serviceNames),
      });
    }

    if (open === "delete" && selectedProxy) {
      return deleteMutation.mutate(selectedProxy.proxy);
    }

    handleClose();
  };

  const renderServiceSelector = (
    value: string[],
    onChange: (serviceNames: string[]) => void,
  ) => (
    <Select
      size="small"
      fullWidth
      multiple
      value={value}
      input={<OutlinedInput />}
      renderValue={(selected) =>
        (selected as string[]).map(formatServiceName).join(", ")
      }
      onChange={(e) =>
        onChange(
          typeof e.target.value === "string"
            ? e.target.value.split(",")
            : e.target.value,
        )
      }
    >
      {(servicesQuery.data ?? []).map((serviceName) => (
        <MenuItem key={serviceName} value={serviceName}>
          <Checkbox checked={value.includes(serviceName)} />
          <ListItemText primary={formatServiceName(serviceName)} />
        </MenuItem>
      ))}
    </Select>
  );

  const renderAddModal = () => (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {result && (
        <Alert severity={result.addedCount > 0 ? "success" : "info"}>
          <div>Добавлено: {result.addedCount}</div>
          <div>Дубликаты: {result.duplicateCount}</div>
          <div>Невалидные строки: {result.invalidCount}</div>
          <div>Не удалось добавить: {result.failedCount}</div>
        </Alert>
      )}
      {renderServiceSelector(formData.serviceNames, (serviceNames) =>
        setFormData((prev) => ({ ...prev, serviceNames })),
      )}
      <TextField
        label="Комментарий"
        value={formData.comment ?? ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            comment: e.target.value,
          }))
        }
        fullWidth
      />
      <TextField
        label="Прокси"
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
        helperText="По одному прокси в строке в формате ip:port:login:password"
        fullWidth
      />
      {result?.duplicateProxies?.length ? (
        <Alert severity="warning">
          Дубликаты: {result.duplicateProxies.slice(0, 10).join(", ")}
          {result.duplicateProxies.length > 10 ? " ..." : ""}
        </Alert>
      ) : null}
      {result?.invalidLines?.length ? (
        <Alert severity="warning">
          Невалидные строки: {result.invalidLines.slice(0, 10).join(", ")}
          {result.invalidLines.length > 10 ? " ..." : ""}
        </Alert>
      ) : null}
      {result?.failedProxies?.length ? (
        <Alert severity="error">
          Не удалось добавить: {result.failedProxies.slice(0, 10).join(", ")}
          {result.failedProxies.length > 10 ? " ..." : ""}
        </Alert>
      ) : null}
    </Stack>
  );

  const renderEditModal = () => (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Прокси"
        value={editFormData.proxy}
        fullWidth
        disabled
      />
      {renderServiceSelector(editFormData.serviceNames, (serviceNames) =>
        setEditFormData((prev) => ({ ...prev, serviceNames })),
      )}
      <TextField
        label="Комментарий"
        value={editFormData.comment ?? ""}
        onChange={(e) =>
          setEditFormData((prev) => ({
            ...prev,
            comment: e.target.value,
          }))
        }
        fullWidth
      />
    </Stack>
  );

  const renderDeleteModal = () => (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography>
        Удалить прокси <strong>{selectedProxy?.proxy}</strong>?
      </Typography>
    </Box>
  );

  const renderCheckModal = () => (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && checkResult && (
        <Alert severity={checkResult.success ? "success" : "error"}>
          {checkResult.message}
        </Alert>
      )}
      <Typography>
        <strong>Прокси:</strong> {selectedProxy?.proxy}
      </Typography>
      {selectedProxy?.comment ? (
        <Typography>
          <strong>Комментарий:</strong> {selectedProxy.comment}
        </Typography>
      ) : null}
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
              Добавить прокси
            </Button>
          </Box>
        }
        tableRows={
          <TableRows
            items={sortedItems}
            onCheck={handleOpenCheck}
            onDelete={handleOpenDelete}
            onEdit={handleOpenEdit}
            formatServiceName={formatServiceName}
          />
        }
      />

      <Modal
        isLoading={
          addMutation.isPending ||
          updateMutation.isPending ||
          checkMutation.isPending ||
          deleteMutation.isPending ||
          servicesQuery.isPending
        }
        onClose={handleClose}
        open={!!open}
        title={
          open === "add"
            ? "Добавить прокси"
            : open === "edit"
              ? "Редактировать прокси"
              : open === "delete"
                ? "Удалить прокси"
                : "Проверить прокси"
        }
        submitLabel={
          open === "add"
            ? "Сохранить"
            : open === "edit"
              ? "Сохранить"
              : open === "delete"
                ? "Удалить"
                : "Закрыть"
        }
        cancelLabel="Отмена"
        onSubmit={handleSubmit}
      >
        {open === "add"
          ? renderAddModal()
          : open === "edit"
            ? renderEditModal()
            : open === "delete"
              ? renderDeleteModal()
              : renderCheckModal()}
      </Modal>
    </>
  );
};

export default ProxiesPage;
