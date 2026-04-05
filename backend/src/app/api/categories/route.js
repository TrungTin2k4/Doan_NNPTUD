import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { getActiveCategories } from "@/controllers/category-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function GET(request) {
    return withErrorHandling(request, async () => {
        const categories = await getActiveCategories();
        return ok(request, categories);
    });
}
