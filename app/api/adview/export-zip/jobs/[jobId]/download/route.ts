import { NextRequest } from "next/server";
import { proxyFileToBackend } from "@/lib/auth/proxy-to-backend";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export const GET = async (req: NextRequest, context: RouteContext) => {
  const { jobId } = await context.params;

  return proxyFileToBackend(
    req,
    `/api/AdView/export-zip/jobs/${jobId}/download`,
    { method: "GET" },
  );
};
