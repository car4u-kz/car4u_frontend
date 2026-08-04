import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type RouteContext = {
  params: Promise<{ adId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { adId } = await context.params;
  const suffix = request.nextUrl.search;

  return proxyToBackend(
    request,
    `/api/adview/${encodeURIComponent(adId)}/duplicate-history${suffix}`,
    { method: "GET" },
  );
}
