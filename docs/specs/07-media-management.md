# SPEC-07: Contact & Social Links Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 6 — Contact & Social Links Management  
**Module:** Contact and Social Profiles  
**Status:** Proposed

## 1. Objective

Implement a dynamic Social Links Management module and a secure Contact Message Management module.

The administrator must be able to manage professional social links and review messages submitted by visitors through the public portfolio contact form.

The frontend must retrieve social links dynamically and submit contact messages through REST APIs.

## 2. Scope

### In scope
- Social link CRUD.
- Social link publication, visibility, and ordering.
- Public social links API.
- Public contact form submission.
- Contact message persistence in MongoDB.
- Protected administrator contact inbox.
- Message status management.
- Message deletion.
- Request validation, rate limiting, security, and automated tests.

### Out of scope
- Frontend contact form or admin inbox UI.
- Email notifications or automatic replies.
- Email service provider integration.
- WhatsApp or live chat integration.
- File attachments.
- Cloudinary integration.
- CAPTCHA integration.
- Contact analytics and reporting.
- Automatic message classification or AI processing.

## 3. Data Models

Implement two independent Mongoose models: `SocialLink` and `ContactMessage`.

### 3.1 SocialLink

| Field | Type | Requirements |
|---|---|---|
| platform | String | Required, trimmed, normalized identifier |
| label | String | Required, trimmed, bounded length |
| url | String | Required, valid HTTPS URL |
| iconName | String | Optional safe icon identifier |
| displayOrder | Number | Default `0`, non-negative integer |
| isVisible | Boolean | Default `true` |
| isPublished | Boolean | Default `false` |
| timestamps | Mongoose timestamps | Enabled |

Requirements:
- `platform` must be a normalized identifier such as `github`, `linkedin`, or `custom`.
- Support custom platforms without allowing arbitrary HTML or executable code.
- `label` is the display text and must not be treated as executable markup.
- `url` must use HTTPS. Reject unsafe protocols such as `javascript:`, `data:`, and `file:`.
- `iconName` must follow a strict safe identifier pattern such as `^[a-zA-Z0-9_-]+$`.
- New links default to unpublished and visible.
- Prevent accidental duplicate entries using a clearly defined uniqueness policy. Prefer a unique normalized platform key when the product intends one link per platform; otherwise use a unique slug or another documented key.
- Preserve established update and validation conventions from earlier modules.

### 3.2 ContactMessage

| Field | Type | Requirements |
|---|---|---|
| name | String | Required, trimmed, bounded length |
| email | String | Required, normalized, valid email |
| subject | String | Required, trimmed, bounded length |
| message | String | Required, trimmed, bounded length |
| status | String | Enum: `new`, `read`, `archived` |
| timestamps | Mongoose timestamps | Enabled |

Requirements:
- New messages default to `status: "new"`.
- Validate email format and maximum lengths.
- Reject empty or whitespace-only values.
- Do not accept administrator-controlled fields such as `status`, timestamps, or internal metadata from the public submission.
- Do not expose contact messages through public GET APIs.
- Do not store unnecessary request metadata such as raw IP addresses or user-agent strings unless a later, explicitly approved requirement justifies it.
- Never include submitted message contents in application logs.
- Do not execute, render as HTML, or trust submitted content.

## 4. Social Link Publication and Visibility

A social link is publicly available only when:

- `isPublished === true`
- `isVisible === true`

Administrator APIs must include draft and hidden records.

Public responses must contain only approved display fields. Do not expose internal publication flags, `__v`, or unnecessary administrative metadata.

## 5. API Requirements

All endpoints use the existing `/api/v1` prefix.

### 5.1 Administrator — Social Links

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/social-links` | Create a social link |
| GET | `/admin/social-links` | List all social links |
| GET | `/admin/social-links/:id` | Retrieve one social link |
| PATCH | `/admin/social-links/:id` | Update a social link |
| DELETE | `/admin/social-links/:id` | Delete a social link |
| PATCH | `/admin/social-links/:id/publish` | Publish a social link |
| PATCH | `/admin/social-links/:id/unpublish` | Unpublish a social link |
| PATCH | `/admin/social-links/reorder` | Reorder social links |

### 5.2 Public — Social Links

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/portfolio/social-links` | Retrieve published and visible social links |

Sort by `displayOrder` ascending with a deterministic tie-breaker.

### 5.3 Public — Contact Form

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/portfolio/contact` | Submit a contact message |

Requirements:
- No public contact-message listing or retrieval endpoint.
- Validate all submitted fields.
- Ignore or reject administrator-controlled fields.
- Use the existing request-size limits and centralized error handling.
- Apply rate limiting to reduce spam and abusive submissions.
- Use the existing CSRF strategy if compatible with anonymous public form submissions. Verify the actual middleware behavior and ensure the public form can obtain and submit a valid CSRF token.
- Return a generic successful submission response without exposing database identifiers or internal data.
- Do not reveal whether a particular email address has previously submitted a message.

### 5.4 Administrator — Contact Inbox

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/contact-messages` | List messages with pagination and optional status filtering |
| GET | `/admin/contact-messages/:id` | Retrieve one message |
| PATCH | `/admin/contact-messages/:id/status` | Update message status |
| DELETE | `/admin/contact-messages/:id` | Delete a message |

Requirements:
- All endpoints require administrator authentication and authorization.
- The status update and delete operations also require CSRF protection.
- Support bounded pagination.
- Validate status filters and message IDs.
- Use deterministic ordering, newest messages first.
- Do not expose internal metadata unnecessarily.
- Return consistent response structures.

## 6. Validation and Security

Reuse existing middleware and conventions.

### Social links
- Strict allowlist validation.
- Valid HTTPS URLs only.
- Safe icon identifiers.
- Normalized platform identifiers.
- Valid display-order values.
- Reject MongoDB operators and unknown properties.

### Contact submissions
- Strict allowlist for `name`, `email`, `subject`, and `message`.
- Trim and validate input.
- Enforce bounded string lengths and request body size.
- Normalize email consistently.
- Apply rate limiting to the public endpoint.
- Apply CSRF protection consistently with the anonymous submission flow.
- Never log full message content.
- Do not trust HTML or executable content in submissions.
- Return generic error responses without leaking internal details.

### Administrator routes
Every mutation must use:
- Existing JWT authentication.
- Administrator authorization.
- CSRF protection.

Do not create another authentication system.

## 7. Reordering Requirements

Social link reordering must:
- Accept record IDs and display-order values.
- Validate the entire payload before writing.
- Reject malformed IDs, duplicate IDs, negative values, and non-integer order values.
- Confirm all submitted records exist.
- Avoid modifying records omitted from the payload.
- Use a transaction when all-or-nothing behavior is required and supported.
- Otherwise implement and document a safe alternative.
- Do not claim `bulkWrite()` alone provides multi-document atomicity.

## 8. Database Indexes

Add indexes justified by actual query patterns.

Consider:
- Unique index for the chosen normalized social-link uniqueness key.
- `{ isPublished: 1, isVisible: 1, displayOrder: 1, createdAt: -1 }` for public social-link queries.
- `{ displayOrder: 1, createdAt: -1 }` for administrator social-link ordering.
- `{ status: 1, createdAt: -1 }` for contact inbox filtering.
- `{ createdAt: -1 }` if needed for default inbox ordering.

Avoid redundant indexes and document their purpose.

## 9. Error Handling

Use the existing centralized error conventions.

Expected handling:
- `400 Bad Request`: invalid fields, malformed IDs, invalid status, or invalid payload.
- `401 Unauthorized`: missing or invalid administrator authentication.
- `403 Forbidden`: insufficient authorization or CSRF failure, following existing conventions.
- `404 Not Found`: missing administrator resource.
- `409 Conflict`: duplicate social-link uniqueness key.
- `429 Too Many Requests`: rate limit exceeded.

Do not expose stack traces, database details, or sensitive message contents in error responses.

## 10. Testing and Acceptance Criteria

### Social link tests
- Model constraints and defaults.
- URL and icon validation.
- Platform normalization and uniqueness.
- CRUD operations.
- Publish and unpublish.
- Public filtering.
- Ordering and reordering.
- Authentication, authorization, and CSRF.

### Contact form tests
- Valid message submission.
- Required field validation.
- Invalid email.
- Empty and whitespace-only input.
- Maximum length and body-size limits.
- Rejection of protected fields.
- Rate limiting.
- CSRF behavior for anonymous submissions.
- No public message retrieval.
- No sensitive message content in logs or public responses.

### Contact inbox tests
- Administrator listing and pagination.
- Status filtering.
- Single-message retrieval.
- Status updates.
- Deletion.
- Authentication, authorization, and CSRF.
- Invalid ID and status handling.

### Regression tests
Run all existing Phase 0–5 test suites and the new Phase 6 suite.

### Acceptance criteria
1. Social links are dynamically manageable.
2. Public social-link responses exclude drafts and hidden records.
3. Visitors can submit valid contact messages.
4. Public visitors cannot retrieve stored messages.
5. The administrator can securely manage the contact inbox.
6. Rate limiting and anonymous CSRF behavior are verified.
7. Strict validation and existing security conventions are preserved.
8. Reordering handles partial-write risks appropriately.
9. All tests pass without failures or skipped tests.
10. `npm run check` passes.
11. Implementation and test results are documented.
12. No Git commit, push, merge, or deployment occurs without explicit approval.