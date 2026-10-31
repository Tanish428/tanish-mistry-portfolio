# ANTIGRAVITY IMPLEMENTATION PROMPT
## Phase 2 — Profile Management

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Task ID:** TASK-03  
**Phase:** Phase 2 — Profile Management  
**Related Specification:** `docs/specs/03-profile-management.md`  
**Related Plan:** `docs/plans/03-profile-management-plan.md`  
**Previous Phase:** Phase 1 — Administrator Authentication

---

# 1. Your Role

Act as a senior backend engineer responsible for implementing the profile management module.

You must follow professional software engineering standards and the approved project architecture.

The project already contains:

- Node.js and Express backend.
- MongoDB Atlas connection.
- Centralized environment configuration.
- Centralized error handling.
- Health-check endpoints.
- Single-administrator authentication.
- bcrypt password hashing.
- JWT authentication.
- HttpOnly cookie authentication.
- Authentication middleware.
- Authorization middleware.
- CSRF protection.
- Login rate limiting.
- Administrator provisioning.

Your task is to extend this existing backend with profile management.

Do not recreate existing functionality.

# 2. Mandatory Documentation

Read the following files completely:

1. `AGENTS.md`
2. `.agents/rules/architecture.md`
3. `.agents/rules/backend.md`
4. `.agents/rules/security.md`
5. `.agents/rules/git-workflow.md`
6. `docs/specs/00-project-overview.md`
7. `docs/specs/01-backend-foundation.md`
8. `docs/specs/02-admin-authentication.md`
9. `docs/specs/03-profile-management.md`
10. `docs/plans/01-backend-foundation-plan.md`
11. `docs/plans/02-admin-authentication-plan.md`
12. `docs/plans/03-profile-management-plan.md`

Do not ignore existing project instructions.

# 3. Stage One — Repository Inspection

Before modifying files, inspect:

- Current backend directory structure.
- Existing profile-related files.
- Existing authentication module.
- Administrator model.
- Authentication middleware.
- Authorization middleware.
- CSRF middleware.
- Database configuration.
- Centralized error handling.
- API route aggregator.
- Existing automated tests.
- Package configuration.

Execute:

```bash
git status
git branch --show-current
git log -5 --oneline
```

Expected development branch:

```text
develop
```

If the current branch is `main`, stop and ask the user to switch to `develop`.

Preserve all existing uncommitted changes.

Do not overwrite existing files without inspection.

# 4. Stage Two — Implementation Analysis

Compare the existing backend with SPEC-03 and PLAN-03.

Identify:

1. Required new files.
2. Required existing file modifications.
3. Existing middleware that can be reused.
4. Database index requirements.
5. Validation requirements.
6. Route integration requirements.
7. Test requirements.
8. Potential conflicts.
9. Risks to existing authentication functionality.

Prepare a concise implementation proposal containing:

- Current backend state.
- Proposed file changes.
- Profile database schema.
- Single-profile enforcement approach.
- Administrator endpoint protection.
- Public API behavior.
- Publication and visibility behavior.
- Testing strategy.
- Dependencies, if any.
- Known risks.

# 5. Stage Three — Approval Gate

STOP after repository inspection and implementation analysis.

Do not:

- Create files.
- Modify source code.
- Install dependencies.
- Create profile records.
- Modify existing database records.
- Change Git history.

Present the implementation proposal and wait for explicit user approval.

Only proceed after the user approves the proposal.

# 6. Stage Four — Implementation

After approval, implement only the approved profile management functionality.

## A. Profile Model

Create:

`backend/src/modules/profile/profile.model.js`

Implement the Mongoose profile schema.

Required fields:

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

- Ensure the unique database index exists.
- Verify index creation.
- Handle duplicate-key errors.
- Do not rely solely on document counts.
- Do not allow clients to change the singleton key.

### Validation

Implement appropriate Mongoose validation.

Do not introduce unrelated profile fields.

## B. Profile Validation

Create:

`backend/src/modules/profile/profile.validation.js`

Validate profile creation and partial updates.

Requirements:

- Required fields.
- String types.
- Maximum lengths.
- Email format.
- HTTPS image URL.
- Availability status.
- Boolean values.
- Empty update rejection.
- Unsupported field rejection.
- Protected field rejection.

Never accept MongoDB operators from request data.

Do not accept:

- `_id`
- `singletonKey`
- `createdAt`
- `updatedAt`

## C. Profile Service

Create:

`backend/src/modules/profile/profile.service.js`

Implement:

- `createProfile`
- `getAdminProfile`
- `getPublicProfile`
- `updateProfile`
- `publishProfile`
- `unpublishProfile`

Responsibilities:

- Database access.
- Business logic.
- Profile existence checks.
- Singleton enforcement.
- Publication validation.
- Public visibility filtering.
- Safe error handling.

Important:

- Only one profile may exist.
- New profiles must default to unpublished.
- New profiles must default to visible.
- Content updates must not automatically publish the profile.
- Public retrieval must require both publication and visibility.
- Unpublished or invisible profiles must not appear in public API responses.

Do not implement advanced revision history or publishing workflows.

## D. Profile Controller

Create:

`backend/src/modules/profile/profile.controller.js`

Implement:

- Create profile.
- Retrieve administrator profile.
- Update profile.
- Publish profile.
- Unpublish profile.
- Retrieve public profile.

Requirements:

- Use validated request data.
- Call service functions.
- Return appropriate HTTP status codes.
- Use consistent JSON responses.
- Forward errors to centralized error handling.
- Keep database operations out of controllers.

## E. Profile Routes

Create:

`backend/src/modules/profile/profile.routes.js`

Implement:

```text
POST   /api/v1/admin/profile
GET    /api/v1/admin/profile
PATCH  /api/v1/admin/profile
PATCH  /api/v1/admin/profile/publish
PATCH  /api/v1/admin/profile/unpublish

GET    /api/v1/portfolio/profile
```

### Administrator Endpoints

Every administrator endpoint must use:

1. Authentication middleware.
2. Authorization middleware.
3. Appropriate CSRF middleware for state-changing requests.
4. Request validation.
5. Controller.

### Public Endpoint

The public profile endpoint must:

- Require no authentication.
- Return only published and visible content.
- Exclude internal fields.
- Return an appropriate response when the profile is unavailable.

## F. Route Integration

Modify:

`backend/src/routes/index.js`

Register the profile routes without breaking existing endpoints.

Preserve:

```text
/api/v1/health
/api/v1/auth
```

Add:

```text
/api/v1/admin/profile
/api/v1/portfolio/profile
```

Use the existing route architecture.

## G. Error Handling

Reuse the existing centralized error-handling system.

Handle:

- Missing profile.
- Duplicate profile.
- Invalid input.
- Invalid email.
- Invalid image URL.
- Invalid availability status.
- Unauthorized access.
- Invalid CSRF token.
- Unexpected database errors.

Do not expose internal database error details.

## H. Response Format

Use consistent JSON responses.

Successful example:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {}
  }
}
```

Error example:

```json
{
  "success": false,
  "message": "Profile not found",
  "data": null
}
```

Do not expose:

- Singleton keys.
- Internal database fields.
- Authentication information.
- Administrator credentials.

# 7. Security Requirements

Mandatory:

- Authentication on all administrator routes.
- Authorization on all administrator routes.
- CSRF protection on state-changing authenticated requests.
- Explicit field allowlist.
- Protection against mass assignment.
- Server-side validation.
- Safe URL validation.
- Safe public response projection.
- Centralized error handling.

Do not weaken existing authentication or CSRF functionality to make profile endpoints work.

Do not trust frontend validation.

# 8. Testing and Verification

Execute relevant automated tests.

## Model Tests

Verify:

- Profile creation.
- Required fields.
- Email normalization.
- URL validation.
- Availability values.
- Default publication status.
- Default visibility status.
- Singleton index.
- Duplicate profile rejection.

## Administrator API Tests

Verify:

- Valid authenticated profile creation.
- Unauthenticated creation rejection.
- Administrator profile retrieval.
- Profile updating.
- Partial update behavior.
- Empty update rejection.
- Protected field rejection.
- Duplicate profile rejection.
- Publishing.
- Unpublishing.
- Missing profile handling.
- CSRF validation.

## Public API Tests

Verify:

- Published and visible profile returns HTTP 200.
- Unpublished profile returns HTTP 404.
- Invisible profile returns HTTP 404.
- Missing profile returns HTTP 404.
- Public response excludes internal fields.
- Public endpoint works without authentication.

## Regression Tests

Run the existing Phase 0 and Phase 1 test suites.

Verify:

- MongoDB connection.
- Liveness endpoint.
- Readiness endpoint.
- Administrator login.
- Current administrator endpoint.
- Logout.
- JWT verification.
- Authentication middleware.
- CSRF protection.
- Login rate limiting.

Use an isolated test database.

Do not run destructive tests against production data.

Never claim tests passed without executing them.

# 9. Scope Restrictions

Do not implement:

- Project management.
- Skills management.
- Experience management.
- Education management.
- Achievements.
- Cloudinary integration.
- Resume upload.
- Contact management.
- Dynamic homepage sections.
- Advanced publishing workflows.
- Profile history.
- Frontend profile management UI.
- Multiple administrator accounts.

These are outside TASK-03.

Do not perform unrelated refactoring.

# 10. Git Restrictions

All development must remain on:

`develop`

Or an approved feature branch created from `develop`.

Never:

- Commit automatically.
- Push automatically.
- Merge into `main`.
- Force-push.
- Rewrite history.
- Discard user changes.
- Deploy without approval.

Before reporting completion, inspect:

```bash
git status
git diff --check
git diff
```

Report the actual working tree status.

# 11. Completion Report

After implementation, provide:

## A. Summary

Explain completed profile management functionality.

## B. Files Created

List all new files.

## C. Files Modified

List all modified existing files.

## D. Database Verification

Report:

- Profile schema.
- Singleton index creation.
- Duplicate creation test results.

## E. API Verification

Report administrator and public endpoint results.

## F. Security Verification

Report:

- Authentication.
- Authorization.
- CSRF.
- Validation.
- Mass assignment protection.
- Public field filtering.

## G. Regression Results

Report Phase 0 and Phase 1 test outcomes.

## H. Known Issues

Identify any unresolved issues.

## I. Git Status

Report:

- Current branch.
- Working tree state.
- Changed files.
- Commit status.
- Push status.

Do not commit or push automatically.

# 12. Final Instructions

Implement only the approved profile management scope.

Preserve existing backend functionality.

Follow the approved specification and plan.

If a requirement is unclear, stop and ask.

If an architectural change is required, explain it and request approval.

**First action: Inspect the existing repository, read the required documentation, and prepare the implementation proposal. Do not modify any files until the user approves the proposal.**

---

**End of Implementation Prompt 03**