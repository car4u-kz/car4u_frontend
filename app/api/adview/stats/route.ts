import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.toString();

  return proxyToBackend(request, `/api/adview/stats?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
