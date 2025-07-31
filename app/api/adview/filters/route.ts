import { NextRequest } from "next/server";
import { getInternalApiUrl } from "@/utils/formatters";

export async function GET() {
  try {
    const baseUrl = getInternalApiUrl();
    const res = await fetch(`${baseUrl}/api/adview/filters`);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("GET /api/our-ad error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
