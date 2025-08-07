import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/our-ad", { method: "GET" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return proxyToBackend(request, "/api/our-ad", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
