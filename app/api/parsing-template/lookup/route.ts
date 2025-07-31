import { NextResponse } from "next/server";
import { getInternalApiUrl } from "@/utils/formatters";

export async function GET() {
  try {
    const baseUrl = getInternalApiUrl();
    const res = await fetch(`${baseUrl}/api/parsing-template/lookup`);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/parsing-template:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
