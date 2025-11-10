export type AccountDto = {
  id: number;
  login: string;
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
