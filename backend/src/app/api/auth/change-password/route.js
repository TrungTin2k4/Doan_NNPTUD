import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { enforceAuthRateLimit } from "@/utils/rate-limit";
import { changePasswordSchema } from "@/utils/schemas";
import { changePassword } from "@/controllers/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function PUT(request) {
    return withErrorHandling(request, async () => {
        enforceAuthRateLimit(request);
        const user = await requireAuth(request);
        const body = await parseJsonBody(request);
        const input = validateBody(changePasswordSchema, body);
        await changePassword(user.id, input);
        return ok(request, null, "Password changed successfully");
    });
}
