import { requireAdmin } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parsePageParam, parseSizeParam } from "@/lib/request";
import { getAllOrders } from "@/lib/services/order-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        var _a;
        await requireAdmin(request);
        const searchParams = request.nextUrl.searchParams;
        const status = (_a = searchParams.get("status")) !== null && _a !== void 0 ? _a : "";
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 10);
        const data = await getAllOrders({
            status,
            page,
            size,
        });
        return ok(request, data);
    });
}
