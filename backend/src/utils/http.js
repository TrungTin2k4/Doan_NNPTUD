import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { buildCorsHeaders } from "@/utils/cors";
import { AppError, ValidationError } from "@/utils/errors";
function mapZodError(error) {
    const fieldErrors = {};
    for (const issue of error.issues) {
        const key = issue.path.length > 0 ? String(issue.path[0]) : "request";
        if (!fieldErrors[key]) {
            fieldErrors[key] = issue.message;
        }
    }
    return fieldErrors;
}
function buildSuccessPayload(data, message) {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}
function buildErrorPayload(message, data) {
    return {
        success: false,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}
function isMongooseCastError(error) {
    return Boolean(error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "CastError");
}
function makeJsonResponse(request, payload, status, extraHeaders) {
    const headers = buildCorsHeaders(request);
    if (extraHeaders) {
        for (const [key, value] of Object.entries(extraHeaders)) {
            headers.set(key, value);
        }
    }
    return NextResponse.json(payload, {
        status,
        headers,
    });
}
export function ok(request, data, message, status = 200) {
    return makeJsonResponse(request, buildSuccessPayload(data, message), status);
}
export function fail(request, status, message, data, extraHeaders) {
    return makeJsonResponse(request, buildErrorPayload(message, data), status, extraHeaders);
}
export function handleError(request, error) {
    if (error instanceof ValidationError) {
        return fail(request, error.status, error.message, error.data);
    }
    if (error instanceof ZodError) {
        return fail(request, 400, "Validation failed", mapZodError(error));
    }
    if (error instanceof AppError) {
        return fail(request, error.status, error.message, error.data, error.headers);
    }
    if (isMongooseCastError(error)) {
        return fail(request, 400, "Invalid request parameters");
    }
    if (error instanceof SyntaxError) {
        return fail(request, 400, "Invalid request body");
    }
    console.error("Unexpected server error", error);
    return fail(request, 500, "An unexpected error occurred");
}
export async function withErrorHandling(request, handler) {
    try {
        return await handler();
    }
    catch (error) {
        return handleError(request, error);
    }
}
