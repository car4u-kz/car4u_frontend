export type AccountDto = {
  id: number;
  login: string;
};

export type AccountManagementItem = {
  id: number;
  login: string;
  hasActiveOurAd: boolean;
  activeOurAdsCount: number;
  activeOurAdExternalId?: string | null;
  activeOurAdName?: string | null;
};

export const getAccounts = async (fetchWithAuth: typeof fetch) => {
  const res = await fetchWithAuth("/api/account", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Не удалось получить список аккаунтов");
  }

  return res.json() as Promise<AccountDto[]>;
};

export const getManagedAccounts = async (fetchWithAuth: typeof fetch) => {
  const res = await fetchWithAuth("/api/account/management", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Не удалось получить список аккаунтов");
  }

  return res.json() as Promise<AccountManagementItem[]>;
};

export const deleteAccount = async (
  accountId: number,
  fetchWithAuth: typeof fetch,
) => {
  const res = await fetchWithAuth("/api/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Не удалось удалить аккаунт");
  }
};
