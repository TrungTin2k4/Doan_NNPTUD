import { requireAdmin } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { BadRequestError } from "@/lib/errors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { updateOrderStatusSchema } from "@/lib/schemas";
import { updateOrderStatus } from "@/lib/services/order-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function PATCH(request, context) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const { id } = await context.params;
        const body = await parseJsonBody(request);
        const input = validateBody(updateOrderStatusSchema, body);
        const order = await updateOrderStatus(id, input.status);
        return ok(request, order, "Order status updated");
    });
}
export async function PUT(request, context) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const { id } = await context.params;
        const status = request.nextUrl.searchParams.get("status");
        if (!status || status.trim().length === 0) {
            throw new BadRequestError("Status is required");
        }
        const order = await updateOrderStatus(id, status);
        return ok(request, order, "Order status updated");
    });
}
