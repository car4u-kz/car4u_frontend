export const reserveAccountWithCredentials = async (
  fetchWithAuth: typeof fetch,
  sessionId: string,
  payload: { login: string; password: string }
) => {
  const res = await fetchWithAuth(
    `/api/our-ads/sessions/${sessionId}/account-reservation`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Не удалось зарезервировать аккаунт по логину/паролю");
  }
};

export const reserveExistingAccount = async (
  fetchWithAuth: typeof fetch,
  sessionId: string,
  accountId: number
) => {
  const res = await fetchWithAuth(
    `/api/our-ads/sessions/${sessionId}/account-reservation`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    }
  );

  if (!res.ok) {
    throw new Error("Не удалось зарезервировать существующий аккаунт");
  }
};

export const cancelAccountReservation = async (
  fetchWithAuth: typeof fetch,
  sessionId: string
) => {
  const res = await fetchWithAuth(
    `/api/our-ads/sessions/${sessionId}/account-reservation/cancel`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    throw new Error("Не удалось отменить резервирование аккаунта");
  }
};
