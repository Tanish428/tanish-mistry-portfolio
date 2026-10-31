# Project Management — Implementation Plan

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Plan ID:** PLAN-04  
**Version:** 1.0  
**Related Specification:** `docs/specs/04-project-management.md`  
**Previous Specification:** `docs/specs/03-profile-management.md`  
**Master Specification:** `docs/specs/00-project-overview.md`  
**Status:** Initial Draft  
**Phase:** Phase 3 — Project Management

---

# 1. Implementation Objective

Implement a complete project management module using the existing backend architecture.

The administrator must be able to:

- Create projects.
- List projects.
- Retrieve individual projects.
- Update projects.
- Delete projects.
- Publish and unpublish projects.
- Mark projects as featured.
- Reorder projects.

The public website must retrieve only published and visible projects.

# 2. Mandatory Pre-Implementation Checks

Before implementation:

1. Read `AGENTS.md`.
2. Read all applicable `.agents/rules/`.
3. Read `docs/specs/00-project-overview.md`.
4. Read `docs/specs/01-backend-foundation.md`.
5. Read `docs/specs/02-admin-authentication.md`.
6. Read `docs/specs/03-profile-management.md`.
7. Read `docs/specs/04-project-management.md`.
8. Inspect the backend directory.
9. Inspect existing authentication and authorization middleware.
10. Inspect existing CSRF middleware.
11. Inspect profile module conventions.
12. Inspect route registration.
13. Inspect test configuration.
14. Inspect Git status and current branch.

Expected branch:

`develop`

Do not implement on `main`.

Preserve all existing changes.

# 3. Module Architecture

Create:

```text
backend/src/modules/projects/
├── project.model.js
├── project.routes.js
├── project.controller.js
├── project.service.js
└── project.validation.js
```

Reuse:

- Existing MongoDB connection.
- Existing environment configuration.
- Existing authentication middleware.
- Existing authorization middleware.
- Existing CSRF middleware.
- Existing centralized error handling.

Do not duplicate existing infrastructure.

# 4. Implementation Sequence

## Step 1 — Repository Inspection

Inspect existing Phase 0, Phase 1, and Phase 2 modules.

Verify:

- Profile module structure.
- Service and controller conventions.
- Authentication middleware interfaces.
- Authorization middleware interfaces.
- CSRF middleware interfaces.
- Route aggregation.
- Error-handling conventions.
- Test setup.

Determine the correct route ordering before implementation.

**Deliverable:** Project module integration assessment.

## Step 2 — Project Model

Create:

`backend/src/modules/projects/project.model.js`

Implement the schema defined in SPEC-04.

Fields:

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

### Model Requirements

- Use Mongoose.
- Add schema validation.
- Normalize slugs.
- Normalize technology values.
- Enforce unique slug.
- Use default publication settings.
- Validate dates.
- Validate supported categories.
- Validate external URLs.
- Use appropriate indexes.

### Default Values

| Field | Default |
|---|---|
| `isFeatured` | false |
| `isVisible` | true |
| `isPublished` | false |
| `displayOrder` | 0 |

New projects must not become publicly accessible automatically.

**Deliverable:** Validated project model.

## Step 3 — Slug Generation

Implement reusable slug generation logic.

Requirements:

1. Convert titles into URL-friendly slugs.
2. Normalize characters.
3. Remove unsupported characters.
4. Avoid empty slugs.
5. Preserve an existing slug during ordinary title updates.
6. Allow explicit slug changes through validated input.
7. Enforce uniqueness through MongoDB.
8. Handle duplicate-key errors.

Do not silently overwrite existing projects.

Do not depend only on an application-level uniqueness check.

**Deliverable:** Reliable slug handling.

## Step 4 — Request Validation

Create:

`backend/src/modules/projects/project.validation.js`

Implement validators for:

- Create project.
- Partial project update.
- Project ID.
- Slug.
- Technology array.
- Category.
- URLs.
- Dates.
- Featured status.
- Publication operations.
- Pagination.
- Search.
- Category filters.
- Reordering.

Requirements:

- Explicit field allowlist.
- Reject MongoDB operators.
- Reject unsupported fields.
- Reject empty updates.
- Reject malformed IDs.
- Reject unsafe URL schemes.
- Reject invalid ordering data.
- Normalize supported values.

Do not allow clients to modify internal fields.

**Deliverable:** Complete project validation layer.

## Step 5 — Project Service

Create:

`backend/src/modules/projects/project.service.js`

Implement the following service operations:

1. `createProject`
2. `getAdminProjects`
3. `getAdminProjectById`
4. `updateProject`
5. `deleteProject`
6. `publishProject`
7. `unpublishProject`
8. `updateFeaturedStatus`
9. `reorderProjects`
10. `getPublicProjects`
11. `getPublicProjectBySlug`

### Business Rules

- Only one document is created per project creation request.
- Slugs must remain unique.
- New projects are drafts.
- New projects are visible by default.
- New projects are not featured by default.
- Updating a project must not automatically publish it.
- Public queries must enforce publication and visibility.
- Featured projects appear before non-featured projects.
- Project ordering must be deterministic.
- Deleted projects must no longer appear in public results.

Do not put database business logic in controllers.

**Deliverable:** Complete project service.

## Step 6 — Project Controller

Create:

`backend/src/modules/projects/project.controller.js`

Implement controllers for all operations in SPEC-04.

Requirements:

- Read validated input.
- Call service functions.
- Return consistent JSON.
- Use appropriate HTTP status codes.
- Forward errors to centralized error handling.
- Avoid database queries directly in controllers.

**Deliverable:** Project HTTP controllers.

## Step 7 — Administrator Project Routes

Create:

`backend/src/modules/projects/project.routes.js`

Register:

| Method | Route |
|---|---|
| POST | `/admin/projects` |
| GET | `/admin/projects` |
| GET | `/admin/projects/:id` |
| PATCH | `/admin/projects/:id` |
| DELETE | `/admin/projects/:id` |
| PATCH | `/admin/projects/:id/publish` |
| PATCH | `/admin/projects/:id/unpublish` |
| PATCH | `/admin/projects/:id/featured` |
| PATCH | `/admin/projects/reorder` |

Important:

Register `/reorder` before parameterized `/:id` routes where required.

Every administrator route must use:

1. Authentication.
2. Authorization.
3. CSRF protection for state-changing requests.
4. Request validation.
5. Controller.

**Deliverable:** Protected administrator routes.

## Step 8 — Public Project Routes

Register:

| Method | Route |
|---|---|
| GET | `/portfolio/projects` |
| GET | `/portfolio/projects/:slug` |

Requirements:

- No authentication required.
- Only published and visible projects.
- Exclude internal fields.
- Support approved pagination and filtering.
- Use deterministic ordering.
- Never allow query parameters to bypass publication restrictions.

**Deliverable:** Public project API.

## Step 9 — Route Aggregation

Modify:

`backend/src/routes/index.js`

Mount project routes under the correct API prefixes.

Preserve existing endpoints:

```text
/api/v1/health
/api/v1/auth
/api/v1/admin/profile
/api/v1/portfolio/profile
```

Add:

```text
/api/v1/admin/projects
/api/v1/portfolio/projects
```

Avoid route collisions.

**Deliverable:** Integrated project routes.

## Step 10 — Project Reordering

Implement safe project ordering.

Requirements:

- Validate project IDs.
- Reject duplicate IDs.
- Validate non-negative integer order values.
- Reject duplicate order values within the submitted ordering.
- Update only requested projects.
- Ensure deterministic public sorting.
- Use a transaction if the chosen update strategy requires atomic multi-document changes and the deployment supports transactions.

If MongoDB transaction requirements cannot be met in the current environment, use a safe alternative and document its consistency limitations.

**Deliverable:** Reliable ordering mechanism.

## Step 11 — Database Indexes

Evaluate and create indexes for:

- Unique slug.
- Publication state.
- Visibility.
- Featured status.
- Display order.
- Category.

Prefer indexes aligned with actual query patterns.

Do not create unnecessary or duplicate indexes.

**Deliverable:** Verified project indexes.

# 5. Testing Strategy

## 5.1 Model Tests

Verify:

- Project creation.
- Required field validation.
- Slug normalization.
- Unique slug enforcement.
- Technology normalization.
- Category validation.
- URL validation.
- Date validation.
- Default flags.
- Display order validation.

## 5.2 Service Tests

Verify:

- Project creation.
- Project retrieval.
- Partial updates.
- Project deletion.
- Publication.
- Unpublication.
- Featured status.
- Reordering.
- Public filtering.
- Duplicate slug handling.
- Missing project handling.

## 5.3 Administrator API Tests

Verify:

- Create.
- List.
- Retrieve.
- Update.
- Delete.
- Publish.
- Unpublish.
- Featured status.
- Reorder.
- Pagination.
- Filtering.
- Search.
- Invalid IDs.
- Invalid payloads.
- CSRF rejection.
- Authentication rejection.

## 5.4 Public API Tests

Verify:

- Public project listing.
- Public project details.
- Unpublished project exclusion.
- Invisible project exclusion.
- Featured ordering.
- Display ordering.
- Pagination.
- Category filtering.
- Search.
- Internal field exclusion.
- No authentication requirement.

## 5.5 Regression Tests

Run all existing test suites:

- Backend foundation tests, if present.
- Authentication tests.
- Profile tests.

Verify that existing functionality remains operational.

# 6. Test Environment

Use an isolated test database.

Requirements:

- Do not use production data.
- Do not use production credentials.
- Do not delete existing development records.
- Ensure automated cleanup targets only the test database.
- Do not silently modify existing profile or administrator records.

# 7. Expected File-Level Changes

| File | Action |
|---|---|
| `src/modules/projects/project.model.js` | Create |
| `src/modules/projects/project.validation.js` | Create |
| `src/modules/projects/project.service.js` | Create |
| `src/modules/projects/project.controller.js` | Create |
| `src/modules/projects/project.routes.js` | Create |
| `src/routes/index.js` | Modify |
| `tests/projects/` | Create |

Modify package files only if necessary.

Do not add dependencies without justification.

# 8. Risk Management

| Risk | Mitigation |
|---|---|
| Duplicate project slugs | Database unique index |
| Draft exposure | Mandatory public query filters |
| Mass assignment | Explicit field allowlist |
| Invalid external URLs | HTTPS validation |
| Inconsistent project ordering | Validated deterministic ordering |
| Route collisions | Explicit route registration order |
| Unauthorized modification | Existing authentication and authorization |
| CSRF attacks | Existing CSRF middleware |
| Regression | Full previous-phase test suites |

# 9. Completion Criteria

Phase 3 is complete only when all applicable acceptance criteria in SPEC-04 are satisfied.

The final report must include:

1. Summary.
2. Files created.
3. Files modified.
4. Dependency changes.
5. Database schema and indexes.
6. Slug uniqueness verification.
7. Administrator API results.
8. Public API results.
9. Publication verification.
10. Ordering verification.
11. Security verification.
12. Phase 0 regression results.
13. Phase 1 regression results.
14. Phase 2 regression results.
15. Known limitations.
16. Git status.

Clearly identify PASSED, FAILED, BLOCKED, and NOT EXECUTED tests.

# 10. Implementation Approval

Before modifying any files, the coding agent must:

1. Inspect the repository.
2. Read all required documentation.
3. Confirm the current branch.
4. Prepare the file-level implementation proposal.
5. Identify dependencies.
6. Identify database and routing changes.
7. Explain testing and security decisions.
8. Wait for explicit user approval.

No automatic commits, pushes, merges, or deployments.

---

**End of Implementation Plan 04**

**Status:** Initial Draft — Requires Review and Approval.