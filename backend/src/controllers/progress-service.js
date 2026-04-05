import { connectToDatabase } from "@/utils/db";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { CourseModel } from "@/schemas/course";
import { ProgressModel } from "@/schemas/progress";
import { countLessons, getCourseById } from "@/controllers/course-service";
import { hasActiveEnrollment } from "@/controllers/enrollment-service";
function getCourseLessonIdSet(course) {
    const sections = Array.isArray(course.sections) ? course.sections : [];
    const lessonIds = new Set();
    for (const section of sections) {
        const lessons = Array.isArray(section.lessons) ? section.lessons : [];
        for (const lesson of lessons) {
            if ((lesson === null || lesson === void 0 ? void 0 : lesson.id) && typeof lesson.id === "string") {
                lessonIds.add(lesson.id);
            }
        }
    }
    return lessonIds;
}
function ensureLessonBelongsToCourse(course, lessonId) {
    const lessonIds = getCourseLessonIdSet(course);
    if (!lessonIds.has(lessonId)) {
        throw new BadRequestError("Lesson does not belong to this course");
    }
    return lessonIds;
}
function normalizeLessonPositionMap(rawMap) {
    if (!rawMap) {
        return new Map();
    }
    if (rawMap instanceof Map) {
        return rawMap;
    }
    if (typeof rawMap === "object") {
        return new Map(Object.entries(rawMap));
    }
    return new Map();
}
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
        lessonPositions: {},
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
    await connectToDatabase();
    const progressDoc = await ProgressModel.findOne({ userId, courseId }).exec();
    if (!progressDoc) {
        throw new NotFoundError("Progress not found");
    }
    const course = await getCourseById(courseId);
    const lessonIds = ensureLessonBelongsToCourse(course, lessonId);
    const completedLessonIds = Array.isArray(progressDoc.completedLessonIds)
        ? progressDoc.completedLessonIds.filter((id) => typeof id === "string" && lessonIds.has(id))
        : [];
    const completedSet = new Set(completedLessonIds);
    completedSet.add(lessonId);
    const normalizedCompletedLessonIds = Array.from(completedSet);
    progressDoc.completedLessonIds = normalizedCompletedLessonIds;
    progressDoc.currentLessonId = lessonId;
    const totalLessons = countLessons(course);
    const completedLessons = Math.min(normalizedCompletedLessonIds.length, totalLessons);
    const progressPercent = totalLessons > 0 ? Math.min(100, Math.floor((completedLessons * 100) / totalLessons)) : 0;
    progressDoc.progressPercent = progressPercent;
    if (progressPercent === 100 && !progressDoc.completedAt) {
        progressDoc.completedAt = new Date();
    }
    if (progressPercent < 100) {
        progressDoc.completedAt = null;
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
    const course = await getCourseById(courseId);
    ensureLessonBelongsToCourse(course, lessonId);
    progressDoc.currentLessonId = lessonId;
    progressDoc.lastVideoPosition = position;
    await progressDoc.save();
    return progressDoc.toObject({ virtuals: true });
}
async function findProgressByLesson(userId, lessonId) {
    await connectToDatabase();
    const progressByCurrentOrCompletedLesson = await ProgressModel.findOne({
        userId,
        $or: [{ currentLessonId: lessonId }, { completedLessonIds: lessonId }],
    }).exec();
    if (progressByCurrentOrCompletedLesson) {
        return progressByCurrentOrCompletedLesson;
    }
    const course = await CourseModel.findOne({
        "sections.lessons.id": lessonId,
    }).exec();
    if (!course) {
        return null;
    }
    return ProgressModel.findOne({ userId, courseId: String(course._id) }).exec();
}
export async function getVideoPositionByLesson(userId, lessonId) {
    const progressDoc = await findProgressByLesson(userId, lessonId);
    if (!progressDoc) {
        return 0;
    }
    const lessonPositions = normalizeLessonPositionMap(progressDoc.lessonPositions);
    const lessonPosition = Number(lessonPositions.get(lessonId));
    if (!Number.isNaN(lessonPosition) && lessonPosition >= 0) {
        return lessonPosition;
    }
    return Number(progressDoc.lastVideoPosition !== null && progressDoc.lastVideoPosition !== void 0 ? progressDoc.lastVideoPosition : 0);
}
export async function updateVideoPositionByLesson(userId, lessonId, position) {
    const progressDoc = await findProgressByLesson(userId, lessonId);
    if (!progressDoc) {
        throw new NotFoundError("Progress not found for lesson");
    }
    const course = await getCourseById(String(progressDoc.courseId));
    ensureLessonBelongsToCourse(course, lessonId);
    const lessonPositions = normalizeLessonPositionMap(progressDoc.lessonPositions);
    lessonPositions.set(lessonId, position);
    progressDoc.lessonPositions = lessonPositions;
    progressDoc.currentLessonId = lessonId;
    progressDoc.lastVideoPosition = position;
    await progressDoc.save();
    return progressDoc.toObject({ virtuals: true });
}
export async function hasAccess(userId, courseId) {
    await connectToDatabase();
    const [progressExisted, enrollmentExisted] = await Promise.all([
        ProgressModel.exists({ userId, courseId }),
        hasActiveEnrollment(userId, courseId),
    ]);
    return Boolean(progressExisted) || Boolean(enrollmentExisted);
}
