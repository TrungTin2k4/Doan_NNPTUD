import { connectToDatabase } from "@/utils/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import { CourseModel } from "@/schemas/course";
import { ReviewModel } from "@/schemas/review";
import { sanitizePlainText } from "@/utils/sanitizer";
import { hasAccess } from "@/controllers/progress-service";

function parseRating(rating) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new BadRequestError("Rating must be an integer between 1 and 5");
    }
    return rating;
}

async function ensureCourseExists(courseId) {
    const course = await CourseModel.findById(courseId).select({ _id: 1 }).exec();
    if (!course) {
        throw new NotFoundError("Course not found");
    }
}

async function syncCourseReviewStats(courseId) {
    const stats = await ReviewModel.aggregate([
        {
            $match: {
                courseId,
                status: "PUBLISHED",
            },
        },
        {
            $group: {
                _id: null,
                reviewsCount: { $sum: 1 },
                averageRating: { $avg: "$rating" },
            },
        },
    ]).exec();
    const aggregate = stats[0] ?? null;
    const reviewsCount = Number(aggregate?.reviewsCount ?? 0);
    const averageRating = Number(aggregate?.averageRating ?? 0);
    const roundedRating = Number.isFinite(averageRating) ? Math.round(averageRating * 100) / 100 : 0;
    await CourseModel.updateOne({ _id: courseId }, {
        $set: {
            reviewsCount,
            rating: roundedRating,
        },
    }).exec();
}

function toReviewResponse(doc) {
    return doc.toObject({ virtuals: true });
}

export async function upsertMyReview(actor, input) {
    await connectToDatabase();
    const courseId = input.courseId.trim();
    const rating = parseRating(input.rating);
    await ensureCourseExists(courseId);
    const canReview = await hasAccess(actor.id, courseId);
    if (!canReview) {
        throw new ForbiddenError("You must enroll in this course before reviewing");
    }
    const comment = sanitizePlainText(input.comment);
    const existing = await ReviewModel.findOne({ userId: actor.id, courseId }).exec();
    let review;
    let created = false;
    if (existing) {
        existing.rating = rating;
        existing.comment = comment;
        existing.userName = actor.fullName;
        existing.userAvatarUrl = actor.avatarUrl ?? null;
        existing.status = "PUBLISHED";
        await existing.save();
        review = existing;
    }
    else {
        review = await ReviewModel.create({
            userId: actor.id,
            userName: actor.fullName,
            userAvatarUrl: actor.avatarUrl ?? null,
            courseId,
            rating,
            comment,
            status: "PUBLISHED",
        });
        created = true;
    }
    await syncCourseReviewStats(courseId);
    return {
        review: toReviewResponse(review),
        created,
    };
}

export async function getCoursePublishedReviews(courseId, params) {
    await connectToDatabase();
    await ensureCourseExists(courseId);
    const filter = {
        courseId,
        status: "PUBLISHED",
    };
    const [totalItems, docs] = await Promise.all([
        ReviewModel.countDocuments(filter).exec(),
        ReviewModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    return {
        reviews: docs.map((doc) => toReviewResponse(doc)),
        currentPage: params.page,
        totalPages: Math.max(1, Math.ceil(totalItems / params.size)),
        totalItems,
    };
}

export async function deleteReviewById(actor, reviewId) {
    await connectToDatabase();
    const review = await ReviewModel.findById(reviewId).exec();
    if (!review) {
        throw new NotFoundError("Review not found");
    }
    const isAdmin = actor.role === "ADMIN";
    const isOwner = review.userId === actor.id;
    if (!isAdmin && !isOwner) {
        throw new ForbiddenError();
    }
    const courseId = String(review.courseId);
    await ReviewModel.deleteOne({ _id: reviewId }).exec();
    await syncCourseReviewStats(courseId);
    return toReviewResponse(review);
}
