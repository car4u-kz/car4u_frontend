import { proxyToBackend } from "@/lib/auth/proxy-to-backend";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/our-ads/sessions", {
    method: "POST",
  });
}
