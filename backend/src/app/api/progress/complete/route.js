import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { completeLessonSchema } from "@/utils/schemas";
import { markLessonComplete } from "@/controllers/progress-service";
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
