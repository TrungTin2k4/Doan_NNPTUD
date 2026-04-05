import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { categorySchema } from "@/utils/schemas";
import { deleteCategory, updateCategory } from "@/controllers/category-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function PUT(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAdmin(request);
        const { id } = await context.params;
        const body = await parseJsonBody(request);
        const input = validateBody(categorySchema, body);
        const category = await updateCategory(id, user.id, input);
        return ok(request, category, "Category updated successfully");
    });
}

export async function DELETE(request, context) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const { id } = await context.params;
        await deleteCategory(id);
        return ok(request, null, "Category deleted successfully");
    });
}
