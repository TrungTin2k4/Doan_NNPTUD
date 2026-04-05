import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parsePageParam, parseSizeParam } from "@/utils/request";
import { getAllUsers } from "@/controllers/user-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const searchParams = request.nextUrl.searchParams;
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 10);
        const data = await getAllUsers({ page, size });
        return ok(request, data);
    });
}
