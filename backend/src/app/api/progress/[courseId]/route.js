import { requireAuth } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { getProgress } from "@/lib/services/progress-service";
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
