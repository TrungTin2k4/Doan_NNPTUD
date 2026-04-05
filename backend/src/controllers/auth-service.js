import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { generateJwtToken } from "@/utils/auth";
import { connectToDatabase } from "@/utils/db";
import { BadRequestError, ForbiddenError, InvalidCredentialsError, NotFoundError, } from "@/utils/errors";
import { PasswordResetTokenModel } from "@/schemas/password-reset-token";
import { UserModel } from "@/schemas/user";
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from "@/utils/password-policy";
import { createUserSession, revokeAllUserSessions } from "@/controllers/user-session-service";
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
async function toAuthResponse(user, request) {
    var _a;
    const token = generateJwtToken({
        id: user.id,
        email: user.email,
        tokenVersion: user.tokenVersion,
    });
    await createUserSession({
        userId: user.id,
        token,
        tokenVersion: user.tokenVersion,
        request,
    });
    return {
        token,
        type: "Bearer",
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatarUrl: (_a = user.avatarUrl) !== null && _a !== void 0 ? _a : null,
        },
    };
}
function ensureStrongPassword(password) {
    if (!isPasswordValid(password)) {
        throw new BadRequestError(PASSWORD_POLICY_MESSAGE);
    }
}
function ensureUserEnabled(user) {
    if (user.enabled === false) {
        throw new ForbiddenError("Account has been disabled");
    }
}
function hashResetToken(token) {
    return createHash("sha256").update(token, "utf8").digest("hex");
}
function createResetToken() {
    return randomBytes(48).toString("base64url");
}
function resolveResetTokenExpirationMinutes() {
    var _a;
    const raw = (_a = process.env.PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES) !== null && _a !== void 0 ? _a : "30";
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 30;
    }
    return parsed;
}
function shouldExposeResetToken() {
    var _a, _b, _c;
    const debugReturnToken = ((_a = process.env.PASSWORD_RESET_DEBUG_RETURN_TOKEN) !== null && _a !== void 0 ? _a : "false").toLowerCase() === "true";
    if (!debugReturnToken) {
        return false;
    }
    const profile = ((_c = (_b = process.env.APP_PROFILE) !== null && _b !== void 0 ? _b : process.env.NODE_ENV) !== null && _c !== void 0 ? _c : "production").toLowerCase();
    return profile === "dev" || profile === "local" || profile === "test";
}
async function cleanupExpiredResetTokens() {
    await PasswordResetTokenModel.deleteMany({
        expiresAt: { $lt: new Date() },
    }).exec();
}
async function invalidateActiveTokens(userId, keepTokenId) {
    const query = { userId, used: false };
    if (keepTokenId) {
        query._id = { $ne: keepTokenId };
    }
    await PasswordResetTokenModel.updateMany(query, {
        $set: {
            used: true,
            usedAt: new Date(),
        },
    }).exec();
}
export async function registerUser(input, request) {
    await connectToDatabase();
    ensureStrongPassword(input.password);
    const email = normalizeEmail(input.email);
    const existed = await UserModel.exists({ email });
    if (existed) {
        throw new BadRequestError("Email already registered");
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await UserModel.create({
        email,
        password: passwordHash,
        fullName: input.fullName.trim(),
        role: "USER",
    });
    const userObj = user.toObject({ virtuals: true });
    return toAuthResponse({
        id: userObj.id,
        email: userObj.email,
        fullName: userObj.fullName,
        role: userObj.role,
        avatarUrl: userObj.avatarUrl,
        tokenVersion: userObj.tokenVersion,
    }, request);
}
export async function loginUser(input, request) {
    await connectToDatabase();
    const email = normalizeEmail(input.email);
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
        throw new InvalidCredentialsError();
    }
    const matched = await bcrypt.compare(input.password, String(user.password));
    if (!matched) {
        throw new InvalidCredentialsError();
    }
    ensureUserEnabled(user);
    const userObj = user.toObject({ virtuals: true });
    return toAuthResponse({
        id: userObj.id,
        email: userObj.email,
        fullName: userObj.fullName,
        role: userObj.role,
        avatarUrl: userObj.avatarUrl,
        tokenVersion: userObj.tokenVersion,
    }, request);
}
export async function getCurrentUserProfile(userId) {
    var _a;
    await connectToDatabase();
    const user = await UserModel.findById(userId).exec();
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const userObj = user.toObject({ virtuals: true });
    return {
        id: userObj.id,
        email: userObj.email,
        fullName: userObj.fullName,
        role: userObj.role,
        avatarUrl: (_a = userObj.avatarUrl) !== null && _a !== void 0 ? _a : null,
    };
}
export async function updateCurrentUserProfile(userId, input) {
    var _a;
    await connectToDatabase();
    const user = await UserModel.findById(userId).exec();
    if (!user) {
        throw new NotFoundError("User not found");
    }
    user.fullName = input.fullName.trim();
    user.avatarUrl = ((_a = input.avatarUrl) === null || _a === void 0 ? void 0 : _a.trim()) ? input.avatarUrl.trim() : null;
    await user.save();
    return getCurrentUserProfile(userId);
}
export async function requestPasswordReset(input) {
    await connectToDatabase();
    await cleanupExpiredResetTokens();
    const email = normalizeEmail(input.email);
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
        return null;
    }
    const userObj = user.toObject({ virtuals: true });
    await invalidateActiveTokens(userObj.id);
    const rawToken = createResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + resolveResetTokenExpirationMinutes() * 60 * 1000);
    await PasswordResetTokenModel.create({
        userId: userObj.id,
        tokenHash,
        expiresAt,
        used: false,
    });
    return shouldExposeResetToken() ? rawToken : null;
}
export async function resetPassword(input) {
    var _a;
    await connectToDatabase();
    await cleanupExpiredResetTokens();
    ensureStrongPassword(input.newPassword);
    const tokenHash = hashResetToken(input.token);
    const resetToken = await PasswordResetTokenModel.findOne({ tokenHash, used: false }).exec();
    const expiresAtMs = (resetToken === null || resetToken === void 0 ? void 0 : resetToken.expiresAt) instanceof Date ? resetToken.expiresAt.getTime() : NaN;
    if (!resetToken || Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
        throw new BadRequestError("Invalid or expired reset token");
    }
    const user = await UserModel.findById(resetToken.userId).exec();
    if (!user) {
        throw new NotFoundError("User not found");
    }
    user.password = await bcrypt.hash(input.newPassword, 10);
    user.tokenVersion = Number((_a = user.tokenVersion) !== null && _a !== void 0 ? _a : 0) + 1;
    await user.save();
    resetToken.used = true;
    resetToken.usedAt = new Date();
    await resetToken.save();
    const tokenObj = resetToken.toObject({ virtuals: true });
    await invalidateActiveTokens(String(resetToken.userId), tokenObj.id);
    await revokeAllUserSessions(String(resetToken.userId), "Password reset");
}
export async function changePassword(userId, input) {
    var _a;
    await connectToDatabase();
    const user = await UserModel.findById(userId).exec();
    if (!user) {
        throw new NotFoundError("User not found");
    }
    ensureStrongPassword(input.newPassword);
    const currentMatched = await bcrypt.compare(input.currentPassword, String(user.password));
    if (!currentMatched) {
        throw new BadRequestError("Current password is incorrect");
    }
    const sameAsCurrent = await bcrypt.compare(input.newPassword, String(user.password));
    if (sameAsCurrent) {
        throw new BadRequestError("New password must be different from current password");
    }
    user.password = await bcrypt.hash(input.newPassword, 10);
    user.tokenVersion = Number((_a = user.tokenVersion) !== null && _a !== void 0 ? _a : 0) + 1;
    await user.save();
    await invalidateActiveTokens(userId);
    await revokeAllUserSessions(userId, "Password changed");
}
export async function logoutUser(userId) {
    await connectToDatabase();
    const update = await UserModel.updateOne({ _id: userId }, {
        $inc: {
            tokenVersion: 1,
        },
    }).exec();
    if (update.matchedCount === 0) {
        throw new NotFoundError("User not found");
    }
    await revokeAllUserSessions(userId, "User logout");
}
export function getForgotPasswordResponse(resetToken) {
    const response = {
        message: "If an account exists, a password reset link has been sent",
    };
    if (resetToken) {
        response.resetToken = resetToken;
    }
    return response;
}
