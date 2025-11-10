"use client";

import { useState } from "react";
import { Box, Stack, Alert, Button as MuiButton } from "@mui/material";
import { Select, TextInput } from "@/components/form";
import { Button, Typography } from "@/components";
import {
  cancelAccountReservation,
  reserveAccountWithCredentials,
  reserveExistingAccount,
} from "@/services/account-reservation-services";
import type { AdFormData } from "../types";
import {
  deleteSession,
  getSessionState,
  type SessionStateDto,
} from "@/services/our-ads-sessions-services";

type AccountOption = { value: string; label: string };

type Props = {
  fetchWithAuth: typeof fetch;
  sessionId: string;
  accounts: AccountOption[];
  formData: AdFormData;
  setFormData: React.Dispatch<React.SetStateAction<AdFormData>>;
  parsingTemplateDataOptions: { value: number | string; label: string }[];
  onFinished?: () => void;
  onSubmitAd: (
    data: AdFormData
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onClose: () => void;
};

const AdWizard = ({
  fetchWithAuth,
  sessionId,
  accounts,
  formData,
  setFormData,
  parsingTemplateDataOptions,
  onSubmitAd,
  onClose,
}: Props) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);

  const [isNewAccount, setIsNewAccount] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [reservationInProgress, setReservationInProgress] = useState(false);
  const [reservationSucceeded, setReservationSucceeded] = useState(false);
  const [sessionState, setSessionState] = useState<SessionStateDto | null>(
    null
  );

  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleClose = async () => {
    try {
      await deleteSession(fetchWithAuth, sessionId);
    } catch {
    } finally {
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof AdFormData
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSelect = (
    e: React.ChangeEvent<{ value: unknown }> | any,
    key: keyof AdFormData
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value as string }));
  };

  const goToStep2 = () => setStep(2);
  const goToStep3 = () => setStep(3);

  const waitForReservation = async () => {
    const maxAttempts = 350;
    for (let i = 0; i < maxAttempts; i++) {
      const state = await getSessionState(fetchWithAuth, sessionId);
      setSessionState(state);

      const info = state.reservedAccountInfo;
      if (info && info.ready) {
        return state;
      }

      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error("Резервация не завершилась вовремя");
  };

  const handleConfirmExistingAccount = async () => {
    setError(null);

    if (!formData.accountId) {
      setError("Выберите аккаунт");
      return;
    }

    setLoading(true);
    setReservationInProgress(true);
    setReservationSucceeded(false);

    try {
      await reserveExistingAccount(
        fetchWithAuth,
        sessionId,
        Number(formData.accountId)
      );

      const state = await waitForReservation();
      const info = state.reservedAccountInfo;

      if (!info || !info.accountId) {
        setError("Аккаунт не был зарезервирован");
        setReservationSucceeded(false);
        return;
      }

      const validation = info.validation;
      if (validation && validation.status === 2) {
        setError(validation.message || "Аккаунт не прошёл проверку");
        setReservationSucceeded(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        accountId: String(info.accountId),
      }));

      setReservationSucceeded(true);
    } catch (e: any) {
      setError(e.message ?? "Ошибка при резервировании аккаунта");
      setReservationSucceeded(false);
    } finally {
      setLoading(false);
      setReservationInProgress(false);
    }
  };

  const handleCreateNewAccount = async () => {
    setError(null);

    if (!newLogin || !newPassword) {
      setError("Укажите логин и пароль");
      return;
    }

    setLoading(true);
    setReservationInProgress(true);
    setReservationSucceeded(false);

    try {
      await reserveAccountWithCredentials(fetchWithAuth, sessionId, {
        login: newLogin,
        password: newPassword,
      });

      const state = await waitForReservation();
      const info = state.reservedAccountInfo;

      if (!info || !info.accountId) {
        setError("Аккаунт не был зарезервирован");
        setReservationSucceeded(false);
        return;
      }

      const validation = info.validation;
      if (validation && validation.status === 2) {
        setError(validation.message || "Аккаунт не прошёл проверку");
        setReservationSucceeded(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        accountId: String(info.accountId),
      }));

      setReservationSucceeded(true);
    } catch (e: any) {
      setError(e.message ?? "Ошибка при создании аккаунта");
      setReservationSucceeded(false);
    } finally {
      setLoading(false);
      setReservationInProgress(false);
    }
  };

  const handleCancelReservation = async () => {
    setError(null);
    setLoading(true);
    try {
      await cancelAccountReservation(fetchWithAuth, sessionId);

      setReservationSucceeded(false);
      setSessionState(null);
      setFormData((prev) => ({
        ...prev,
        accountId: "",
      }));
      setIsNewAccount(false);
    } catch (e: any) {
      setError(e.message ?? "Не удалось отменить резервирование");
    } finally {
      setLoading(false);
    }
  };

  const renderStep2 = () => (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextInput
        label="Наименование Объявления"
        value={formData.name}
        onChange={(e) => handleChange(e, "name")}
      />

      <Select
        value={formData.parsingTemplateId}
        placeholder="Parsing Template ID"
        handleChange={(e) => handleSelect(e, "parsingTemplateId")}
        menuItems={parsingTemplateDataOptions}
      />

      <TextInput
        label="URL"
        value={formData.url}
        onChange={(e) => handleChange(e, "url")}
      />

      <TextInput
        label="Локальний путь к фотографии на сервере"
        value={formData.mainImagePath}
        onChange={(e) => handleChange(e, "mainImagePath")}
      />

      <Typography>Параметры мониторинга Объявления</Typography>

      <TextInput
        type="number"
        label="Количество проходов необнаружения Объявления"
        value={formData.notDetectedCount}
        onChange={(e) => handleChange(e, "notDetectedCount")}
      />

      <Select
        value={formData.depthOfMonitoring}
        placeholder="Глубина мониторинга Объявления (стр.)"
        handleChange={(e) => handleSelect(e, "depthOfMonitoring")}
        menuItems={[
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "ВСЕ", label: "ALL" },
        ]}
      />

      <TextInput
        type="number"
        max={60 * 99}
        label="Интервал между проходами (сек.)"
        value={formData.intervalSeconds}
        onChange={(e) => handleChange(e, "intervalSeconds")}
      />

      <TextInput
        max={99}
        type="number"
        label="Длительность мониторинга (дней)"
        value={formData.monitoringDurationDays}
        onChange={(e) => handleChange(e, "monitoringDurationDays")}
      />

      <input type="hidden" value={formData.sessionId} name="sessionId" />

      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button
          variant="contained"
          onClick={async () => {
            setSubmitInProgress(true);
            setSubmitError(null);
            setSubmitSuccess(false);

            const result = await onSubmitAd(formData);
            if (result.ok) {
              setSubmitSuccess(true);
            } else {
              setSubmitError(result.error);
            }
            setSubmitInProgress(false);
            goToStep3();
          }}
          disabled={submitInProgress}
        >
          {submitInProgress ? "Сохраняю..." : "Далее"}
        </Button>
      </Box>
    </Stack>
  );

  const renderStep3 = () => (
    <Stack gap={2}>
      {submitSuccess ? (
        <Alert severity="success">Объявление размещено успешно.</Alert>
      ) : submitError ? (
        <Alert severity="error">{submitError}</Alert>
      ) : (
        <Alert severity="info">Статус неизвестен.</Alert>
      )}

      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button
          onClick={async () => {
            try {
              await deleteSession(fetchWithAuth, sessionId);
            } catch {}
            onClose();
          }}
        >
          Закрыть
        </Button>
      </Box>
    </Stack>
  );

  const renderStep1 = () => {
    const validation = sessionState?.reservedAccountInfo?.validation;
    const requiresConfirmation = validation?.status === 1;
    const failed = validation?.status === 2;

    const showLogin =
      validation?.account?.login || (isNewAccount && newLogin ? newLogin : "");
    const showPassword =
      validation?.account?.password ||
      (isNewAccount && newPassword ? newPassword : "");

    const canProceed =
      reservationSucceeded &&
      !!sessionState?.reservedAccountInfo?.accountId &&
      !failed;

    return (
      <Stack direction="column" gap={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Выбор аккаунта</Typography>
          <MuiButton
            size="small"
            onClick={() => !reservationInProgress && setIsNewAccount((p) => !p)}
            disabled={reservationInProgress || reservationSucceeded} // если уже зарезервировано – не даём переключать тип
          >
            {isNewAccount ? "Выбрать из списка" : "Добавить новый"}
          </MuiButton>
        </Box>

        {}
        {!isNewAccount ? (
          <>
            <Select
              value={formData.accountId}
              placeholder="Аккаунт"
              handleChange={(e) => handleSelect(e, "accountId")}
              menuItems={accounts}
            />
            <Box display="flex" justifyContent="flex-end" gap={1}>
              {reservationSucceeded ? (
                <Button
                  color="secondary"
                  onClick={handleCancelReservation}
                  disabled={loading || reservationInProgress}
                >
                  Сменить аккаунт
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmExistingAccount}
                  disabled={loading || reservationInProgress}
                >
                  Зарезервировать
                </Button>
              )}
            </Box>
          </>
        ) : (
          <>
            <TextInput
              label="Логин"
              value={newLogin}
              onChange={(e) => setNewLogin(e.target.value)}
              disabled={reservationInProgress || reservationSucceeded}
            />
            <TextInput
              label="Пароль"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={reservationInProgress || reservationSucceeded}
            />
            <Box display="flex" justifyContent="flex-end" gap={1}>
              {reservationSucceeded ? (
                <Button
                  color="secondary"
                  onClick={handleCancelReservation}
                  disabled={loading || reservationInProgress}
                >
                  Сменить аккаунт
                </Button>
              ) : (
                <Button
                  onClick={handleCreateNewAccount}
                  disabled={loading || reservationInProgress}
                >
                  Создать и зарезервировать
                </Button>
              )}
            </Box>
          </>
        )}

        {reservationInProgress && (
          <Alert severity="info">
            Идёт резервирование аккаунта… пожалуйста, подождите.
          </Alert>
        )}

        {reservationSucceeded && (showLogin || showPassword) && (
          <Alert severity="success">
            Аккаунт зарезервирован.
            <div style={{ marginTop: 6 }}>
              {showLogin && (
                <div>
                  Логин: <strong>{showLogin}</strong>
                </div>
              )}
              {showPassword && (
                <div>
                  Пароль: <strong>{showPassword}</strong>
                </div>
              )}
            </div>
          </Alert>
        )}

        {requiresConfirmation && (
          <Alert severity="info">
            Для аккаунта требуется подтверждение.
            {validation?.confirmationInfo?.adInfo && (
              <div style={{ marginTop: 8 }}>
                <div>
                  Объявление: {validation.confirmationInfo.adInfo.title}
                </div>
                <div>URL: {validation.confirmationInfo.adInfo.url}</div>
                <div>Цена: {validation.confirmationInfo.adInfo.price}</div>
              </div>
            )}
          </Alert>
        )}

        {failed && (
          <Alert severity="error">
            {validation?.message || "Аккаунт нельзя выбрать"}
          </Alert>
        )}

        <Box display="flex" justifyContent="flex-end">
          <Button onClick={goToStep2} disabled={!canProceed}>
            Далее
          </Button>
        </Box>
      </Stack>
    );
  };

  return (
    <Box position="relative">
      <Box
        sx={{
          position: "absolute",
          top: -44,
          right: -8,
        }}
      >
        <Button size="small" onClick={handleClose}>
          Закрыть
        </Button>
      </Box>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Box>
  );
};

export default AdWizard;
