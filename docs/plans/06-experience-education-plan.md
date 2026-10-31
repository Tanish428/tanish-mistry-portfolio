# PLAN-06: Experience & Education Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 5 — Experience & Education Management  
**Specification:** `docs/specs/06-experience-education-management.md`  
**Status:** Proposed

## 1. Implementation Objective

Implement two independent backend resources for managing professional experience and education records.

Both resources must use the existing modular Express and Mongoose architecture, share established security infrastructure, and provide separate administrator and public APIs.

## 2. Expected Architecture

Follow the existing module conventions:

```text
backend/
  src/
    modules/
      experience-education/
        experience.model.js
        education.model.js
        experience-education.validation.js
        experience-education.service.js
        experience-education.controller.js
        experience-education.routes.js
  tests/
    experience-education.test.js
```

If existing Phase 1–4 modules use a different structure, follow the established repository convention instead of forcing this proposed structure.

Keep experience and education as separate models and resources, even if they share validation helpers or controller utilities.

## 3. Implementation Sequence

### Step 1 — Repository inspection

Before modifying files:
1. Read `AGENTS.md` and applicable `.agents/rules/`.
2. Read SPEC-06 completely.
3. Inspect the Phase 1–4 implementation.
4. Inspect existing model, validation, service, controller, route, and test conventions.
5. Inspect `backend/src/routes/index.js`.
6. Verify the existing security middleware and error-handling conventions.
7. Verify the actual Git branch is `develop`.
8. Identify any specification conflicts or implementation risks.

Do not modify files during the inspection stage.

### Step 2 — Experience model

Implement the `Experience` model.

Include:
- Company and position.
- Employment type.
- Optional location and work mode.
- Start and end dates.
- Current status.
- Description.
- Responsibilities.
- Achievements.
- Technologies.
- Display ordering.
- Visibility and publication flags.
- Timestamps.

Enforce the exact enum values and date consistency rules in SPEC-06.

### Step 3 — Education model

Implement the `Education` model.

Include:
- Institution.
- Degree.
- Field of study.
- Location.
- Start and end dates.
- Current status.
- Grade.
- Description.
- Achievements.
- Display ordering.
- Visibility and publication flags.
- Timestamps.

Enforce the date consistency rules and defaults in SPEC-06.

### Step 4 — Request validation

Implement strict validation for:
- Experience creation and partial updates.
- Education creation and partial updates.
- ObjectId route parameters.
- Publication and unpublication.
- Experience reordering.
- Education reordering.
- String and array constraints.
- Date formats and chronological consistency.
- Enum values.
- Display-order values.

Reject unknown fields, protected fields, MongoDB operators, and malformed payloads.

Do not rely solely on Mongoose validation for HTTP request validation.

### Step 5 — Service layer

Implement domain operations independently of Express request and response objects.

**Experience**
- Create.
- List all administrator records.
- Retrieve one record.
- Update.
- Delete.
- Publish.
- Unpublish.
- Reorder.

**Education**
- Create.
- List all administrator records.
- Retrieve one record.
- Update.
- Delete.
- Publish.
- Unpublish.
- Reorder.

**Public operations**
- Retrieve published and visible experience records.
- Retrieve published and visible education records.
- Apply deterministic ordering.
- Return controlled response projections.

Keep public and administrator query logic separate.

### Step 6 — Controller layer

Create thin controllers that:
- Receive validated request data.
- Call service methods.
- Return consistent status codes and response structures.
- Use the existing centralized error-handling conventions.
- Avoid duplicating business logic.

### Step 7 — Routes and security

Implement all endpoints defined in SPEC-06.

Use the existing:
- JWT authentication middleware.
- Administrator authorization middleware.
- CSRF protection middleware.
- Centralized error handling.

Ensure every administrator mutation uses the correct middleware.

Register static routes such as `/reorder` before conflicting parameterized routes.

Mount the module through the existing route index without affecting previous endpoints.

### Step 8 — Reordering safety

Implement independent experience and education reorder operations.

Before database writes:
1. Validate the complete payload.
2. Validate all IDs.
3. Reject duplicate IDs.
4. Validate display-order values.
5. Confirm all submitted records exist.
6. Ensure omitted records remain unchanged.

Use MongoDB transactions if required and supported by the actual deployment. Otherwise, implement and document an appropriate safe alternative.

Do not claim `bulkWrite()` alone guarantees multi-document atomicity.

### Step 9 — Automated testing

Create a test suite following the existing project conventions.

Cover:
- Experience model and validation.
- Education model and validation.
- Date consistency.
- Current-status rules.
- CRUD operations.
- Publishing and unpublishing.
- Visibility restrictions.
- Reordering and invalid payloads.
- Public filtering and ordering.
- Authentication, authorization, and CSRF.
- Error handling and missing records.

Run all previous regression suites.

### Step 10 — Final verification

Execute the repository's actual scripts:

```bash
npm run check
npm test
```

Inspect:
- Actual test results and exit codes.
- Git branch and working-tree status.
- Created and modified files.
- Database indexes.
- Middleware integration.
- Regression behavior.
- Unnecessary dependency changes.
- Secret and environment-file exclusion.

Do not commit, push, merge, or deploy.

## 4. Expected API Groups

```text
/api/v1
  /admin
    /experience
      POST /
      GET /
      GET /:id
      PATCH /:id
      DELETE /:id
      PATCH /:id/publish
      PATCH /:id/unpublish
      PATCH /reorder

    /education
      POST /
      GET /
      GET /:id
      PATCH /:id
      DELETE /:id
      PATCH /:id/publish
      PATCH /:id/unpublish
      PATCH /reorder

  /portfolio
    /experience
      GET /

    /education
      GET /
```

Ensure route ordering prevents static-path conflicts.

## 5. Expected Deliverables

- Experience model.
- Education model.
- Validation module.
- Service module.
- Controller module.
- Route module.
- Automated test suite.
- Updated route index.
- Updated package scripts only if necessary.
- Implementation report.

No new dependencies should be introduced without a concrete technical justification.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Invalid date ranges | Enforce date consistency in request and model validation |
| Contradictory current status | Require null end date for current records |
| Public draft exposure | Filter publication and visibility at query level |
| Unsafe reordering | Validate the complete payload before writing |
| Partial database updates | Transaction or documented safe alternative |
| Route collisions | Register static routes before parameterized routes |
| Mass assignment | Strict allowlists |
| Regression | Run all existing tests |

## 7. Completion Report Requirements

Provide:
1. Implementation summary.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Database schema and indexes.
6. API endpoints implemented.
7. Security and validation details.
8. Exact test results.
9. Regression results.
10. Known limitations.
11. Git branch and working-tree status.
12. Recommended next steps.

Clearly distinguish actual test execution results from assumptions or code-review observations.