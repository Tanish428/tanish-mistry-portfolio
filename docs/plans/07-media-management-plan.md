# PLAN-07: Contact & Social Links Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 6 — Contact & Social Links Management  
**Specification:** `docs/specs/07-contact-social-links-management.md`  
**Status:** Proposed

## 1. Implementation Objective

Implement:
- SocialLink management for dynamic professional profile links.
- ContactMessage management for public visitor submissions and a protected administrator inbox.

Reuse the existing backend architecture, security middleware, database connection, and test infrastructure.

## 2. Expected Architecture

Follow existing module conventions. A proposed structure is:

```text
backend/
  src/
    modules/
      contact-social/
        social-link.model.js
        contact-message.model.js
        contact-social.validation.js
        contact-social.service.js
        contact-social.controller.js
        contact-social.routes.js
  tests/
    contact-social.test.js
```

If existing modules follow a different structure, preserve repository consistency.

Keep social-link management and contact-message management as separate domain resources. Shared helpers are acceptable where they do not obscure domain responsibilities.

## 3. Implementation Sequence

### Step 1 — Repository inspection

Before changes:
1. Read `AGENTS.md` and applicable `.agents/rules/`.
2. Read SPEC-07 completely.
3. Inspect the existing Phase 1–5 modules.
4. Inspect existing authentication, authorization, CSRF, rate-limiting, and error-handling middleware.
5. Inspect how anonymous clients obtain CSRF tokens.
6. Inspect current request-size limits and CORS configuration.
7. Inspect `backend/src/routes/index.js`.
8. Verify the current branch is `develop`.
9. Identify conflicts and technical risks.

Do not modify files during inspection.

### Step 2 — SocialLink model

Implement:
- Normalized platform identifier.
- Display label.
- HTTPS URL.
- Optional safe icon identifier.
- Display order.
- Visibility and publication flags.
- Timestamps.

Enforce the selected uniqueness policy at the database level.

### Step 3 — ContactMessage model

Implement:
- Name.
- Normalized email.
- Subject.
- Message.
- Status enum.
- Timestamps.

New messages must default to `new`.

Do not accept administrative status or internal fields from public submissions.

Avoid unnecessary personal metadata and never log full submitted messages.

### Step 4 — Validation

Implement strict validators for:
- Social link creation and partial updates.
- Social-link IDs and reordering.
- Public contact submissions.
- Contact-message IDs.
- Inbox pagination.
- Status filtering.
- Message status updates.

Reject unknown fields, MongoDB operators, protected fields, invalid URLs, invalid emails, oversized strings, and invalid ordering values.

### Step 5 — Service layer

Implement independent service operations.

**Social links**
- Create.
- List all administrator records.
- Retrieve one record.
- Update.
- Delete.
- Publish.
- Unpublish.
- Reorder.
- Retrieve public social links.

**Contact messages**
- Accept public submissions.
- List messages with pagination.
- Filter by status.
- Retrieve one message.
- Update status.
- Delete a message.

Keep public and administrator query logic separate.

Never implement a public message retrieval or listing operation.

### Step 6 — Contact submission security

This step requires special attention.

1. Inspect the existing CSRF implementation.
2. Confirm how an unauthenticated visitor obtains a valid CSRF token.
3. Confirm that the contact submission route can validate the token without requiring administrator authentication.
4. Apply the existing rate-limiting package or established limiter pattern.
5. Verify rate limits use the correct client identity under the current proxy configuration.
6. Ensure request-size limits are enforced.
7. Return generic successful submission responses.
8. Do not expose database IDs or submitted content in public responses.
9. Do not log the full contact message.

Do not bypass CSRF protection merely to make anonymous submissions easier. If the existing implementation cannot safely support this flow, explain the problem and propose a minimal change before implementing it.

### Step 7 — Controller and route layers

Create thin controllers and implement all endpoints in SPEC-07.

Ensure:
- Public social links and contact submission are accessible without administrator login.
- Contact inbox routes require administrator authentication and authorization.
- Administrator mutations use CSRF protection.
- Contact submission uses its dedicated rate limiter and the verified anonymous CSRF flow.
- Static routes such as `/reorder` are registered before conflicting parameterized routes.

Mount the module through the existing route index.

### Step 8 — Reordering

Validate the entire social-link reorder payload before writes.

Confirm all submitted records exist and do not modify omitted records.

Use transactions if all-or-nothing behavior is required and supported. Otherwise, implement and document a safe alternative.

Do not claim `bulkWrite()` alone guarantees multi-document atomicity.

### Step 9 — Automated testing

Create a test suite following existing conventions.

Cover:

**Social links**
- Model defaults and constraints.
- URL and icon validation.
- Uniqueness.
- CRUD.
- Publication and visibility.
- Public filtering.
- Reordering.
- Security middleware.

**Contact form**
- Valid submissions.
- Invalid and missing fields.
- Email normalization.
- Length and request-size limits.
- Protected-field rejection.
- Anonymous CSRF behavior.
- Rate limiting.
- Public response privacy.
- Absence of public retrieval endpoints.

**Contact inbox**
- Administrator listing.
- Pagination and filtering.
- Single-message retrieval.
- Status updates.
- Deletion.
- Authentication, authorization, and CSRF.

Run all existing Phase 0–5 regression suites.

### Step 10 — Final verification

Execute:

```bash
npm run check
npm test
```

Inspect:
- Actual test results and exit codes.
- Git branch and working-tree status.
- Changed files.
- Database indexes.
- Contact submission security.
- Rate limiter behavior.
- Public response projections.
- Existing module regressions.
- Accidental environment or secret changes.

Do not commit, push, merge, or deploy.

## 4. Expected API Groups

```text
/api/v1
  /admin
    /social-links
      POST /
      GET /
      GET /:id
      PATCH /:id
      DELETE /:id
      PATCH /:id/publish
      PATCH /:id/unpublish
      PATCH /reorder

    /contact-messages
      GET /
      GET /:id
      PATCH /:id/status
      DELETE /:id

  /portfolio
    /social-links
      GET /

    /contact
      POST /
```

Ensure all routes have the correct middleware and no route collisions.

## 5. Expected Deliverables

- SocialLink model.
- ContactMessage model.
- Validation module.
- Service module.
- Controller module.
- Route module.
- Automated tests.
- Updated route index.
- Updated package scripts only if necessary.
- Implementation report.

Do not add dependencies without a concrete technical justification.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Spam submissions | Rate limiting and input validation |
| Anonymous CSRF failure | Verify token acquisition and submission flow |
| Public exposure of messages | No public retrieval endpoints |
| Message content leakage | Controlled responses and no message-content logging |
| Unsafe social URLs | HTTPS-only URL validation |
| Duplicate social profiles | Database-enforced uniqueness policy |
| Partial reorder writes | Transaction or documented safe alternative |
| Unauthorized inbox access | Existing JWT and administrator authorization |
| Regression | Full previous-phase test suite |

## 7. Completion Report Requirements

Provide:
1. Implementation summary.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Database schema and indexes.
6. API endpoints implemented.
7. Contact form CSRF and rate-limiting details.
8. Security and validation details.
9. Exact test results.
10. Regression results.
11. Known limitations.
12. Git branch and working-tree status.
13. Recommended next steps.

Clearly distinguish verified results from assumptions.