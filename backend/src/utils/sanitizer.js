import { BadRequestError } from "@/utils/errors";
const URL_PROTOCOLS = new Set(["http:", "https:"]);
function isRootRelativePath(value) {
    if (!value.startsWith("/")) {
        return false;
    }
    if (value.startsWith("//")) {
        return false;
    }
    return !/\s/.test(value);
}
function stripHtml(value) {
    return value.replace(/<[^>]*>/g, "");
}
export function sanitizePlainText(value) {
    if (value == null) {
        return null;
    }
    const cleaned = stripHtml(String(value)).trim();
    return cleaned.length > 0 ? cleaned : null;
}
export function sanitizeHttpUrl(value, fieldName, options) {
    var _a;
    if (value == null) {
        return null;
    }
    const trimmed = String(value).trim();
    if (!trimmed) {
        return null;
    }
    const allowRelativePath = ((_a = options === null || options === void 0 ? void 0 : options.allowRelativePath) !== null && _a !== void 0 ? _a : false) === true;
    if (allowRelativePath && isRootRelativePath(trimmed)) {
        return trimmed;
    }
    let parsed;
    try {
        parsed = new URL(trimmed);
    }
    catch (_a) {
        throw new BadRequestError(`Invalid URL for ${fieldName}`);
    }
    if (!URL_PROTOCOLS.has(parsed.protocol)) {
        throw new BadRequestError(`${fieldName} must use http or https`);
    }
    return trimmed;
}
