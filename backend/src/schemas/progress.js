var _a;
import { Schema, model, models } from "mongoose";
const progressSchema = new Schema({
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    completedLessonIds: { type: [String], default: [] },
    currentLessonId: { type: String, default: null, index: true },
    lastVideoPosition: { type: Number, default: 0 },
    lessonPositions: {
        type: Map,
        of: Number,
        default: {},
    },
    progressPercent: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
}, {
    collection: "progress",
    timestamps: { createdAt: false, updatedAt: true },
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
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true, name: "user_course_idx" });
export const ProgressModel = (_a = models.Progress) !== null && _a !== void 0 ? _a : model("Progress", progressSchema);
