import { z } from "zod";
import { PASSWORD_POLICY_MESSAGE, PASSWORD_POLICY_REGEX } from "@/utils/password-policy";
export const registerSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
    password: z
        .string()
        .min(1, "Password is required")
        .regex(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
});
export const loginSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});
export const forgotPasswordSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
});
export const resetPasswordSchema = z.object({
    token: z.string().trim().min(1, "Reset token is required"),
    newPassword: z
        .string()
        .min(1, "New password is required")
        .regex(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
});
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(1, "New password is required")
        .regex(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
});
export const updateProfileSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    avatarUrl: z.union([
        z.string().trim().url("Avatar URL must be a valid URL"),
        z.string().trim().regex(/^\/(?!\/)[^\s]*$/, "Avatar URL must be a valid URL or root-relative path"),
        z.literal(""),
        z.null(),
    ]).optional(),
});
const lessonSchema = z.object({
    title: z.string().optional(),
    videoUrl: z.string().optional().nullable(),
    duration: z.number().int().optional(),
    isPreview: z.boolean().optional(),
});
const sectionSchema = z.object({
    title: z.string().optional(),
    lessons: z.array(lessonSchema).optional(),
});
export const courseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    thumbnail: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    level: z.string().optional().nullable(),
    instructor: z.string().optional().nullable(),
    price: z.number({ message: "Price is required" }),
    originalPrice: z.number().optional().nullable(),
    isPublished: z.boolean().optional(),
    sections: z.array(sectionSchema).optional(),
});
export const categorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required"),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});
export const reviewSchema = z.object({
    courseId: z.string().trim().min(1, "Course ID is required"),
    rating: z.number({ message: "Rating is required" }).int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().optional().nullable(),
});
export const cartItemSchema = z.object({
    courseId: z.string().trim().min(1, "Course ID is required"),
});
export const checkoutSchema = z.object({
    courseIds: z.array(z.string().trim().min(1, "Course ID is required")).min(1, "Course IDs cannot be empty"),
    paymentMethod: z.string().trim().min(1, "Payment method is required"),
});
export const updateOrderStatusSchema = z.object({
    status: z.string().trim().min(1, "Status is required"),
});
export const completeLessonSchema = z.object({
    courseId: z.string().trim().min(1, "Course ID is required"),
    lessonId: z.string().trim().min(1, "Lesson ID is required"),
});
export const videoPositionSchema = z.object({
    position: z.number({ message: "Position is required" }).int().min(0, "Position must be greater than or equal to 0"),
});
