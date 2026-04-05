import { Schema, model, models } from "mongoose";

const cartItemSchema = new Schema({
    courseId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: null,
    },
    price: {
        type: Number,
        default: 0,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const cartSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    items: {
        type: [cartItemSchema],
        default: [],
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
}, {
    collection: "carts",
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

export const CartModel = models.Cart ?? model("Cart", cartSchema);
