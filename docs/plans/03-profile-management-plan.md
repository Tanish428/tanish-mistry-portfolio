# Profile Management — Implementation Plan

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Plan ID:** PLAN-03  
**Version:** 1.0  
**Related Specification:** `docs/specs/03-profile-management.md`  
**Previous Specification:** `docs/specs/02-admin-authentication.md`  
**Master Specification:** `docs/specs/00-project-overview.md`  
**Status:** Initial Draft  
**Phase:** Phase 2 — Profile Management

---

# 1. Implementation Objective

Implement the profile management module using the existing backend architecture.

The administrator must be able to:

- Create the initial profile.
- Retrieve profile information.
- Update profile information.
- Publish the profile.
- Unpublish the profile.

The public website must retrieve only published and visible profile information.

The implementation must reuse existing authentication, authorization, CSRF, database, and error-handling infrastructure.

# 2. Mandatory Pre-Implementation Checks

Before modifying files:

1. Read `AGENTS.md`.
2. Read all applicable `.agents/rules/`.
3. Read `docs/specs/00-project-overview.md`.
4. Read `docs/specs/01-backend-foundation.md`.
5. Read `docs/specs/02-admin-authentication.md`.
6. Read `docs/specs/03-profile-management.md`.
7. Inspect existing backend modules.
8. Inspect administrator model and authentication middleware.
9. Inspect CSRF middleware and route registration.
10. Inspect package configuration and tests.
11. Inspect Git status and current branch.

Expected branch:

`develop`

Do not implement on `main`.

Preserve all uncommitted changes.

# 3. Implementation Architecture

Create a feature module:

```text
backend/src/modules/profile/
├── profile.model.js
├── profile.routes.js
├── profile.controller.js
├── profile.service.js
└── profile.validation.js
```

Reuse existing modules:

- Authentication middleware.
- Authorization middleware.
- CSRF middleware.
- Environment configuration.
- Database connection.
- Centralized error handling.

Do not create duplicate infrastructure.

# 4. Implementation Sequence

## Step 1 — Existing Backend Inspection

Inspect:

- Phase 0 backend foundation.
- Phase 1 authentication module.
- Existing route aggregator.
- Existing error handling.
- Existing CSRF implementation.
- Existing test setup.

Identify the exact middleware interfaces and import paths.

Do not assume middleware names or behavior without inspecting their implementation.

**Deliverable:** Profile module integration assessment.

## Step 2 — Profile Model

Create:

`backend/src/modules/profile/profile.model.js`

Implement a Mongoose schema with:

- singletonKey
- fullName
- professionalTitle
- shortIntroduction
- about
- location
- publicEmail
- profileImageUrl
- profileImageAlt
- availabilityStatus
- isVisible
- isPublished
- timestamps

### Singleton Enforcement

Use a fixed unique singleton key.

Example:

```javascript
singletonKey: {
  type: String,
  required: true,
  unique: true,
  immutable: true,
  default: "primary"
}
```

Requirements:

- Ensure the unique index exists.
- Verify database index creation.
- Handle duplicate-key errors.
- Prevent updates to the singleton key.
- Do not rely solely on application-level document counts.

### Validation

Implement schema validation for:

- Required strings.
- Maximum string lengths.
- Valid email.
- HTTPS image URL.
- Supported availability values.
- Boolean fields.

Do not introduce unrelated fields.

**Deliverable:** Profile model with database-enforced singleton behavior.

## Step 3 — Profile Validation

Create:

`backend/src/modules/profile/profile.validation.js`

Implement validation for:

### Create Profile

Validate all required and optional fields.

### Update Profile

Validate only fields included in the request.

Requirements:

- Reject empty updates.
- Reject unsupported fields.
- Reject protected fields.
- Reject MongoDB operators.
- Validate string lengths.
- Validate email format.
- Validate HTTPS image URLs.
- Validate availability values.
- Validate boolean values.

Do not accept `_id`, `singletonKey`, `createdAt`, or `updatedAt` from clients.

Use the existing project's validation conventions where appropriate.

**Deliverable:** Reusable profile request validation.

## Step 4 — Profile Service

Create:

`backend/src/modules/profile/profile.service.js`

Implement:

1. `createProfile`
2. `getAdminProfile`
3. `getPublicProfile`
4. `updateProfile`
5. `publishProfile`
6. `unpublishProfile`

Responsibilities:

- Perform database operations.
- Enforce business rules.
- Handle missing records.
- Handle duplicate profile creation.
- Validate publication conditions.
- Return safe profile data.

### Important Rules

- Exactly one profile may exist.
- New profile defaults to unpublished.
- New profile defaults to visible.
- Updating profile content must not silently publish it.
- Public retrieval requires both `isPublished` and `isVisible` to be true.
- Unpublishing must immediately exclude the profile from public API responses.

Do not introduce revision history or advanced publishing workflows.

**Deliverable:** Complete profile business logic.

## Step 5 — Profile Controller

Create:

`backend/src/modules/profile/profile.controller.js`

Implement controllers for:

- Create profile.
- Get administrator profile.
- Update profile.
- Publish profile.
- Unpublish profile.
- Get public profile.

Requirements:

- Use validated input.
- Call service methods.
- Return appropriate HTTP status codes.
- Use consistent JSON responses.
- Forward errors to centralized error handling.
- Avoid database queries directly inside controllers.

**Deliverable:** Profile HTTP controllers.

## Step 6 — Profile Routes

Create:

`backend/src/modules/profile/profile.routes.js`

Implement the following endpoints:

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/admin/profile` | Administrator |
| GET | `/api/v1/admin/profile` | Administrator |
| PATCH | `/api/v1/admin/profile` | Administrator |
| PATCH | `/api/v1/admin/profile/publish` | Administrator |
| PATCH | `/api/v1/admin/profile/unpublish` | Administrator |
| GET | `/api/v1/portfolio/profile` | Public |

Apply middleware in the correct order.

### Administrator Routes

Use:

1. Authentication middleware.
2. Authorization middleware.
3. CSRF protection for state-changing operations.
4. Request validation.
5. Controller.

### Public Route

Do not require authentication.

Return only published and visible profile information.

**Deliverable:** Profile route module.

## Step 7 — Route Aggregation

Modify:

`backend/src/routes/index.js`

Register the profile routes.

Keep the API structure organized.

Do not break existing:

- `/api/v1/health`
- `/api/v1/auth`

Use the following logical API separation:

```text
/api/v1/health
/api/v1/auth
/api/v1/admin/profile
/api/v1/portfolio/profile
```

**Deliverable:** Integrated profile API.

## Step 8 — Response and Error Handling

Use the existing centralized error-handling middleware.

Handle:

- Profile not found.
- Duplicate profile.
- Invalid input.
- Invalid URL.
- Invalid email.
- Invalid availability status.
- Unauthorized access.
- CSRF failure.
- Unexpected database errors.

Use:

- HTTP 201 for successful creation.
- HTTP 200 for successful retrieval and updates.
- HTTP 400 for invalid input.
- HTTP 401 for unauthenticated requests.
- HTTP 403 for unauthorized or invalid CSRF requests.
- HTTP 404 for missing profiles.
- HTTP 409 for duplicate profile creation.
- HTTP 500 for unexpected errors.

Do not expose raw database errors.

**Deliverable:** Consistent profile API responses.

# 5. Testing Strategy

## 5.1 Model Tests

Test:

- Valid profile creation.
- Required field validation.
- Email normalization.
- HTTPS URL validation.
- Availability status validation.
- Default publication status.
- Default visibility status.
- Unique singleton key.
- Duplicate profile rejection.

## 5.2 Service Tests

Test:

- Profile creation.
- Administrator retrieval.
- Public retrieval.
- Partial updates.
- Publishing.
- Unpublishing.
- Duplicate creation.
- Missing profile.
- Invalid publication conditions.

## 5.3 Administrator API Tests

Test:

- Create profile with valid authentication.
- Reject unauthenticated creation.
- Retrieve profile.
- Update profile.
- Reject empty updates.
- Reject protected fields.
- Reject unsupported fields.
- Publish profile.
- Unpublish profile.
- Return HTTP 404 when missing.
- Reject requests with invalid CSRF tokens.

## 5.4 Public API Tests

Test:

- Published and visible profile returns HTTP 200.
- Unpublished profile returns HTTP 404.
- Invisible profile returns HTTP 404.
- Missing profile returns HTTP 404.
- Public response excludes internal fields.
- Public endpoint works without authentication.

## 5.5 Regression Tests

Run existing Phase 0 and Phase 1 tests.

Verify:

- Database connectivity.
- Health endpoints.
- Administrator login.
- Current administrator endpoint.
- Logout.
- JWT verification.
- Authentication middleware.
- CSRF protection.
- Login rate limiting.

Do not modify existing authentication behavior to make profile tests pass.

# 6. Test Environment

Use an isolated test database.

Requirements:

- Do not use production administrator credentials.
- Do not modify production profile data.
- Do not run destructive tests against production.
- Ensure test database cleanup is safe.
- Preserve development database data.

# 7. Expected File-Level Changes

| File | Action |
|---|---|
| `src/modules/profile/profile.model.js` | Create |
| `src/modules/profile/profile.validation.js` | Create |
| `src/modules/profile/profile.service.js` | Create |
| `src/modules/profile/profile.controller.js` | Create |
| `src/modules/profile/profile.routes.js` | Create |
| `src/routes/index.js` | Modify |
| `tests/profile/` | Create |

Only modify other files if technically required and approved.

# 8. Risk Management

| Risk | Mitigation |
|---|---|
| Multiple profile documents | Unique singleton database index |
| Accidental public disclosure | Published and visible filters |
| Unauthorized modification | Existing authentication and authorization |
| CSRF attacks | Existing CSRF middleware |
| Mass assignment | Explicit field allowlist |
| Invalid profile URLs | HTTPS URL validation |
| Accidental publishing | Explicit publication endpoints |
| Duplicate records | Atomic database constraint |
| Regression in authentication | Phase 1 regression tests |

# 9. Completion Criteria

The implementation is complete only when all applicable acceptance criteria in SPEC-03 are satisfied.

The completion report must include:

1. Implementation summary.
2. Files created.
3. Files modified.
4. Database schema and index verification.
5. Administrator API test results.
6. Public API test results.
7. Security test results.
8. Phase 0 regression results.
9. Phase 1 regression results.
10. Known limitations.
11. Git working tree status.

Clearly distinguish passed, failed, blocked, and unexecuted tests.

Do not claim successful verification without executing the relevant tests.

# 10. Implementation Approval

Before modifying files, the coding agent must:

1. Inspect the existing repository.
2. Read all applicable documentation.
3. Confirm the current branch.
4. Identify middleware dependencies.
5. Present the file-level implementation proposal.
6. Identify potential conflicts.
7. Wait for explicit user approval.

No automatic commits, pushes, merges, or deployments.

---

**End of Implementation Plan 03**

**Status:** Initial Draft — Requires Review and Approval.