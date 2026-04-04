import { requireAuth } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { parsePageParam, parseSizeParam } from "@/utils/request";
import { listMySessions, revokeAllUserSessions } from "@/controllers/user-session-service";

export async function OPTIONS(request) {
    return corsPreflight(request);
}

export async function GET(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        const searchParams = request.nextUrl.searchParams;
        const page = parsePageParam(searchParams.get("page"), 0);
        const size = parseSizeParam(searchParams.get("size"), 10);
        const sessions = await listMySessions(user.id, {
            page,
            size,
        });
        return ok(request, sessions);
    });
}

export async function DELETE(request) {
    return withErrorHandling(request, async () => {
        const user = await requireAuth(request);
        await revokeAllUserSessions(user.id, "Revoked by user");
        return ok(request, null, "All sessions revoked successfully");
    });
}
