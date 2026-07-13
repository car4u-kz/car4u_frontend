"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useMutation } from "@tanstack/react-query";

import {
  Button,
  CarTitleHoverPreview,
  DateTimeTypography,
  Modal,
  Tooltip,
} from "@/components";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { updateSellerProfile } from "@/services/seller-services";
import { SEARCH_QUERY as SQ } from "@/constants";
import {
  AdLookupOption,
  CarAd,
  SellerProfileUpdatePayload,
} from "@/types";
import GeneratePDFDropdown from "@/components/generate-pdf/generate-pdf";
import {
  formatDistance,
  formatPrice,
  getAdIdFromUrl,
} from "@/utils/formatters";

type Props = {
  items: CarAd[];
  statusId: SQ;
  onUpdate: (itemGlobalIndex: number) => Promise<void>;
  onAccountClick: (accountId: string) => void;
  sellerRegions: AdLookupOption[];
};

const ACCOUNT_TYPE_OPTIONS = [
  "ОД Автосалон",
  "Перекуп",
  "Автоплощадка",
  "Частное лицо",
  "Новый игрок",
] as const;

const getDisplayDate = (item: CarAd, statusId: SQ): string => {
  switch (statusId) {
    case SQ.all:
      return item.publicationDate as string;
    case SQ.new:
    case SQ.pendingArchiveValidation:
    case SQ.notFound404:
      return item.lastCheckDate as string;
    case SQ.archived:
    default:
      return item.latestAdUpdateDate as string;
  }
};

const baseCellSx = {
  height: 64,
  px: { xs: "8px", xl: "12px" },
  py: "10px",
  borderBottom: "1px solid #edf2f7",
  fontSize: 13,
  lineHeight: "18px",
  color: "#0f172a",
  verticalAlign: "middle",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const subtleCellSx = {
  ...baseCellSx,
  color: "#334155",
};

const tooltipContentSx = {
  minWidth: 280,
  maxWidth: 320,
  p: 0.5,
};

const accountLabelButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#2563eb",
  cursor: "pointer",
  font: "inherit",
  textAlign: "left",
};

const normalizeNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const TableRows = ({
  statusId,
  items,
  onUpdate,
  onAccountClick,
  sellerRegions,
}: Props) => {
  const fetchWithAuth = useFetchWithAuth();
  const [editingSeller, setEditingSeller] =
    useState<SellerProfileUpdatePayload | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [sellerOverrides, setSellerOverrides] = useState<
    Record<string, Partial<CarAd>>
  >({});

  const mergedItems = useMemo(
    () =>
      items.map((item) => {
        if (!item.sellerUserId) {
          return item;
        }

        const override = sellerOverrides[item.sellerUserId];
        return override ? { ...item, ...override } : item;
      }),
    [items, sellerOverrides],
  );

  const sellerMutation = useMutation({
    mutationFn: (payload: SellerProfileUpdatePayload) =>
      updateSellerProfile(payload, fetchWithAuth),
    onSuccess: (seller) => {
      setSellerOverrides((prev) => ({
        ...prev,
        [seller.userId]: {
          sellerDisplayName: seller.displayName,
          sellerPhone1: seller.phone1,
          sellerPhone2: seller.phone2,
          sellerPhone3: seller.phone3,
          sellerNotes: seller.notes,
          sellerAccountType: seller.accountType,
          sellerAccountRegionId: seller.accountRegionId,
          sellerAccountRegionName: seller.accountRegionName,
        },
      }));
      setEditError(null);
      setEditingSeller(null);
    },
    onError: (error: Error) => {
      setEditError(error.message);
    },
  });

  const handleOpenSellerEdit = (item: CarAd) => {
    if (!item.sellerUserId) {
      return;
    }

    setEditError(null);
    setEditingSeller({
      userId: item.sellerUserId,
      displayName: item.sellerDisplayName ?? "",
      phone1: item.sellerPhone1 ?? "",
      phone2: item.sellerPhone2 ?? "",
      phone3: item.sellerPhone3 ?? "",
      notes: item.sellerNotes ?? "",
      accountType: item.sellerAccountType ?? "",
      accountRegionName: item.sellerAccountRegionName ?? "",
      accountRegionId: item.sellerAccountRegionId,
    });
  };

  const handleCloseSellerEdit = () => {
    if (sellerMutation.isPending) {
      return;
    }

    setEditError(null);
    setEditingSeller(null);
  };

  const handleSaveSeller = () => {
    if (!editingSeller) {
      return;
    }

    sellerMutation.mutate({
      userId: editingSeller.userId,
      displayName: normalizeNullable(editingSeller.displayName ?? ""),
      phone1: normalizeNullable(editingSeller.phone1 ?? ""),
      phone2: normalizeNullable(editingSeller.phone2 ?? ""),
      phone3: normalizeNullable(editingSeller.phone3 ?? ""),
      notes: normalizeNullable(editingSeller.notes ?? ""),
      accountType: normalizeNullable(editingSeller.accountType ?? ""),
      accountRegionId: editingSeller.accountRegionId,
      accountRegionName: normalizeNullable(editingSeller.accountRegionName ?? ""),
    });
  };

  return (
    <>
      {mergedItems?.map((item, idx) => {
        const adExternalId = getAdIdFromUrl(item.adUrl);
        const accountLabel =
          item.sellerDisplayName?.trim() || item.sellerUserId || "—";
        const phones = [
          item.sellerPhone1,
          item.sellerPhone2,
          item.sellerPhone3,
        ].filter(Boolean);

        return (
          <TableRow
            key={`${item.adId}-${idx}`}
            hover
            sx={{
              backgroundColor:
                idx % 2 === 0 ? "#ffffff" : "rgba(148, 163, 184, 0.06)",
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "#f8fafc",
              },
              opacity: item.isViewed ? 0.55 : 1,
            }}
          >
            <TableCell
              className="published-col"
              sx={{ ...subtleCellSx, whiteSpace: "nowrap" }}
            >
              <DateTimeTypography
                carSearchParam={statusId}
                date={getDisplayDate(item, statusId)}
              />
            </TableCell>

            <TableCell className="car-col" sx={baseCellSx}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: item.firstPhotoLink ? "12px" : 0,
                  minWidth: 0,
                }}
              >
                {item.firstPhotoLink ? (
                  <Box
                    component="img"
                    src={item.firstPhotoLink}
                    alt={item.adTitle}
                    sx={{
                      width: 56,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: "7px",
                      border: "1px solid #e2e8f0",
                      background: "#f1f5f9",
                      flexShrink: 0,
                    }}
                  />
                ) : null}

                <Box
                  sx={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      "& .MuiTypography-root": {
                        display: "inline-block",
                        maxWidth: "100%",
                      },
                      "& a": {
                        display: "inline-block",
                        maxWidth: "100%",
                        padding: 0,
                        borderRadius: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 14,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#2563eb",
                        textDecoration: "none",
                      },
                      "& a:hover": {
                        color: "#1d4ed8",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    <CarTitleHoverPreview
                      src={item.firstPhotoLink}
                      shortDescription={item.shortDescription}
                      adUrl={item.adUrl}
                      isViewed={item.isViewed}
                      adId={item.adId}
                      onUpdate={onUpdate}
                      index={idx}
                    >
                      {item.adTitle}
                    </CarTitleHoverPreview>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "self-start",
                      gap: 0,
                      fontSize: 12,
                      lineHeight: "16px",
                      fontWeight: 500,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>ID: {adExternalId}</span>
                    <span>
                      Account:{" "}
                      {item.sellerUserId ? (
                        <Tooltip
                          placement="top-start"
                          slotProps={{
                            tooltip: {
                              sx: {
                                backgroundColor: "#ffffff",
                                color: "#0f172a",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 16px 40px rgba(15, 23, 42, 0.14)",
                                borderRadius: "14px",
                                p: 1.25,
                                maxWidth: 360,
                              },
                            },
                          }}
                          title={
                            <Box
                              sx={tooltipContentSx}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Stack spacing={1}>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: 14,
                                      fontWeight: 700,
                                      color: "#0f172a",
                                    }}
                                  >
                                    {item.sellerDisplayName?.trim() ||
                                      "Аккаунт без названия"}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      mt: 0.25,
                                      fontSize: 12,
                                      color: "#64748b",
                                    }}
                                  >
                                    ID: {item.sellerUserId}
                                  </Typography>
                                </Box>

                                {item.sellerAccountType?.trim() ? (
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      Тип аккаунта
                                    </Typography>
                                    <Typography
                                      sx={{
                                        mt: 0.25,
                                        fontSize: 13,
                                        color: "#0f172a",
                                      }}
                                    >
                                      {item.sellerAccountType}
                                    </Typography>
                                  </Box>
                                ) : null}

                                {item.sellerAccountRegionName?.trim() ? (
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      Регион
                                    </Typography>
                                    <Typography
                                      sx={{
                                        mt: 0.25,
                                        fontSize: 13,
                                        color: "#0f172a",
                                      }}
                                    >
                                      {item.sellerAccountRegionName}
                                    </Typography>
                                  </Box>
                                ) : null}

                                {phones.length ? (
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      Телефоны
                                    </Typography>
                                    {phones.map((phone) => (
                                      <Typography
                                        key={phone}
                                        sx={{
                                          mt: 0.25,
                                          fontSize: 13,
                                          color: "#0f172a",
                                        }}
                                      >
                                        {phone}
                                      </Typography>
                                    ))}
                                  </Box>
                                ) : null}

                                {item.sellerNotes?.trim() ? (
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      Заметки
                                    </Typography>
                                    <Typography
                                      sx={{
                                        mt: 0.25,
                                        fontSize: 13,
                                        lineHeight: "18px",
                                        color: "#0f172a",
                                        whiteSpace: "pre-wrap",
                                      }}
                                    >
                                      {item.sellerNotes}
                                    </Typography>
                                  </Box>
                                ) : null}

                                {typeof item.accountAdsCount === "number" &&
                                item.accountAdsCount > 0 ? (
                                  <Box>
                                    <Typography
                                      sx={{ fontSize: 13, color: "#0f172a" }}
                                    >
                                      Объявлений: {item.accountAdsCount}
                                    </Typography>
                                    {item.accountAdsCount > 1 &&
                                    typeof item.accountAvgPrice === "number" ? (
                                      <Typography
                                        sx={{
                                          mt: 0.25,
                                          fontSize: 13,
                                          color: "#0f172a",
                                        }}
                                      >
                                        Средняя цена:{" "}
                                        {formatPrice(item.accountAvgPrice)}
                                      </Typography>
                                    ) : null}
                                  </Box>
                                ) : null}

                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleOpenSellerEdit(item)}
                                    startIcon={
                                      <EditOutlinedIcon fontSize="small" />
                                    }
                                    sx={{
                                      minWidth: 0,
                                      px: 1.5,
                                      py: 0.5,
                                      textTransform: "none",
                                    }}
                                  >
                                    Редактировать
                                  </Button>
                                </Stack>
                              </Stack>
                            </Box>
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `/ads?statusId=0&accountId=${encodeURIComponent(item.sellerUserId!)}`,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            style={accountLabelButtonStyle}
                          >
                            {accountLabel}
                          </button>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </span>
                    {typeof item.accountAdsCount === "number" &&
                    item.accountAdsCount > 0 ? (
                      <span>Ads: {item.accountAdsCount}</span>
                    ) : null}
                    {typeof item.accountAdsCount === "number" &&
                    item.accountAdsCount > 1 &&
                    typeof item.accountAvgPrice === "number" ? (
                      <span>Avg price: {formatPrice(item.accountAvgPrice)}</span>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            </TableCell>

            <TableCell className="year-col" sx={subtleCellSx}>
              {item.adYear}
            </TableCell>

            <TableCell
              className="price-col"
              sx={{
                ...baseCellSx,
                fontWeight: 700,
                color: "#0f172a",
                whiteSpace: "nowrap",
              }}
            >
              {formatPrice(item.dynamicPrice)}
            </TableCell>

            <TableCell className="mileage-col" sx={subtleCellSx}>
              {formatDistance(item.mileage)}
            </TableCell>

            <TableCell className="engine-col" sx={subtleCellSx}>
              {item.engineVolume} {item.fuelType}
            </TableCell>

            <TableCell className="gearbox-col" sx={subtleCellSx}>
              {item.transmission}
            </TableCell>

            <TableCell className="body-col" sx={subtleCellSx}>
              {item.bodyType}
            </TableCell>

            <TableCell
              className="region-col"
              sx={{
                ...subtleCellSx,
                maxWidth: 180,
              }}
            >
              {item.region}
            </TableCell>

            <GeneratePDFDropdown index={idx} itemId={item.adId} variant="ads" />
          </TableRow>
        );
      })}

      <Modal
        open={!!editingSeller}
        onClose={handleCloseSellerEdit}
        onSubmit={handleSaveSeller}
        title="Редактировать аккаунт"
        submitLabel="Сохранить"
        cancelLabel="Отмена"
        isLoading={sellerMutation.isPending}
        sx={{ width: 560, maxWidth: "calc(100vw - 32px)" }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {editError ? <Alert severity="error">{editError}</Alert> : null}

          <TextField
            label="ID аккаунта"
            value={editingSeller?.userId ?? ""}
            fullWidth
            disabled
            size="small"
          />
          <TextField
            label="Наименование"
            value={editingSeller?.displayName ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      displayName: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Тип аккаунта"
            value={editingSeller?.accountType ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      accountType: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
            select
          >
            <MenuItem value="">Не выбрано</MenuItem>
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Регион"
            value={editingSeller?.accountRegionId ?? ""}
            onChange={(event) => {
              const selectedId = Number(event.target.value);
              const selectedRegion = sellerRegions.find(
                (region) => region.id === selectedId,
              );

              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      accountRegionId: selectedRegion?.id,
                      accountRegionName: selectedRegion?.name,
                    }
                  : prev,
              );
            }}
            fullWidth
            size="small"
            select
          >
            <MenuItem value="">Не выбрано</MenuItem>
            {sellerRegions.map((region) => (
              <MenuItem key={region.id} value={region.id}>
                {region.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Телефон 1"
            value={editingSeller?.phone1 ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      phone1: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Телефон 2"
            value={editingSeller?.phone2 ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      phone2: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Телефон 3"
            value={editingSeller?.phone3 ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      phone3: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
          />
          <TextField
            label="Заметки"
            value={editingSeller?.notes ?? ""}
            onChange={(event) =>
              setEditingSeller((prev) =>
                prev
                  ? {
                      ...prev,
                      notes: event.target.value,
                    }
                  : prev,
              )
            }
            fullWidth
            size="small"
            multiline
            minRows={4}
          />
        </Box>
      </Modal>
    </>
  );
};

export default TableRows;
