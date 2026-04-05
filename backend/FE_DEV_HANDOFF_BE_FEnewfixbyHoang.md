# FE Dev Handoff - Backend Update by Hoang

## Scope

This handoff covers backend changes implemented to stabilize auth/progress flows, add upload support, and expand product modules needed by frontend.

## New Primary Models (now visible in backend/src/lib/models)

- `user.js`
- `course.js`
- `order.js`
- `progress.js`
- `password-reset-token.js`
- `media-asset.js`
- `category.js`
- `review.js`
- `enrollment.js` (new)
- `cart.js` (new)
- `user-session.js` (new)

Total model files in `backend/src/lib/models`: **11**.

## Key Backend Changes Relevant to FE

### 1) Auth and Session Behavior

- Login/register now create server-side sessions (`UserSession`) in addition to JWT.
- `requireAuth` now validates:
  - JWT validity
  - `tokenVersion`
  - active server session
- Logout revokes active sessions and token version.
- New session management endpoints:
  - `GET /api/auth/sessions`
  - `DELETE /api/auth/sessions` (revoke all)
  - `DELETE /api/auth/sessions/{id}` (revoke one)

### 2) Upload Module

- Media upload model/service/routes added.
- Endpoints:
  - `POST /api/upload` (multipart, field `file`, optional `purpose`)
  - `GET /api/upload`
  - `DELETE /api/upload/{id}`
- `avatarUrl` now supports root-relative paths (for uploaded files), e.g. `/uploads/avatar/...`.

### 3) Category and Review Modules

- Public categories:
  - `GET /api/categories`
- Admin category CRUD:
  - `GET /api/admin/categories`
  - `POST /api/admin/categories`
  - `PUT /api/admin/categories/{id}`
  - `DELETE /api/admin/categories/{id}`
- Reviews:
  - `POST /api/reviews` (create/update own review)
  - `GET /api/reviews/course/{courseId}`
  - `DELETE /api/reviews/{id}`

### 4) Enrollment Module (new)

- Enrollment records are created/activated when order is completed.
- Access checks now consider active enrollments.
- Endpoint:
  - `GET /api/enrollments/me`

### 5) Cart Module (new)

- Server-side cart added.
- Endpoints:
  - `GET /api/cart`
  - `DELETE /api/cart`
  - `POST /api/cart/items` with `{ "courseId": "..." }`
  - `DELETE /api/cart/items/{courseId}`

### 6) Progress and Order Fixes

- Progress now validates `lessonId` belongs to `courseId`.
- Progress percentage is clamped safely and avoids invalid over-100 states.
- Order completion uses safer atomic updates and now synchronizes enrollments.

## FE Integration Notes

1. Keep JWT token handling unchanged client-side, but expect session invalidation to cause `401` sooner if session revoked.
2. For profile avatar after upload, use returned `publicUrl` directly.
3. FE can move cart state from local-only to backend endpoints above (optional phased rollout).
4. Review flow should call `POST /api/reviews` for both create and update.
5. Learning access checks now align with enrollments generated after completed orders.

## Validation and Testing Status

- `npm run lint`: passed
- `npm run build`: passed
- Smoke test suite (`backend/scripts/api-smoke.mjs`): passed, including new sessions/cart/enrollments flows

## API Docs

- OpenAPI updated in `backend/src/lib/openapi.js`
- README updated in `backend/README.md`
