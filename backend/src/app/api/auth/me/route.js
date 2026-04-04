import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parseJsonBody, validateBody } from "@/utils/request";
import { updateProfileSchema } from "@/utils/schemas";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/controllers/auth-service";
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
