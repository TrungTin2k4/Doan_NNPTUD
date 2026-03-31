import { tryGetAuthUser } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { getCourseBySlugForEnrolledUser, getCourseBySlugPublic } from "@/lib/services/course-service";
import { hasAccess } from "@/lib/services/progress-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request, context) {
    return withErrorHandling(request, async () => {
        const { slug } = await context.params;
        const viewer = await tryGetAuthUser(request);
        let course = await getCourseBySlugPublic(slug);
        if (viewer) {
            const canAccess = await hasAccess(viewer.id, course.id);
            if (canAccess) {
                course = await getCourseBySlugForEnrolledUser(slug);
            }
        }
        return ok(request, course);
    });
}
