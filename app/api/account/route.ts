import { proxyToBackend } from "@/lib/auth/proxy-to-backend";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/account", {
    method: "GET",
  });
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, "/api/account", {
    method: "DELETE",
    body: await request.text(),
    headers: { "Content-Type": "application/json" },
  });
}
