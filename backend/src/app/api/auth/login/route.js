import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { enforceAuthRateLimit } from "@/utils/rate-limit";
import { loginSchema } from "@/utils/schemas";
import { loginUser } from "@/controllers/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        enforceAuthRateLimit(request);
        const body = await parseJsonBody(request);
        const input = validateBody(loginSchema, body);
        const auth = await loginUser(input, request);
        return ok(request, auth, "Login successful");
    });
}
