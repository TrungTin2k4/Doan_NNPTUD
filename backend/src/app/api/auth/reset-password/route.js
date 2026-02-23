import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/schemas";
import { resetPassword } from "@/lib/services/auth-service";
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
