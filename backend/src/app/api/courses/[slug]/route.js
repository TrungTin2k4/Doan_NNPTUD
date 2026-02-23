import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { getCourseBySlugPublic } from "@/lib/services/course-service";
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
