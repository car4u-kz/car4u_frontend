export class AccountReservationError extends Error {
  metadata?: any;

  constructor(message: string, metadata?: any) {
    super(message);
    this.name = "AccountReservationError";
    this.metadata = metadata;
  }
}

const readReservationError = async (res: Response, fallback: string) => {
  const text = await res.text();

  if (!text) {
    return new AccountReservationError(fallback);
  }

  try {
    const body = JSON.parse(text);
    return new AccountReservationError(
      body?.errorMessage || body?.message || body?.error || fallback,
      body?.metadata
    );
  } catch {
    return new AccountReservationError(text || fallback);
  }
};

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
    throw await readReservationError(
      res,
      "Не удалось зарезервировать кабинет по логину/паролю"
    );
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
    throw await readReservationError(
      res,
      "Не удалось зарезервировать существующий кабинет"
    );
  }
};

export const clearPendingAccountReservation = async (
  fetchWithAuth: typeof fetch,
  sessionId: string,
  login: string
) => {
  const res = await fetchWithAuth(
    `/api/our-ads/sessions/${sessionId}/account-reservation/clear-pending`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
    }
  );

  if (!res.ok) {
    throw await readReservationError(
      res,
      "Не удалось удалить старую резервацию кабинета"
    );
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
    throw await readReservationError(
      res,
      "Не удалось отменить резервирование кабинета"
    );
  }
};
