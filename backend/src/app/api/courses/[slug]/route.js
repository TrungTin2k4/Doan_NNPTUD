import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getCourseBySlugPublic } from "@/controllers/course-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request, context) {
    return withErrorHandling(request, async () => {
        const { slug } = await context.params;
        const course = await getCourseBySlugPublic(slug);
        return ok(request, course);
    });
}
