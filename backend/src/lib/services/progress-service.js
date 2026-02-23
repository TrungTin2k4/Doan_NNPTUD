import { connectToDatabase } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { ProgressModel } from "@/lib/models/progress";
import { countLessons, getCourseById } from "@/lib/services/course-service";
export async function createProgress(userId, courseId) {
    await connectToDatabase();
    const existing = await ProgressModel.findOne({ userId, courseId }).exec();
    if (existing) {
        return existing.toObject({ virtuals: true });
    }
    const progress = await ProgressModel.create({
        userId,
        courseId,
        progressPercent: 0,
        completedLessonIds: [],
        lastVideoPosition: 0,
    });
    return progress.toObject({ virtuals: true });
}
export async function getProgress(userId, courseId) {
    await connectToDatabase();
    const progress = await ProgressModel.findOne({ userId, courseId }).exec();
    if (!progress) {
        throw new NotFoundError("Progress not found");
    }
    return progress.toObject({ virtuals: true });
}
export async function getUserProgress(userId) {
    await connectToDatabase();
    const docs = await ProgressModel.find({ userId }).exec();
    return docs.map((doc) => doc.toObject({ virtuals: true }));
}
export async function getMyLearningCourses(userId) {
    const progressList = await getUserProgress(userId);
    const result = [];
    for (const progress of progressList) {
        const course = await getCourseById(String(progress.courseId));
        result.push({
            id: course.id,
            title: course.title,
            slug: course.slug,
            thumbnail: course.thumbnail,
            category: course.category,
            instructor: course.instructor,
            progress: progress.progressPercent,
            currentLessonId: progress.currentLessonId,
            completedAt: progress.completedAt,
        });
    }
    return result;
}
export async function markLessonComplete(userId, courseId, lessonId) {
    var _a;
    await connectToDatabase();
    const progressDoc = await ProgressModel.findOne({ userId, courseId }).exec();
    if (!progressDoc) {
        throw new NotFoundError("Progress not found");
    }
    const completedLessonIds = (_a = progressDoc.completedLessonIds) !== null && _a !== void 0 ? _a : [];
    if (!completedLessonIds.includes(lessonId)) {
        completedLessonIds.push(lessonId);
    }
    progressDoc.completedLessonIds = completedLessonIds;
    progressDoc.currentLessonId = lessonId;
    const course = await getCourseById(courseId);
    const totalLessons = countLessons(course);
    const completedLessons = completedLessonIds.length;
    const progressPercent = totalLessons > 0 ? Math.floor((completedLessons * 100) / totalLessons) : 0;
    progressDoc.progressPercent = progressPercent;
    if (progressPercent === 100 && !progressDoc.completedAt) {
        progressDoc.completedAt = new Date();
    }
    await progressDoc.save();
    return progressDoc.toObject({ virtuals: true });
}
export async function updateVideoPosition(userId, courseId, lessonId, position) {
    await connectToDatabase();
    const progressDoc = await ProgressModel.findOne({ userId, courseId }).exec();
    if (!progressDoc) {
        throw new NotFoundError("Progress not found");
    }
    progressDoc.currentLessonId = lessonId;
    progressDoc.lastVideoPosition = position;
    await progressDoc.save();
    return progressDoc.toObject({ virtuals: true });
}
async function findProgressByLesson(userId, lessonId) {
    await connectToDatabase();
    const currentLessonProgress = await ProgressModel.findOne({
        userId,
        currentLessonId: lessonId,
    }).exec();
    if (currentLessonProgress) {
        return currentLessonProgress.toObject({ virtuals: true });
    }
    const completedLessonProgress = await ProgressModel.findOne({
        userId,
        completedLessonIds: lessonId,
    }).exec();
    if (completedLessonProgress) {
        return completedLessonProgress.toObject({ virtuals: true });
    }
    return null;
}
export async function getVideoPositionByLesson(userId, lessonId) {
    var _a;
    const progress = await findProgressByLesson(userId, lessonId);
    if (!progress) {
        return 0;
    }
    return Number((_a = progress.lastVideoPosition) !== null && _a !== void 0 ? _a : 0);
}
export async function updateVideoPositionByLesson(userId, lessonId, position) {
    await connectToDatabase();
    const progress = await findProgressByLesson(userId, lessonId);
    if (!progress) {
        throw new NotFoundError("Progress not found for lesson");
    }
    const progressDoc = await ProgressModel.findById(progress.id).exec();
    if (!progressDoc) {
        throw new NotFoundError("Progress not found for lesson");
    }
    progressDoc.currentLessonId = lessonId;
    progressDoc.lastVideoPosition = position;
    await progressDoc.save();
    return progressDoc.toObject({ virtuals: true });
}
export async function hasAccess(userId, courseId) {
    await connectToDatabase();
    const existed = await ProgressModel.exists({ userId, courseId });
    return Boolean(existed);
}
