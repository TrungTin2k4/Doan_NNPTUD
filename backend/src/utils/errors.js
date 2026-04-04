export class AppError extends Error {
    constructor(status, message, data, headers) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.data = data;
        this.headers = headers;
    }
}
export class BadRequestError extends AppError {
    constructor(message, data) {
        super(400, message, data);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(401, message);
    }
}
export class InvalidCredentialsError extends AppError {
    constructor() {
        super(401, "Invalid email or password");
    }
}
export class ForbiddenError extends AppError {
    constructor(message = "You do not have permission to perform this action") {
        super(403, message);
    }
}
export class NotFoundError extends AppError {
    constructor(message) {
        super(404, message);
    }
}
export class ValidationError extends AppError {
    constructor(errors) {
        super(400, "Validation failed", errors);
    }
}
export class TooManyRequestsError extends AppError {
    constructor(retryAfterSeconds) {
        super(429, "Too many requests, please try again later", undefined, { "Retry-After": String(Math.max(1, retryAfterSeconds)) });
    }
}
