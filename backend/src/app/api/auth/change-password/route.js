import { requireAuth } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/schemas";
import { changePassword } from "@/lib/services/auth-service";
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
