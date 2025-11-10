import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type Params = {
  params: {
    sessionId: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  const { sessionId } = params;

  return proxyToBackend(request, `/api/our-ads/sessions/${sessionId}`, {
    method: "GET",
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { sessionId } = params;

  return proxyToBackend(request, `/api/our-ads/sessions/${sessionId}`, {
    method: "DELETE",
  });
}
