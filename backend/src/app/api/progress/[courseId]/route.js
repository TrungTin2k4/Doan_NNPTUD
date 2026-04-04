import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getProgress } from "@/controllers/progress-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { courseId } = await context.params;
        const progress = await getProgress(user.id, courseId);
        return ok(request, progress);
    });
}
