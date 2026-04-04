import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userAvatarUrl: {
        type: String,
        default: null,
    },
    courseId: {
        type: String,
        required: true,
        index: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["PUBLISHED", "HIDDEN"],
        default: "PUBLISHED",
        index: true,
    },
}, {
    collection: "reviews",
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

reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true, name: "user_course_review_idx" });

export const ReviewModel = models.Review ?? model("Review", reviewSchema);
