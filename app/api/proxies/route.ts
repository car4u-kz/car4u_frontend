import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/proxies", {
    method: "GET",
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/proxies", {
    method: "POST",
    body: await request.text(),
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, "/api/proxies", {
    method: "DELETE",
    body: await request.text(),
    headers: { "Content-Type": "application/json" },
  });
}
