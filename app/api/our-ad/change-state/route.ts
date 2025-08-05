import { proxyToBackend } from "@/lib/auth/proxy-to-backend";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  return proxyToBackend(request, "/api/our-ad/change-state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
