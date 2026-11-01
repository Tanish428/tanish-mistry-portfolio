# PROMPT-06: Implement Experience & Education Management

**Task ID:** TASK-06  
**Phase:** 5 — Experience & Education Management  
**Specification:** `docs/specs/06-experience-education-management.md`  
**Implementation Plan:** `docs/plans/06-experience-education-management-plan.md`  
**Target Branch:** `develop`

## 1. Role

Act as a senior backend engineer implementing a secure, maintainable Experience & Education Management module for a production-quality MERN portfolio application.

Follow the repository's architecture, coding conventions, security rules, and existing implementation patterns.

## 2. Mandatory Instructions

Before implementation:
- Read `AGENTS.md`.
- Read all applicable `.agents/rules/`.
- Read SPEC-06 and PLAN-06 completely.
- Inspect the existing Phase 0–4 implementation.
- Inspect existing models, validation, services, controllers, routes, middleware, and tests.
- Inspect package scripts and database configuration.
- Verify the current branch is `develop`.

Do not assume existing code is correct merely because previous reports claim successful tests.

Do not:
- Work on `main`.
- Introduce unnecessary dependencies.
- Weaken authentication, authorization, or CSRF.
- Expose unpublished or hidden records.
- Modify unrelated modules.
- Replace existing architecture without justification.
- Commit, push, merge, or deploy.

## 3. Mandatory Two-Stage Workflow

### Stage A — Inspection and proposal

This stage is strictly read-only.

1. Inspect the repository and applicable rules.
2. Review SPEC-06 and PLAN-06.
3. Inspect Phase 1–4 module conventions.
4. Identify integration points.
5. Verify database and transaction capabilities.
6. Identify potential conflicts or ambiguities.
7. List exact files to create and modify.
8. Propose the model and index design.
9. Propose validation and date-handling rules.
10. Propose the API and middleware integration.
11. Define the testing and regression strategy.

Provide a detailed implementation proposal.

**STOP after Stage A. Do not create, modify, delete, or overwrite files. Wait for my explicit approval.**

### Stage B — Implementation

Begin only after explicit approval.

Implement both resources independently:

**Experience**
- Create, read, update, and delete.
- Employment types and work modes.
- Current and completed experience.
- Start and end date validation.
- Responsibilities, achievements, and technologies.
- Publication and visibility.
- Display ordering.

**Education**
- Create, read, update, and delete.
- Institution, degree, and field of study.
- Current and completed education.
- Start and end date validation.
- Grade, description, and achievements.
- Publication and visibility.
- Display ordering.

### 4. Security and API Requirements

Implement all administrator and public endpoints specified in SPEC-06.

Every administrator mutation must use the existing:
- JWT authentication middleware.
- Administrator authorization middleware.
- CSRF protection middleware.

Use strict request allowlists and reject:
- Unknown fields.
- Protected fields.
- MongoDB operators.
- Invalid ObjectIds.
- Invalid enums.
- Invalid date ranges.
- Invalid display-order values.

Public endpoints must return only published and visible records.

Return controlled response projections rather than raw Mongoose documents.

### 5. Reordering Requirements

Implement separate experience and education reorder operations.

Validate the entire payload before writing.

Do not modify records omitted from the request.

Use transactions when appropriate and supported. Otherwise, implement and document a safe alternative.

Do not describe `bulkWrite()` alone as an atomic multi-document transaction.

### 6. Testing

Create comprehensive automated tests for:
- Both models.
- Date validation and current-status consistency.
- CRUD operations.
- Publishing and unpublishing.
- Visibility restrictions.
- Reordering.
- Public API filtering and sorting.
- Authentication and authorization.
- CSRF.
- Invalid inputs and error handling.

Run all regression suites for Phases 0–4 and the complete test suite.

Execute:

```bash
npm run check
npm test
```

Report actual results, including pass, fail, and skipped counts.

### 7. Scope Restrictions

This task covers only Phase 5.

Do not implement:
- Frontend screens.
- Resume or certificate uploads.
- Cloudinary integration.
- LinkedIn synchronization.
- Employment verification.
- Features belonging to future phases.

If an unrelated defect is discovered, explain it and request approval before changing out-of-scope files.

### 8. Final Report

Provide:
1. Implementation summary.
2. Created and modified files.
3. Dependencies.
4. Database schemas and indexes.
5. API endpoints.
6. Security and validation details.
7. Test results.
8. Regression results.
9. Known limitations.
10. Git branch and working-tree status.
11. Recommended next steps.

**Strict Git restrictions:**
- Work only on `develop`.
- Do not commit.
- Do not push.
- Do not merge.
- Do not deploy.
- Never switch to `main`.
- Wait for explicit authorization before any Git operation.

Begin with Stage A only. Stop and wait for approval before implementation.