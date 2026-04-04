import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { cartItemSchema } from "@/utils/schemas";
import { addCourseToMyCart } from "@/controllers/cart-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function POST(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const body = await parseJsonBody(request);
        const input = validateBody(cartItemSchema, body);
        const cart = await addCourseToMyCart(user.id, input.courseId);
        return ok(request, cart, "Course added to cart");
    });
}
