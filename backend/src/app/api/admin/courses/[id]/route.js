import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { courseSchema } from "@/utils/schemas";
import { deleteCourse, updateCourse } from "@/controllers/course-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function PUT(request, context) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const { id } = await context.params;
        const body = await parseJsonBody(request);
        const input = validateBody(courseSchema, body);
        const course = await updateCourse(id, input);
        return ok(request, course, "Course updated successfully");
    });
}
export async function DELETE(request, context) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const { id } = await context.params;
        await deleteCourse(id);
        return ok(request, null, "Course deleted successfully");
    });
}
