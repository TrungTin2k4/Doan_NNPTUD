import { connectToDatabase } from "@/utils/db";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import { CategoryModel } from "@/schemas/category";
import { sanitizePlainText } from "@/utils/sanitizer";
import { escapeRegex, generateSlugFromTitle, normalizeText } from "@/utils";

function parseRequiredName(name) {
    const normalized = sanitizePlainText(name);
    if (!normalized) {
        throw new BadRequestError("Category name is required");
    }
    return normalized;
}

function parseOptionalBooleanFilter(raw) {
    const normalized = normalizeText(raw);
    if (!normalized) {
        return null;
    }
    if (normalized.toLowerCase() === "true") {
        return true;
    }
    if (normalized.toLowerCase() === "false") {
        return false;
    }
    throw new BadRequestError("isActive must be true or false");
}

function toCategoryResponse(doc) {
    return doc.toObject({ virtuals: true });
}

export async function getActiveCategories() {
    await connectToDatabase();
    const docs = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).exec();
    return docs.map((doc) => toCategoryResponse(doc));
}

export async function getAdminCategories(params) {
    await connectToDatabase();
    const filter = {};
    const search = normalizeText(params.search);
    if (search) {
        filter.name = { $regex: escapeRegex(search), $options: "i" };
    }
    const isActive = parseOptionalBooleanFilter(params.isActive);
    if (isActive !== null) {
        filter.isActive = isActive;
    }
    const [totalItems, docs] = await Promise.all([
        CategoryModel.countDocuments(filter).exec(),
        CategoryModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(params.page * params.size)
            .limit(params.size)
            .exec(),
    ]);
    return {
        categories: docs.map((doc) => toCategoryResponse(doc)),
        currentPage: params.page,
        totalPages: Math.max(1, Math.ceil(totalItems / params.size)),
        totalItems,
    };
}

export async function createCategory(actorUserId, input) {
    await connectToDatabase();
    const name = parseRequiredName(input.name);
    const existed = await CategoryModel.exists({ name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } });
    if (existed) {
        throw new BadRequestError("Category already exists");
    }
    const category = await CategoryModel.create({
        name,
        slug: generateSlugFromTitle(name),
        description: sanitizePlainText(input.description),
        isActive: input.isActive !== false,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
    });
    return toCategoryResponse(category);
}

export async function updateCategory(id, actorUserId, input) {
    await connectToDatabase();
    const category = await CategoryModel.findById(id).exec();
    if (!category) {
        throw new NotFoundError("Category not found");
    }
    const name = parseRequiredName(input.name);
    const duplicate = await CategoryModel.exists({
        _id: { $ne: id },
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    });
    if (duplicate) {
        throw new BadRequestError("Category already exists");
    }
    if (category.name !== name) {
        category.slug = generateSlugFromTitle(name);
    }
    category.name = name;
    category.description = sanitizePlainText(input.description);
    category.isActive = input.isActive !== false;
    category.updatedByUserId = actorUserId;
    await category.save();
    return toCategoryResponse(category);
}

export async function deleteCategory(id) {
    await connectToDatabase();
    const deleted = await CategoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
        throw new NotFoundError("Category not found");
    }
}
