import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export const POST = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams.toString();
  const backendPath = `/api/AdView/export-zip/jobs${query ? `?${query}` : ""}`;

  return proxyToBackend(req, backendPath, { method: "POST" });
};
