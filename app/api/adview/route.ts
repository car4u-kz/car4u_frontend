import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function POST(req: NextRequest) {
  const query = new URL(req.url).searchParams.toString();

  return proxyToBackend(req, `/api/adview?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
