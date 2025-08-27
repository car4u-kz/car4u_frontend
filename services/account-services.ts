export const getAccounts = async (fetchWithAuth: typeof fetch) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/account`;
  try {
    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch ads");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
};

export const addAccount = async (
  formData: { login: string; password: string },
  fetchWithAuth: typeof fetch
) => {
  const isServer = typeof window === "undefined";
  const basePath = isServer ? `${process.env.NEXT_PUBLIC_SITE_URL}` : "";
  const url = `${basePath}/api/account`;
  try {
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to fetch ads");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
};
