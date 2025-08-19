import { proxyToBackend } from "@/lib/auth/proxy-to-backend";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/organization/my", {
    method: "GET",
  });
}
