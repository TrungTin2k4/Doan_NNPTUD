import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { getFeaturedCourses } from "@/lib/services/course-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        const data = await getFeaturedCourses();
        return ok(request, data);
    });
}
