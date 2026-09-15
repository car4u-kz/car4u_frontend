import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/catalog-description-keywords/${id}`, {
    method: "PUT",
    body: await request.text(),
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/catalog-description-keywords/${id}`, {
    method: "DELETE",
  });
}
