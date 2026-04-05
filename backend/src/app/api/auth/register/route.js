import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { enforceAuthRateLimit } from "@/utils/rate-limit";
import { registerSchema } from "@/utils/schemas";
import { registerUser } from "@/controllers/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        enforceAuthRateLimit(request);
        const body = await parseJsonBody(request);
        const input = validateBody(registerSchema, body);
        const auth = await registerUser(input, request);
        return ok(request, auth, "Registration successful");
    });
}
