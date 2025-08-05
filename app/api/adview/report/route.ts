import { NextRequest } from "next/server";
import { proxyFileToBackend } from "@/lib/auth/proxy-to-backend";

export const POST = async (req: NextRequest) => {
  const { id } = await req.json();
  return proxyFileToBackend(req, `/api/AdView/report?id=${id}`, { method: "GET" });
};
