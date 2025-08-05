export function useFetchWithAuth() {
  const BACKEND_JWT_KEY = "backend_jwt";

  async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
    const headers = new Headers(init?.headers);

    const jwt = localStorage.getItem(BACKEND_JWT_KEY);
    if (jwt) {
      headers.set("Authorization", `Bearer ${jwt}`);
    }

    let url = input;
    if (typeof input === "string" && !input.startsWith("http")) {
      url = `${url}`;
    }

    const response = await fetch(url, { ...init, headers });

    return response;
  }

  return fetchWithAuth;
}

