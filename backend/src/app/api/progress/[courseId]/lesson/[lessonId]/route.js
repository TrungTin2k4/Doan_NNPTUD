import { requireAuth } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { markLessonComplete } from "@/lib/services/progress-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function PUT(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { courseId, lessonId } = await context.params;
        const progress = await markLessonComplete(user.id, courseId, lessonId);
        return ok(request, progress);
    });
}
