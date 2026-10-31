# SPEC-09: Dynamic Homepage Sections

**Phase:** 8 — Dynamic Homepage Sections  
**Task ID:** TASK-09  
**Module:** Dynamic Sections Management  
**Status:** Proposed  
**Priority:** High

---

## 1. Objective

Implement a database-driven homepage section management system that allows the administrator to control which sections appear on the public portfolio homepage, their order, visibility, publication status, and supported configuration.

The public homepage must retrieve its section structure from the backend API rather than relying on a hardcoded section sequence.

This module composes existing portfolio modules. It must not duplicate profile, project, skill, experience, education, or social-link records.

## 2. Existing Architecture

The implementation must follow the established project architecture:

- Backend: Node.js, Express 5, JavaScript ES modules.
- Database: MongoDB Atlas with Mongoose.
- API prefix: `/api/v1`.
- Authentication: Existing administrator authentication using JWT in secure HttpOnly cookies.
- Authorization: Existing admin authentication and authorization middleware.
- Security: Existing validation, error handling, CSRF protection, and response conventions.
- Frontend: React with Vite, implemented in a separate frontend phase.
- Architecture: Modular monolith.

Before implementation, inspect the existing modules and actual API response shapes. Do not assume undocumented fields or routes.

## 3. Functional Requirements

### FR-01: Homepage Section Management

The administrator must be able to:

- Create a homepage section.
- View all sections, including drafts and hidden sections.
- Retrieve a section by ID.
- Update section properties.
- Delete a section.
- Publish and unpublish a section.
- Change section visibility.
- Reorder sections.
- Configure supported section-specific options.

### FR-02: Supported Section Types

The initial allowlisted section types are:

| Type | Purpose | Data source |
|---|---|---|
| `hero` | Introductory homepage area | Profile |
| `about` | About/profile information | Profile |
| `projects` | Project showcase | Projects |
| `skills` | Skills and categories | Skills |
| `experience` | Work experience | Experience |
| `education` | Education history | Education |
| `social_links` | Social profiles | Contact & Social |
| `contact` | Contact information or contact form entry point | Profile and Contact |

Section type is immutable after creation. If the administrator needs another type, it must be introduced through a code change, validation, and frontend implementation.

Do not support arbitrary component names, HTML, JavaScript, JSX, executable templates, or dynamically imported modules from database records.

### FR-03: Section Data and Configuration

Each section must support:

- `title`: optional display heading.
- `subtitle`: optional supporting text.
- `type`: required allowlisted section type.
- `config`: validated section-specific configuration.
- `displayOrder`: non-negative integer.
- `isVisible`: boolean.
- `isPublished`: boolean.
- `createdAt` and `updatedAt`.

Use a strict configuration schema per section type.

Initial configuration options should remain intentionally limited:

**Hero**
- Whether to show the profile image.
- Whether to show the availability status.
- Optional primary and secondary call-to-action labels and destinations.

**About**
- Whether to show the profile image.
- Optional maximum text length for presentation.

**Projects**
- Whether to show featured projects only.
- Maximum number of projects.
- Optional category filter, if supported by the existing project API and model.

**Skills**
- Whether to show featured skills only.
- Maximum number of skills or categories.

**Experience and Education**
- Maximum number of records to display.

**Social Links**
- Optional maximum number of links.

**Contact**
- Whether to show the contact form entry point.
- Optional heading and supporting text.

All configuration values must be type-checked, bounded, and allowlisted. Reject unknown configuration properties rather than silently accepting arbitrary data.

Do not store duplicated project, skill, experience, or education content in a section.

### FR-04: Draft and Publication Lifecycle

- Newly created sections default to `isPublished: false`.
- Sections default to `isVisible: true`.
- Only published and visible sections appear in the public homepage response.
- Unpublishing a section removes it from the public response.
- Hiding a section removes it from the public response without deleting it.
- Admin APIs must continue to expose drafts and hidden sections.

### FR-05: Section Ordering

- `displayOrder` determines the public order.
- Lower values appear first.
- Ordering must be deterministic when two sections have the same order; use a stable secondary sort such as `createdAt` and `_id`.
- Reordering must validate all submitted IDs and reject duplicates, missing IDs, or IDs that do not belong to the intended section set.
- Validate before writing.
- Use a MongoDB transaction when supported by the deployment environment.
- If transactions are unavailable, implement a safe alternative that prevents silently reporting success after a partial reorder.
- Do not rely on `bulkWrite()` alone as proof of atomicity.

### FR-06: Duplicate Section Policy

Initially, permit only one section of each type.

Enforce this rule at the database and service-validation levels where practical.

If the existing product overview explicitly requires multiple instances of a section type, stop and report the conflict before implementing a different policy.

## 4. Data Model

Create a Mongoose model named `HomepageSection`.

Suggested fields:

| Field | Type | Constraints |
|---|---|---|
| `type` | String | Required, enum of supported types, unique |
| `title` | String | Optional, trimmed, bounded length |
| `subtitle` | String | Optional, trimmed, bounded length |
| `config` | Mixed/Object | Strictly validated against type-specific schema |
| `displayOrder` | Number | Required, integer, minimum 0 |
| `isVisible` | Boolean | Default true |
| `isPublished` | Boolean | Default false |
| `timestamps` | Mongoose timestamps | Enabled |

Use a unique index on `type` to enforce one section per type.

Do not use unrestricted `Mixed` configuration without strict service-level validation. Prefer a structured schema or explicit validation layer.

## 5. API Requirements

All routes must follow existing API response and error conventions.

### Admin routes

All admin routes must require existing authentication and authorization middleware.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/admin/homepage-sections` | Create section |
| `GET` | `/api/v1/admin/homepage-sections` | List all sections |
| `GET` | `/api/v1/admin/homepage-sections/:id` | Get section |
| `PATCH` | `/api/v1/admin/homepage-sections/:id` | Update section |
| `DELETE` | `/api/v1/admin/homepage-sections/:id` | Delete section |
| `PATCH` | `/api/v1/admin/homepage-sections/:id/publish` | Publish section |
| `PATCH` | `/api/v1/admin/homepage-sections/:id/unpublish` | Unpublish section |
| `PATCH` | `/api/v1/admin/homepage-sections/reorder` | Reorder sections |

Mutating endpoints must use the existing CSRF protection pattern.

### Public route

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/portfolio/homepage-sections` | Retrieve published, visible homepage sections |

The public endpoint must:

- Return only published and visible sections.
- Return sections in deterministic display order.
- Exclude internal administration fields.
- Resolve data from existing portfolio modules using their established public-service logic or equivalent shared service functions.
- Avoid exposing unpublished or hidden content through nested section data.
- Return a predictable response structure.
- Handle missing optional module content without failing the entire homepage response.

Do not call internal HTTP endpoints from the backend to assemble the response. Use service-layer composition.

## 6. Public Response Contract

The response should follow the project's existing API envelope.

Conceptual response:

```json
{
  "success": true,
  "data": [
    {
      "type": "hero",
      "title": "Welcome",
      "subtitle": "Software Developer",
      "displayOrder": 0,
      "config": {},
      "content": {}
    },
    {
      "type": "projects",
      "title": "Featured Projects",
      "displayOrder": 1,
      "config": {
        "featuredOnly": true,
        "limit": 6
      },
      "content": {
        "projects": []
      }
    }
  ]
}
```

This is a conceptual contract. Match the actual response envelope and field naming conventions in the existing backend.

The `content` field must be assembled from the relevant existing module. It must never be populated by executing database-stored code.

## 7. Validation and Security

- Validate all request bodies, route parameters, and query parameters.
- Use strict field allowlists for create and update operations.
- Reject unknown section types.
- Reject unknown configuration keys.
- Prevent administrator updates from changing immutable section types.
- Validate numeric limits and ordering values.
- Sanitize and bound text fields according to existing project conventions.
- Use existing authentication, authorization, and CSRF middleware.
- Never expose unpublished or hidden sections through public endpoints.
- Never expose admin-only fields publicly.
- Never execute HTML, JavaScript, JSX, template strings, or code stored in MongoDB.
- Do not introduce public registration or additional authentication mechanisms.

## 8. Performance and Reliability

- Use efficient queries and projections.
- Avoid N+1 database queries when resolving section content.
- Reuse existing public service functions where possible.
- Consider bounded parallel service calls for independent section content.
- A missing optional section data source should produce an empty or omitted content value according to a consistent contract, not an unhandled server error.
- Do not introduce Redis or additional infrastructure for this phase.
- Follow existing caching conventions; do not cache unpublished or administrator-specific data in public responses.

## 9. Testing Requirements

Tests must cover:

### Model and validation
- Valid section creation.
- Invalid section type.
- Duplicate section type.
- Invalid configuration for each supported type.
- Unknown configuration properties.
- Invalid display order.
- Default draft and visibility values.

### Admin API
- Authentication and authorization.
- CSRF protection on mutations.
- Create, list, detail, update, and delete.
- Publish and unpublish.
- Visibility updates.
- Immutable type enforcement.
- Duplicate and invalid reorder IDs.
- Reorder validation and failure behavior.

### Public API
- Published and visible filtering.
- Hidden and unpublished section exclusion.
- Deterministic ordering.
- Correct content composition from existing modules.
- No leakage of internal IDs or admin-only fields.
- Empty or missing content handling.
- No unpublished project, skill, experience, education, or social content leakage.

### Regression
- All existing module tests must continue to pass.
- Existing authentication, profile, projects, skills, experience/education, contact/social, and media behavior must remain unchanged.

## 10. Out of Scope

The following are explicitly excluded:

- React frontend implementation.
- Admin dashboard UI.
- Drag-and-drop interface.
- Arbitrary user-created components.
- Custom HTML, CSS, JavaScript, or JSX execution.
- User-defined templates.
- Page builder functionality.
- Multiple independently configurable pages.
- Navigation menu management.
- New media upload functionality.
- Duplicating data from existing modules.
- Redis or other new infrastructure.

## 11. Acceptance Criteria

TASK-09 is complete when:

1. The `HomepageSection` model and module follow the existing backend architecture.
2. All supported section types are strictly allowlisted.
3. Each type has validated configuration.
4. Admin CRUD and publication operations work.
5. Reordering is validated and safely handled.
6. The public API returns only published and visible sections in deterministic order.
7. Section content is composed from existing module services.
8. No executable database content is supported.
9. Security and regression tests pass.
10. `npm test` and `npm run check` pass.
11. No unrelated files or modules are changed.
12. The implementation report lists actual files, tests, limitations, and Git status.

**Completion rule:** Do not commit, push, merge, or deploy without explicit user authorization.