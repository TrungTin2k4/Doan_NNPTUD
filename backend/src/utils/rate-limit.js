import { LRUCache } from "lru-cache";
import { TooManyRequestsError } from "@/utils/errors";
const buckets = new LRUCache({
    max: 50000,
    ttl: 60 * 60 * 1000,
});
function resolveClientIp(request) {
    var _a, _b;
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const first = (_a = forwardedFor.split(",")[0]) === null || _a === void 0 ? void 0 : _a.trim();
        if (first) {
            return first;
        }
    }
    const realIp = (_b = request.headers.get("x-real-ip")) === null || _b === void 0 ? void 0 : _b.trim();
    if (realIp) {
        return realIp;
    }
    return "unknown";
}
function consume(rule, request) {
    var _a, _b;
    const now = Date.now();
    const key = `${rule.method}:${rule.path}:${resolveClientIp(request)}`;
    const history = (_a = buckets.get(key)) !== null && _a !== void 0 ? _a : [];
    const threshold = now - rule.durationMs;
    const recent = history.filter((time) => time > threshold);
    if (recent.length >= rule.capacity) {
        const oldest = (_b = recent[0]) !== null && _b !== void 0 ? _b : now;
        const retryAfterSeconds = Math.max(1, Math.ceil((oldest + rule.durationMs - now) / 1000));
        throw new TooManyRequestsError(retryAfterSeconds);
    }
    recent.push(now);
    buckets.set(key, recent);
}
const RULES = [
    { method: "POST", path: "/api/auth/login", capacity: 5, durationMs: 60000 },
    { method: "POST", path: "/api/auth/register", capacity: 5, durationMs: 10 * 60000 },
    { method: "POST", path: "/api/auth/forgot-password", capacity: 3, durationMs: 15 * 60000 },
    { method: "POST", path: "/api/auth/reset-password", capacity: 5, durationMs: 15 * 60000 },
    { method: "PUT", path: "/api/auth/change-password", capacity: 5, durationMs: 15 * 60000 },
];
export function enforceAuthRateLimit(request) {
    const pathname = request.nextUrl.pathname;
    const method = request.method.toUpperCase();
    const rule = RULES.find((candidate) => candidate.method === method && candidate.path === pathname);
    if (!rule) {
        return;
    }
    consume(rule, request);
}
