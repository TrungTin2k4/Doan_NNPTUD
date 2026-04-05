import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_TYPES = new Map([
    ["jpg", "image/jpeg"],
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"],
    ["gif", "image/gif"],
    ["svg", "image/svg+xml"],
]);

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET(_request, context) {
    const { path: segments } = await context.params;
    if (!segments || segments.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const relativePath = segments.join("/");

    // Security: block directory traversal
    if (relativePath.includes("..")) {
        return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const ext = path.extname(relativePath).replace(".", "").toLowerCase();
    const mimeType = MIME_TYPES.get(ext);
    if (!mimeType) {
        return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const absolutePath = path.join(process.cwd(), "public", "uploads", ...segments);

    try {
        const fileBuffer = await readFile(absolutePath);
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=31536000, immutable",
                ...CORS_HEADERS,
            },
        });
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CORS_HEADERS });
    }
}
