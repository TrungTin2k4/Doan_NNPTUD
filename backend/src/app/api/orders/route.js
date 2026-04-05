import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { checkoutSchema } from "@/utils/schemas";
import { checkout, getUserOrders } from "@/controllers/order-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const body = await parseJsonBody(request);
        const input = validateBody(checkoutSchema, body);
        const order = await checkout(user.id, input);
        return ok(request, order, "Order placed successfully");
    });
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const orders = await getUserOrders(user.id);
        return ok(request, orders);
    });
}
