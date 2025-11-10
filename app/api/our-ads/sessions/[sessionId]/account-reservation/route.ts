import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

// POST  /api/our-ads/sessions/:sessionId/account-reservation
// тело: { login, password }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const body = await request.json();
  const { sessionId } = await params;

  return proxyToBackend(
    request,
    `/api/our-ads/sessions/${sessionId}/account-reservation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

// PUT  /api/our-ads/sessions/:sessionId/account-reservation
// тело: { accountId: number }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const body = await request.json();
  const { sessionId } = await params;

  return proxyToBackend(
    request,
    `/api/our-ads/sessions/${sessionId}/account-reservation`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}
