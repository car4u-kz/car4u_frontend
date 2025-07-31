import { NextRequest } from "next/server";
import { getInternalApiUrl } from "@/utils/formatters";

export async function DELETE(req: NextRequest) {
  try {
    const baseUrl = getInternalApiUrl();
    const body = await req.json();

    const res = await fetch(`${baseUrl}/api/our-ad/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMessage = "Unknown error";
      return Response.json({ error: errorMessage }, { status: res.status });
    }

    return Response.json({}, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/our-ad error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
