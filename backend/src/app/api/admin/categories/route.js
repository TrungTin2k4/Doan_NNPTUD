import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, parsePageParam, parseSizeParam, validateBody } from "@/utils/request";
import { categorySchema } from "@/utils/schemas";
import { createCategory, getAdminCategories } from "@/controllers/category-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function GET(request) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const searchParams = request.nextUrl.searchParams;
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 10);
        const search = searchParams.get("search") ?? "";
        const isActive = searchParams.get("isActive") ?? "";
        const data = await getAdminCategories({
            page,
            size,
            search,
            isActive,
        });
        return ok(request, data);
    });
}

export async function POST(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAdmin(request);
        const body = await parseJsonBody(request);
        const input = validateBody(categorySchema, body);
        const category = await createCategory(user.id, input);
        return ok(request, category, "Category created successfully", 201);
    });
}
