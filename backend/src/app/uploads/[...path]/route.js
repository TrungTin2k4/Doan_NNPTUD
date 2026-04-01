import path from "node:path";
import { access, readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadRoot = path.resolve(process.cwd(), "public", "uploads");

const mimeTypes = {
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
};

function resolveUploadFilePath(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
        return null;
    }

    const normalizedSegments = segments.map((segment) => String(segment).trim()).filter(Boolean);
    const hasUnsafeSegment = normalizedSegments.some((segment) => segment === "." || segment === ".." || /[\\/]/.test(segment));

    if (hasUnsafeSegment) {
        return null;
    }

    const absolutePath = path.resolve(uploadRoot, ...normalizedSegments);
    if (absolutePath !== uploadRoot && !absolutePath.startsWith(`${uploadRoot}${path.sep}`)) {
        return null;
    }

    return absolutePath;
}

function resolveContentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return mimeTypes[extension] ?? "application/octet-stream";
}

export async function GET(_request, context) {
    const { path: pathSegments } = await context.params;
    const filePath = resolveUploadFilePath(pathSegments);

    if (!filePath) {
        return new NextResponse("Not found", { status: 404 });
    }

    try {
        await access(filePath);
        const fileBuffer = await readFile(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Type": resolveContentType(filePath),
            },
        });
    }
    catch {
        return new NextResponse("Not found", { status: 404 });
    }
}
