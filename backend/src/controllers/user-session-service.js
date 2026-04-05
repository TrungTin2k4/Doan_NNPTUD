import { createHash } from "crypto";
import { connectToDatabase } from "@/utils/db";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { UserSessionModel } from "@/schemas/user-session";
import { normalizeText } from "@/utils";

function resolveJwtExpirationMs() {
    const raw = process.env.JWT_EXPIRATION ?? "86400000";
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 86400000;
    }
    return Math.floor(parsed);
}

function sanitizeNullableText(value, maxLength = 255) {
    const normalized = normalizeText(value);
    if (!normalized) {
        return null;
    }
    return normalized.slice(0, maxLength);
}

function extractClientIp(request) {
    if (!request) {
        return null;
    }
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const firstIp = forwardedFor.split(",")[0]?.trim();
        if (firstIp) {
            return sanitizeNullableText(firstIp, 100);
        }
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return sanitizeNullableText(realIp, 100);
    }
    return null;
}

function extractUserAgent(request) {
    if (!request) {
        return null;
    }
    return sanitizeNullableText(request.headers.get("user-agent"), 500);
}

function extractDeviceName(request) {
    if (!request) {
        return null;
    }
    return sanitizeNullableText(request.headers.get("sec-ch-ua-platform"), 120);
}

export function hashSessionToken(token) {
    return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function createUserSession(input) {
    await connectToDatabase();
    const userId = normalizeText(input.userId);
    const token = normalizeText(input.token);
    if (!userId || !token) {
        throw new BadRequestError("Cannot create session without user ID and token");
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + resolveJwtExpirationMs());
    const tokenHash = hashSessionToken(token);
    const session = await UserSessionModel.findOneAndUpdate({
        tokenHash,
    }, {
        $set: {
            userId,
            tokenHash,
            tokenVersion: Number(input.tokenVersion ?? 0),
            ipAddress: extractClientIp(input.request),
            userAgent: extractUserAgent(input.request),
            deviceName: extractDeviceName(input.request),
            status: "ACTIVE",
            lastSeenAt: now,
            revokedAt: null,
            revokedReason: null,
            expiresAt,
        },
    }, {
        upsert: true,
        new: true,
    }).exec();
    return session.toObject({ virtuals: true });
}

export async function findActiveUserSessionByToken(userId, token) {
    await connectToDatabase();
    const tokenHash = hashSessionToken(token);
    const session = await UserSessionModel.findOne({
        userId,
        tokenHash,
        status: "ACTIVE",
    }).exec();
    if (!session) {
        return null;
    }
    const expiresAtMs = session.expiresAt instanceof Date ? session.expiresAt.getTime() : NaN;
    if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
        session.status = "EXPIRED";
        session.revokedReason = "Token expired";
        session.revokedAt = new Date();
        await session.save();
        return null;
    }
    return session.toObject({ virtuals: true });
}

export async function touchSessionById(id) {
    await connectToDatabase();
    await UserSessionModel.updateOne({
        _id: id,
        status: "ACTIVE",
    }, {
        $set: {
            lastSeenAt: new Date(),
        },
    }).exec();
}

export async function revokeAllUserSessions(userId, reason = "Token revoked") {
    await connectToDatabase();
    const normalizedUserId = normalizeText(userId);
    if (!normalizedUserId) {
        return;
    }
    await UserSessionModel.updateMany({
        userId: normalizedUserId,
        status: "ACTIVE",
    }, {
        $set: {
            status: "REVOKED",
            revokedAt: new Date(),
            revokedReason: reason,
        },
    }).exec();
}

export async function listMySessions(userId, params) {
    await connectToDatabase();
    const normalizedUserId = normalizeText(userId);
    if (!normalizedUserId) {
        throw new BadRequestError("Invalid user ID");
    }
    const [totalItems, docs] = await Promise.all([
        UserSessionModel.countDocuments({ userId: normalizedUserId }).exec(),
        UserSessionModel.find({ userId: normalizedUserId })
            .sort({ createdAt: -1 })
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    return {
        sessions: docs.map((doc) => doc.toObject({ virtuals: true })),
        currentPage: params.page,
        totalPages: Math.max(1, Math.ceil(totalItems / params.size)),
        totalItems,
    };
}

export async function revokeMySessionById(userId, sessionId) {
    await connectToDatabase();
    const session = await UserSessionModel.findById(sessionId).exec();
    if (!session) {
        throw new NotFoundError("Session not found");
    }
    if (session.userId !== userId) {
        throw new NotFoundError("Session not found");
    }
    if (session.status === "REVOKED") {
        return session.toObject({ virtuals: true });
    }
    session.status = "REVOKED";
    session.revokedAt = new Date();
    session.revokedReason = "Revoked by user";
    await session.save();
    return session.toObject({ virtuals: true });
}
