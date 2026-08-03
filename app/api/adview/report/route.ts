import { NextRequest, NextResponse } from "next/server";
import { proxyFileToBackend } from "@/lib/auth/proxy-to-backend";

export const GET = async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams;
  const id = sp.get("id");
  const forParam = sp.get("for");
  const templateId = sp.get("templateId");
  const timezoneOffsetMinutes = sp.get("timezoneOffsetMinutes");

  if (!id || !forParam) {
    return NextResponse.json(
      { error: "Missing required query params: id, for" },
      { status: 400 }
    );
  }

  let backendPath = `/api/AdView/report?id=${encodeURIComponent(
    id
  )}&for=${encodeURIComponent(forParam)}`;
  if (templateId) {
    backendPath += `&templateId=${encodeURIComponent(templateId)}`;
  }
  if (timezoneOffsetMinutes) {
    backendPath += `&timezoneOffsetMinutes=${encodeURIComponent(timezoneOffsetMinutes)}`;
  }

  return proxyFileToBackend(req, backendPath, { method: "GET" });
};
