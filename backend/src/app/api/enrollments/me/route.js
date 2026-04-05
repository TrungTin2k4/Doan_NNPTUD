import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parsePageParam, parseSizeParam } from "@/utils/request";
import { getMyEnrollments } from "@/controllers/enrollment-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function GET(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const searchParams = request.nextUrl.searchParams;
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 10);
        const status = searchParams.get("status") ?? "";
        const data = await getMyEnrollments(user.id, {
            page,
            size,
            status,
        });
        return ok(request, data);
    });
}
