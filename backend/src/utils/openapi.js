const jsonContent = {
  "application/json": {
    schema: {
      $ref: "#/components/schemas/ApiEnvelope",
    },
  },
};

const okResponse = {
  description: "Success",
  content: jsonContent,
};

const badRequestResponse = {
  description: "Bad request",
  content: jsonContent,
};

const unauthorizedResponse = {
  description: "Unauthorized",
  content: jsonContent,
};

const forbiddenResponse = {
  description: "Forbidden",
  content: jsonContent,
};

const notFoundResponse = {
  description: "Not found",
  content: jsonContent,
};

const tooManyRequestsResponse = {
  description: "Too many requests",
  content: jsonContent,
};

const authSecurity = [{ bearerAuth: [] }];
const adminSecurity = [{ bearerAuth: [] }];

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "EduLearn Backend API",
    version: "1.0.0",
    description:
      "Next.js (Node.js) backend migrated from Java Spring Boot. All responses follow { success, message, data, timestamp }.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Auth" },
    { name: "Courses" },
    { name: "Categories" },
    { name: "Cart" },
    { name: "Enrollments" },
    { name: "Orders" },
    { name: "Progress" },
    { name: "Reviews" },
    { name: "Upload" },
    { name: "Admin" },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "429": tooManyRequestsResponse,
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "400": badRequestResponse,
          "429": tooManyRequestsResponse,
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Update current user profile",
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "429": tooManyRequestsResponse,
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "429": tooManyRequestsResponse,
        },
      },
    },
    "/api/auth/change-password": {
      put: {
        tags: ["Auth"],
        summary: "Change password",
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "429": tooManyRequestsResponse,
        },
      },
    },
    "/api/auth/sessions": {
      get: {
        tags: ["Auth"],
        summary: "Get my login sessions",
        security: authSecurity,
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Revoke all my sessions",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/auth/sessions/{id}": {
      delete: {
        tags: ["Auth"],
        summary: "Revoke one session",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/courses": {
      get: {
        tags: ["Courses"],
        summary: "Get published courses",
        parameters: [
          {
            in: "query",
            name: "category",
            schema: { type: "string" },
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 0, default: 0 },
          },
          {
            in: "query",
            name: "size",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 12 },
          },
          {
            in: "query",
            name: "sort",
            schema: {
              type: "string",
              enum: ["newest", "price_asc", "price_desc", "rating", "popular"],
              default: "newest",
            },
          },
        ],
        responses: {
          "200": okResponse,
        },
      },
    },
    "/api/courses/featured": {
      get: {
        tags: ["Courses"],
        summary: "Get featured courses",
        responses: {
          "200": okResponse,
        },
      },
    },
    "/api/courses/categories": {
      get: {
        tags: ["Courses"],
        summary: "Get published categories",
        responses: {
          "200": okResponse,
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get active categories",
        responses: {
          "200": okResponse,
        },
      },
    },
    "/api/courses/{slug}": {
      get: {
        tags: ["Courses"],
        summary: "Get course detail by slug",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/courses/id/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Get course by ID (admin)",
        security: adminSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get my cart",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear my cart",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Add course to my cart",
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartItemRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/cart/items/{courseId}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove course from my cart",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "courseId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/enrollments/me": {
      get: {
        tags: ["Enrollments"],
        summary: "Get my enrollments",
        security: authSecurity,
        parameters: [
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "REVOKED"] } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Get my orders",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Checkout",
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckoutRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/orders/me": {
      get: {
        tags: ["Orders"],
        summary: "Get my orders (alias)",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/orders/{orderId}": {
      get: {
        tags: ["Orders"],
        summary: "Get my order by ID",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "orderId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/progress/my-learning": {
      get: {
        tags: ["Progress"],
        summary: "Get my learning courses",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/progress/courses": {
      get: {
        tags: ["Progress"],
        summary: "Get my learning courses (alias)",
        security: authSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/progress/{courseId}": {
      get: {
        tags: ["Progress"],
        summary: "Get progress by course ID",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "courseId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/progress/{courseId}/lesson/{lessonId}": {
      put: {
        tags: ["Progress"],
        summary: "Mark lesson complete",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "courseId",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "path",
            name: "lessonId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/progress/complete": {
      post: {
        tags: ["Progress"],
        summary: "Mark lesson complete (body)",
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompleteLessonRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/progress/position/{lessonId}": {
      get: {
        tags: ["Progress"],
        summary: "Get video position by lesson ID",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "lessonId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
      post: {
        tags: ["Progress"],
        summary: "Update video position by lesson ID",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "lessonId",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VideoPositionRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/progress/{courseId}/video-position": {
      put: {
        tags: ["Progress"],
        summary: "Update video position by course and lesson",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "courseId",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "query",
            name: "lessonId",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "query",
            name: "position",
            required: true,
            schema: { type: "integer", minimum: 0 },
          },
        ],
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create or update my review",
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReviewRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "201": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/reviews/course/{courseId}": {
      get: {
        tags: ["Reviews"],
        summary: "Get published reviews by course",
        parameters: [
          {
            in: "path",
            name: "courseId",
            required: true,
            schema: { type: "string" },
          },
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": okResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/reviews/{id}": {
      delete: {
        tags: ["Reviews"],
        summary: "Delete review by ID",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/upload": {
      get: {
        tags: ["Upload"],
        summary: "Get my uploaded files",
        security: authSecurity,
        parameters: [
          { in: "query", name: "purpose", schema: { type: "string", enum: ["GENERAL", "AVATAR", "COURSE_THUMBNAIL"] } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
        },
      },
      post: {
        tags: ["Upload"],
        summary: "Upload image file",
        security: authSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                  },
                  purpose: {
                    type: "string",
                    enum: ["GENERAL", "AVATAR", "COURSE_THUMBNAIL"],
                    default: "GENERAL",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
        },
      },
    },
    "/api/upload/{id}": {
      delete: {
        tags: ["Upload"],
        summary: "Delete uploaded file",
        security: authSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/admin/categories": {
      get: {
        tags: ["Admin"],
        summary: "Get admin categories",
        security: adminSecurity,
        parameters: [
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "isActive", schema: { type: "boolean" } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Create category",
        security: adminSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryRequest" },
            },
          },
        },
        responses: {
          "201": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
    },
    "/api/admin/categories/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Update category",
        security: adminSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete category",
        security: adminSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Get dashboard stats",
        security: adminSecurity,
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
    },
    "/api/admin/courses": {
      get: {
        tags: ["Admin"],
        summary: "Get admin courses",
        security: adminSecurity,
        parameters: [
          { in: "query", name: "status", schema: { type: "string" } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Create course",
        security: adminSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CourseRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
    },
    "/api/admin/courses/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Update course",
        security: adminSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CourseRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete course",
        security: adminSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
    },
    "/api/admin/orders": {
      get: {
        tags: ["Admin"],
        summary: "Get admin orders",
        security: adminSecurity,
        parameters: [
          { in: "query", name: "status", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
    },
    "/api/admin/orders/{id}/status": {
      patch: {
        tags: ["Admin"],
        summary: "Update order status (PATCH body)",
        security: adminSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" },
            },
          },
        },
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
      put: {
        tags: ["Admin"],
        summary: "Update order status (PUT query)",
        security: adminSecurity,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "query",
            name: "status",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": okResponse,
          "400": badRequestResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
          "404": notFoundResponse,
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Get admin users",
        security: adminSecurity,
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 0, default: 0 } },
          { in: "query", name: "size", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": okResponse,
          "401": unauthorizedResponse,
          "403": forbiddenResponse,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", nullable: true },
          data: {
            description: "Endpoint-specific payload",
            nullable: true,
          },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string", example: "Nguyen Van A" },
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", example: "Aa@123456" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", example: "Aa@123456" },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "newPassword"],
        properties: {
          token: { type: "string" },
          newPassword: { type: "string", example: "Bb@123456" },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string", example: "Aa@123456" },
          newPassword: { type: "string", example: "Bb@123456" },
        },
      },
      UpdateProfileRequest: {
        type: "object",
        required: ["fullName"],
        properties: {
          fullName: { type: "string", example: "Nguyen Van B" },
          avatarUrl: {
            type: "string",
            nullable: true,
            description: "Supports absolute URL (http/https) or root-relative path like /uploads/...",
          },
        },
      },
      CheckoutRequest: {
        type: "object",
        required: ["courseIds", "paymentMethod"],
        properties: {
          courseIds: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
          paymentMethod: {
            type: "string",
            enum: ["CARD", "MOMO", "BANK_TRANSFER"],
          },
        },
      },
      CompleteLessonRequest: {
        type: "object",
        required: ["courseId", "lessonId"],
        properties: {
          courseId: { type: "string" },
          lessonId: { type: "string" },
        },
      },
      VideoPositionRequest: {
        type: "object",
        required: ["position"],
        properties: {
          position: { type: "integer", minimum: 0, example: 120 },
        },
      },
      CourseRequest: {
        type: "object",
        required: ["title", "price"],
        properties: {
          title: { type: "string", example: "Node.js Masterclass" },
          description: { type: "string", nullable: true },
          thumbnail: { type: "string", nullable: true, example: "https://example.com/image.jpg" },
          category: { type: "string", nullable: true, example: "Backend" },
          level: { type: "string", nullable: true, example: "beginner" },
          instructor: { type: "string", nullable: true, example: "Instructor A" },
          price: { type: "number", minimum: 0, example: 499000 },
          originalPrice: { type: "number", minimum: 0, nullable: true, example: 799000 },
          isPublished: { type: "boolean", default: false },
        },
      },
      CategoryRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Frontend" },
          description: { type: "string", nullable: true, example: "Client-side development" },
          isActive: { type: "boolean", default: true },
        },
      },
      ReviewRequest: {
        type: "object",
        required: ["courseId", "rating"],
        properties: {
          courseId: { type: "string" },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", nullable: true, example: "Very practical course." },
        },
      },
      CartItemRequest: {
        type: "object",
        required: ["courseId"],
        properties: {
          courseId: { type: "string" },
        },
      },
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["PENDING", "COMPLETED", "REFUNDED", "CANCELLED"],
          },
        },
      },
      MediaAsset: {
        type: "object",
        properties: {
          id: { type: "string" },
          ownerUserId: { type: "string" },
          originalName: { type: "string" },
          mimeType: { type: "string", example: "image/png" },
          extension: { type: "string", example: "png" },
          sizeBytes: { type: "number", example: 102400 },
          relativePath: { type: "string", example: "uploads/general/2026/03/1710000000000-uuid.png" },
          publicUrl: { type: "string", example: "/uploads/general/2026/03/1710000000000-uuid.png" },
          purpose: { type: "string", enum: ["GENERAL", "AVATAR", "COURSE_THUMBNAIL"] },
          status: { type: "string", enum: ["ACTIVE", "DELETED"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
  },
};
