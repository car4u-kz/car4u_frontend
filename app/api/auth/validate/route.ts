import { getInternalApiUrl } from "@/utils/formatters";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const clerkToken = authHeader.substring("Bearer ".length);
  const DOTNET_BASE_URL = getInternalApiUrl();
  const res = await fetch(`${DOTNET_BASE_URL}/api/auth/validate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
