import { requireAuth } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { videoPositionSchema } from "@/lib/schemas";
import { getVideoPositionByLesson, updateVideoPositionByLesson, } from "@/lib/services/progress-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { lessonId } = await context.params;
        const position = await getVideoPositionByLesson(user.id, lessonId);
        return ok(request, {
            lessonId,
            position,
        });
    });
}
export async function POST(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { lessonId } = await context.params;
        const body = await parseJsonBody(request);
        const input = validateBody(videoPositionSchema, body);
        const progress = await updateVideoPositionByLesson(user.id, lessonId, input.position);
        return ok(request, progress);
    });
}
