var _a;
import { Schema, model, models } from "mongoose";
const lessonSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, default: null },
    duration: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false },
}, { _id: false });
const sectionSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    lessons: { type: [lessonSchema], default: [] },
}, { _id: false });
const courseSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: null },
    thumbnail: { type: String, default: null },
    category: { type: String, default: null },
    level: { type: String, default: "beginner" },
    instructor: { type: String, default: null },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: null },
    duration: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["DRAFT", "PUBLISHED"],
        default: "DRAFT",
    },
    sections: {
        type: [sectionSchema],
        default: [],
    },
}, {
    collection: "courses",
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
export const CourseModel = (_a = models.Course) !== null && _a !== void 0 ? _a : model("Course", courseSchema);
