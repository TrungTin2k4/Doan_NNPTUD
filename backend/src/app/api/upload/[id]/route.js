import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { deleteMediaAssetById } from "@/controllers/media-service";

export const runtime = "nodejs";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function DELETE(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { id } = await context.params;
        const deletedMediaAsset = await deleteMediaAssetById(user, id);
        return ok(request, deletedMediaAsset, "Media asset deleted successfully");
    });
}
