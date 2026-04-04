var _a;
import { Schema, model, models } from "mongoose";
const orderItemSchema = new Schema({
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    courseThumbnail: { type: String, default: null },
    price: { type: Number, default: 0 },
}, { _id: false });
const orderSchema = new Schema({
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, default: 0 },
    paymentMethod: {
        type: String,
        enum: ["CARD", "MOMO", "BANK_TRANSFER"],
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "REFUNDED", "CANCELLED"],
        default: "PENDING",
        index: true,
    },
}, {
    collection: "orders",
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
export const OrderModel = (_a = models.Order) !== null && _a !== void 0 ? _a : model("Order", orderSchema);
