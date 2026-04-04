import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { reviewSchema } from "@/utils/schemas";
import { upsertMyReview } from "@/controllers/review-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function POST(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const body = await parseJsonBody(request);
        const input = validateBody(reviewSchema, body);
        const result = await upsertMyReview(user, input);
        const message = result.created ? "Review created successfully" : "Review updated successfully";
        return ok(request, result.review, message, result.created ? 201 : 200);
    });
}
