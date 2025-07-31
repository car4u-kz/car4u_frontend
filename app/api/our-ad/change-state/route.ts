import { NextRequest } from "next/server";

import { getInternalApiUrl } from "@/utils/formatters";

export async function POST(req: NextRequest) {
  try {
    const baseUrl = getInternalApiUrl();
    const body = await req.json();

    const response = await fetch(`${baseUrl}/api/our-ad/change-state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      let errorMessage = "Unknown error";
      try {
        errorMessage = result?.errorMessage || errorMessage;
      } catch {
        // ignored
      }
      return Response.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return Response.json(result, { status: response.status });
  } catch (error) {
    console.error("POST /api/our-ad/change-state error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
