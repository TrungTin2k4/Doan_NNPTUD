import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, parsePageParam, parseSizeParam, validateBody } from "@/utils/request";
import { courseSchema } from "@/utils/schemas";
import { createCourse, getAllCoursesForAdmin, } from "@/controllers/course-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        var _a, _b, _c;
        await requireAdmin(request);
        const searchParams = request.nextUrl.searchParams;
        const status = (_a = searchParams.get("status")) !== null && _a !== void 0 ? _a : "";
        const category = (_b = searchParams.get("category")) !== null && _b !== void 0 ? _b : "";
        const search = (_c = searchParams.get("search")) !== null && _c !== void 0 ? _c : "";
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 10);
        const data = await getAllCoursesForAdmin({
            status,
            category,
            search,
            page,
            size,
        });
        return ok(request, data);
    });
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const body = await parseJsonBody(request);
        const input = validateBody(courseSchema, body);
        const course = await createCourse(input);
        return ok(request, course, "Course created successfully");
    });
}
