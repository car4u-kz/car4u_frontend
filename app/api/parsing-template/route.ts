import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/parsing-template", {
    method: "GET",
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/parsing-template", {
    method: "POST",
    body: await request.text(),
    headers: { "Content-Type": "application/json" },
  });
}