import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export const GET = async (req: NextRequest, context: RouteContext) => {
  const { jobId } = await context.params;

  return proxyToBackend(req, `/api/AdView/export-zip/jobs/${jobId}`, {
    method: "GET",
  });
};
