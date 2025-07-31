import { NextRequest } from "next/server";
import { getInternalApiUrl } from "@/utils/formatters";

export const POST = async (req: NextRequest) => {
  console.log("reach");
  try {
    const baseUrl = getInternalApiUrl();
    const { id } = await req.json();
    const res = await fetch(`${baseUrl}/api/AdView/report?id=${id}`);

    if (!res.ok) {
      return new Response("Failed to fetch report", { status: res.status });
    }

    const pdfBuffer = await res.arrayBuffer();

    return new Response(pdfBuffer, {
      status: res.status,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=report.pdf",
      },
    });
  } catch (error) {
    console.log(error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
