import { NextRequest, NextResponse } from "next/server";
import { proxyFileToBackend } from "@/lib/auth/proxy-to-backend";

export const GET = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams.toString();
  const backendPath = `/api/AdView/export-zip${query ? `?${query}` : ""}`;

  return proxyFileToBackend(req, backendPath, { method: "GET" });
};
