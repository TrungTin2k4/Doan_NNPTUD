import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/utils/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/errors";
import { MediaAssetModel } from "@/schemas/media-asset";
import { normalizeText } from "@/utils";

const DEFAULT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const SUPPORTED_PURPOSES = new Set(["GENERAL", "AVATAR", "COURSE_THUMBNAIL"]);
const SUPPORTED_IMAGE_MIME_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
]);

function resolveUploadMaxBytes() {
    const raw = process.env.UPLOAD_MAX_FILE_SIZE_BYTES;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_UPLOAD_MAX_BYTES;
    }
    return Math.floor(parsed);
}

function parseUploadPurpose(rawPurpose, defaultValue = "GENERAL") {
    const normalized = normalizeText(rawPurpose);
    if (!normalized) {
        return defaultValue;
    }
    const purpose = normalized.toUpperCase().replace(/[-\s]+/g, "_");
    if (!SUPPORTED_PURPOSES.has(purpose)) {
        throw new BadRequestError(`Unsupported upload purpose: ${rawPurpose}`);
    }
    return purpose;
}

function parseFileExtension(name) {
    const ext = path.extname(name).replace(".", "").trim().toLowerCase();
    if (!ext) {
        return null;
    }
    return ext;
}

function resolveFileExtension(fileName, mimeType) {
    const fromMime = SUPPORTED_IMAGE_MIME_TYPES.get(mimeType);
    if (fromMime) {
        return fromMime;
    }
    const fromName = parseFileExtension(fileName);
    if (fromName) {
        return fromName;
    }
    throw new BadRequestError("Cannot determine file extension");
}

function sanitizeOriginalName(name) {
    const normalized = normalizeText(name);
    if (!normalized) {
        return "uploaded-file";
    }
    return normalized.replace(/[\u0000-\u001f]/g, "").slice(0, 255);
}

function ensureUploadFile(file) {
    if (!file || typeof file !== "object") {
        throw new BadRequestError("File is required");
    }
    if (!("arrayBuffer" in file) || typeof file.arrayBuffer !== "function") {
        throw new BadRequestError("Invalid upload file");
    }
    const size = Number(file.size);
    if (!Number.isFinite(size) || size <= 0) {
        throw new BadRequestError("File cannot be empty");
    }
    const mimeType = normalizeText(file.type);
    if (!mimeType) {
        throw new BadRequestError("File type is required");
    }
    const loweredMimeType = mimeType.toLowerCase();
    if (!SUPPORTED_IMAGE_MIME_TYPES.has(loweredMimeType)) {
        throw new BadRequestError("Only image uploads are supported");
    }
    return {
        size,
        mimeType: loweredMimeType,
        name: sanitizeOriginalName(typeof file.name === "string" ? file.name : "uploaded-file"),
    };
}

function resolveFileStoragePaths(purpose, extension) {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const relativePath = path.posix.join("uploads", purpose.toLowerCase(), year, month, fileName);
    const absolutePath = path.join(process.cwd(), "public", ...relativePath.split("/"));
    return {
        relativePath,
        absolutePath,
        publicUrl: `/api/${relativePath}`,
    };
}

export async function uploadMediaAsset(input) {
    await connectToDatabase();
    const ownerUserId = normalizeText(input.ownerUserId);
    if (!ownerUserId) {
        throw new BadRequestError("Invalid owner user ID");
    }
    const purpose = parseUploadPurpose(input.purpose);
    const fileMeta = ensureUploadFile(input.file);
    const maxBytes = resolveUploadMaxBytes();
    if (fileMeta.size > maxBytes) {
        throw new BadRequestError(`File is too large. Maximum size is ${maxBytes} bytes`);
    }
    const extension = resolveFileExtension(fileMeta.name, fileMeta.mimeType);
    const filePaths = resolveFileStoragePaths(purpose, extension);
    await mkdir(path.dirname(filePaths.absolutePath), { recursive: true });
    const bytes = await input.file.arrayBuffer();
    await writeFile(filePaths.absolutePath, Buffer.from(bytes));
    const mediaAsset = await MediaAssetModel.create({
        ownerUserId,
        originalName: fileMeta.name,
        mimeType: fileMeta.mimeType,
        extension,
        sizeBytes: fileMeta.size,
        relativePath: filePaths.relativePath,
        publicUrl: filePaths.publicUrl,
        purpose,
        status: "ACTIVE",
    });
    return mediaAsset.toObject({ virtuals: true });
}

export async function getMyMediaAssets(ownerUserId, params) {
    await connectToDatabase();
    const normalizedOwnerUserId = normalizeText(ownerUserId);
    if (!normalizedOwnerUserId) {
        throw new BadRequestError("Invalid owner user ID");
    }
    const page = params.page;
    const size = params.size;
    const filter = {
        ownerUserId: normalizedOwnerUserId,
        status: "ACTIVE",
    };
    if (params.purpose) {
        filter.purpose = parseUploadPurpose(params.purpose);
    }
    const [totalItems, docs] = await Promise.all([
        MediaAssetModel.countDocuments(filter).exec(),
        MediaAssetModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(page * size)
            .limit(size)
            .exec(),
    ]);
    return {
        assets: docs.map((doc) => doc.toObject({ virtuals: true })),
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalItems / size)),
        totalItems,
    };
}

async function removeStoredFile(relativePath) {
    if (!relativePath) {
        return;
    }
    const absolutePath = path.join(process.cwd(), "public", ...relativePath.split("/"));
    try {
        await unlink(absolutePath);
    }
    catch (error) {
        if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
            throw error;
        }
    }
}

export async function deleteMediaAssetById(actor, mediaAssetId) {
    await connectToDatabase();
    const mediaAsset = await MediaAssetModel.findById(mediaAssetId).exec();
    if (!mediaAsset || mediaAsset.status === "DELETED") {
        throw new NotFoundError("Media asset not found");
    }
    const isAdmin = actor.role === "ADMIN";
    const isOwner = mediaAsset.ownerUserId === actor.id;
    if (!isAdmin && !isOwner) {
        throw new ForbiddenError();
    }
    mediaAsset.status = "DELETED";
    mediaAsset.deletedAt = new Date();
    await mediaAsset.save();
    await removeStoredFile(String(mediaAsset.relativePath));
    return mediaAsset.toObject({ virtuals: true });
}
