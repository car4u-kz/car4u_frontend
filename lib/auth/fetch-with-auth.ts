const BACKEND_JWT_KEY = "backend_jwt";

export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  const jwt = localStorage.getItem(BACKEND_JWT_KEY);
  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }

  let url = input;
  if (typeof input === "string" && !input.startsWith("http")) {
    url = `${process.env.NEXT_PUBLIC_SITE_URL}${input}`;
  }

  return fetch(url, { ...init, headers });
}
