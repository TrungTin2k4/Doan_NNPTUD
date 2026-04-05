import { NextResponse } from "next/server";

import { openApiDocument } from "@/utils/openapi";

export async function GET(request) {
  const serverUrl = request.nextUrl.origin;

  return NextResponse.json(
    {
      ...openApiDocument,
      servers: [{ url: serverUrl }],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
