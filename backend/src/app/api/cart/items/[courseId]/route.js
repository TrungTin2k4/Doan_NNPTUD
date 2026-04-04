import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { removeCourseFromMyCart } from "@/controllers/cart-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function DELETE(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { courseId } = await context.params;
        const cart = await removeCourseFromMyCart(user.id, courseId);
        return ok(request, cart, "Course removed from cart");
    });
}
