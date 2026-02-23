import { requireAuth } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { completeLessonSchema } from "@/lib/schemas";
import { markLessonComplete } from "@/lib/services/progress-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const body = await parseJsonBody(request);
        const input = validateBody(completeLessonSchema, body);
        const progress = await markLessonComplete(user.id, input.courseId, input.lessonId);
        return ok(request, progress);
    });
}
