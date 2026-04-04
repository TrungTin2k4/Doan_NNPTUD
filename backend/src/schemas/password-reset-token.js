var _a;
import { Schema, model, models } from "mongoose";
const passwordResetTokenSchema = new Schema({
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
}, {
    collection: "password_reset_tokens",
    timestamps: { createdAt: true, updatedAt: false },
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
export const PasswordResetTokenModel = (_a = models.PasswordResetToken) !== null && _a !== void 0 ? _a : model("PasswordResetToken", passwordResetTokenSchema);
