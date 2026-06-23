import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/proxies/check", {
    method: "POST",
    body: await request.text(),
    headers: { "Content-Type": "application/json" },
  });
}
