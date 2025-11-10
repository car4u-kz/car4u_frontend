import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type Params = {
  params: {
    sessionId: string;
  };
};

export async function POST(request: NextRequest, { params }: Params) {
  const { sessionId } = params;

  return proxyToBackend(
    request,
    `/api/our-ads/sessions/${sessionId}/account-reservation/cancel`,
    {
      method: "POST",
    }
  );
}
