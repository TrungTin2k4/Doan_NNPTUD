import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { videoPositionSchema } from "@/utils/schemas";
import { getVideoPositionByLesson, updateVideoPositionByLesson, } from "@/controllers/progress-service";
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
