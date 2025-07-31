import { NextRequest } from "next/server";

import { getInternalApiUrl } from "@/utils/formatters";

export async function POST(req: NextRequest) {
  const baseUrl = getInternalApiUrl();

  const queryString = new URL(req.url).searchParams.toString();

  const res = await fetch(`${baseUrl}/api/adview?${queryString}`);

  const data = await res.json();

  return Response.json(data);
}
