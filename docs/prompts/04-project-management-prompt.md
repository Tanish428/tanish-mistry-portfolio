# ANTIGRAVITY IMPLEMENTATION PROMPT
## Phase 3 — Project Management

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Task ID:** TASK-04  
**Phase:** Phase 3 — Project Management  
**Related Specification:** `docs/specs/04-project-management.md`  
**Related Plan:** `docs/plans/04-project-management-plan.md`  
**Previous Phase:** Phase 2 — Profile Management

---

# 1. Your Role

Act as a senior backend engineer responsible for implementing a production-quality project management module.

The project already has:

- Node.js and Express backend.
- MongoDB Atlas and Mongoose.
- Centralized environment configuration.
- Health-check endpoints.
- Single-administrator authentication.
- bcrypt password hashing.
- JWT authentication.
- HttpOnly cookie authentication.
- Authentication and authorization middleware.
- CSRF protection.
- Login rate limiting.
- Profile management APIs.

Your responsibility is to extend the existing backend with dynamic project management.

Preserve existing architecture and functionality.

# 2. Mandatory Documentation

Read these files completely:

1. `AGENTS.md`
2. `.agents/rules/architecture.md`
3. `.agents/rules/backend.md`
4. `.agents/rules/security.md`
5. `.agents/rules/git-workflow.md`
6. `docs/specs/00-project-overview.md`
7. `docs/specs/01-backend-foundation.md`
8. `docs/specs/02-admin-authentication.md`
9. `docs/specs/03-profile-management.md`
10. `docs/specs/04-project-management.md`
11. `docs/plans/01-backend-foundation-plan.md`
12. `docs/plans/02-admin-authentication-plan.md`
13. `docs/plans/03-profile-management-plan.md`
14. `docs/plans/04-project-management-plan.md`

These documents define the approved architecture and scope.

Do not silently override their requirements.

# 3. Stage One — Repository Inspection

Before modifying files, inspect:

- Backend directory structure.
- Existing profile module.
- Existing authentication module.
- Authentication middleware.
- Authorization middleware.
- CSRF middleware.
- Database configuration.
- Centralized error handling.
- API route aggregator.
- Package configuration.
- Existing automated tests.

Execute:

```bash
git status
git branch --show-current
git log -5 --oneline
```

Expected branch:

```text
develop
```

If the current branch is `main`, stop and request that the user switch to `develop`.

Preserve all existing changes.

Do not overwrite existing files without inspection.

# 4. Stage Two — Implementation Analysis

Compare the actual backend with SPEC-04 and PLAN-04.

Identify:

1. Required new files.
2. Required modifications.
3. Existing reusable middleware.
4. Project schema and index requirements.
5. Slug generation strategy.
6. Publication and visibility logic.
7. Project ordering strategy.
8. Pagination and filtering strategy.
9. Route registration order.
10. Testing requirements.
11. Potential architectural conflicts.

Prepare an implementation proposal containing:

- Current backend status.
- Proposed file changes.
- Project model design.
- Slug uniqueness strategy.
- Database index design.
- Administrator API design.
- Public API design.
- Publication behavior.
- Reordering behavior.
- Testing strategy.
- Security considerations.
- Required dependencies, if any.

# 5. Stage Three — Approval Gate

STOP after completing repository inspection and implementation analysis.

Do not:

- Create files.
- Modify files.
- Install dependencies.
- Create project records.
- Modify existing database records.
- Change Git history.

Present the implementation proposal.

Wait for explicit user approval before implementation.

# 6. Stage Four — Implementation

After approval, implement only the approved project management functionality.

## A. Project Model

Create:

`backend/src/modules/projects/project.model.js`

Implement the schema defined in SPEC-04.

Required fields:

- title
- slug
- shortDescription
- description
- technologies
- category
- thumbnailUrl
- thumbnailAlt
- liveDemoUrl
- repositoryUrl
- role
- keyFeatures
- startDate
- endDate
- isFeatured
- isVisible
- isPublished
- displayOrder
- timestamps

Requirements:

- Validate required fields.
- Normalize strings.
- Normalize technologies.
- Enforce unique slug.
- Validate categories.
- Validate external URLs.
- Validate dates.
- Apply approved defaults.
- Add appropriate indexes.

New projects must remain unpublished by default.

Do not implement Cloudinary uploads.

## B. Slug Management

Implement URL-friendly slug generation.

Requirements:

- Generate from title when omitted.
- Normalize characters.
- Reject empty slugs.
- Validate explicitly supplied slugs.
- Preserve existing slugs during ordinary title updates.
- Enforce database-level uniqueness.
- Handle duplicate-key errors safely.

Do not overwrite another project when a slug conflicts.

## C. Request Validation

Create:

`backend/src/modules/projects/project.validation.js`

Implement validation for:

- Project creation.
- Partial updates.
- Project IDs.
- Slugs.
- Technologies.
- Categories.
- URLs.
- Dates.
- Featured status.
- Publication operations.
- Display ordering.
- Pagination.
- Search.
- Category filtering.
- Reordering.

Requirements:

- Explicit field allowlist.
- Reject unsupported fields.
- Reject MongoDB operators.
- Reject protected fields.
- Reject empty updates.
- Reject invalid IDs.
- Reject unsafe URL schemes.
- Reject invalid date ranges.
- Reject invalid pagination values.

Never rely solely on frontend validation.

## D. Project Service

Create:

`backend/src/modules/projects/project.service.js`

Implement:

- `createProject`
- `getAdminProjects`
- `getAdminProjectById`
- `updateProject`
- `deleteProject`
- `publishProject`
- `unpublishProject`
- `updateFeaturedStatus`
- `reorderProjects`
- `getPublicProjects`
- `getPublicProjectBySlug`

Keep business logic in this layer.

Requirements:

- Unique slugs.
- Draft-by-default behavior.
- Explicit publishing.
- Explicit visibility filtering.
- Safe deletion.
- Deterministic sorting.
- Pagination.
- Category filtering.
- Search.
- Safe duplicate handling.

Never expose unpublished projects through public queries.

## E. Project Controller

Create:

`backend/src/modules/projects/project.controller.js`

Implement controllers for all administrator and public operations.

Requirements:

- Read validated input.
- Call service methods.
- Return consistent JSON.
- Use appropriate HTTP status codes.
- Forward errors to existing centralized error handling.

Do not duplicate business logic in controllers.

## F. Project Routes

Create:

`backend/src/modules/projects/project.routes.js`

Implement:

```text
POST    /admin/projects
GET     /admin/projects
GET     /admin/projects/:id
PATCH   /admin/projects/:id
DELETE  /admin/projects/:id

PATCH   /admin/projects/:id/publish
PATCH   /admin/projects/:id/unpublish
PATCH   /admin/projects/:id/featured

PATCH   /admin/projects/reorder

GET     /portfolio/projects
GET     /portfolio/projects/:slug
```

Use the existing authentication and authorization middleware for all administrator routes.

Use CSRF protection on all state-changing administrator routes.

Register the reorder route before parameterized routes when necessary to avoid route conflicts.

Public routes must not require authentication.

## G. Project Ordering

Implement safe ordering.

Requirements:

- Validate project IDs.
- Reject duplicate IDs.
- Validate non-negative integer order values.
- Reject duplicate order values within the submitted ordering.
- Update only supplied projects.
- Ensure deterministic sorting.

Use an appropriate atomic or transactional approach.

If the MongoDB deployment cannot support the chosen transaction strategy, explain the limitation and implement a safe alternative.

## H. Route Integration

Modify:

`backend/src/routes/index.js`

Mount the project routes under:

```text
/api/v1/admin/projects
/api/v1/portfolio/projects
```

Preserve existing routes:

```text
/api/v1/health
/api/v1/auth
/api/v1/admin/profile
/api/v1/portfolio/profile
```

Do not break existing APIs.

## I. Error Handling

Reuse the centralized error handler.

Handle:

- Invalid project ID.
- Missing project.
- Duplicate slug.
- Invalid input.
- Invalid URLs.
- Invalid dates.
- Invalid category.
- Invalid ordering.
- Unauthorized requests.
- CSRF failures.
- Database errors.

Do not expose internal database details.

# 7. Public API Security

The following requirements are mandatory:

- Public listing only includes published and visible projects.
- Public detail lookup only returns published and visible projects.
- Public query parameters cannot bypass these conditions.
- Internal database fields must not be returned.
- Administrator-only information must not be exposed.
- Unpublished projects must remain inaccessible through public endpoints.

Do not rely on the frontend to hide unpublished projects.

# 8. Scope Restrictions

Do not implement:

- Cloudinary uploads.
- Media management.
- GitHub API synchronization.
- GitHub statistics.
- Project analytics.
- Project comments.
- Project reviews.
- Dynamic homepage sections.
- Frontend project dashboard.
- Automatic project imports.
- Project revision history.

These features belong to future phases.

Do not add unnecessary dependencies.

Do not perform unrelated refactoring.

# 9. Testing and Verification

Execute all relevant tests.

## Model Tests

Verify:

- Project creation.
- Required fields.
- Slug normalization.
- Slug uniqueness.
- Technology normalization.
- Category validation.
- URL validation.
- Date validation.
- Default flags.
- Display order.

## Administrator API Tests

Verify:

- Project creation.
- Project listing.
- Project retrieval.
- Project updating.
- Project deletion.
- Publishing.
- Unpublishing.
- Featured status.
- Reordering.
- Pagination.
- Filtering.
- Search.
- Duplicate slug rejection.
- Invalid IDs.
- Authentication rejection.
- CSRF rejection.

## Public API Tests

Verify:

- Public project listing.
- Public project detail by slug.
- Published and visible filtering.
- Draft exclusion.
- Invisible project exclusion.
- Featured sorting.
- Display ordering.
- Pagination.
- Search.
- Category filtering.
- Internal field exclusion.
- No authentication requirement.

## Regression Tests

Run all previous test suites:

- Phase 0 backend foundation.
- Phase 1 administrator authentication.
- Phase 2 profile management.

Verify existing functionality remains operational.

Use an isolated test database.

Never run destructive tests against production data.

Never report tests as passed without executing them.

# 10. Git Restrictions

All implementation must remain on:

`develop`

Or an approved feature branch created from `develop`.

Never:

- Commit automatically.
- Push automatically.
- Merge into `main`.
- Force-push.
- Rewrite Git history.
- Discard user changes.
- Deploy automatically.

Before completion, inspect:

```bash
git status
git diff --check
git diff
```

Report actual Git status.

# 11. Completion Report

After implementation, provide:

## A. Implementation Summary

Describe the completed project management functionality.

## B. Files Created

List every new file.

## C. Files Modified

List every modified existing file.

## D. Dependencies

List added or modified dependencies and reasons.

## E. Database Verification

Report:

- Project schema.
- Unique slug index.
- Other indexes.
- Duplicate slug test results.

## F. Administrator API Results

Report actual results for all administrator endpoints.

## G. Public API Results

Report actual results for public endpoints and visibility filtering.

## H. Security Verification

Report:

- Authentication.
- Authorization.
- CSRF.
- Input validation.
- Mass assignment prevention.
- Public field filtering.

## I. Regression Results

Report Phase 0, Phase 1, and Phase 2 test results.

## J. Known Limitations

List unresolved issues and limitations.

## K. Git Status

Report:

- Current branch.
- Working tree state.
- Changed files.
- Commit status.
- Push status.

Use:

- PASSED
- FAILED
- BLOCKED
- NOT EXECUTED

Do not claim success without actual verification.

# 12. Final Instructions

Implement only the approved scope.

Maintain consistency with existing architecture.

Prioritize correctness, security, and maintainability.

Do not weaken existing authentication or CSRF protections.

If a requirement is ambiguous, stop and ask.

If a change to the approved architecture is necessary, explain the reason and obtain approval.

**First action: Inspect the repository, read all required documentation, and prepare the implementation proposal. Do not modify files until the user explicitly approves the proposal.**

---

**End of Implementation Prompt 04**