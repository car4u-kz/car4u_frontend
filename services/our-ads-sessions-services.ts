export type SessionStateDto = {
  expiresAt: string | null;
  reservedAccountInfo: {
    accountId: number | null;
    ready: boolean;
    reservationStatus: number;
    validation?: {
      status: number;
      message: string;
      confirmationInfo?: {
        adInfo?: {
          id: string;
          url: string;
          title: string;
          price: string;
        };
      };
      account: {
        login: string;
        password: string;
      };
    };
  } | null;
};

export const getSessionState = async (
  fetchWithAuth: typeof fetch,
  sessionId: string
) => {
  const res = await fetchWithAuth(`/api/our-ads/sessions/${sessionId}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Не удалось получить состояние сессии");
  }

  return res.json() as Promise<SessionStateDto>;
};

export const getOurAdsSession = async (fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/our-ads/sessions`;

  const response = await fetchWithAuth(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  return response.json() as Promise<{ sessionId: string }>;
};



export const deleteSession = async (
  fetchWithAuth: typeof fetch,
  sessionId: string
) => {
  const res = await fetchWithAuth(`/api/our-ads/sessions/${sessionId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Не удалось удалить сессию");
  }
};
