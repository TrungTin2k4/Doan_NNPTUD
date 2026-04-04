import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/utils/db";
import { ForbiddenError, UnauthorizedError } from "@/utils/errors";
import { UserModel } from "@/schemas/user";
import { findActiveUserSessionByToken, touchSessionById } from "@/controllers/user-session-service";
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim().length < 32) {
        throw new Error("JWT_SECRET must be configured and at least 32 bytes long");
    }
    return secret;
}
function getJwtExpirationMs() {
    var _a;
    const raw = (_a = process.env.JWT_EXPIRATION) !== null && _a !== void 0 ? _a : "86400000";
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 86400000;
    }
    return parsed;
}
function isValidClaims(payload) {
    return (typeof payload !== "string" &&
        typeof payload.sub === "string" &&
        typeof payload.email === "string" &&
        typeof payload.tokenVersion === "number");
}
export function generateJwtToken(user) {
    const expiresInSeconds = Math.floor(getJwtExpirationMs() / 1000);
    return jwt.sign({
        email: user.email,
        tokenVersion: user.tokenVersion,
    }, getJwtSecret(), {
        algorithm: "HS256",
        subject: user.id,
        expiresIn: expiresInSeconds,
    });
}
export function verifyJwtToken(token) {
    try {
        const payload = jwt.verify(token, getJwtSecret());
        if (!isValidClaims(payload)) {
            return null;
        }
        return payload;
    }
    catch (_a) {
        return null;
    }
}
export function extractBearerToken(request) {
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return null;
    }
    return authorization.slice(7);
}
export async function requireAuth(request) {
    await connectToDatabase();
    const token = extractBearerToken(request);
    if (!token) {
        throw new UnauthorizedError();
    }
    const claims = verifyJwtToken(token);
    if (!claims) {
        throw new UnauthorizedError();
    }
    const user = await UserModel.findById(claims.sub).exec();
    if (!user) {
        throw new UnauthorizedError();
    }
    const userObj = user.toObject({ virtuals: true });
    if (userObj.enabled === false) {
        throw new UnauthorizedError("Account has been disabled");
    }
    if (userObj.tokenVersion !== claims.tokenVersion) {
        throw new UnauthorizedError("Token has been revoked");
    }
    const session = await findActiveUserSessionByToken(userObj.id, token);
    if (!session) {
        throw new UnauthorizedError("Session is no longer active");
    }
    await touchSessionById(session.id);
    return {
        ...userObj,
        sessionId: session.id,
    };
}
export async function requireAdmin(request) {
    const user = await requireAuth(request);
    if (user.role !== "ADMIN") {
        throw new ForbiddenError();
    }
    return user;
}
