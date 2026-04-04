import { connectToDatabase } from "@/utils/db";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { EnrollmentModel } from "@/schemas/enrollment";
import { normalizeText } from "@/utils";

function parseEnrollmentSource(source) {
    const normalized = normalizeText(source);
    if (!normalized) {
        return "MANUAL";
    }
    const upperCased = normalized.toUpperCase();
    if (upperCased === "ORDER" || upperCased === "ADMIN" || upperCased === "MANUAL") {
        return upperCased;
    }
    throw new BadRequestError(`Invalid enrollment source: ${source}`);
}

function parseEnrollmentStatus(status) {
    const normalized = normalizeText(status);
    if (!normalized) {
        return null;
    }
    const upperCased = normalized.toUpperCase();
    if (upperCased === "ACTIVE" || upperCased === "REVOKED") {
        return upperCased;
    }
    throw new BadRequestError(`Invalid enrollment status: ${status}`);
}

export async function createOrActivateEnrollment(input) {
    await connectToDatabase();
    const userId = normalizeText(input.userId);
    const courseId = normalizeText(input.courseId);
    if (!userId || !courseId) {
        throw new BadRequestError("Enrollment userId and courseId are required");
    }
    const orderId = normalizeText(input.orderId);
    const source = parseEnrollmentSource(input.source);
    const now = new Date();
    const enrollment = await EnrollmentModel.findOneAndUpdate({
        userId,
        courseId,
    }, {
        $set: {
            status: "ACTIVE",
            orderId,
            source,
            revokedAt: null,
            revokedByUserId: null,
        },
        $setOnInsert: {
            enrolledAt: now,
        },
    }, {
        upsert: true,
        new: true,
    }).exec();
    return enrollment.toObject({ virtuals: true });
}

export async function hasActiveEnrollment(userId, courseId) {
    await connectToDatabase();
    const existed = await EnrollmentModel.exists({
        userId,
        courseId,
        status: "ACTIVE",
    });
    return Boolean(existed);
}

export async function getMyEnrollments(userId, params) {
    await connectToDatabase();
    const normalizedUserId = normalizeText(userId);
    if (!normalizedUserId) {
        throw new BadRequestError("Invalid user ID");
    }
    const filter = {
        userId: normalizedUserId,
    };
    const status = parseEnrollmentStatus(params.status);
    if (status) {
        filter.status = status;
    }
    const [totalItems, docs] = await Promise.all([
        EnrollmentModel.countDocuments(filter).exec(),
        EnrollmentModel.find(filter)
            .sort({ enrolledAt: -1 })
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    return {
        enrollments: docs.map((doc) => doc.toObject({ virtuals: true })),
        currentPage: params.page,
        totalPages: Math.max(1, Math.ceil(totalItems / params.size)),
        totalItems,
    };
}

export async function revokeEnrollmentById(id, actorUserId) {
    await connectToDatabase();
    const enrollment = await EnrollmentModel.findById(id).exec();
    if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
    }
    if (enrollment.status === "REVOKED") {
        return enrollment.toObject({ virtuals: true });
    }
    enrollment.status = "REVOKED";
    enrollment.revokedAt = new Date();
    enrollment.revokedByUserId = normalizeText(actorUserId);
    await enrollment.save();
    return enrollment.toObject({ virtuals: true });
}
