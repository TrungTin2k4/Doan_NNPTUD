import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getFeaturedCourses } from "@/controllers/course-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        const data = await getFeaturedCourses();
        return ok(request, data);
    });
}
