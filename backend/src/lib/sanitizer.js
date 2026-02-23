import { BadRequestError } from "@/lib/errors";
const URL_PROTOCOLS = new Set(["http:", "https:"]);
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
export function sanitizeHttpUrl(value, fieldName) {
    if (value == null) {
        return null;
    }
    const trimmed = String(value).trim();
    if (!trimmed) {
        return null;
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
