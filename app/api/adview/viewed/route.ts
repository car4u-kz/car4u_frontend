import { proxyToBackend } from "@/lib/auth/proxy-to-backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.adId) {
    return NextResponse.json(
      { error: "Missing required query params: id" },
      { status: 400 }
    );
  }

  return proxyToBackend(request, "/api/AdView/viewed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
