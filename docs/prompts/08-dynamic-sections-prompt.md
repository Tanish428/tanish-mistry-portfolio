# PROMPT-08: Implement Media Management

**Task ID:** TASK-08  
**Phase:** 7 — Media Management  
**Specification:** `docs/specs/08-media-management.md`  
**Implementation Plan:** `docs/plans/08-media-management-plan.md`  
**Target Branch:** `develop`

## 1. Role

Act as a senior backend engineer implementing secure Cloudinary-based image management for a production-quality MERN portfolio application.

Follow all repository instructions, existing architecture, security standards, and completed module conventions.

## 2. Mandatory Initial Inspection

Before implementation:

- Read `AGENTS.md`.
- Read all applicable `.agents/rules/`.
- Read SPEC-08 and PLAN-08 completely.
- Inspect the complete Phase 0–6 implementation.
- Inspect Profile and Project schemas, services, validation, controllers, routes, and tests.
- Inspect environment configuration and `.env.example`.
- Inspect existing dependencies and package scripts.
- Inspect the current Git branch and working tree.

Verify the current branch is `develop`.

Do not assume that previous completion reports guarantee the correctness of existing code.

## 3. Mandatory Two-Stage Workflow

### Stage A — Inspection and implementation proposal

This stage is strictly read-only.

1. Inspect the repository architecture.
2. Review SPEC-08 and PLAN-08.
3. Inspect the existing profile image and project thumbnail fields.
4. Check whether Cloudinary and multipart upload dependencies already exist.
5. Identify the required environment variables.
6. Propose the Media model and indexes.
7. Define secure image upload and file validation.
8. Define profile and project integration.
9. Define media reference tracking and safe deletion.
10. Explain Cloudinary/MongoDB failure handling.
11. Identify exact files to create and modify.
12. Define the test and regression strategy.
13. Identify conflicts, ambiguities, and migration requirements.

Provide a detailed implementation proposal.

**STOP after Stage A. Do not create, modify, delete, overwrite, or install anything. Wait for my explicit approval.**

### Stage B — Implementation

Begin only after explicit approval.

Implement:

**Cloudinary configuration**
- Centralized server-side configuration.
- Environment validation.
- `.env.example` placeholders.
- No exposed secrets.

**Media model**
- Cloudinary public ID.
- HTTPS delivery URL.
- Image format and dimensions.
- File size.
- Controlled folder.
- Optional sanitized filename and alt text.
- Timestamps and required indexes.

**Image upload**
- Single image upload endpoint.
- Multipart/form-data validation.
- JPEG, PNG, and WebP support.
- Maximum 5 MB.
- Actual image content validation where practical.
- Server-generated unique public IDs.
- Server-controlled Cloudinary folder.
- No permanent local temporary-file storage unless strictly necessary.
- Compensating cleanup if MongoDB persistence fails after successful upload.

**Media management**
- Administrator listing with pagination.
- Retrieve one media record.
- Delete unused media.
- Proper handling of Cloudinary provider errors.

**Profile integration**
- Managed profile image references.
- Preserve `profileImageUrl` in the public response.
- Maintain compatibility with existing records.
- Prevent deletion of referenced media.

**Project integration**
- Managed project thumbnail references.
- Preserve `thumbnailUrl` in the public response.
- Maintain compatibility with existing records.
- Prevent deletion of referenced media.

### 4. Mandatory Security Requirements

- All administrator operations require existing JWT authentication and administrator authorization.
- Upload and delete operations require CSRF protection.
- Cloudinary credentials must remain server-side.
- Never trust original filenames or client-provided MIME types alone.
- Reject unsupported formats and oversized uploads.
- Do not permit arbitrary Cloudinary folders or transformations.
- Do not allow arbitrary remote URL fetching.
- Do not expose provider credentials or raw provider errors.
- Do not delete assets that are still referenced.
- Do not claim MongoDB and Cloudinary operations are transactionally atomic.

### 5. Automated Testing

Create a comprehensive media test suite.

Cover:
- Cloudinary configuration.
- Supported image formats.
- Invalid and oversized files.
- Missing upload file.
- MIME and file-signature mismatch.
- Cloudinary success and failure.
- MongoDB persistence failure.
- Compensating cleanup.
- Media listing and retrieval.
- Referenced-media deletion protection.
- Profile image integration.
- Project thumbnail integration.
- Legacy HTTPS URL compatibility.
- Authentication, authorization, and CSRF.

Mock Cloudinary operations in automated tests. Do not require real Cloudinary credentials for the normal test suite.

### 6. Verification

Execute:

```bash
npm run check
npm test
```

Run all regression suites from Phase 0 through Phase 6.

Report actual pass, fail, and skipped counts.

Inspect the final Git diff, changed files, dependency changes, and working-tree status.

### 7. Scope Restrictions

This task covers only Phase 7.

Do not implement:
- Video uploads.
- Audio uploads.
- Resume or certificate uploads.
- Frontend upload UI.
- Image editing UI.
- Public media browsing.
- Features belonging to future phases.

Do not modify unrelated modules.

If an existing schema requires migration or a security limitation requires an out-of-scope change, stop and explain it before proceeding.

### 8. Final Completion Report

Provide:
1. Implementation summary.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Environment variables.
6. Database schemas and indexes.
7. API endpoints.
8. Upload security and validation.
9. Profile and Project integration.
10. Media deletion and failure recovery.
11. Exact test results.
12. Regression results.
13. Known limitations.
14. Git branch and working-tree status.
15. Recommended next steps.

### Strict Git Restrictions

- Work only on `develop`.
- Never switch to `main`.
- Do not commit.
- Do not push.
- Do not merge.
- Do not deploy.
- Never perform Git operations without my explicit authorization.

Follow repository instructions strictly.

**Begin with Stage A only. Wait for my explicit approval before implementing Stage B.**