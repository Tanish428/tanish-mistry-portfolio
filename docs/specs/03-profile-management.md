# Profile Management — Functional and Technical Specification

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Document ID:** SPEC-03  
**Version:** 1.0  
**Status:** Initial Draft  
**Phase:** Phase 2 — Profile Management  
**Priority:** High  
**Related Specification:** `docs/specs/02-admin-authentication.md`  
**Master Specification:** `docs/specs/00-project-overview.md`

---

# 1. Objective

Implement a dynamic profile management module that allows the administrator to manage personal and professional information displayed on the public portfolio.

The profile information must be stored in MongoDB and retrieved through REST APIs.

The administrator must be able to create and update the profile through protected endpoints without modifying application source code.

The public website must retrieve only published profile information.

# 2. Scope

## 2.1 Included

1. Profile Mongoose model.
2. Single-profile database enforcement.
3. Profile creation.
4. Profile retrieval for the administrator.
5. Profile updating.
6. Profile visibility and publication status.
7. Public profile retrieval.
8. Request validation.
9. Profile service layer.
10. Profile controller.
11. Profile routes.
12. Authentication and authorization integration.
13. CSRF protection for state-changing requests.
14. Profile API testing.
15. Database validation and indexing.

## 2.2 Excluded

The following features are outside this phase:

- Project management.
- Skills management.
- Experience management.
- Education management.
- Achievements and certifications.
- Social link management as a separate CMS module.
- Cloudinary image uploads.
- Resume uploads.
- Contact form management.
- Dynamic homepage section configuration.
- Advanced publishing workflows.
- Profile revision history.
- Multiple administrator accounts.
- Frontend profile management UI.

These features will be implemented in their respective phases.

# 3. Profile Architecture

## 3.1 Single Profile Requirement

The application represents one developer.

Therefore, the database must contain exactly one logical profile record.

The system must not support multiple independently managed developer profiles.

Enforce this requirement at the database level using a fixed unique singleton key.

A unique email field alone is not sufficient to enforce a single profile.

## 3.2 Profile Data Flow

```text
          ADMINISTRATOR
                |
                v
          ADMIN DASHBOARD
          (Future Frontend)
                |
                v
       PROTECTED PROFILE API
                |
       AUTH + AUTHORIZATION
                |
                v
         PROFILE CONTROLLER
                |
                v
          PROFILE SERVICE
                |
                v
         MONGOOSE MODEL
                |
                v
            MONGODB
                |
                v
         PUBLIC PROFILE API
                |
                v
          PUBLIC WEBSITE
```

# 4. Profile Data Model

## 4.1 Model Location

Create:

`backend/src/modules/profile/profile.model.js`

Use Mongoose.

## 4.2 Profile Fields

The profile document should contain the following information:

| Field | Type | Required | Description |
|---|---|---|---|
| `singletonKey` | String | Yes | Fixed unique identifier |
| `fullName` | String | Yes | Developer's name |
| `professionalTitle` | String | Yes | Professional role or headline |
| `shortIntroduction` | String | Yes | Short hero-section introduction |
| `about` | String | Yes | Detailed professional introduction |
| `location` | String | No | Publicly displayed location |
| `publicEmail` | String | No | Public contact email |
| `profileImageUrl` | String | No | Optional HTTPS image URL |
| `profileImageAlt` | String | No | Alternative text for profile image |
| `availabilityStatus` | String | No | Current professional availability |
| `isVisible` | Boolean | Yes | Controls public visibility |
| `isPublished` | Boolean | Yes | Controls publication status |
| `createdAt` | Date | Automatic | Creation timestamp |
| `updatedAt` | Date | Automatic | Last update timestamp |

## 4.3 Field Validation

### fullName
- Required.
- Trimmed.
- Must contain a meaningful value.
- Enforce a reasonable maximum length.

### professionalTitle
- Required.
- Trimmed.
- Must not be empty.
- Enforce a reasonable maximum length.

### shortIntroduction
- Required.
- Trimmed.
- Enforce a reasonable maximum length suitable for the hero section.

### about
- Required.
- Trimmed.
- Must contain meaningful content.
- Enforce a reasonable maximum length.

### location
- Optional.
- Trimmed.
- Must not contain an excessively long value.

### publicEmail
- Optional.
- Must be a valid email address when provided.
- Normalize to lowercase.
- Trim whitespace.

### profileImageUrl
- Optional.
- Must be a valid HTTPS URL.
- Do not accept executable schemes such as javascript: or data:.
- Do not implement file uploads in this phase.

### profileImageAlt
- Optional.
- Trimmed.
- Must have a reasonable maximum length.

### availabilityStatus

Allowed values:

- `open_to_opportunities`
- `not_available`
- `open_to_internships`
- `open_to_full_time`

This field is optional and must not be interpreted as a verified employment status.

### isVisible
- Boolean.
- Default: true.

### isPublished
- Boolean.
- Default: false.

New profiles must remain unpublished until the administrator explicitly publishes them.

# 5. Single-Profile Enforcement

The profile collection must support exactly one logical profile record.

Use a fixed singleton key such as:

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
- Do not rely only on application-level document counts.
- Prevent concurrent requests from creating multiple profiles.
- Handle MongoDB duplicate-key errors safely.
- Do not allow the singleton key to be modified through API input.

# 6. Administrator Operations

All administrator profile endpoints must require:

1. Valid authentication.
2. Administrator authorization.
3. Appropriate CSRF validation for state-changing requests.

## 6.1 Create Profile

**Endpoint:**

`POST /api/v1/admin/profile`

Purpose:

Create the initial profile document.

Requirements:

- Only the authenticated administrator can create it.
- Validate all supplied fields.
- Enforce the singleton constraint.
- Do not permit a second profile.
- Set `isPublished` to false by default.
- Set `isVisible` to true by default.
- Do not accept `singletonKey`, `_id`, or timestamps from the client.

Successful response:

HTTP 201

## 6.2 Get Administrator Profile

**Endpoint:**

`GET /api/v1/admin/profile`

Requirements:

- Authentication required.
- Return the existing profile, including unpublished information.
- Return HTTP 404 if the profile does not exist.
- Never expose internal or unnecessary database fields.

## 6.3 Update Profile

**Endpoint:**

`PATCH /api/v1/admin/profile`

Requirements:

- Authentication required.
- Accept only explicitly supported profile fields.
- Support partial updates.
- Reject attempts to modify protected fields.
- Validate updated values.
- Preserve fields that were not included in the request.
- Update timestamps automatically.

Do not allow mass assignment.

Do not accept arbitrary MongoDB operators from the request.

## 6.4 Publish Profile

**Endpoint:**

`PATCH /api/v1/admin/profile/publish`

Requirements:

- Authentication required.
- Set `isPublished` to true.
- Require the profile to exist.
- Validate required profile fields before publishing.
- Return the updated safe profile.

## 6.5 Unpublish Profile

**Endpoint:**

`PATCH /api/v1/admin/profile/unpublish`

Requirements:

- Authentication required.
- Set `isPublished` to false.
- Require the profile to exist.
- Ensure the public API no longer returns the profile.

# 7. Public Profile API

## 7.1 Get Public Profile

**Endpoint:**

`GET /api/v1/portfolio/profile`

Purpose:

Provide the published profile information to the public portfolio.

Requirements:

- No authentication required.
- Return only the profile when `isPublished` and `isVisible` are both true.
- Exclude singleton keys and internal database fields.
- Exclude private administrative information.
- Return a safe response when the profile does not exist or is unpublished.

Expected successful response:

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "profile": {
      "fullName": "Tanish Mistry",
      "professionalTitle": "Computer Engineering Student | Full-Stack Developer",
      "shortIntroduction": "Building reliable and useful software applications.",
      "about": "Professional introduction goes here.",
      "location": "India",
      "publicEmail": "contact@example.com",
      "profileImageUrl": null,
      "profileImageAlt": null,
      "availabilityStatus": "open_to_internships"
    }
  }
}
```

The response must not include:

- `singletonKey`
- Internal administrative fields
- Password information
- Authentication information

When the profile is unavailable publicly, return an appropriate HTTP 404 response.

# 8. Service Layer

Create:

`backend/src/modules/profile/profile.service.js`

Responsibilities:

- Create the initial profile.
- Retrieve administrator profile.
- Retrieve public profile.
- Update allowed profile fields.
- Publish profile.
- Unpublish profile.
- Validate business-level conditions.
- Handle missing profiles.
- Handle duplicate singleton creation.

Keep database operations and business rules in the service layer.

Do not place complex database operations directly inside controllers.

# 9. Controller Layer

Create:

`backend/src/modules/profile/profile.controller.js`

Responsibilities:

- Receive HTTP requests.
- Read validated input.
- Call the profile service.
- Return consistent JSON responses.
- Forward errors to centralized error handling.

Implement controllers for:

- Create profile.
- Get administrator profile.
- Update profile.
- Publish profile.
- Unpublish profile.
- Get public profile.

Do not duplicate business logic in controllers.

# 10. Validation Layer

Create:

`backend/src/modules/profile/profile.validation.js`

Validate:

- Profile creation input.
- Partial profile update input.
- Publication operations.
- String lengths.
- Email format.
- HTTPS image URL.
- Availability status.
- Boolean fields.

Reject:

- Invalid data types.
- Unsupported fields.
- MongoDB operators.
- Protected internal fields.
- Empty update requests.
- Malformed request bodies.

Never rely solely on Mongoose validation.

# 11. Route Structure

Create:

`backend/src/modules/profile/profile.routes.js`

Register administrator and public endpoints separately.

Expected routes:

```text
POST   /api/v1/admin/profile
GET    /api/v1/admin/profile
PATCH  /api/v1/admin/profile
PATCH  /api/v1/admin/profile/publish
PATCH  /api/v1/admin/profile/unpublish

GET    /api/v1/portfolio/profile
```

Apply the correct authentication, authorization, validation, and CSRF middleware.

Public profile retrieval must not require authentication.

All administrator operations must be protected.

# 12. Security Requirements

- Require administrator authentication for profile management.
- Apply authorization middleware.
- Apply CSRF protection to state-changing requests.
- Prevent mass assignment.
- Reject unexpected fields.
- Validate all input server-side.
- Do not expose internal database fields.
- Do not permit arbitrary URL schemes.
- Do not allow public modification of profile data.
- Do not trust client-provided publication status unless the administrator is authorized.
- Use centralized error handling.
- Do not expose stack traces or internal database errors.

# 13. API Response Format

Maintain consistent response structures.

Successful response:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {}
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Profile not found",
  "data": null
}
```

Use appropriate HTTP status codes:

| Scenario | HTTP Status |
|---|---|
| Profile created | 201 |
| Profile retrieved | 200 |
| Profile updated | 200 |
| Profile published | 200 |
| Profile unpublished | 200 |
| Invalid input | 400 |
| Unauthenticated | 401 |
| Unauthorized | 403 |
| Profile not found | 404 |
| Duplicate profile | 409 |
| Unexpected error | 500 |

# 14. Testing Requirements

## 14.1 Model Tests

Verify:

- Valid profile creation.
- Required field validation.
- Email normalization.
- HTTPS image URL validation.
- Availability status validation.
- Singleton database constraint.
- Timestamp behavior.

## 14.2 Administrator API Tests

Verify:

- Profile creation with valid authentication.
- Profile creation without authentication is rejected.
- Profile retrieval by administrator.
- Profile updating.
- Partial update behavior.
- Protected fields cannot be modified.
- Duplicate profile creation is rejected.
- Publishing works.
- Unpublishing works.
- Missing profile returns HTTP 404.
- Invalid input is rejected.
- CSRF protection works for state-changing requests.

## 14.3 Public API Tests

Verify:

- Published and visible profile is returned.
- Unpublished profile is not returned.
- Invisible profile is not returned.
- Missing profile returns HTTP 404.
- Public response contains only allowed fields.
- Public endpoint does not require authentication.

## 14.4 Security Tests

Verify:

- Unauthorized requests are rejected.
- Mass assignment is prevented.
- Internal fields are not exposed.
- MongoDB operators are rejected.
- Invalid URLs are rejected.
- CSRF validation works.
- Existing authentication continues to work.

## 14.5 Regression Tests

Verify existing Phase 0 and Phase 1 functionality:

- Database connectivity.
- Liveness endpoint.
- Readiness endpoint.
- Administrator login.
- Current administrator endpoint.
- Logout.
- Authentication middleware.
- CSRF protection.
- Login rate limiting.

Use an isolated test database.

Never run destructive tests against production data.

# 15. Acceptance Criteria

Phase 2 is accepted only when:

1. The profile model is implemented.
2. Exactly one profile document is supported.
3. Profile creation works.
4. Profile retrieval works.
5. Partial profile updates work.
6. Publication works.
7. Unpublishing works.
8. Public APIs return only published and visible content.
9. Validation is enforced.
10. Authentication protects administrator endpoints.
11. CSRF protects state-changing requests.
12. Mass assignment is prevented.
13. Internal fields are not exposed.
14. All relevant tests are executed.
15. Phase 0 and Phase 1 functionality remains operational.
16. Documentation reflects actual implementation.

# 16. Implementation Restrictions

The coding agent must:

- Read `AGENTS.md`.
- Read all applicable agent rules.
- Read the master specification.
- Read Phase 0 and Phase 1 specifications.
- Read this specification.
- Inspect existing authentication and database modules.
- Reuse existing authentication middleware.
- Reuse existing CSRF middleware.
- Reuse centralized error handling.
- Avoid unnecessary dependencies.
- Avoid unrelated refactoring.
- Avoid implementing future CMS modules.
- Never expose administrator credentials.
- Never modify production data without approval.
- Never commit or push without approval.

If existing implementation conflicts with this specification, stop and explain the conflict.

# 17. Expected Deliverables

At the end of this phase, provide:

1. Profile Mongoose model.
2. Profile service.
3. Profile controller.
4. Profile validation.
5. Profile routes.
6. Public profile API.
7. Protected administrator profile APIs.
8. Single-profile database enforcement.
9. Publication and visibility behavior.
10. Automated profile tests.
11. Phase 0 and Phase 1 regression results.
12. Implementation report.
13. Security verification report.

---

**End of Specification 03**

**Document Status:** Initial Draft — Requires Review and Approval.