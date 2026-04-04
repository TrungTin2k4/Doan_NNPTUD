import { connectToDatabase } from "@/utils/db";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { CourseModel } from "@/schemas/course";
import { sanitizeHttpUrl, sanitizePlainText } from "@/utils/sanitizer";
import { escapeRegex, generateEntityId, generateSlugFromTitle, normalizeText } from "@/utils";
const DEFAULT_SORT = { createdAt: -1 };
function toCourseSummary(course) {
    return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        instructor: course.instructor,
        price: course.price,
        originalPrice: course.originalPrice,
        duration: course.duration,
        studentsCount: course.studentsCount,
        rating: course.rating,
        reviewsCount: course.reviewsCount,
    };
}
function toPublicCourseDetail(course) {
    const sections = Array.isArray(course.sections)
        ? course.sections.map((section) => ({
            id: section.id,
            title: section.title,
            lessons: Array.isArray(section.lessons)
                ? section.lessons.map((lesson) => {
                    var _a;
                    return ({
                        id: lesson.id,
                        title: lesson.title,
                        duration: lesson.duration,
                        isPreview: lesson.isPreview === true,
                        videoUrl: lesson.isPreview === true ? (_a = lesson.videoUrl) !== null && _a !== void 0 ? _a : null : null,
                    });
                })
                : [],
        }))
        : [];
    return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        instructor: course.instructor,
        price: course.price,
        originalPrice: course.originalPrice,
        duration: course.duration,
        studentsCount: course.studentsCount,
        rating: course.rating,
        reviewsCount: course.reviewsCount,
        sections,
    };
}
function resolveSort(sortBy) {
    if (sortBy === "price_asc") {
        return { price: 1 };
    }
    if (sortBy === "price_desc") {
        return { price: -1 };
    }
    if (sortBy === "rating") {
        return { rating: -1 };
    }
    if (sortBy === "popular") {
        return { studentsCount: -1 };
    }
    return DEFAULT_SORT;
}
function requiredText(value, errorMessage) {
    const sanitized = sanitizePlainText(value);
    if (!sanitized) {
        throw new BadRequestError(errorMessage);
    }
    return sanitized;
}
function optionalText(value) {
    return sanitizePlainText(value);
}
function parseCourseStatusOrNull(rawStatus) {
    const normalized = normalizeText(rawStatus !== null && rawStatus !== void 0 ? rawStatus : null);
    if (!normalized) {
        return null;
    }
    const upper = normalized.toUpperCase();
    if (upper === "DRAFT" || upper === "PUBLISHED") {
        return upper;
    }
    throw new BadRequestError(`Invalid course status: ${rawStatus}`);
}
function safeDuration(duration) {
    if (duration == null) {
        return 0;
    }
    if (duration < 0) {
        throw new BadRequestError("Duration must be greater than or equal to 0");
    }
    return duration;
}
function mapSections(sections) {
    if (!sections) {
        return [];
    }
    return sections.map((section) => {
        var _a, _b;
        return ({
            id: generateEntityId(),
            title: requiredText((_a = section.title) !== null && _a !== void 0 ? _a : null, "Section title is required"),
            lessons: ((_b = section.lessons) !== null && _b !== void 0 ? _b : []).map((lesson) => {
                var _a, _b;
                return ({
                    id: generateEntityId(),
                    title: requiredText((_a = lesson.title) !== null && _a !== void 0 ? _a : null, "Lesson title is required"),
                    videoUrl: sanitizeHttpUrl((_b = lesson.videoUrl) !== null && _b !== void 0 ? _b : null, "videoUrl"),
                    duration: safeDuration(lesson.duration),
                    isPreview: lesson.isPreview === true,
                });
            }),
        });
    });
}
function calculateDuration(sections) {
    return sections
        .flatMap((section) => (Array.isArray(section.lessons) ? section.lessons : []))
        .reduce((sum, lesson) => { var _a; return sum + ((_a = lesson.duration) !== null && _a !== void 0 ? _a : 0); }, 0);
}
export function countLessons(course) {
    const sections = Array.isArray(course.sections) ? course.sections : [];
    return sections.reduce((sum, section) => {
        const lessons = Array.isArray(section.lessons) ? section.lessons.length : 0;
        return sum + lessons;
    }, 0);
}
export async function getPublishedCourses(params) {
    await connectToDatabase();
    const categoryFilter = normalizeText(params.category);
    const searchFilter = normalizeText(params.search);
    const hasCategory = categoryFilter && categoryFilter.toLowerCase() !== "all";
    const hasSearch = Boolean(searchFilter);
    const filter = { status: "PUBLISHED" };
    if (hasCategory) {
        filter.category = { $regex: `^${escapeRegex(categoryFilter)}$`, $options: "i" };
    }
    if (hasSearch) {
        filter.title = { $regex: escapeRegex(searchFilter), $options: "i" };
    }
    const [totalItems, docs] = await Promise.all([
        CourseModel.countDocuments(filter).exec(),
        CourseModel.find(filter)
            .sort(resolveSort(params.sort))
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalItems / params.size));
    const courses = docs.map((doc) => toCourseSummary(doc.toObject({ virtuals: true })));
    return {
        courses,
        currentPage: params.page,
        totalPages,
        totalItems,
    };
}
export async function getFeaturedCourses() {
    await connectToDatabase();
    const docs = await CourseModel.find({ status: "PUBLISHED" })
        .sort({ rating: -1 })
        .limit(6)
        .exec();
    return docs.map((doc) => toCourseSummary(doc.toObject({ virtuals: true })));
}
export async function getPublishedCategories() {
    await connectToDatabase();
    const docs = await CourseModel.find({
        status: "PUBLISHED",
        category: { $nin: [null, ""] },
    })
        .sort({ category: 1 })
        .select({ category: 1 })
        .exec();
    const categories = docs
        .map((doc) => {
        const category = typeof doc.category === "string" ? doc.category : null;
        return normalizeText(category);
    })
        .filter((category) => Boolean(category));
    return Array.from(new Set(categories));
}
export async function getCourseBySlugPublic(slug) {
    await connectToDatabase();
    const course = await CourseModel.findOne({ slug, status: "PUBLISHED" }).exec();
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    return toPublicCourseDetail(course.toObject({ virtuals: true }));
}
export async function getCourseById(id) {
    await connectToDatabase();
    const course = await CourseModel.findById(id).exec();
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    return course.toObject({ virtuals: true });
}
export async function getCoursesByIds(ids) {
    await connectToDatabase();
    if (ids.length === 0) {
        return [];
    }
    const docs = await CourseModel.find({ _id: { $in: ids } }).exec();
    return docs.map((doc) => doc.toObject({ virtuals: true }));
}
export async function getPublishedCoursesByIds(ids) {
    await connectToDatabase();
    if (ids.length === 0) {
        return [];
    }
    const docs = await CourseModel.find({ _id: { $in: ids }, status: "PUBLISHED" }).exec();
    return docs.map((doc) => doc.toObject({ virtuals: true }));
}
export async function getAllCoursesForAdmin(params) {
    await connectToDatabase();
    const filter = {};
    const status = parseCourseStatusOrNull(params.status);
    const category = normalizeText(params.category);
    const search = normalizeText(params.search);
    if (status) {
        filter.status = status;
    }
    if (category) {
        filter.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
    }
    if (search) {
        filter.title = { $regex: escapeRegex(search), $options: "i" };
    }
    const [totalItems, docs] = await Promise.all([
        CourseModel.countDocuments(filter).exec(),
        CourseModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalItems / params.size));
    return {
        courses: docs.map((doc) => doc.toObject({ virtuals: true })),
        currentPage: params.page,
        totalPages,
        totalItems,
    };
}
export async function createCourse(input) {
    var _a, _b;
    await connectToDatabase();
    const title = requiredText(input.title, "Title is required");
    const sections = mapSections(input.sections);
    const course = await CourseModel.create({
        title,
        slug: generateSlugFromTitle(title),
        description: optionalText(input.description),
        thumbnail: sanitizeHttpUrl(input.thumbnail, "thumbnail", { allowRelativePath: true }),
        category: optionalText(input.category),
        level: (_a = optionalText(input.level)) !== null && _a !== void 0 ? _a : "beginner",
        instructor: optionalText(input.instructor),
        price: input.price,
        originalPrice: (_b = input.originalPrice) !== null && _b !== void 0 ? _b : null,
        status: input.isPublished === true ? "PUBLISHED" : "DRAFT",
        sections,
        duration: calculateDuration(sections),
    });
    return course.toObject({ virtuals: true });
}
export async function updateCourse(id, input) {
    var _a, _b;
    await connectToDatabase();
    const course = await CourseModel.findById(id).exec();
    if (!course) {
        throw new NotFoundError("Course not found");
    }
    course.title = requiredText(input.title, "Title is required");
    course.description = optionalText(input.description);
    course.thumbnail = sanitizeHttpUrl(input.thumbnail, "thumbnail", { allowRelativePath: true });
    course.category = optionalText(input.category);
    course.level = (_a = optionalText(input.level)) !== null && _a !== void 0 ? _a : "beginner";
    course.instructor = optionalText(input.instructor);
    course.price = input.price;
    course.originalPrice = (_b = input.originalPrice) !== null && _b !== void 0 ? _b : null;
    course.status = input.isPublished === true ? "PUBLISHED" : "DRAFT";
    if (input.sections !== undefined) {
        const sections = mapSections(input.sections);
        course.sections = sections;
        course.duration = calculateDuration(sections);
    }
    await course.save();
    return course.toObject({ virtuals: true });
}
export async function deleteCourse(id) {
    await connectToDatabase();
    await CourseModel.deleteOne({ _id: id }).exec();
}
export async function countPublishedCourses() {
    await connectToDatabase();
    return CourseModel.countDocuments({ status: "PUBLISHED" }).exec();
}
