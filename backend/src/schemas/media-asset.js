import { Schema, model, models } from "mongoose";

const mediaAssetSchema = new Schema({
    ownerUserId: {
        type: String,
        required: true,
        index: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    extension: {
        type: String,
        required: true,
    },
    sizeBytes: {
        type: Number,
        required: true,
        min: 1,
    },
    relativePath: {
        type: String,
        required: true,
        unique: true,
    },
    publicUrl: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        enum: ["GENERAL", "AVATAR", "COURSE_THUMBNAIL"],
        default: "GENERAL",
        index: true,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "DELETED"],
        default: "ACTIVE",
        index: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    collection: "media_assets",
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

mediaAssetSchema.index({ ownerUserId: 1, createdAt: -1 }, { name: "owner_created_idx" });

export const MediaAssetModel = models.MediaAsset ?? model("MediaAsset", mediaAssetSchema);
