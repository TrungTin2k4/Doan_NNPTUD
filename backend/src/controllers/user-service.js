import { connectToDatabase } from "@/utils/db";
import { UserModel } from "@/schemas/user";
function toAdminUserResponse(user) {
    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        enabled: Boolean(user.enabled),
        enrolledCoursesCount: Array.isArray(user.enrolledCourseIds) ? user.enrolledCourseIds.length : 0,
        createdAt: user.createdAt,
    };
}
export async function getAllUsers(params) {
    await connectToDatabase();
    const [totalItems, docs] = await Promise.all([
        UserModel.countDocuments({}).exec(),
        UserModel.find({})
            .sort({ createdAt: -1 })
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    const users = docs.map((doc) => toAdminUserResponse(doc.toObject({ virtuals: true })));
    return {
        users,
        currentPage: params.page,
        totalPages: Math.max(1, Math.ceil(totalItems / params.size)),
        totalItems,
    };
}
export async function countUsers() {
    await connectToDatabase();
    return UserModel.countDocuments({}).exec();
}
