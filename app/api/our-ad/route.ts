import { NextRequest } from "next/server";
import { getInternalApiUrl } from "@/utils/formatters";

export async function GET() {
  try {
    const baseUrl = getInternalApiUrl();
    const res = await fetch(`${baseUrl}/api/our-ad`);

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

export async function POST(req: NextRequest) {
  try {
    const baseUrl = getInternalApiUrl();
    const body = await req.json();

    const res = await fetch(`${baseUrl}/api/our-ad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const error = await res.json();
    if (!res.ok) {
      let errorMessage = "Unknown error";
      try {
        errorMessage = error?.errorMessage || error?.message || errorMessage;
      } catch {
        // ignored
      }
      return Response.json({ error: errorMessage }, { status: res.status });
    }

    return Response.json({}, { status: res.status });
  } catch (error) {
    console.error("POST /api/our-ad error:", error);
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
