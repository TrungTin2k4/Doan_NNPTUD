import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/schemas";
import { loginUser } from "@/lib/services/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function POST(request) {
    return withErrorHandling(request, async () => {
        enforceAuthRateLimit(request);
        const body = await parseJsonBody(request);
        const input = validateBody(loginSchema, body);
        const auth = await loginUser(input);
        return ok(request, auth, "Login successful");
    });
}
