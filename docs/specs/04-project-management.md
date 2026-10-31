# Project Management — Functional and Technical Specification

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Document ID:** SPEC-04  
**Version:** 1.0  
**Status:** Initial Draft  
**Phase:** Phase 3 — Project Management  
**Priority:** High  
**Related Specification:** `docs/specs/03-profile-management.md`  
**Master Specification:** `docs/specs/00-project-overview.md`

---

# 1. Objective

Implement a dynamic project management module for the personal developer portfolio.

The administrator must be able to create, retrieve, update, publish, unpublish, reorder, feature, and delete portfolio projects through protected REST APIs.

The public portfolio must retrieve only projects that are published and publicly visible.

All project information must be stored in MongoDB using Mongoose.

The implementation must integrate with the existing Phase 0, Phase 1, and Phase 2 backend architecture.

# 2. Scope

## 2.1 Included

1. Project Mongoose model.
2. Project creation.
3. Project retrieval.
4. Project updating.
5. Project deletion.
6. Project publication and unpublication.
7. Featured project management.
8. Project ordering.
9. Technology stack management within projects.
10. Project image URL management.
11. Project filtering and pagination.
12. Administrator project APIs.
13. Public project APIs.
14. Request validation.
15. Project service layer.
16. Project controller.
17. Project routes.
18. Automated tests.
19. Authentication, authorization, and CSRF integration.

## 2.2 Excluded

The following features are outside this phase:

- Cloudinary image uploads.
- Media library management.
- Multiple project image uploads.
- GitHub API synchronization.
- Live GitHub repository statistics.
- Project analytics.
- Project reviews.
- Project comments.
- Dynamic homepage section management.
- Frontend project management UI.
- Automatic project imports.
- Project revision history.

These features must be implemented separately when approved.

# 3. Project Architecture

## 3.1 Data Flow

```text
          ADMINISTRATOR
                |
                v
          ADMIN DASHBOARD
          (Future Frontend)
                |
                v
        PROTECTED PROJECT API
                |
       AUTH + AUTHORIZATION
                |
                v
         PROJECT CONTROLLER
                |
                v
          PROJECT SERVICE
                |
                v
         MONGOOSE MODEL
                |
                v
             MONGODB
                |
                v
          PUBLIC PROJECT API
                |
                v
          PUBLIC PORTFOLIO
```

## 3.2 Project Independence

Each project must be stored as an independent MongoDB document.

Do not embed complete project documents inside the profile document.

Project records must be independently manageable.

# 4. Project Data Model

## 4.1 Model Location

Create:

`backend/src/modules/projects/project.model.js`

Use Mongoose.

## 4.2 Project Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | String | Yes | Project name |
| `slug` | String | Yes | Unique URL-friendly identifier |
| `shortDescription` | String | Yes | Short project summary |
| `description` | String | Yes | Detailed project description |
| `technologies` | Array of strings | Yes | Technologies used |
| `category` | String | Yes | Project category |
| `thumbnailUrl` | String | No | Main project image URL |
| `thumbnailAlt` | String | No | Accessible image description |
| `liveDemoUrl` | String | No | Live application URL |
| `repositoryUrl` | String | No | Source repository URL |
| `role` | String | No | Developer's contribution |
| `keyFeatures` | Array of strings | No | Important project features |
| `startDate` | Date | No | Project start date |
| `endDate` | Date | No | Project completion date |
| `isFeatured` | Boolean | Yes | Featured project flag |
| `isVisible` | Boolean | Yes | Public visibility |
| `isPublished` | Boolean | Yes | Publication state |
| `displayOrder` | Number | Yes | Project ordering |
| `createdAt` | Date | Automatic | Creation timestamp |
| `updatedAt` | Date | Automatic | Last update timestamp |

Additional internal fields may be introduced only when justified by the implementation requirements.

## 4.3 Field Requirements

### title

- Required.
- Trimmed.
- Non-empty.
- Reasonable maximum length.

### slug

- Required.
- Unique.
- Lowercase.
- URL-friendly.
- Generated from title by default.
- Explicitly supplied slugs must be validated.
- Updating a title must not silently change an existing slug unless the administrator explicitly changes it.

### shortDescription

- Required.
- Trimmed.
- Suitable for project cards.
- Enforce a reasonable maximum length.

### description

- Required.
- Trimmed.
- Supports sufficiently detailed project descriptions.
- Enforce a reasonable maximum length.

Store descriptions as plain text or safely validated structured content. Do not render arbitrary HTML or execute database-stored markup.

### technologies

- Required.
- Array of strings.
- Trim each value.
- Remove duplicate values case-insensitively.
- Reject empty technology names.
- Enforce limits on array length and individual item length.

Example:

```json
[
  "React",
  "Node.js",
  "Express.js",
  "MongoDB"
]
```

### category

Use a controlled category value.

Initial supported categories:

- `web`
- `mobile`
- `desktop`
- `backend`
- `fullstack`
- `other`

Additional categories require explicit validation and documentation changes.

### thumbnailUrl

- Optional.
- Must be a valid HTTPS URL.
- No file upload functionality in this phase.

### liveDemoUrl and repositoryUrl

- Optional.
- Must be valid HTTPS URLs when supplied.
- Reject unsafe URL schemes.
- Do not automatically trust arbitrary URLs supplied by clients.

### keyFeatures

- Optional array of strings.
- Trim values.
- Reject empty entries.
- Enforce array and string length limits.

### startDate and endDate

- Optional.
- Must be valid dates.
- End date must not precede start date when both are supplied.

### isFeatured

- Boolean.
- Default false.
- Only the administrator can modify it.

### isVisible

- Boolean.
- Default true.

### isPublished

- Boolean.
- Default false.
- New projects remain drafts until explicitly published.

### displayOrder

- Number.
- Default 0.
- Must be a finite non-negative integer.
- Lower values appear first.

# 5. Slug and Uniqueness Management

The project slug must be unique.

Requirements:

- Create a unique database index on slug.
- Generate a URL-friendly slug from the project title when one is not supplied.
- Handle duplicate slugs.
- Do not overwrite an existing project when a slug conflict occurs.
- Return HTTP 409 for a duplicate slug.
- Avoid race conditions by relying on the database unique index.
- Preserve the slug during ordinary title updates.

If an explicitly requested slug already exists, reject the operation instead of silently changing it.

# 6. Administrator Project APIs

All administrator endpoints must require:

1. Authentication.
2. Administrator authorization.
3. CSRF protection for state-changing operations.
4. Server-side request validation.

Base path:

`/api/v1/admin/projects`

## 6.1 Create Project

**Endpoint:**

`POST /api/v1/admin/projects`

Responsibilities:

- Validate request body.
- Create a project document.
- Generate a slug if not supplied.
- Apply default publication and visibility settings.
- Normalize technologies.
- Handle duplicate slug errors.

Successful response:

HTTP 201

## 6.2 List Administrator Projects

**Endpoint:**

`GET /api/v1/admin/projects`

Requirements:

- Return published and unpublished projects.
- Support pagination.
- Support search by title.
- Support filtering by category.
- Support filtering by publication status.
- Support filtering by featured status.
- Support deterministic ordering.
- Do not expose unnecessary internal fields.

## 6.3 Get Project by ID

**Endpoint:**

`GET /api/v1/admin/projects/:id`

Requirements:

- Validate MongoDB ObjectId.
- Return the requested project.
- Include unpublished project data.
- Return HTTP 404 when not found.

## 6.4 Update Project

**Endpoint:**

`PATCH /api/v1/admin/projects/:id`

Requirements:

- Support partial updates.
- Accept only explicitly allowed fields.
- Validate updated values.
- Preserve fields not included in the request.
- Prevent mass assignment.
- Reject MongoDB operators.
- Handle slug conflicts.
- Do not automatically publish a draft.

## 6.5 Delete Project

**Endpoint:**

`DELETE /api/v1/admin/projects/:id`

Requirements:

- Require administrator authentication.
- Require authorization.
- Require CSRF validation.
- Permanently delete the selected project document.
- Return HTTP 404 when the project does not exist.
- Return an appropriate successful response.

Do not delete external Cloudinary assets in this phase because Cloudinary integration is not yet implemented.

## 6.6 Publish Project

**Endpoint:**

`PATCH /api/v1/admin/projects/:id/publish`

Requirements:

- Set `isPublished` to true.
- Validate required project fields.
- Require the project to exist.
- Return the updated project.

## 6.7 Unpublish Project

**Endpoint:**

`PATCH /api/v1/admin/projects/:id/unpublish`

Requirements:

- Set `isPublished` to false.
- Require the project to exist.
- Immediately exclude it from public API results.

## 6.8 Featured Status

**Endpoint:**

`PATCH /api/v1/admin/projects/:id/featured`

Purpose:

Update whether a project is featured.

Requirements:

- Accept a boolean `isFeatured` value.
- Reject invalid types.
- Require administrator authorization.
- Do not automatically publish the project when featuring it.

## 6.9 Project Ordering

**Endpoint:**

`PATCH /api/v1/admin/projects/reorder`

Purpose:

Update project display order.

Request example:

```json
{
  "projects": [
    {
      "id": "project-id-1",
      "displayOrder": 1
    },
    {
      "id": "project-id-2",
      "displayOrder": 2
    }
  ]
}
```

Requirements:

- Validate all project IDs.
- Validate display order values.
- Reject duplicate IDs in the request.
- Reject duplicate display order values within the submitted ordering.
- Update only the supplied projects.
- Use an appropriate atomic or transactional strategy where necessary.
- Never allow client input to modify protected fields.

# 7. Public Project APIs

Base path:

`/api/v1/portfolio/projects`

## 7.1 List Public Projects

**Endpoint:**

`GET /api/v1/portfolio/projects`

Requirements:

- No authentication required.
- Return only projects where `isPublished` and `isVisible` are both true.
- Sort featured projects first, then by `displayOrder`, then by a deterministic tie-breaker.
- Support pagination.
- Support category filtering.
- Support search by project title.
- Exclude internal fields.
- Exclude unpublished projects.
- Exclude invisible projects.

Do not allow public query parameters to override publication or visibility filters.

## 7.2 Get Public Project by Slug

**Endpoint:**

`GET /api/v1/portfolio/projects/:slug`

Requirements:

- No authentication required.
- Find the project using its slug.
- Return only published and visible projects.
- Return HTTP 404 when the project is missing, unpublished, or invisible.
- Exclude internal fields.

# 8. Service Layer

Create:

`backend/src/modules/projects/project.service.js`

Responsibilities:

- Create project.
- List administrator projects.
- Retrieve administrator project.
- Update project.
- Delete project.
- Publish project.
- Unpublish project.
- Update featured status.
- Reorder projects.
- List public projects.
- Retrieve public project by slug.

Keep business logic and database operations in the service layer.

Controllers must not contain complex database operations.

# 9. Controller Layer

Create:

`backend/src/modules/projects/project.controller.js`

Responsibilities:

- Handle HTTP requests.
- Read validated input.
- Call project service functions.
- Return consistent JSON responses.
- Forward errors to centralized error handling.

Implement controllers for every specified administrator and public operation.

# 10. Validation Layer

Create:

`backend/src/modules/projects/project.validation.js`

Validate:

- Project creation.
- Partial project updates.
- Project IDs.
- Slugs.
- Technologies.
- Categories.
- Descriptions.
- URLs.
- Dates.
- Featured status.
- Publication operations.
- Visibility settings.
- Display order.
- Pagination.
- Search and category filters.
- Reordering payloads.

Reject:

- Unsupported fields.
- MongoDB operators.
- Invalid IDs.
- Empty updates.
- Invalid URL schemes.
- Invalid dates.
- Invalid ordering data.
- Unexpected request body structures.

Use an explicit field allowlist.

# 11. Route Structure

Create:

`backend/src/modules/projects/project.routes.js`

Expected endpoints:

```text
POST    /api/v1/admin/projects
GET     /api/v1/admin/projects
GET     /api/v1/admin/projects/:id
PATCH   /api/v1/admin/projects/:id
DELETE  /api/v1/admin/projects/:id

PATCH   /api/v1/admin/projects/:id/publish
PATCH   /api/v1/admin/projects/:id/unpublish
PATCH   /api/v1/admin/projects/:id/featured

PATCH   /api/v1/admin/projects/reorder

GET     /api/v1/portfolio/projects
GET     /api/v1/portfolio/projects/:slug
```

Ensure the reorder route is registered before parameterized project ID routes where necessary to avoid route conflicts.

Apply existing authentication, authorization, CSRF, and validation middleware.

# 12. Database Indexes

Create appropriate indexes for:

- Unique slug.
- Publication and visibility filtering.
- Featured project ordering.
- Display order.
- Category filtering.

Avoid unnecessary indexes.

Inspect query patterns and justify compound indexes.

Do not create duplicate indexes.

# 13. API Response Format

Use the existing response convention.

Successful response:

```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Project not found",
  "data": null
}
```

Use appropriate HTTP status codes:

| Scenario | Status |
|---|---|
| Project created | 201 |
| Successful retrieval/update | 200 |
| Project deleted | 200 or 204 |
| Invalid input | 400 |
| Unauthenticated | 401 |
| Unauthorized | 403 |
| Project not found | 404 |
| Duplicate slug | 409 |
| Unexpected error | 500 |

# 14. Security Requirements

- Protect every administrator endpoint.
- Apply CSRF protection to state-changing requests.
- Validate all client input.
- Prevent mass assignment.
- Reject MongoDB operators.
- Never trust client-supplied publication filters.
- Never expose internal fields publicly.
- Validate all external URLs.
- Use safe error handling.
- Do not execute database-stored content.
- Do not permit unauthenticated project modifications.

# 15. Testing Requirements

## 15.1 Model Tests

Verify:

- Valid project creation.
- Required fields.
- Slug uniqueness.
- Slug normalization.
- Technology normalization.
- Category validation.
- URL validation.
- Date validation.
- Default publication state.
- Default visibility state.
- Default featured state.
- Display order validation.

## 15.2 Administrator API Tests

Verify:

- Project creation.
- Project listing.
- Project retrieval.
- Project updating.
- Partial updates.
- Project deletion.
- Publishing.
- Unpublishing.
- Featured status changes.
- Project reordering.
- Pagination.
- Search and filtering.
- Invalid project IDs.
- Duplicate slug rejection.
- CSRF protection.
- Authentication and authorization.

## 15.3 Public API Tests

Verify:

- Public project listing.
- Public project detail by slug.
- Published and visible filtering.
- Unpublished project exclusion.
- Invisible project exclusion.
- Featured ordering.
- Display ordering.
- Pagination.
- Category filtering.
- Search.
- Public field projection.
- Missing slug response.
- No authentication requirement.

## 15.4 Security Tests

Verify:

- Unauthorized requests are rejected.
- CSRF validation works.
- Mass assignment is prevented.
- MongoDB operators are rejected.
- Unsafe URL schemes are rejected.
- Internal fields are not exposed.
- Public filters cannot reveal drafts.

## 15.5 Regression Tests

Run existing Phase 0, Phase 1, and Phase 2 test suites.

Verify:

- Database connectivity.
- Health endpoints.
- Authentication.
- Administrator provisioning constraints.
- CSRF protection.
- Rate limiting.
- Profile management.
- Public profile retrieval.

Use an isolated test database.

Do not execute destructive tests against production data.

# 16. Acceptance Criteria

Phase 3 is accepted only when:

1. Project model is implemented.
2. Unique slug enforcement works.
3. Project creation works.
4. Administrator project listing works.
5. Project retrieval works.
6. Project updates work.
7. Project deletion works.
8. Publishing and unpublishing work.
9. Featured status works.
10. Project reordering works.
11. Technology associations are stored correctly.
12. Public listing works.
13. Public project details work by slug.
14. Only published and visible projects are publicly accessible.
15. Pagination and filtering work.
16. Validation is enforced.
17. Authentication and authorization protect administrator endpoints.
18. CSRF protects state-changing requests.
19. Mass assignment is prevented.
20. Existing Phase 0, Phase 1, and Phase 2 functionality remains operational.
21. All relevant tests are executed.
22. Documentation reflects the actual implementation.

# 17. Implementation Restrictions

The coding agent must:

- Read `AGENTS.md`.
- Read all applicable `.agents/rules/`.
- Read the master specification.
- Read Phase 0, Phase 1, and Phase 2 specifications.
- Read this specification.
- Reuse existing infrastructure.
- Avoid unnecessary dependencies.
- Avoid unrelated refactoring.
- Avoid implementing Cloudinary.
- Avoid implementing GitHub API integration.
- Avoid implementing future CMS modules.
- Never expose unpublished projects publicly.
- Never modify production data without approval.
- Never commit, push, merge, or deploy without approval.

# 18. Expected Deliverables

At the end of Phase 3, provide:

1. Project Mongoose model.
2. Project service.
3. Project controller.
4. Project validation.
5. Project routes.
6. Administrator CRUD APIs.
7. Project publication endpoints.
8. Featured project management.
9. Project ordering functionality.
10. Public project APIs.
11. Pagination and filtering.
12. Database indexes.
13. Automated project tests.
14. Regression test results.
15. Implementation report.
16. Security verification report.

---

**End of Specification 04**

**Document Status:** Initial Draft — Requires Review and Approval.