# PLAN-09: Dynamic Homepage Sections

**Phase:** 8 — Dynamic Homepage Sections  
**Task ID:** TASK-09  
**Related Specification:** `docs/specs/09-dynamic-sections.md`  
**Status:** Proposed

---

## 1. Implementation Objective

Implement the backend module that manages homepage section definitions and assembles a public homepage response from existing portfolio modules.

The implementation must remain modular, secure, testable, and compatible with the existing backend.

## 2. Mandatory Pre-Implementation Inspection

Before writing code:

1. Read `AGENTS.md` and every applicable `.agents/rules/*.md` file.
2. Read `docs/00-project-overview.md` and the relevant architecture documentation.
3. Read the complete TASK-09 specification.
4. Inspect existing module structures and conventions:
   - `auth`
   - `profile`
   - `projects`
   - `skills`
   - `experience-education`
   - `contact-social`
   - `media`
5. Inspect:
   - Route registration.
   - Validation patterns.
   - Controller and service conventions.
   - Public response envelopes.
   - Error handling.
   - Existing test helpers and fixtures.
   - Existing indexes and database transaction patterns.
6. Confirm whether the proposed `09-dynamic-sections` documents already exist and whether they contain placeholders or previous content.

If existing architecture conflicts with the specification, report the conflict and stop before implementation.

## 3. Proposed Module Structure

Follow existing naming conventions. The expected module may resemble:

```text
backend/src/modules/homepage-sections/
  homepage-section.model.js
  homepage-section.validation.js
  homepage-section.service.js
  homepage-section.controller.js
  homepage-section.routes.js
```

Tests:

```text
backend/tests/homepage-sections.test.js
```

The exact filenames must match existing project conventions.

## 4. Implementation Sequence

### Step 1 — Model and indexes

- Create `HomepageSection`.
- Define the supported section type enum.
- Add strict fields and timestamps.
- Set `isVisible` default to true.
- Set `isPublished` default to false.
- Add unique section-type index.
- Add appropriate ordering index if useful.
- Verify index behavior against existing records and deployment conventions.

**Checkpoint:** Model tests pass.

### Step 2 — Validation layer

Implement separate validation for:

- Create.
- Update.
- Section ID parameters.
- Publication operations.
- Reordering.
- Type-specific configuration.

Requirements:

- Strict allowlists.
- Unknown-field rejection.
- Immutable section type.
- Bounded strings and numeric values.
- Explicit handling of empty and null values.
- No unvalidated configuration persistence.

**Checkpoint:** Validation tests pass.

### Step 3 — Admin service layer

Implement:

- Create section.
- List sections.
- Retrieve section by ID.
- Update section.
- Delete section.
- Publish.
- Unpublish.
- Reorder.

Requirements:

- Duplicate type protection.
- Consistent not-found and conflict errors.
- Validate reorder payload completely before writing.
- Use a transaction where supported.
- Otherwise use a safe recovery approach and report its limitations.
- Never report successful reordering after a partial write.

**Checkpoint:** Service tests pass.

### Step 4 — Public content composition

Implement a public homepage service that:

1. Queries only published and visible sections.
2. Sorts sections deterministically.
3. Resolves section content from existing module services.
4. Applies validated configuration limits and filters.
5. Returns a predictable section structure.
6. Handles absent optional content consistently.
7. Ensures nested content follows existing public publication and visibility rules.

Do not duplicate data models or invoke internal HTTP endpoints.

Avoid N+1 queries. Use efficient shared service functions and bounded parallel composition where appropriate.

**Checkpoint:** Public composition tests pass.

### Step 5 — Controllers and routes

Register the admin routes and public route.

Admin endpoints:

```text
POST   /api/v1/admin/homepage-sections
GET    /api/v1/admin/homepage-sections
GET    /api/v1/admin/homepage-sections/:id
PATCH  /api/v1/admin/homepage-sections/:id
DELETE /api/v1/admin/homepage-sections/:id
PATCH  /api/v1/admin/homepage-sections/:id/publish
PATCH  /api/v1/admin/homepage-sections/:id/unpublish
PATCH  /api/v1/admin/homepage-sections/reorder
```

Public endpoint:

```text
GET /api/v1/portfolio/homepage-sections
```

Use the existing middleware order and response conventions.

**Checkpoint:** Route integration tests pass.

### Step 6 — Security and regression

Verify:

- Authentication and authorization.
- CSRF protection.
- Strict request validation.
- No arbitrary component or executable content.
- No draft or hidden section leakage.
- No nested unpublished content leakage.
- No admin-only field leakage.
- Existing module behavior remains unchanged.

**Checkpoint:** Security and regression tests pass.

### Step 7 — Full verification

Run:

```bash
npm test
npm run check
```

Run from the correct backend working directory.

Record actual output and test totals. Reconcile suite counts against the total reported by the test runner.

Do not report success based only on partial test runs.

## 5. File Scope

Expected new files:

- Homepage section model.
- Homepage section validation.
- Homepage section service.
- Homepage section controller.
- Homepage section routes.
- Homepage section tests.

Expected modified files, only where required:

- Central module route registration.
- Any necessary shared service exports or narrowly required integration points.

Do not modify existing business modules unless the integration requires a small, justified change.

Do not modify completed phase specifications or implementation files unnecessarily.

## 6. Risk Register

| Risk | Mitigation |
|---|---|
| Duplicate section definitions | Unique type constraint and service validation |
| Invalid configuration | Per-type strict validation |
| Unpublished content leakage | Reuse existing public service filtering |
| Inconsistent section ordering | Prevalidation and safe reorder strategy |
| N+1 queries | Shared services and bounded parallel composition |
| Database-stored executable content | Allowlisted types and configuration only |
| Existing module regressions | Full regression test suite |
| Documentation naming conflicts | Inspect existing files before writing |

## 7. Completion Checklist

- [ ] Existing project instructions inspected.
- [ ] Existing documentation and phase mapping verified.
- [ ] Model and indexes implemented.
- [ ] Type-specific configuration validation implemented.
- [ ] Admin CRUD implemented.
- [ ] Publish/unpublish implemented.
- [ ] Reordering implemented safely.
- [ ] Public section composition implemented.
- [ ] Public visibility and publication filtering verified.
- [ ] Security tests passed.
- [ ] Existing regression tests passed.
- [ ] `npm test` passed.
- [ ] `npm run check` passed.
- [ ] Git diff reviewed.
- [ ] Exact changed files documented.
- [ ] Remaining limitations documented.

## 8. Git Restrictions

- Work only on `develop`.
- Do not switch branches.
- Do not commit.
- Do not push.
- Do not merge.
- Do not deploy.
- Preserve unrelated user changes.
- Stop after implementation and verification for user review.

**Final deliverable:** A working backend Dynamic Homepage Sections module, automated tests, and a truthful implementation report.