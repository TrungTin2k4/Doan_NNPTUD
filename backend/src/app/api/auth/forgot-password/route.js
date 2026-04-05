import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { enforceAuthRateLimit } from "@/utils/rate-limit";
import { forgotPasswordSchema } from "@/utils/schemas";
import { getForgotPasswordResponse, requestPasswordReset, } from "@/controllers/auth-service";
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
