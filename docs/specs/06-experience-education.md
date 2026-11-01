# SPEC-06: Experience & Education Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 5 — Experience & Education Management  
**Module:** Professional Journey  
**Status:** Proposed

## 1. Objective

Implement database-driven management of professional experience and educational qualifications.

The administrator must be able to create, update, organize, publish, hide, and delete experience and education records through protected REST APIs.

The public portfolio must retrieve published records dynamically without requiring frontend source-code changes or redeployment when records are added or updated.

## 2. Scope

### In scope
- Professional experience management.
- Internship and employment records.
- Education records.
- Current and completed experience/education status.
- Date and duration validation.
- Responsibilities, achievements, and descriptions.
- Technology lists associated with experience.
- Publication, visibility, and display ordering.
- Public APIs for retrieving experience and education.
- Administrator CRUD APIs.
- Security, validation, and automated tests.

### Out of scope
- Frontend admin or public UI.
- Resume and certificate file uploads.
- Cloudinary integration.
- LinkedIn or other external profile synchronization.
- Employment verification.
- Recommendation letters.
- Reference/contact management.
- Analytics.

## 3. Data Models

Implement two independent Mongoose models: `Experience` and `Education`.

### 3.1 Experience

| Field | Type | Requirements |
|---|---|---|
| company | String | Required, trimmed, bounded length |
| position | String | Required, trimmed, bounded length |
| employmentType | String | Required enum |
| location | String | Optional, trimmed |
| workMode | String | Optional enum |
| startDate | Date | Required |
| endDate | Date | Nullable when current |
| isCurrent | Boolean | Default `false` |
| description | String | Optional, bounded length |
| responsibilities | String[] | Optional, bounded array and item lengths |
| achievements | String[] | Optional, bounded array and item lengths |
| technologies | String[] | Optional, bounded array and item lengths |
| displayOrder | Number | Default `0`, non-negative integer |
| isVisible | Boolean | Default `true` |
| isPublished | Boolean | Default `false` |
| timestamps | Mongoose timestamps | Enabled |

`employmentType` enum:
- `internship`
- `full_time`
- `part_time`
- `contract`
- `freelance`
- `other`

`workMode` enum:
- `onsite`
- `remote`
- `hybrid`

Requirements:
- `company`, `position`, and `startDate` are required.
- `endDate` must be later than or equal to `startDate`.
- If `isCurrent` is true, `endDate` must be null.
- If `isCurrent` is false, `endDate` may be null for an ongoing or unspecified record only if the API contract explicitly allows it. Prefer requiring an end date for completed records.
- The service and model validation must prevent contradictory current-status and date values.
- Store dates as date values, not preformatted display strings.
- New records default to draft and visible.

### 3.2 Education

| Field | Type | Requirements |
|---|---|---|
| institution | String | Required, trimmed, bounded length |
| degree | String | Required, trimmed, bounded length |
| fieldOfStudy | String | Optional, trimmed, bounded length |
| location | String | Optional, trimmed |
| startDate | Date | Required |
| endDate | Date | Nullable when current |
| isCurrent | Boolean | Default `false` |
| grade | String | Optional, bounded length |
| description | String | Optional, bounded length |
| achievements | String[] | Optional, bounded array and item lengths |
| displayOrder | Number | Default `0`, non-negative integer |
| isVisible | Boolean | Default `true` |
| isPublished | Boolean | Default `false` |
| timestamps | Mongoose timestamps | Enabled |

Requirements:
- `institution`, `degree`, and `startDate` are required.
- `endDate` must be later than or equal to `startDate`.
- If `isCurrent` is true, `endDate` must be null.
- If `isCurrent` is false, a completed record should have an end date.
- Store dates as date values.
- New records default to draft and visible.

## 4. Publication and Visibility

A record is publicly available only when:

- `isPublished === true`
- `isVisible === true`

Administrator APIs must include drafts and hidden records.

Public APIs must never return unpublished or hidden records.

Publishing and unpublishing experience records must not affect education records, and vice versa.

## 5. API Requirements

All endpoints use the existing `/api/v1` prefix.

### 5.1 Administrator — Experience

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/experience` | Create an experience record |
| GET | `/admin/experience` | List all experience records |
| GET | `/admin/experience/:id` | Get one record |
| PATCH | `/admin/experience/:id` | Update a record |
| DELETE | `/admin/experience/:id` | Delete a record |
| PATCH | `/admin/experience/:id/publish` | Publish a record |
| PATCH | `/admin/experience/:id/unpublish` | Unpublish a record |
| PATCH | `/admin/experience/reorder` | Reorder experience records |

### 5.2 Administrator — Education

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/education` | Create an education record |
| GET | `/admin/education` | List all education records |
| GET | `/admin/education/:id` | Get one record |
| PATCH | `/admin/education/:id` | Update a record |
| DELETE | `/admin/education/:id` | Delete a record |
| PATCH | `/admin/education/:id/publish` | Publish a record |
| PATCH | `/admin/education/:id/unpublish` | Unpublish a record |
| PATCH | `/admin/education/reorder` | Reorder education records |

### 5.3 Public Portfolio APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/portfolio/experience` | Retrieve published experience records |
| GET | `/portfolio/education` | Retrieve published education records |

Public API requirements:
- Return only published and visible records.
- Return controlled response projections.
- Do not expose internal publication flags, `__v`, or unnecessary administrative metadata.
- Return dates in a consistent ISO-compatible representation.
- Sort by `displayOrder` ascending, with a deterministic tie-breaker.
- Do not return raw Mongoose documents.

## 6. Validation and Security

Reuse the existing authentication, administrator authorization, CSRF, error handling, and routing infrastructure.

Every administrator mutation must require:
- Valid administrator authentication.
- Administrator authorization.
- CSRF protection.

Validate:
- Required and optional fields.
- String lengths and array limits.
- Date formats and chronological consistency.
- Employment and work-mode enums.
- ObjectId route parameters.
- Display-order values.
- Unknown and protected fields.

Use strict allowlists. Reject MongoDB operators and unsafe nested objects.

Never pass raw request bodies directly into Mongoose updates.

Use consistent error handling:
- `400 Bad Request` for invalid input.
- `401 Unauthorized` for missing or invalid authentication.
- `403 Forbidden` for insufficient authorization or CSRF failure, following existing conventions.
- `404 Not Found` for missing records.

## 7. Reordering Requirements

Implement separate reordering operations for experience and education.

Requirements:
- Accept record IDs and new display-order values.
- Validate all IDs and values before writing.
- Reject malformed IDs, duplicate IDs, negative values, and non-integer values.
- Reject duplicate order values if the selected API contract requires unique ordering.
- Confirm all submitted records exist.
- Do not modify records omitted from the payload.
- Use a transaction when all-or-nothing behavior is required and supported.
- Otherwise, document and implement a safe alternative.
- Do not claim that `bulkWrite()` alone provides multi-document transaction atomicity.

## 8. Database Indexes

Add only indexes justified by actual query patterns.

Consider:
- `{ isPublished: 1, isVisible: 1, displayOrder: 1, createdAt: -1 }` for public ordering.
- `{ displayOrder: 1, createdAt: -1 }` for administrator ordering.

Create appropriate indexes for both models. Avoid redundant indexes and document each index's purpose.

## 9. Testing and Acceptance Criteria

### Model and validation tests
- Required fields and defaults.
- Valid and invalid date ranges.
- Current record and end-date consistency.
- Enum validation.
- String and array limits.
- Display-order validation.
- Unknown and protected field rejection.

### Administrator API tests
- Experience CRUD.
- Education CRUD.
- Publish and unpublish.
- Reordering.
- Invalid IDs and missing records.
- Authentication, authorization, and CSRF enforcement.
- Invalid payload handling.

### Public API tests
- Only published and visible records are returned.
- Draft records are excluded.
- Hidden records are excluded.
- Date fields are returned consistently.
- Sorting is deterministic.
- Administrative metadata is excluded.

### Regression tests
Run all existing suites:
- Phase 0 — Backend Foundation.
- Phase 1 — Administrator Authentication.
- Phase 2 — Profile Management.
- Phase 3 — Project Management.
- Phase 4 — Skills Management.
- Phase 5 — Experience & Education Management.

### Acceptance criteria
1. Both models and required indexes are implemented.
2. Administrator APIs support all specified operations.
3. Public APIs enforce publication and visibility rules.
4. Date consistency is enforced.
5. All administrator mutations use existing security middleware.
6. Reordering handles validation and write failures safely.
7. All tests pass without failures or skipped tests.
8. Existing regression tests pass.
9. `npm run check` passes.
10. The implementation report documents actual results.
11. No Git commit, push, merge, or deployment occurs without explicit approval.