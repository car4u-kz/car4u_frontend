import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/adview/filters", { method: "GET" });
}