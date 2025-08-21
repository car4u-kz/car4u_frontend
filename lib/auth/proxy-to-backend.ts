import { getInternalApiUrl } from "@/utils/formatters";
import { NextRequest, NextResponse } from "next/server";

export async function proxyToBackend(
  request: NextRequest,
  path: string,
  options?: RequestInit
) {
  try {
    const DOTNET_BASE_URL = getInternalApiUrl();
    const authHeader = request.headers.get("authorization") ?? "";
    const organizationHeader = request.headers.get("X-Organization-Id") ?? "";

    const url = `${DOTNET_BASE_URL}${path}`;

    const headers = new Headers(options?.headers);
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    if (organizationHeader) {
      headers.set("X-Organization-Id", organizationHeader);
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type") || "";

    let body: any;
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    return new NextResponse(
      typeof body === "string" ? body : JSON.stringify(body),
      {
        status: res.status,
        headers: { "Content-Type": contentType },
      }
    );
  } catch (error) {
    console.error("proxyToBackend error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function proxyFileToBackend(
  request: NextRequest,
  path: string,
  options?: RequestInit
) {
  try {
    const DOTNET_BASE_URL = getInternalApiUrl();
    const authHeader = request.headers.get("authorization") ?? "";
    const organizationHeader = request.headers.get("X-Organization-Id") ?? "";

    const url = `${DOTNET_BASE_URL}${path}`;

    const headers = new Headers(options?.headers);

    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    if (organizationHeader) {
      headers.set("X-Organization-Id", organizationHeader);
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(errorText, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const buffer = await res.arrayBuffer();

    const responseHeaders = new Headers(res.headers);

    return new Response(buffer, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("proxyFileToBackend error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
