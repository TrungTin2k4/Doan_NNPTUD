import { randomUUID } from "crypto";
export function normalizeText(value) {
    if (value == null) {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
export function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function generateEntityId() {
    return randomUUID();
}
export function generateSlugFromTitle(title) {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    return `${baseSlug}-${randomUUID().slice(0, 8)}`;
}
export function serializeDoc(doc) {
    return doc.toObject({ virtuals: true });
}
