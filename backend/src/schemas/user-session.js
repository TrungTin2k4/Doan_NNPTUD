import { Schema, model, models } from "mongoose";

const userSessionSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    tokenVersion: {
        type: Number,
        required: true,
        default: 0,
    },
    ipAddress: {
        type: String,
        default: null,
    },
    userAgent: {
        type: String,
        default: null,
    },
    deviceName: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "REVOKED", "EXPIRED"],
        default: "ACTIVE",
        index: true,
    },
    lastSeenAt: {
        type: Date,
        default: Date.now,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    revokedReason: {
        type: String,
        default: null,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    collection: "user_sessions",
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            const record = ret;
            const rawId = record._id;
            if (rawId && typeof rawId === "object" && "toString" in rawId) {
                record.id = rawId.toString();
            }
            delete record._id;
        },
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            const record = ret;
            const rawId = record._id;
            if (rawId && typeof rawId === "object" && "toString" in rawId) {
                record.id = rawId.toString();
            }
            delete record._id;
        },
    },
});

userSessionSchema.index({ userId: 1, createdAt: -1 }, { name: "user_created_session_idx" });

export const UserSessionModel = models.UserSession ?? model("UserSession", userSessionSchema);
