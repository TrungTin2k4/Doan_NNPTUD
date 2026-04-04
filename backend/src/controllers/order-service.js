import { connectToDatabase } from "@/utils/db";
import { BadRequestError, ForbiddenError, NotFoundError, } from "@/utils/errors";
import { CourseModel } from "@/schemas/course";
import { EnrollmentModel } from "@/schemas/enrollment";
import { OrderModel } from "@/schemas/order";
import { UserModel } from "@/schemas/user";
import { createOrActivateEnrollment } from "@/controllers/enrollment-service";
import { createProgress } from "@/controllers/progress-service";
import { getCoursesByIds, getPublishedCoursesByIds, } from "@/controllers/course-service";
const SUPPORTED_PAYMENT_METHODS = "CARD, MOMO, BANK_TRANSFER";
function parseOrderStatus(status) {
    const normalized = status.trim().toUpperCase();
    if (normalized === "PENDING" ||
        normalized === "COMPLETED" ||
        normalized === "REFUNDED" ||
        normalized === "CANCELLED") {
        return normalized;
    }
    throw new BadRequestError(`Invalid order status: ${status}`);
}
function parseOrderStatusOrNull(status) {
    if (!status || !status.trim()) {
        return null;
    }
    return parseOrderStatus(status);
}
function parsePaymentMethod(paymentMethod) {
    if (!paymentMethod || !paymentMethod.trim()) {
        throw new BadRequestError("Payment method is required");
    }
    const normalized = paymentMethod.trim().toUpperCase().replace(/[-\s]/g, "_");
    if (normalized === "CARD" || normalized === "MOMO" || normalized === "BANK_TRANSFER") {
        return normalized;
    }
    throw new BadRequestError(`Unsupported payment method. Supported values: ${SUPPORTED_PAYMENT_METHODS}`);
}
export async function checkout(userId, input) {
    var _a;
    await connectToDatabase();
    const user = await UserModel.findById(userId).exec();
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const courseIds = Array.from(new Set(input.courseIds
        .map((courseId) => courseId.trim())
        .filter((courseId) => courseId.length > 0)));
    if (courseIds.length === 0) {
        throw new BadRequestError("Course IDs cannot be empty");
    }
    const courses = await getPublishedCoursesByIds(courseIds);
    const courseMap = new Map(courses.map((course) => [course.id, course]));
    const missingCourseIds = courseIds.filter((courseId) => !courseMap.has(courseId));
    if (missingCourseIds.length > 0) {
        throw new BadRequestError(`Some courses are unavailable or not published: ${missingCourseIds.join(", ")}`);
    }
    const enrolledCourseIds = (_a = user.enrolledCourseIds) !== null && _a !== void 0 ? _a : [];
    const activeEnrollments = await EnrollmentModel.find({
        userId,
        courseId: { $in: courseIds },
        status: "ACTIVE",
    })
        .select({ courseId: 1 })
        .exec();
    const activeEnrollmentCourseIds = activeEnrollments
        .map((enrollment) => enrollment.courseId)
        .filter((courseId) => typeof courseId === "string");
    const alreadyEnrolledSet = new Set([...enrolledCourseIds, ...activeEnrollmentCourseIds]);
    const alreadyEnrolledCourseIds = courseIds.filter((courseId) => alreadyEnrolledSet.has(courseId));
    if (alreadyEnrolledCourseIds.length > 0) {
        throw new BadRequestError(`You are already enrolled in: ${alreadyEnrolledCourseIds.join(", ")}`);
    }
    const orderItems = courseIds.map((courseId) => {
        var _a;
        const course = courseMap.get(courseId);
        return {
            courseId,
            courseTitle: course.title,
            courseThumbnail: course.thumbnail,
            price: Number((_a = course.price) !== null && _a !== void 0 ? _a : 0),
        };
    });
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);
    const order = await OrderModel.create({
        userId,
        userEmail: user.email,
        userName: user.fullName,
        items: orderItems,
        totalAmount,
        paymentMethod: parsePaymentMethod(input.paymentMethod),
        status: "PENDING",
    });
    return order.toObject({ virtuals: true });
}
export async function getUserOrders(userId) {
    await connectToDatabase();
    const docs = await OrderModel.find({ userId }).sort({ createdAt: -1 }).exec();
    return docs.map((doc) => doc.toObject({ virtuals: true }));
}
export async function getUserOrderById(userId, orderId) {
    await connectToDatabase();
    const order = await OrderModel.findById(orderId).exec();
    if (!order) {
        throw new NotFoundError("Order not found");
    }
    if (order.userId !== userId) {
        throw new ForbiddenError();
    }
    return order.toObject({ virtuals: true });
}
export async function getAllOrders(params) {
    await connectToDatabase();
    const filter = {};
    const status = parseOrderStatusOrNull(params.status);
    if (status) {
        filter.status = status;
    }
    const [totalItems, docs] = await Promise.all([
        OrderModel.countDocuments(filter).exec(),
        OrderModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    return {
        orders: docs.map((doc) => doc.toObject({ virtuals: true })),
        currentPage: params.page,
        totalPages: Math.max(1, Math.ceil(totalItems / params.size)),
        totalItems,
    };
}
async function grantCourseAccess(order) {
    var _a;
    const userId = String(order.userId);
    const existedUser = await UserModel.exists({ _id: userId });
    if (!existedUser) {
        throw new NotFoundError("User not found");
    }
    const orderedCourseIds = Array.from(new Set(((_a = order.items) !== null && _a !== void 0 ? _a : [])
        .map((item) => { var _a; return ((_a = item === null || item === void 0 ? void 0 : item.courseId) !== null && _a !== void 0 ? _a : "").trim(); })
        .filter((courseId) => courseId.length > 0)));
    if (orderedCourseIds.length === 0) {
        return;
    }
    const courses = await getCoursesByIds(orderedCourseIds);
    const courseMap = new Map(courses.map((course) => [course.id, course]));
    const missing = orderedCourseIds.filter((courseId) => !courseMap.has(courseId));
    if (missing.length > 0) {
        throw new BadRequestError(`Cannot complete order because some courses no longer exist: ${missing.join(", ")}`);
    }
    const newlyEnrolledCourseIds = [];
    for (const courseId of orderedCourseIds) {
        const updatedUser = await UserModel.updateOne({
            _id: userId,
            enrolledCourseIds: { $ne: courseId },
        }, {
            $addToSet: {
                enrolledCourseIds: courseId,
            },
        }).exec();
        if (updatedUser.modifiedCount > 0) {
            newlyEnrolledCourseIds.push(courseId);
        }
    }
    const orderId = order.id ? String(order.id) : null;
    for (const courseId of newlyEnrolledCourseIds) {
        await CourseModel.updateOne({ _id: courseId }, {
            $inc: {
                studentsCount: 1,
            },
        }).exec();
        await createOrActivateEnrollment({
            userId,
            courseId,
            orderId,
            source: "ORDER",
        });
        await createProgress(userId, courseId);
    }
}
export async function updateOrderStatus(orderId, statusInput) {
    await connectToDatabase();
    const status = parseOrderStatus(statusInput);
    const order = await OrderModel.findById(orderId).exec();
    if (!order) {
        throw new NotFoundError("Order not found");
    }
    if (order.status === status) {
        return order.toObject({ virtuals: true });
    }
    const shouldGrantAccess = status === "COMPLETED" && order.status !== "COMPLETED";
    if (shouldGrantAccess) {
        const orderObj = order.toObject({ virtuals: true });
        await grantCourseAccess(orderObj);
    }
    order.status = status;
    await order.save();
    return order.toObject({ virtuals: true });
}
export async function getTotalRevenue() {
    await connectToDatabase();
    const docs = await OrderModel.find({ status: "COMPLETED" }).select({ totalAmount: 1 }).exec();
    return docs.reduce((sum, order) => { var _a; return sum + Number((_a = order.totalAmount) !== null && _a !== void 0 ? _a : 0); }, 0);
}
export async function countCompletedOrders() {
    await connectToDatabase();
    return OrderModel.countDocuments({ status: "COMPLETED" }).exec();
}
