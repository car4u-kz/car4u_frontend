import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(
    request,
    `/api/catalog-description-keywords/${id}/deactivate`,
    { method: "POST" },
  );
}
