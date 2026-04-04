import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { revokeMySessionById } from "@/controllers/user-session-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function DELETE(request, context) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const { id } = await context.params;
        const session = await revokeMySessionById(user.id, id);
        return ok(request, session, "Session revoked successfully");
    });
}
