import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.toString();

  return proxyToBackend(request, `/api/sellers${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request, "/api/sellers", {
    method: "PUT",
    body: await request.text(),
    headers: { "Content-Type": "application/json" },
  });
}
