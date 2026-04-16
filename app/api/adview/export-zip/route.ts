import { NextRequest, NextResponse } from "next/server";
import { proxyFileToBackend } from "@/lib/auth/proxy-to-backend";

export const GET = async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams;
  const templateId = sp.get("templateId");

  if (!templateId) {
    return NextResponse.json(
      { error: "Missing required query params: templateId" },
      { status: 400 }
    );
  }

  const backendPath = `/api/AdView/export-zip?templateId=${encodeURIComponent(templateId)}`;

  return proxyFileToBackend(req, backendPath, { method: "GET" });
};