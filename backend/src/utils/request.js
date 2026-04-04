import { BadRequestError, ValidationError } from "@/utils/errors";
export async function parseJsonBody(request) {
    try {
        return await request.json();
    }
    catch (_a) {
        throw new BadRequestError("Invalid request body");
    }
}
export function validateBody(schema, body) {
    const parsed = schema.safeParse(body);
    if (parsed.success) {
        return parsed.data;
    }
    const errors = {};
    for (const issue of parsed.error.issues) {
        const key = issue.path.length > 0 ? String(issue.path[0]) : "request";
        if (!errors[key]) {
            errors[key] = issue.message;
        }
    }
    throw new ValidationError(errors);
}
export function parsePageParam(raw, defaultValue) {
    const value = raw == null || raw === "" ? defaultValue : Number(raw);
    if (!Number.isInteger(value) || value < 0) {
        throw new BadRequestError("Invalid request parameters");
    }
    return value;
}
export function parseSizeParam(raw, defaultValue) {
    const value = raw == null || raw === "" ? defaultValue : Number(raw);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
        throw new BadRequestError("Invalid request parameters");
    }
    return value;
}
