import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { enforceAuthRateLimit } from "@/utils/rate-limit";
import { resetPasswordSchema } from "@/utils/schemas";
import { resetPassword } from "@/controllers/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        enforceAuthRateLimit(request);
        const body = await parseJsonBody(request);
        const input = validateBody(resetPasswordSchema, body);
        await resetPassword(input);
        return ok(request, null, "Password has been reset successfully");
    });
}
