# PLAN-05: Skills Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 4 — Skills Management  
**Related specification:** `docs/specs/05-skills-management.md`  
**Status:** Proposed

## 1. Implementation Objective

Implement the Skills Management module using the existing backend architecture and security infrastructure.

The module will manage two related resources:
- Skill categories.
- Individual skills belonging to categories.

The implementation must follow the existing modular structure and avoid unnecessary dependencies or changes to completed modules.

## 2. Architecture

Follow the existing project structure:

```text
backend/
  src/
    modules/
      skills/
        skill-category.model.js
        skill.model.js
        skills.validation.js
        skills.service.js
        skills.controller.js
        skills.routes.js
  tests/
    skills.test.js
```

If the repository's existing modules use a different naming or file organization convention, follow the established convention instead of introducing an inconsistent structure.

Use the existing:
- Express application and API versioning.
- Mongoose connection and models.
- Authentication middleware.
- Administrator authorization middleware.
- CSRF middleware.
- Centralized error handling.
- Environment configuration.
- Test setup and utilities.

Do not create a second authentication or database infrastructure.

## 3. Implementation Sequence

### Step 1 — Repository inspection

Before writing code:
1. Read `AGENTS.md` and all applicable `.agents/rules/` files.
2. Read SPEC-05 completely.
3. Inspect the existing Phase 1–3 models, services, controllers, routes, and tests.
4. Inspect `backend/src/routes/index.js`.
5. Inspect the current test scripts and validation conventions.
6. Confirm how duplicate-key and validation errors are handled.
7. Confirm the actual MongoDB deployment capabilities relevant to transactions.
8. Identify any conflicts between SPEC-05 and existing architecture.

Do not modify files during this step.

### Step 2 — SkillCategory model

Implement the category schema with:
- Required and trimmed name.
- Unique URL-friendly slug.
- Optional description.
- Non-negative integer display order.
- Visibility and publication flags.
- Timestamps.
- Required indexes.

Implement slug generation and update behavior consistently with the project module.

Ensure duplicate slugs are handled through the database unique index, not only application-level checks.

### Step 3 — Skill model

Implement the skill schema with:
- Required and trimmed name.
- Unique URL-friendly slug.
- Required category reference.
- Optional description.
- Proficiency enum.
- Optional safe icon identifier.
- Featured, visibility, and publication flags.
- Non-negative integer display order.
- Timestamps.
- Query-oriented indexes.

Ensure category references are validated before writes. Avoid introducing circular model dependencies.

### Step 4 — Request validation

Implement validation for:
- Category creation and partial updates.
- Skill creation and partial updates.
- MongoDB ObjectId route parameters.
- Category and skill slug parameters where required.
- Publish and unpublish operations.
- Featured status updates.
- Category reordering.
- Category-scoped skill reordering.
- Public query parameters.

Use explicit allowlists. Reject unknown fields, MongoDB operators, protected fields, invalid enums, and invalid ordering values.

Do not rely solely on Mongoose validation for HTTP request validation.

### Step 5 — Service layer

Implement domain logic independently of Express request and response objects.

**Category operations**
- Create category.
- List all categories for administration.
- Retrieve one category.
- Update category.
- Delete category only when it has no associated skills.
- Publish and unpublish category.
- Reorder categories.

**Skill operations**
- Create skill.
- List all skills for administration.
- Retrieve one skill.
- Update skill.
- Delete skill.
- Publish and unpublish skill.
- Toggle featured status.
- Reorder skills within a category.

**Public operations**
- Retrieve public categories.
- Retrieve public skills.
- Apply category and featured filters.
- Enforce the category publication and visibility conditions.
- Apply deterministic sorting.
- Return controlled response projections.

Keep public and administrative query logic separate.

### Step 6 — Controller layer

Create thin controllers that:
- Read validated request data.
- Call the appropriate service.
- Return consistent HTTP status codes.
- Use the existing centralized error-handling conventions.
- Avoid duplicating domain logic.

### Step 7 — Route layer

Implement the administrator and public routes defined in SPEC-05.

Administrator routes must use the existing authentication, authorization, and CSRF middleware in the established order.

Register static paths such as `/reorder` before conflicting parameterized paths.

Mount the routes through the existing route index without disrupting previous endpoints.

### Step 8 — Safe reordering

Implement separate category and category-scoped skill reorder operations.

Before writing:
1. Validate the complete payload.
2. Check ID format and uniqueness.
3. Check order-value validity and uniqueness according to the API contract.
4. Confirm all submitted records exist.
5. Confirm every submitted skill belongs to the specified category.
6. Reject the complete request if validation fails.

For writes:
- Use a MongoDB transaction if the deployment supports transactions and all-or-nothing behavior is required.
- Otherwise, implement an explicitly documented safe alternative.
- Do not describe `bulkWrite()` alone as an atomic multi-document transaction.
- Ensure records omitted from the request remain unchanged.

### Step 9 — Automated testing

Create `backend/tests/skills.test.js` following existing test conventions.

Test categories:
- Model constraints and defaults.
- Slug generation and uniqueness.
- Category CRUD.
- Category publication and visibility.
- Category deletion conflict.
- Skill CRUD.
- Skill category references.
- Proficiency validation.
- Featured status.
- Skill publication and visibility.
- Public filtering and sorting.
- Category-scoped reordering.
- CSRF, authentication, and authorization.
- Invalid payloads and duplicate-key errors.

Run the existing Phase 0–3 regression tests as well as the complete test suite.

### Step 10 — Final verification

Run:

```bash
npm run check
npm test
```

Use the actual repository scripts. If test scripts are split into separate suites, run each required suite and then the combined suite.

Inspect:
- Test output and exit codes.
- Git branch.
- Working tree.
- Changed files.
- Dependency changes.
- Accidental modifications to earlier modules.
- Secret and environment-file exclusion.

Do not commit, push, merge, or deploy.

## 4. Expected API Route Groups

```text
/api/v1
  /admin
    /skill-categories
      POST /
      GET /
      GET /:id
      PATCH /:id
      DELETE /:id
      PATCH /:id/publish
      PATCH /:id/unpublish
      PATCH /reorder

    /skills
      POST /
      GET /
      GET /:id
      PATCH /:id
      DELETE /:id
      PATCH /:id/publish
      PATCH /:id/unpublish
      PATCH /:id/featured
      PATCH /reorder

  /portfolio
    /skill-categories
      GET /

    /skills
      GET /
```

The final route registration must avoid conflicts between static and parameterized paths.

## 5. Expected Deliverables

- SkillCategory model.
- Skill model.
- Validation module.
- Service module.
- Controller module.
- Route module.
- Automated skills test suite.
- Updated route index.
- Updated package scripts only if necessary.
- Implementation report.

Do not add dependencies unless a concrete requirement cannot be satisfied by the existing packages.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Duplicate category or skill slugs | Database unique indexes and consistent conflict handling |
| Orphaned skills | Prevent category deletion while skills reference it |
| Public exposure of drafts | Enforce publication and visibility filters in service queries |
| Hidden category skills exposed | Require the referenced category to be public |
| Unsafe reorder operations | Full-payload validation and transaction or documented alternative |
| Route collisions | Register static routes before parameterized routes |
| Accidental mass assignment | Strict request allowlists |
| Regression in earlier modules | Run the full existing test suite |
| Unnecessary dependency growth | Reuse existing packages |

## 7. Completion Report Format

The implementation report must include:

1. Implementation summary.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Database schema and indexes.
6. API endpoints implemented.
7. Test execution results, including regression suites.
8. Known limitations or unresolved issues.
9. Git branch and working-tree status.
10. Recommended next steps.

Clearly distinguish verified test results from assumptions. Do not report a test as passed unless it was actually executed and passed.