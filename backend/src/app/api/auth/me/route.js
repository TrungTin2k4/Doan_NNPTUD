import { requireAuth } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { parseJsonBody, validateBody } from "@/lib/request";
import { updateProfileSchema } from "@/lib/schemas";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/lib/services/auth-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const profile = await getCurrentUserProfile(user.id);
        return ok(request, profile);
    });
}
export async function PUT(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const body = await parseJsonBody(request);
        const input = validateBody(updateProfileSchema, body);
        const profile = await updateCurrentUserProfile(user.id, input);
        return ok(request, profile, "Profile updated successfully");
    });
}
