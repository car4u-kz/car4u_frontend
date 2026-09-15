"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SegmentRoundedIcon from "@mui/icons-material/SegmentRounded";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button, Modal } from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import {
  createCatalogDescriptionKeyword,
  deleteCatalogDescriptionKeyword,
  getCatalogDescriptionKeywordProgress,
  getCatalogDescriptionKeywords,
  requeueCatalogDescriptionKeywords,
  setCatalogDescriptionKeywordActive,
  updateCatalogDescriptionKeyword,
} from "@/services/catalog-keyword-services";
import type {
  CatalogDescriptionKeyword,
  CatalogDescriptionKeywordPayload,
  CatalogDescriptionKeywordProgress,
} from "./types";

const initialForm: CatalogDescriptionKeywordPayload = {
  name: "",
  targetTerms: [],
  semanticEnabled: true,
  similarityThreshold: null,
  isActive: true,
};

const formatNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat("ru-RU").format(value ?? 0);

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const parseTerms = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((term) => term.trim())
    .filter(Boolean);

const buildTermsText = (terms: string[]) => terms.join("\n");

const buildPayload = (form: CatalogDescriptionKeywordPayload) => ({
  ...form,
  name: form.name.trim(),
  targetTerms: form.targetTerms.map((term) => term.trim()).filter(Boolean),
  similarityThreshold:
    form.similarityThreshold === null || Number.isNaN(form.similarityThreshold)
      ? null
      : form.similarityThreshold,
});

const calculatePercent = (done: number, total: number) => {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
};

const statCardSx = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minHeight: "80px",
  padding: "16px 18px",
  background: "#ffffff",
  border: "1px solid #e6eaf0",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
};

const statIconSx = (background: string, color: string) => ({
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background,
  color,
});

const statLabelSx = {
  fontSize: 13,
  lineHeight: "18px",
  fontWeight: 500,
  color: "#64748b",
};

const statValueSx = {
  mt: "2px",
  fontSize: 20,
  lineHeight: "24px",
  fontWeight: 700,
  color: "#0f172a",
  letterSpacing: "-0.02em",
};

const StatCard = ({
  label,
  value,
  icon,
  iconBackground,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
}) => (
  <Box sx={statCardSx}>
    <Box sx={statIconSx(iconBackground, iconColor)}>{icon}</Box>
    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Typography sx={statLabelSx}>{label}</Typography>
      <Typography sx={statValueSx}>{value}</Typography>
    </Box>
  </Box>
);

const StatCardSkeleton = () => (
  <Box sx={statCardSx}>
    <Skeleton variant="circular" width={38} height={38} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="70%" height={18} />
      <Skeleton variant="text" width="44%" height={30} />
    </Box>
  </Box>
);

const ProgressPanel = ({
  progress,
  isFetching,
}: {
  progress?: CatalogDescriptionKeywordProgress;
  isFetching: boolean;
}) => {
  const totalDescriptions = progress?.descriptionsWithFullDescription ?? 0;
  const keywordChecked = progress?.keywordCheckedDescriptions ?? 0;
  const embedded = progress?.embeddedDescriptions ?? 0;
  const keywordPercent = calculatePercent(keywordChecked, totalDescriptions);
  const embeddingPercent = calculatePercent(embedded, totalDescriptions);
  const showSkeleton = isFetching && !progress;

  return (
    <Stack gap={1.5}>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: "14px",
          }}
        >
          {showSkeleton ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Описаний"
                value={formatNumber(progress?.descriptionsWithFullDescription)}
                icon={<SegmentRoundedIcon fontSize="small" />}
                iconBackground="#e8f1ff"
                iconColor="#2563eb"
              />
              <StatCard
                label="Проверено"
                value={formatNumber(progress?.keywordCheckedDescriptions)}
                icon={<CheckCircleRoundedIcon fontSize="small" />}
                iconBackground="#e9f9ef"
                iconColor="#16a34a"
              />
              <StatCard
                label="Ожидает"
                value={formatNumber(progress?.keywordPendingDescriptions)}
                icon={<HourglassTopRoundedIcon fontSize="small" />}
                iconBackground="#fff4e5"
                iconColor="#f97316"
              />
              <StatCard
                label="С совпадениями"
                value={formatNumber(progress?.descriptionsWithMatchedKeywords)}
                icon={<AutoAwesomeIcon fontSize="small" />}
                iconBackground="#f0edff"
                iconColor="#7c3aed"
              />
            </>
          )}
        </Box>
        {isFetching && progress ? (
          <CircularProgress
            size={18}
            sx={{ position: "absolute", right: 8, top: 8 }}
          />
        ) : null}
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.25 }}>
        <Stack gap={1}>
          <Box>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Ключевые слова
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {keywordPercent}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={keywordPercent}
              sx={{ mt: 0.75, height: 7, borderRadius: 1 }}
            />
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Embeddings: {progress?.embeddingModelName || "-"}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {embeddingPercent}%
              </Typography>
            </Stack>
            <LinearProgress
              color="secondary"
              variant="determinate"
              value={embeddingPercent}
              sx={{ mt: 0.75, height: 7, borderRadius: 1 }}
            />
          </Box>
        </Stack>

        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
          <Chip
            size="small"
            label={`Словарь: ${formatDate(progress?.dictionaryUpdatedAt)}`}
          />
          <Chip
            size="small"
            label={`Последняя проверка: ${formatDate(progress?.lastKeywordCheckedAt)}`}
          />
          <Chip
            size="small"
            label={`Последний embedding: ${formatDate(progress?.lastEmbeddingUpdatedAt)}`}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

const CatalogKeywordsPage = () => {
  const fetchWithAuth = useFetchWithAuth({ trackLoading: false });
  const [editingKeyword, setEditingKeyword] =
    useState<CatalogDescriptionKeyword | null>(null);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [form, setForm] = useState<CatalogDescriptionKeywordPayload>(initialForm);
  const [termsText, setTermsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const keywordsQuery = useQuery({
    queryKey: ["catalog-description-keywords"],
    queryFn: () => getCatalogDescriptionKeywords(fetchWithAuth),
    retry: false,
  });

  const progressQuery = useQuery({
    queryKey: ["catalog-description-keyword-progress"],
    queryFn: () => getCatalogDescriptionKeywordProgress(fetchWithAuth),
    refetchInterval: 15000,
    retry: false,
  });

  const resetForm = () => {
    setEditingKeyword(null);
    setForm(initialForm);
    setTermsText("");
  };

  const closeKeywordModal = () => {
    resetForm();
    setIsKeywordModalOpen(false);
  };

  const startCreate = () => {
    resetForm();
    setError(null);
    setSuccess(null);
    setIsKeywordModalOpen(true);
  };

  const refreshAll = async () => {
    await Promise.all([keywordsQuery.refetch(), progressQuery.refetch()]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload({
        ...form,
        targetTerms: parseTerms(termsText),
      });

      if (editingKeyword) {
        return updateCatalogDescriptionKeyword(
          editingKeyword.id,
          payload,
          fetchWithAuth,
        );
      }

      return createCatalogDescriptionKeyword(payload, fetchWithAuth);
    },
    onSuccess: async () => {
      setError(null);
      setSuccess(
        editingKeyword
          ? "Ключевое слово обновлено"
          : "Ключевое слово добавлено",
      );
      resetForm();
      setIsKeywordModalOpen(false);
      await refreshAll();
    },
    onError: (mutationError: Error) => {
      setSuccess(null);
      setError(mutationError.message);
    },
  });

  const activeMutation = useMutation({
    mutationFn: (keyword: CatalogDescriptionKeyword) =>
      setCatalogDescriptionKeywordActive(
        keyword.id,
        !keyword.isActive,
        fetchWithAuth,
      ),
    onSuccess: refreshAll,
    onError: (mutationError: Error) => {
      setSuccess(null);
      setError(mutationError.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (keyword: CatalogDescriptionKeyword) =>
      deleteCatalogDescriptionKeyword(keyword.id, fetchWithAuth),
    onSuccess: async () => {
      setSuccess("Ключевое слово удалено");
      setError(null);
      await refreshAll();
    },
    onError: (mutationError: Error) => {
      setSuccess(null);
      setError(mutationError.message);
    },
  });

  const requeueMutation = useMutation({
    mutationFn: () => requeueCatalogDescriptionKeywords(fetchWithAuth),
    onSuccess: async (result) => {
      setError(null);
      setSuccess(
        `Повторная обработка запущена. Сброшено описаний: ${formatNumber(result.resetDescriptions)}.`,
      );
      await refreshAll();
    },
    onError: (mutationError: Error) => {
      setSuccess(null);
      setError(mutationError.message);
    },
  });

  const keywords = useMemo(
    () => keywordsQuery.data ?? [],
    [keywordsQuery.data],
  );

  const startEdit = (keyword: CatalogDescriptionKeyword) => {
    setEditingKeyword(keyword);
    setForm({
      name: keyword.name,
      targetTerms: keyword.targetTerms,
      semanticEnabled: keyword.semanticEnabled,
      similarityThreshold: keyword.similarityThreshold,
      isActive: keyword.isActive,
    });
    setTermsText(buildTermsText(keyword.targetTerms));
    setError(null);
    setSuccess(null);
    setIsKeywordModalOpen(true);
  };

  const isBusy =
    saveMutation.isPending ||
    activeMutation.isPending ||
    deleteMutation.isPending ||
    requeueMutation.isPending;

  return (
    <Stack gap={2.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 28,
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Ключевые слова
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Обработка описаний каталога
          </Typography>
        </Box>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={isBusy}
            onClick={() => requeueMutation.mutate()}
          >
            Переобработать
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            disabled={isBusy}
            onClick={startCreate}
          >
            Новое слово
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <ProgressPanel
        progress={progressQuery.data}
        isFetching={progressQuery.isFetching}
      />

      <Paper variant="outlined" sx={{ borderRadius: 1.25, overflow: "hidden" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            sx={{ px: 2, py: 1.5 }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <KeyOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Словарь
              </Typography>
            </Stack>
            {keywordsQuery.isFetching ? <CircularProgress size={18} /> : null}
          </Stack>
          <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Целевые слова</TableCell>
                <TableCell>Обновлено</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {keywords.map((keyword) => (
                <TableRow key={keyword.id} hover>
                  <TableCell>
                    <Stack gap={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {keyword.name}
                      </Typography>
                      <Chip
                        size="small"
                        color={keyword.isActive ? "success" : "default"}
                        variant={keyword.isActive ? "filled" : "outlined"}
                        label={keyword.isActive ? "Активно" : "Отключено"}
                        sx={{ width: "fit-content" }}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Stack direction="row" gap={0.5} flexWrap="wrap">
                      {keyword.targetTerms.slice(0, 8).map((term) => (
                        <Chip key={term} label={term} size="small" />
                      ))}
                      {keyword.targetTerms.length > 8 ? (
                        <Chip
                          label={`+${keyword.targetTerms.length - 8}`}
                          size="small"
                          variant="outlined"
                        />
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(keyword.updatedAt)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                      <Tooltip title="Редактировать">
                        <span>
                          <IconButton
                            size="small"
                            disabled={isBusy}
                            onClick={() => startEdit(keyword)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={keyword.isActive ? "Отключить" : "Активировать"}
                      >
                        <span>
                          <IconButton
                            size="small"
                            disabled={isBusy}
                            onClick={() => activeMutation.mutate(keyword)}
                          >
                            {keyword.isActive ? (
                              <PauseCircleOutlineIcon fontSize="small" />
                            ) : (
                              <PlayCircleOutlineIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isBusy}
                            onClick={() => deleteMutation.mutate(keyword)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!keywordsQuery.isFetching && keywords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 4, textAlign: "center" }}
                    >
                      Ключевые слова не добавлены
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
      </Paper>

      <Modal
        open={isKeywordModalOpen}
        title={editingKeyword ? "Редактирование" : "Новое слово"}
        submitLabel="Сохранить"
        cancelLabel="Отмена"
        onSubmit={() => saveMutation.mutate()}
        onClose={closeKeywordModal}
        isLoading={saveMutation.isPending}
        sx={{
          width: { xs: "calc(100vw - 32px)", sm: 560 },
          maxWidth: "100%",
        }}
      >
          <Stack gap={1.5}>
            <TextField
              size="small"
              label="Название"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Целевые слова"
              value={termsText}
              onChange={(event) => setTermsText(event.target.value)}
              multiline
              rows={8}
              fullWidth
            />

          </Stack>
      </Modal>
    </Stack>
  );
};

export default CatalogKeywordsPage;
