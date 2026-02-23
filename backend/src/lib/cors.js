import { NextResponse } from "next/server";
const DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:3000";
const DEFAULT_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
function parseList(value, fallback) {
    return (value !== null && value !== void 0 ? value : fallback)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}
export function buildCorsHeaders(request, allowedMethods) {
    var _a, _b, _c, _d;
    if (allowedMethods === void 0) { allowedMethods = (_a = process.env.CORS_ALLOWED_METHODS) !== null && _a !== void 0 ? _a : DEFAULT_METHODS; }
    const configuredOrigins = parseList(process.env.CORS_ALLOWED_ORIGINS, DEFAULT_ORIGINS);
    const requestOrigin = request.headers.get("origin");
    const allowCredentials = ((_b = process.env.CORS_ALLOW_CREDENTIALS) !== null && _b !== void 0 ? _b : "true").toLowerCase() === "true";
    const allowHeaders = (_c = process.env.CORS_ALLOWED_HEADERS) !== null && _c !== void 0 ? _c : "*";
    let allowOrigin = (_d = configuredOrigins[0]) !== null && _d !== void 0 ? _d : "*";
    if (configuredOrigins.includes("*")) {
        allowOrigin = "*";
    }
    else if (requestOrigin && configuredOrigins.includes(requestOrigin)) {
        allowOrigin = requestOrigin;
    }
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", allowOrigin);
    headers.set("Access-Control-Allow-Methods", allowedMethods);
    headers.set("Access-Control-Allow-Headers", allowHeaders);
    headers.set("Vary", "Origin");
    if (allowCredentials && allowOrigin !== "*") {
        headers.set("Access-Control-Allow-Credentials", "true");
    }
    return headers;
}
export function corsPreflight(request, allowedMethods) {
    var _a;
    if (allowedMethods === void 0) { allowedMethods = (_a = process.env.CORS_ALLOWED_METHODS) !== null && _a !== void 0 ? _a : DEFAULT_METHODS; }
    return new NextResponse(null, {
        status: 200,
        headers: buildCorsHeaders(request, allowedMethods),
    });
}
