import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { BadRequestError } from "@/utils/errors";
import { ok, withErrorHandling } from "@/utils/http";
import { parsePageParam, parseSizeParam } from "@/utils/request";
import { getMyMediaAssets, uploadMediaAsset } from "@/controllers/media-service";

export const runtime = "nodejs";

async function parseUploadFormData(request) {
    try {
        return await request.formData();
    }
    catch (_a) {
        throw new BadRequestError("Invalid upload form data");
    }
}

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function GET(request) {
    return withErrorHandling(request, async () => {
        var _a;
        const user = await requireAuth(request);
        const searchParams = request.nextUrl.searchParams;
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 20);
        const purpose = (_a = searchParams.get("purpose")) !== null && _a !== void 0 ? _a : null;
        const data = await getMyMediaAssets(user.id, {
            page,
            size,
            purpose,
        });
        return ok(request, data);
    });
}

export async function POST(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const formData = await parseUploadFormData(request);
        const file = formData.get("file");
        const purposeRaw = formData.get("purpose");
        const purpose = typeof purposeRaw === "string" ? purposeRaw : null;
        const mediaAsset = await uploadMediaAsset({
            ownerUserId: user.id,
            file,
            purpose,
        });
        return ok(request, mediaAsset, "File uploaded successfully", 201);
    });
}
