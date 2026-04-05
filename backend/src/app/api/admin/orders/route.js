import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parsePageParam, parseSizeParam } from "@/utils/request";
import { getAllOrders } from "@/controllers/order-service";
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
