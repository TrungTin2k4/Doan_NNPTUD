import { requireAuth } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { BadRequestError } from "@/lib/errors";
import { ok, withErrorHandling } from "@/lib/http";
import { updateVideoPosition } from "@/lib/services/progress-service";
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
