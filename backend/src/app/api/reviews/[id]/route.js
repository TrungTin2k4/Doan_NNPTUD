import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { deleteReviewById } from "@/controllers/review-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function DELETE(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { id } = await context.params;
        const deletedReview = await deleteReviewById(user, id);
        return ok(request, deletedReview, "Review deleted successfully");
    });
}
