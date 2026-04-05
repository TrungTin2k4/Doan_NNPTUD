import { connectToDatabase } from "@/utils/db";
import { BadRequestError } from "@/utils/errors";
import { CartModel } from "@/schemas/cart";
import { CourseModel } from "@/schemas/course";
import { normalizeText } from "@/utils";

function calculateTotalAmount(items) {
    return items.reduce((sum, item) => sum + Number(item.price ?? 0), 0);
}

async function getOrCreateCartDoc(userId) {
    const existed = await CartModel.findOne({ userId }).exec();
    if (existed) {
        return existed;
    }
    return CartModel.create({
        userId,
        items: [],
        totalAmount: 0,
    });
}

async function getPublishedCourseById(courseId) {
    const course = await CourseModel.findOne({
        _id: courseId,
        status: "PUBLISHED",
    })
        .select({
        title: 1,
        thumbnail: 1,
        price: 1,
    })
        .exec();
    if (!course) {
        throw new BadRequestError("Course is unavailable or not published");
    }
    return course.toObject({ virtuals: true });
}

export async function getMyCart(userId) {
    await connectToDatabase();
    const normalizedUserId = normalizeText(userId);
    if (!normalizedUserId) {
        throw new BadRequestError("Invalid user ID");
    }
    const cart = await getOrCreateCartDoc(normalizedUserId);
    return cart.toObject({ virtuals: true });
}

export async function addCourseToMyCart(userId, courseId) {
    await connectToDatabase();
    const normalizedUserId = normalizeText(userId);
    const normalizedCourseId = normalizeText(courseId);
    if (!normalizedUserId || !normalizedCourseId) {
        throw new BadRequestError("User ID and course ID are required");
    }
    const [cart, course] = await Promise.all([
        getOrCreateCartDoc(normalizedUserId),
        getPublishedCourseById(normalizedCourseId),
    ]);
    const items = Array.isArray(cart.items) ? [...cart.items] : [];
    const existed = items.some((item) => item.courseId === normalizedCourseId);
    if (!existed) {
        items.push({
            courseId: normalizedCourseId,
            title: course.title,
            thumbnail: course.thumbnail,
            price: Number(course.price ?? 0),
            addedAt: new Date(),
        });
    }
    cart.items = items;
    cart.totalAmount = calculateTotalAmount(items);
    await cart.save();
    return cart.toObject({ virtuals: true });
}

export async function removeCourseFromMyCart(userId, courseId) {
    await connectToDatabase();
    const normalizedUserId = normalizeText(userId);
    const normalizedCourseId = normalizeText(courseId);
    if (!normalizedUserId || !normalizedCourseId) {
        throw new BadRequestError("User ID and course ID are required");
    }
    const cart = await getOrCreateCartDoc(normalizedUserId);
    const items = Array.isArray(cart.items)
        ? cart.items.filter((item) => item.courseId !== normalizedCourseId)
        : [];
    cart.items = items;
    cart.totalAmount = calculateTotalAmount(items);
    await cart.save();
    return cart.toObject({ virtuals: true });
}

export async function clearMyCart(userId) {
    await connectToDatabase();
    const normalizedUserId = normalizeText(userId);
    if (!normalizedUserId) {
        throw new BadRequestError("Invalid user ID");
    }
    const cart = await getOrCreateCartDoc(normalizedUserId);
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    return cart.toObject({ virtuals: true });
}
