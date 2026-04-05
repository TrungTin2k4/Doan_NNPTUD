import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getCourseById } from "@/controllers/course-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request, context) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const { id } = await context.params;
        const course = await getCourseById(id);
        return ok(request, course);
    });
}
