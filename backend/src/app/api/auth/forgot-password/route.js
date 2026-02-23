import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/schemas";
import { getForgotPasswordResponse, requestPasswordReset, } from "@/lib/services/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        enforceAuthRateLimit(request);
        const body = await parseJsonBody(request);
        const input = validateBody(forgotPasswordSchema, body);
        const resetToken = await requestPasswordReset(input);
        const response = getForgotPasswordResponse(resetToken);
        return ok(request, response, "Password reset request accepted");
    });
}
