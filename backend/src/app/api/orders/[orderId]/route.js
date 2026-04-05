import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getUserOrderById } from "@/controllers/order-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { orderId } = await context.params;
        const order = await getUserOrderById(user.id, orderId);
        return ok(request, order);
    });
}
