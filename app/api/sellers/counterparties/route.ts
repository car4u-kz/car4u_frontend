import { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.toString();

  return proxyToBackend(
    request,
    `/api/sellers/counterparties${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );
}
