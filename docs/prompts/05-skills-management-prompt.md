# PROMPT-05: Implement Skills Management

**Task ID:** TASK-05  
**Phase:** 4 — Skills Management  
**Specification:** `docs/specs/05-skills-management.md`  
**Implementation Plan:** `docs/plans/05-skills-management-plan.md`  
**Target Branch:** `develop`

## 1. Role

Act as a senior backend engineer implementing a secure, maintainable Skills Management module for a production-quality MERN portfolio application.

Follow the repository's existing architecture, coding conventions, security standards, and documentation.

## 2. Mandatory Instructions

Before implementation:
- Read `AGENTS.md`.
- Read every applicable rule under `.agents/rules/`.
- Read SPEC-05 and PLAN-05 completely.
- Inspect the existing Phase 0, Phase 1, Phase 2, and Phase 3 implementations.
- Inspect existing models, validation, services, controllers, routes, middleware, tests, and package scripts.
- Verify the current Git branch is `develop`.

Do not assume that previous completion reports guarantee the current code is correct.

Do not:
- Work on `main`.
- Replace existing architecture without justification.
- Introduce unnecessary dependencies.
- weaken authentication, authorization, or CSRF protections.
- Expose internal fields through public APIs.
- Store executable code or arbitrary HTML in database fields.
- Modify unrelated modules.
- Commit, push, merge, or deploy.

If the repository differs from the documented architecture, inspect and explain the discrepancy before deciding how to proceed.

## 3. Required Two-Stage Workflow

### Stage A — Inspection and implementation proposal

This stage is strictly read-only.

1. Inspect the repository and applicable rules.
2. Verify the Phase 0–3 integration points.
3. Identify the actual conventions used by existing modules.
4. Review SPEC-05 and PLAN-05 against the existing implementation.
5. Identify any ambiguity, technical conflict, or unsupported assumption.
6. Propose the exact files to create and modify.
7. Propose the implementation sequence.
8. Identify risks, database index requirements, and test coverage.
9. Explain how category-scoped reordering will be implemented safely.
10. Confirm whether MongoDB transactions are supported by the configured deployment.

Provide a concise but complete implementation proposal.

**STOP after Stage A. Do not create or modify files. Wait for explicit approval before implementation.**

### Stage B — Implementation

Begin only after explicit approval.

Implement the module according to the approved proposal and SPEC-05.

### 3.1 Data Models

Implement:
- `SkillCategory`
- `Skill`

Follow all fields, defaults, enums, constraints, timestamps, and index requirements from SPEC-05.

Ensure:
- Category slugs are unique.
- Skill slugs are unique.
- Slugs are normalized.
- Existing slugs are preserved when names change unless explicitly modified.
- Skills reference valid categories.
- Categories with associated skills cannot be deleted.
- New categories and skills are unpublished by default.
- Proficiency levels use the exact specified enum.
- Icon identifiers are safe identifiers, not executable code.

### 3.2 Validation

Implement strict request validation for every endpoint.

Reject:
- Unknown properties.
- Protected/internal fields.
- MongoDB operators.
- Invalid ObjectIds.
- Invalid enums.
- Invalid URLs if any are introduced by the approved schema.
- Invalid display-order values.
- Duplicate IDs and invalid reorder payloads.

Do not pass raw request objects into database queries or update operations.

### 3.3 Service and Controller

Keep business logic in the service layer.

Implement category and skill CRUD, publication, visibility, featuring, public filtering, and ordering according to SPEC-05.

Controllers must remain thin and use existing centralized error handling.

Handle duplicate-key conflicts consistently.

### 3.4 Routes and Security

Implement all specified administrator and public endpoints.

Every administrator mutation must use the existing:
- JWT authentication middleware.
- Administrator authorization middleware.
- CSRF protection middleware.

Do not create duplicate authentication logic.

Ensure static routes such as `/reorder` are registered before parameterized routes when necessary.

### 3.5 Public API Restrictions

Public category responses must contain only published and visible categories.

Public skill responses must contain only published and visible skills whose referenced categories are also published and visible.

Do not expose administrative publication flags, internal database metadata, or unnecessary fields.

Apply deterministic sorting and validated filters.

### 3.6 Reordering Safety

Implement category reordering and category-scoped skill reordering.

Validate the entire request before performing writes.

Do not claim that `bulkWrite()` alone makes a multi-document operation atomic.

Use a MongoDB transaction when supported and required. Otherwise, implement and document a safe alternative.

Never modify records omitted from the reorder request.

### 3.7 Automated Testing

Create comprehensive tests for:
- Models and defaults.
- Slug generation and uniqueness.
- Category CRUD and publication.
- Category deletion restrictions.
- Skill CRUD and category references.
- Proficiency validation.
- Featured status.
- Public category and skill filtering.
- Category visibility and publication enforcement.
- Ordering and filtering.
- Reordering validation and failure handling.
- Authentication, authorization, and CSRF.
- Invalid input and duplicate-key conflicts.

Run all existing regression suites and the complete test suite.

## 4. Verification Commands

Execute the repository's actual scripts, including:

```bash
npm run check
npm test
```

If necessary, run individual suites to isolate failures.

Do not report success based on expected behavior or code inspection alone. Report actual command results.

## 5. Scope Protection

This task is limited to Phase 4 — Skills Management.

Do not implement:
- Cloudinary upload integration.
- Frontend admin screens.
- Public portfolio UI.
- GitHub or LinkedIn integrations.
- Analytics.
- Automated skill verification.
- Dynamic arbitrary frontend components.
- Features belonging to future phases.

Do not modify completed modules unless an actual integration defect makes it necessary. If such a defect is found, explain it and wait for approval before making out-of-scope changes.

## 6. Final Report

After implementation and verification, provide:

1. Implementation summary.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Database schema and indexes.
6. API endpoints implemented.
7. Security and validation details.
8. Test results with exact pass/fail/skip counts.
9. Regression test results.
10. Known limitations.
11. Git branch and working-tree status.
12. Recommended next steps.

Include any deviations from SPEC-05 and explain why they were necessary.

**Final restriction:** Leave all changes uncommitted. Do not push, merge, or deploy. Wait for explicit user authorization before any Git operation.