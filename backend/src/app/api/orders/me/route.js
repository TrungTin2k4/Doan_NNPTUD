import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getUserOrders } from "@/controllers/order-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const orders = await getUserOrders(user.id);
        return ok(request, orders);
    });
}
