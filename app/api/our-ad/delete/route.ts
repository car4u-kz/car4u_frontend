import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function DELETE(request: NextRequest) {
  const body = await request.json();

  return proxyToBackend(request, "/api/our-ad/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
