"use client";

import { useState } from "react";
import {
  Box,
  Stack,
  Alert,
  Button as MuiButton,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
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

  const handleBoundaryTypeChange = (
    value: AdFormData["monitoringBoundaryType"]
  ) => {
    setFormData((prev) => ({
      ...prev,
      monitoringBoundaryType: value,
      depthOfMonitoring: value === "page" ? "1" : "",
    }));
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
    throw new Error("Р РµР·РµСЂРІР°С†РёСЏ РЅРµ Р·Р°РІРµСЂС€РёР»Р°СЃСЊ РІРѕРІСЂРµРјСЏ");
  };

  const handleConfirmExistingAccount = async () => {
    setError(null);

    if (!formData.accountId) {
      setError("Р’С‹Р±РµСЂРёС‚Рµ Р°РєРєР°СѓРЅС‚");
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
        setError("РђРєРєР°СѓРЅС‚ РЅРµ Р±С‹Р» Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅ");
        setReservationSucceeded(false);
        return;
      }

      const validation = info.validation;
      if (validation && validation.status === 2) {
        setError(validation.message || "РђРєРєР°СѓРЅС‚ РЅРµ РїСЂРѕС€С‘Р» РїСЂРѕРІРµСЂРєСѓ");
        setReservationSucceeded(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        accountId: String(info.accountId),
      }));

      setReservationSucceeded(true);
    } catch (e: any) {
      setError(e.message ?? "РћС€РёР±РєР° РїСЂРё СЂРµР·РµСЂРІРёСЂРѕРІР°РЅРёРё Р°РєРєР°СѓРЅС‚Р°");
      setReservationSucceeded(false);
    } finally {
      setLoading(false);
      setReservationInProgress(false);
    }
  };

  const handleCreateNewAccount = async () => {
    setError(null);

    if (!newLogin || !newPassword) {
      setError("РЈРєР°Р¶РёС‚Рµ Р»РѕРіРёРЅ Рё РїР°СЂРѕР»СЊ");
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
        setError("РђРєРєР°СѓРЅС‚ РЅРµ Р±С‹Р» Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅ");
        setReservationSucceeded(false);
        return;
      }

      const validation = info.validation;
      if (validation && validation.status === 2) {
        setError(validation.message || "РђРєРєР°СѓРЅС‚ РЅРµ РїСЂРѕС€С‘Р» РїСЂРѕРІРµСЂРєСѓ");
        setReservationSucceeded(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        accountId: String(info.accountId),
      }));

      setReservationSucceeded(true);
    } catch (e: any) {
      setError(e.message ?? "РћС€РёР±РєР° РїСЂРё СЃРѕР·РґР°РЅРёРё Р°РєРєР°СѓРЅС‚Р°");
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
      setError(e.message ?? "РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РјРµРЅРёС‚СЊ СЂРµР·РµСЂРІРёСЂРѕРІР°РЅРёРµ");
    } finally {
      setLoading(false);
    }
  };

  const renderStep2 = () => (
    <Stack direction="column" gap={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextInput
        label="РќР°РёРјРµРЅРѕРІР°РЅРёРµ РћР±СЉСЏРІР»РµРЅРёСЏ"
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
        label="Р›РѕРєР°Р»СЊРЅРёР№ РїСѓС‚СЊ Рє С„РѕС‚РѕРіСЂР°С„РёРё РЅР° СЃРµСЂРІРµСЂРµ"
        value={formData.mainImagePath}
        onChange={(e) => handleChange(e, "mainImagePath")}
      />

      <Typography>РџР°СЂР°РјРµС‚СЂС‹ РјРѕРЅРёС‚РѕСЂРёРЅРіР° РћР±СЉСЏРІР»РµРЅРёСЏ</Typography>

      <TextInput
        type="number"
        label="РљРѕР»РёС‡РµСЃС‚РІРѕ РїСЂРѕС…РѕРґРѕРІ РЅРµРѕР±РЅР°СЂСѓР¶РµРЅРёСЏ РћР±СЉСЏРІР»РµРЅРёСЏ"
        value={formData.notDetectedCount}
        onChange={(e) => handleChange(e, "notDetectedCount")}
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
        />
      )}

      <TextInput
        type="number"
        max={60 * 99}
        label="РРЅС‚РµСЂРІР°Р» РјРµР¶РґСѓ РїСЂРѕС…РѕРґР°РјРё (СЃРµРє.)"
        value={formData.intervalSeconds}
        onChange={(e) => handleChange(e, "intervalSeconds")}
      />

      <TextInput
        max={99}
        type="number"
        label="Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ РјРѕРЅРёС‚РѕСЂРёРЅРіР° (РґРЅРµР№)"
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
          {submitInProgress ? "РЎРѕС…СЂР°РЅСЏСЋ..." : "Р”Р°Р»РµРµ"}
        </Button>
      </Box>
    </Stack>
  );

  const renderStep3 = () => (
    <Stack gap={2}>
      {submitSuccess ? (
        <Alert severity="success">РћР±СЉСЏРІР»РµРЅРёРµ СЂР°Р·РјРµС‰РµРЅРѕ СѓСЃРїРµС€РЅРѕ.</Alert>
      ) : submitError ? (
        <Alert severity="error">{submitError}</Alert>
      ) : (
        <Alert severity="info">РЎС‚Р°С‚СѓСЃ РЅРµРёР·РІРµСЃС‚РµРЅ.</Alert>
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
          Р—Р°РєСЂС‹С‚СЊ
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
          <Typography variant="h6">Р’С‹Р±РѕСЂ Р°РєРєР°СѓРЅС‚Р°</Typography>
          <MuiButton
            size="small"
            onClick={() => !reservationInProgress && setIsNewAccount((p) => !p)}
            disabled={reservationInProgress || reservationSucceeded} // РµСЃР»Рё СѓР¶Рµ Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅРѕ вЂ“ РЅРµ РґР°С‘Рј РїРµСЂРµРєР»СЋС‡Р°С‚СЊ С‚РёРї
          >
            {isNewAccount ? "Р’С‹Р±СЂР°С‚СЊ РёР· СЃРїРёСЃРєР°" : "Р”РѕР±Р°РІРёС‚СЊ РЅРѕРІС‹Р№"}
          </MuiButton>
        </Box>

        {}
        {!isNewAccount ? (
          <>
            <Select
              value={formData.accountId}
              placeholder="РђРєРєР°СѓРЅС‚"
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
                  РЎРјРµРЅРёС‚СЊ Р°РєРєР°СѓРЅС‚
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmExistingAccount}
                  disabled={loading || reservationInProgress}
                >
                  Р—Р°СЂРµР·РµСЂРІРёСЂРѕРІР°С‚СЊ
                </Button>
              )}
            </Box>
          </>
        ) : (
          <>
            <TextInput
              label="Р›РѕРіРёРЅ"
              value={newLogin}
              onChange={(e) => setNewLogin(e.target.value)}
              disabled={reservationInProgress || reservationSucceeded}
            />
            <TextInput
              label="РџР°СЂРѕР»СЊ"
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
                  РЎРјРµРЅРёС‚СЊ Р°РєРєР°СѓРЅС‚
                </Button>
              ) : (
                <Button
                  onClick={handleCreateNewAccount}
                  disabled={loading || reservationInProgress}
                >
                  РЎРѕР·РґР°С‚СЊ Рё Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°С‚СЊ
                </Button>
              )}
            </Box>
          </>
        )}

        {reservationInProgress && (
          <Alert severity="info">
            РРґС‘С‚ СЂРµР·РµСЂРІРёСЂРѕРІР°РЅРёРµ Р°РєРєР°СѓРЅС‚Р°вЂ¦ РїРѕР¶Р°Р»СѓР№СЃС‚Р°, РїРѕРґРѕР¶РґРёС‚Рµ.
          </Alert>
        )}

        {reservationSucceeded && (showLogin || showPassword) && (
          <Alert severity="success">
            РђРєРєР°СѓРЅС‚ Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅ.
            <div style={{ marginTop: 6 }}>
              {showLogin && (
                <div>
                  Р›РѕРіРёРЅ: <strong>{showLogin}</strong>
                </div>
              )}
              {showPassword && (
                <div>
                  РџР°СЂРѕР»СЊ: <strong>{showPassword}</strong>
                </div>
              )}
            </div>
          </Alert>
        )}

        {requiresConfirmation && (
          <Alert severity="info">
            Р”Р»СЏ Р°РєРєР°СѓРЅС‚Р° С‚СЂРµР±СѓРµС‚СЃСЏ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ.
            {validation?.confirmationInfo?.adInfo && (
              <div style={{ marginTop: 8 }}>
                <div>
                  РћР±СЉСЏРІР»РµРЅРёРµ: {validation.confirmationInfo.adInfo.title}
                </div>
                <div>URL: {validation.confirmationInfo.adInfo.url}</div>
                <div>Р¦РµРЅР°: {validation.confirmationInfo.adInfo.price}</div>
              </div>
            )}
          </Alert>
        )}

        {failed && (
          <Alert severity="error">
            {validation?.message || "РђРєРєР°СѓРЅС‚ РЅРµР»СЊР·СЏ РІС‹Р±СЂР°С‚СЊ"}
          </Alert>
        )}

        <Box display="flex" justifyContent="flex-end">
          <Button onClick={goToStep2} disabled={!canProceed}>
            Р”Р°Р»РµРµ
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
          Р—Р°РєСЂС‹С‚СЊ
        </Button>
      </Box>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Box>
  );
};

export default AdWizard;
