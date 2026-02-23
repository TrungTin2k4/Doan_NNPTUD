import { requireAdmin } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parsePageParam, parseSizeParam } from "@/lib/request";
import { getAllUsers } from "@/lib/services/user-service";
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
