import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { BadRequestError } from "@/utils/errors";
import { ok, withErrorHandling } from "@/utils/http";
import { updateVideoPosition } from "@/controllers/progress-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function PUT(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { courseId } = await context.params;
        const lessonId = request.nextUrl.searchParams.get("lessonId");
        const rawPosition = request.nextUrl.searchParams.get("position");
        if (!lessonId || lessonId.trim().length === 0) {
            throw new BadRequestError("Invalid request parameters");
        }
        const position = Number(rawPosition);
        if (!Number.isInteger(position) || position < 0) {
            throw new BadRequestError("Invalid request parameters");
        }
        const progress = await updateVideoPosition(user.id, courseId, lessonId, position);
        return ok(request, progress);
    });
}
