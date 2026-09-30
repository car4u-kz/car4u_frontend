"use client";

import { useState } from "react";
import {
  Box,
  Stack,
  Alert,
  Button as MuiButton,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Select, TextInput } from "@/components/form";
import { Button, Typography } from "@/components";
import {
  AccountReservationError,
  cancelAccountReservation,
  clearPendingAccountReservation,
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
type FormErrors = Partial<Record<keyof AdFormData, string>>;

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
  const [pendingAccountConflict, setPendingAccountConflict] = useState<{
    login: string;
    expiresAt?: string;
  } | null>(null);

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
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const cleanupReservationAndSession = async () => {
    if (sessionState?.reservedAccountInfo || reservationSucceeded) {
      try {
        await cancelAccountReservation(fetchWithAuth, sessionId);
      } catch {}
    }

    try {
      await deleteSession(fetchWithAuth, sessionId);
    } catch {}
  };

  const handleClose = async () => {
    try {
      await cleanupReservationAndSession();
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
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  };

  const handleSelect = (
    e: React.ChangeEvent<{ value: unknown }> | any,
    key: keyof AdFormData
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value as string }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  };

  const handleBooleanChange = (value: boolean, key: keyof AdFormData) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  };

  const handleBoundaryTypeChange = (
    value: AdFormData["monitoringBoundaryType"]
  ) => {
    setFormData((prev) => ({
      ...prev,
      monitoringBoundaryType: value,
      depthOfMonitoring: value === "page" ? "1" : "",
    }));
    setFormErrors((prev) => ({
      ...prev,
      monitoringBoundaryType: undefined,
      depthOfMonitoring: undefined,
    }));
    setSubmitError(null);
  };

  const goToStep2 = () => setStep(2);
  const goToStep3 = () => setStep(3);

  const isPositiveInteger = (value: string, max?: number) => {
    const normalized = value.trim();
    if (!/^\d+$/.test(normalized)) return false;

    const parsed = Number(normalized);
    return parsed >= 1 && (max == null || parsed <= max);
  };

  const validateStep2 = () => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Укажите название объявления";
    } else if (formData.name.trim().length > 255) {
      nextErrors.name = "Название должно быть не длиннее 255 символов";
    }

    if (!formData.parsingTemplateId) {
      nextErrors.parsingTemplateId = "Выберите поиск";
    }

    if (!formData.url.trim()) {
      nextErrors.url = "Укажите ссылку на объявление Kolesa";
    } else if (
      !/^https?:\/\/(?:www\.)?kolesa\.kz\/a\/show\/\d+/i.test(
        formData.url.trim()
      )
    ) {
      nextErrors.url =
        "Ссылка должна быть вида https://kolesa.kz/a/show/123456789";
    }

    if (!formData.mainImagePath.trim()) {
      nextErrors.mainImagePath = "Укажите путь к основной фотографии";
    }

    if (!isPositiveInteger(formData.notDetectedCount, 99)) {
      nextErrors.notDetectedCount =
        "Укажите количество проходов от 1 до 99";
    }

    if (!formData.monitoringBoundaryType) {
      nextErrors.monitoringBoundaryType = "Выберите режим мониторинга";
    }

    if (!isPositiveInteger(formData.depthOfMonitoring)) {
      nextErrors.depthOfMonitoring =
        formData.monitoringBoundaryType === "position"
          ? "Укажите граничную позицию"
          : "Выберите граничную страницу";
    }

    if (!isPositiveInteger(formData.intervalSeconds, 60 * 99)) {
      nextErrors.intervalSeconds =
        "Укажите интервал между проходами от 1 до 5940 секунд";
    }

    if (
      formData.timingRepublishingEnabled &&
      !isPositiveInteger(formData.timingRepublishingIntervalHours, 99)
    ) {
      nextErrors.timingRepublishingIntervalHours =
        "Укажите интервал автоперепубликации в часах";
    }

    if (!isPositiveInteger(formData.monitoringDurationDays, 99)) {
      nextErrors.monitoringDurationDays =
        "Укажите длительность мониторинга от 1 до 99 дней";
    }

    if (!formData.accountId) {
      nextErrors.accountId = "Сначала зарезервируйте кабинет";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

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
    throw new Error("Резервирование не завершилось вовремя");
  };

  const handleConfirmExistingAccount = async () => {
    setError(null);

    if (!formData.accountId) {
      setError("Выберите кабинет");
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
      const validation = info?.validation;

      if (validation && validation.status === 2) {
        setError(validation.message || "Кабинет не прошел проверку");
        setReservationSucceeded(false);
        return;
      }

      if (!info || !info.accountId) {
        setError("Кабинет не был зарезервирован");
        setReservationSucceeded(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        accountId: String(info.accountId),
      }));

      setReservationSucceeded(true);
    } catch (e: any) {
      setError(e.message ?? "Ошибка при резервировании кабинета");
      setReservationSucceeded(false);
    } finally {
      setLoading(false);
      setReservationInProgress(false);
    }
  };

  const handleCreateNewAccount = async () => {
    setError(null);
    setPendingAccountConflict(null);

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
      const validation = info?.validation;

      if (validation && validation.status === 2) {
        setError(validation.message || "Кабинет не прошел проверку");
        setReservationSucceeded(false);
        return;
      }

      if (!info || !info.accountId) {
        setError("Кабинет не был зарезервирован");
        setReservationSucceeded(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        accountId: String(info.accountId),
      }));

      setReservationSucceeded(true);
    } catch (e: any) {
      const metadata = e instanceof AccountReservationError ? e.metadata : null;
      if (metadata?.code === "pending_account_exists" && metadata?.login) {
        setPendingAccountConflict({
          login: metadata.login,
          expiresAt: metadata.expiresAt,
        });
        setError(
          "Для этого кабинета осталась незавершенная временная резервация."
        );
      } else {
        setError(e.message ?? "Ошибка при создании кабинета");
      }
      setReservationSucceeded(false);
    } finally {
      setLoading(false);
      setReservationInProgress(false);
    }
  };

  const handleClearPendingReservation = async () => {
    if (!pendingAccountConflict?.login) return;

    setError(null);
    setLoading(true);

    try {
      await clearPendingAccountReservation(
        fetchWithAuth,
        sessionId,
        pendingAccountConflict.login
      );
      setPendingAccountConflict(null);
    } catch (e: any) {
      setError(e.message ?? "Не удалось удалить старую резервацию");
      return;
    } finally {
      setLoading(false);
    }

    await handleCreateNewAccount();
  };

  const handleStartOverWithAnotherAccount = () => {
    setError(null);
    setPendingAccountConflict(null);
    setReservationSucceeded(false);
    setReservationInProgress(false);
    setSessionState(null);
    setNewLogin("");
    setNewPassword("");
    setFormData((prev) => ({
      ...prev,
      accountId: accounts[0]?.value ?? "",
    }));
    setIsNewAccount(false);
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
      {submitError && (
        <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
          {submitError}
        </Alert>
      )}

      <TextInput
        label="Название объявления"
        value={formData.name}
        onChange={(e) => handleChange(e, "name")}
        error={!!formErrors.name}
        helperText={formErrors.name}
      />

      <Select
        value={formData.parsingTemplateId}
        placeholder="Parsing Template ID"
        handleChange={(e) => handleSelect(e, "parsingTemplateId")}
        menuItems={parsingTemplateDataOptions}
        error={!!formErrors.parsingTemplateId}
        helperText={formErrors.parsingTemplateId}
      />

      <TextInput
        label="URL"
        value={formData.url}
        onChange={(e) => handleChange(e, "url")}
        error={!!formErrors.url}
        helperText={formErrors.url}
      />

      <TextInput
        label="Локальный путь к фотографии на сервере"
        value={formData.mainImagePath}
        onChange={(e) => handleChange(e, "mainImagePath")}
        error={!!formErrors.mainImagePath}
        helperText={formErrors.mainImagePath}
      />

      <Typography>Параметры мониторинга объявления</Typography>

      <TextInput
        type="number"
        label="Количество проходов необнаружения объявления"
        value={formData.notDetectedCount}
        onChange={(e) => handleChange(e, "notDetectedCount")}
        error={!!formErrors.notDetectedCount}
        helperText={formErrors.notDetectedCount}
      />

      <RadioGroup
        row
        value={formData.monitoringBoundaryType}
        onChange={(e) =>
          handleBoundaryTypeChange(
            e.target.value as AdFormData["monitoringBoundaryType"],
          )
        }
      >
        <FormControlLabel value="page" control={<Radio />} label="Страница" />
        <FormControlLabel value="position" control={<Radio />} label="Позиция" />
      </RadioGroup>

      {formData.monitoringBoundaryType === "page" ? (
        <Select
          value={formData.depthOfMonitoring}
          placeholder="Граничная страница"
          handleChange={(e) => handleSelect(e, "depthOfMonitoring")}
          error={!!formErrors.depthOfMonitoring}
          helperText={formErrors.depthOfMonitoring}
          menuItems={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
          ]}
        />
      ) : (
        <TextInput
          type="number"
          min={1}
          label="Граничная позиция"
          value={formData.depthOfMonitoring}
          onChange={(e) => handleChange(e, "depthOfMonitoring")}
          error={!!formErrors.depthOfMonitoring}
          helperText={formErrors.depthOfMonitoring}
        />
      )}

      <TextInput
        type="number"
        max={60 * 99}
        label="Интервал между проходами (сек.)"
        value={formData.intervalSeconds}
        onChange={(e) => handleChange(e, "intervalSeconds")}
        error={!!formErrors.intervalSeconds}
        helperText={formErrors.intervalSeconds}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.timingRepublishingEnabled}
            onChange={(e) =>
              handleBooleanChange(e.target.checked, "timingRepublishingEnabled")
            }
          />
        }
        label="Перепубликация по таймингу"
      />

      {formData.timingRepublishingEnabled && (
        <TextInput
          type="number"
          min={1}
          label="Перепубликовывать через (час.)"
          value={formData.timingRepublishingIntervalHours}
          onChange={(e) => handleChange(e, "timingRepublishingIntervalHours")}
          error={!!formErrors.timingRepublishingIntervalHours}
          helperText={formErrors.timingRepublishingIntervalHours}
        />
      )}

      <TextInput
        max={99}
        type="number"
        label="Длительность мониторинга (дней)"
        value={formData.monitoringDurationDays}
        onChange={(e) => handleChange(e, "monitoringDurationDays")}
        error={!!formErrors.monitoringDurationDays}
        helperText={formErrors.monitoringDurationDays}
      />

      <input type="hidden" value={formData.sessionId} name="sessionId" />

      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button
          variant="contained"
          onClick={async () => {
            setSubmitError(null);
            setSubmitSuccess(false);

            if (!validateStep2()) {
              setSubmitError("Заполните обязательные поля формы");
              return;
            }

            setSubmitInProgress(true);

            const result = await onSubmitAd(formData);
            if (result.ok) {
              setSubmitSuccess(true);
              goToStep3();
            } else {
              setSubmitError(result.error);
            }
            setSubmitInProgress(false);
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
          color="secondary"
          onClick={() => setStep(2)}
          disabled={!submitError}
        >
          Вернуться к форме
        </Button>
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

        {pendingAccountConflict && (
          <Alert severity="warning">
            Кабинет {pendingAccountConflict.login} уже находится во временной
            резервации. Можно удалить старую резервацию и начать заново.
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Выбор кабинета</Typography>
          <MuiButton
            size="small"
            onClick={() => !reservationInProgress && setIsNewAccount((p) => !p)}
            disabled={reservationInProgress || reservationSucceeded}
          >
            {isNewAccount ? "Выбрать из списка" : "Добавить новый"}
          </MuiButton>
        </Box>

        {}
        {!isNewAccount ? (
          <>
            <Select
              value={formData.accountId}
              placeholder="Кабинет"
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
                  Сменить кабинет
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
                  Сменить кабинет
                </Button>
              ) : pendingAccountConflict ? (
                <>
                  <Button
                    color="secondary"
                    onClick={handleStartOverWithAnotherAccount}
                    disabled={loading || reservationInProgress}
                  >
                    Другой кабинет
                  </Button>
                  <Button
                    onClick={handleClearPendingReservation}
                    disabled={loading || reservationInProgress}
                  >
                    Удалить и повторить
                  </Button>
                </>
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
            {sessionState?.activeOperation?.statusMessage ||
              "Идет резервирование кабинета... пожалуйста, подождите."}
          </Alert>
        )}

        {reservationSucceeded && (showLogin || showPassword) && (
          <Alert severity="success">
            Кабинет зарезервирован.
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
            Для кабинета требуется подтверждение.
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
            {validation?.message || "Кабинет нельзя выбрать"}
          </Alert>
        )}

        {canProceed && (
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={goToStep2}>Далее</Button>
          </Box>
        )}
      </Stack>
    );
  };

  const busy = loading || submitInProgress;

  return (
    <Box
      position="relative"
      sx={{
        mx: -0.5,
        px: 0.5,
        "& .MuiAlert-root": {
          borderRadius: 1,
        },
      }}
    >
      {busy && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(1px)",
            borderRadius: 1,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Box>
  );
};

export default AdWizard;
