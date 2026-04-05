import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getMyLearningCourses } from "@/controllers/progress-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const courses = await getMyLearningCourses(user.id);
        return ok(request, courses);
    });
}
