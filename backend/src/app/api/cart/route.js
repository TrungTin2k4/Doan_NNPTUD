import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { clearMyCart, getMyCart } from "@/controllers/cart-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function GET(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const cart = await getMyCart(user.id);
        return ok(request, cart);
    });
}

export async function DELETE(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const cart = await clearMyCart(user.id);
        return ok(request, cart, "Cart cleared successfully");
    });
}
