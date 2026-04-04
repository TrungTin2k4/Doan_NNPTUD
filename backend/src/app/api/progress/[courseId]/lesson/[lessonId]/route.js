import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { markLessonComplete } from "@/controllers/progress-service";
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
