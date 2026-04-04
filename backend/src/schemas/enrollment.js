import { Schema, model, models } from "mongoose";

const enrollmentSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    courseId: {
        type: String,
        required: true,
        index: true,
    },
    orderId: {
        type: String,
        default: null,
    },
    source: {
        type: String,
        enum: ["ORDER", "ADMIN", "MANUAL"],
        default: "ORDER",
    },
    status: {
        type: String,
        enum: ["ACTIVE", "REVOKED"],
        default: "ACTIVE",
        index: true,
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    revokedByUserId: {
        type: String,
        default: null,
    },
}, {
    collection: "enrollments",
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

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true, name: "user_course_enrollment_idx" });

export const EnrollmentModel = models.Enrollment ?? model("Enrollment", enrollmentSchema);
