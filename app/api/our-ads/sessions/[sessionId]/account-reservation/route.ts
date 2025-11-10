import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type Params = {
  params: {
    sessionId: string;
  };
};

// POST  /api/our-ads/sessions/:sessionId/account-reservation
// тело: { login, password }
export async function POST(request: NextRequest, { params }: Params) {
  const body = await request.json();
  const { sessionId } = params;

  // прокидываем на реальный бекенд
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
export async function PUT(request: NextRequest, { params }: Params) {
  const body = await request.json();
  const { sessionId } = params;

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
