import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { logoutUser } from "@/controllers/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        await logoutUser(user.id);
        return ok(request, null, "Logout successful");
    });
}
