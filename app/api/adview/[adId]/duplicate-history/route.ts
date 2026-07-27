import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type RouteContext = {
  params: Promise<{ adId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { adId } = await context.params;

  return proxyToBackend(
    request,
    `/api/adview/${encodeURIComponent(adId)}/duplicate-history`,
    { method: "GET" },
  );
}
