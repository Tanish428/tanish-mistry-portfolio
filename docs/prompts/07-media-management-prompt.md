# PROMPT-07: Implement Contact & Social Links Management

**Task ID:** TASK-07  
**Phase:** 6 — Contact & Social Links Management  
**Specification:** `docs/specs/07-contact-social-links-management.md`  
**Implementation Plan:** `docs/plans/07-contact-social-links-management-plan.md`  
**Target Branch:** `develop`

## 1. Role

Act as a senior backend engineer implementing a secure, maintainable Contact & Social Links Management module for a production-quality MERN portfolio.

Follow all repository instructions and existing architecture.

## 2. Mandatory Initial Inspection

Before implementation:
- Read `AGENTS.md`.
- Read all applicable `.agents/rules/`.
- Read SPEC-07 and PLAN-07 completely.
- Inspect existing Phase 0–5 models, services, controllers, routes, middleware, and tests.
- Inspect existing CSRF and rate-limiting configuration.
- Verify how anonymous visitors obtain CSRF tokens.
- Inspect request-size limits and CORS configuration.
- Verify that the current branch is `develop`.

Do not assume the previous implementation reports guarantee code correctness.

## 3. Mandatory Two-Stage Workflow

### Stage A — Inspection and proposal

This stage is strictly read-only.

1. Inspect the existing architecture.
2. Review the specification and implementation plan.
3. Identify the exact files to create and modify.
4. Design the SocialLink and ContactMessage models.
5. Define database indexes and uniqueness policy.
6. Verify anonymous CSRF token acquisition and validation.
7. Define the public contact endpoint's rate-limiting strategy.
8. Verify contact inbox authorization.
9. Identify security risks and potential conflicts.
10. Define the test and regression strategy.

Present a detailed implementation proposal.

**STOP after Stage A. Do not create, modify, delete, overwrite, or install anything. Wait for my explicit approval.**

### Stage B — Implementation

Begin only after explicit approval.

Implement the following.

### 3.1 Social Links

- SocialLink Mongoose model.
- Social link CRUD.
- Slug or normalized platform uniqueness according to the approved design.
- HTTPS-only URL validation.
- Safe icon identifier validation.
- Publication and visibility controls.
- Reordering.
- Public social links API.

### 3.2 Contact Form

- ContactMessage Mongoose model.
- Public contact submission endpoint.
- Name, email, subject, and message validation.
- Email normalization.
- Message status defaults to `new`.
- Anonymous CSRF protection.
- Rate limiting.
- Request-size protection.
- Generic public responses.
- No public message listing or retrieval.

### 3.3 Administrator Contact Inbox

- Paginated message listing.
- Status filtering.
- Single-message retrieval.
- Status updates.
- Message deletion.
- Existing JWT authentication and administrator authorization.
- CSRF protection for mutations.

### 3.4 Security Requirements

- Never expose submitted messages through public GET endpoints.
- Never log complete message contents.
- Never accept administrator-controlled fields from public submissions.
- Never store unnecessary request metadata.
- Never trust submitted HTML or executable content.
- Do not bypass CSRF protection.
- Do not weaken existing security middleware.

### 3.5 Reordering

Validate the entire reorder request before writing.

Use transactions when appropriate and supported. Otherwise, document and implement a safe alternative.

Do not claim that `bulkWrite()` alone guarantees multi-document atomicity.

## 4. Automated Testing

Create comprehensive tests for:

- SocialLink model and validation.
- Social link CRUD and uniqueness.
- Publication and visibility.
- Public social-link filtering.
- Reordering.
- Contact form submissions.
- Invalid email and missing fields.
- Length and body-size restrictions.
- Protected-field rejection.
- Anonymous CSRF.
- Rate limiting.
- Public response privacy.
- Administrator inbox listing and pagination.
- Status updates and deletion.
- Authentication, authorization, and CSRF.
- Existing Phase 0–5 regression suites.

## 5. Verification

Execute:

```bash
npm run check
npm test
```

Report actual command results, including passed, failed, and skipped counts.

Inspect the final Git diff and working-tree status.

Do not report tests as successful unless they were actually executed.

## 6. Scope Restrictions

This task covers only Phase 6.

Do not implement:
- Frontend contact UI.
- Email notifications.
- Automatic replies.
- Email provider integration.
- WhatsApp integration.
- CAPTCHA.
- File attachments.
- Cloudinary integration.
- Analytics.
- Features belonging to future phases.

If an existing infrastructure limitation prevents secure implementation, stop and explain it before making out-of-scope changes.

## 7. Final Completion Report

Provide:
1. Implementation summary.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Database schemas and indexes.
6. API endpoints.
7. Anonymous CSRF and rate-limiting implementation.
8. Security and validation details.
9. Exact test results.
10. Regression results.
11. Known limitations.
12. Git branch and working-tree status.
13. Recommended next steps.

### Strict Git Restrictions

- Work only on `develop`.
- Do not switch to `main`.
- Do not commit.
- Do not push.
- Do not merge.
- Do not deploy.
- Never perform Git operations without my explicit authorization.

Follow repository instructions strictly.

**Begin with Stage A only. Wait for my explicit approval before implementing Stage B.**