import { Schema, model, models } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    description: {
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    createdByUserId: {
        type: String,
        required: true,
        index: true,
    },
    updatedByUserId: {
        type: String,
        default: null,
    },
}, {
    collection: "categories",
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

categorySchema.index({ name: 1 }, { name: "category_name_idx" });

export const CategoryModel = models.Category ?? model("Category", categorySchema);
