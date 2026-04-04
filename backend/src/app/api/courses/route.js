import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parsePageParam, parseSizeParam } from "@/utils/request";
import { getPublishedCourses } from "@/controllers/course-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        var _a, _b, _c;
        const searchParams = request.nextUrl.searchParams;
        const category = (_a = searchParams.get("category")) !== null && _a !== void 0 ? _a : "";
        const search = (_b = searchParams.get("search")) !== null && _b !== void 0 ? _b : "";
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 12);
        const sort = (_c = searchParams.get("sort")) !== null && _c !== void 0 ? _c : "newest";
        const data = await getPublishedCourses({
            category,
            search,
            page,
            size,
            sort,
        });
        return ok(request, data);
    });
}
