import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return proxyToBackend(request, `/api/our-ads/sessions/${sessionId}`, {
    method: "GET",
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return proxyToBackend(request, `/api/our-ads/sessions/${sessionId}`, {
    method: "DELETE",
  });
}
