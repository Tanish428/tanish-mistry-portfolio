# PLAN-08: Media Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 7 — Media Management  
**Task ID:** TASK-08  
**Specification:** `docs/specs/08-media-management.md`  
**Status:** Proposed

## 1. Implementation Objective

Implement Cloudinary-based image management and integrate it with the existing Profile and Project modules.

The module must provide a secure upload and media lifecycle while preserving the existing public API contracts.

## 2. Architecture

Follow the existing backend conventions. Proposed structure:

```text
backend/
  src/
    config/
      cloudinary.js
    modules/
      media/
        media.model.js
        media.validation.js
        media.service.js
        media.controller.js
        media.routes.js
  tests/
    media.test.js
```

Adapt the file structure to existing repository conventions if necessary.

Profile and Project integration should use their existing modules. Avoid creating duplicate profile or project business logic inside the media module.

## 3. Implementation Sequence

### Step 1 — Repository inspection

Before changing files:
1. Read `AGENTS.md` and all applicable `.agents/rules/`.
2. Read SPEC-08 completely.
3. Inspect existing Phase 0–6 implementation.
4. Inspect `profile.model.js`, `profile.service.js`, and their validation and tests.
5. Inspect `project.model.js`, `project.service.js`, and their validation and tests.
6. Inspect environment configuration and `.env.example`.
7. Inspect installed Cloudinary and multipart dependencies.
8. Inspect existing error-handling and authorization middleware.
9. Inspect existing media-related fields and their current data compatibility.
10. Verify the current Git branch is `develop`.

Do not modify files during inspection.

### Step 2 — Dependency and configuration assessment

Check whether `cloudinary` and `multer` are already installed.

If missing:
- Propose the exact dependencies and compatible versions.
- Explain why they are required.
- Wait for approval before installing them if the project workflow requires dependency approval.

Implement centralized Cloudinary configuration using server-side environment variables.

Update `.env.example` with placeholders only.

Do not expose credentials through public environment configuration or API responses.

### Step 3 — Media model

Implement the `Media` schema with:
- Unique Cloudinary public ID.
- HTTPS delivery URL.
- Image resource type.
- Validated format.
- File size.
- Image dimensions.
- Controlled folder.
- Sanitized optional filename.
- Optional alt text.
- Timestamps.

Add indexes based on actual listing and lookup requirements.

### Step 4 — Upload pipeline

Implement a protected single-image upload endpoint.

Recommended flow:

1. Authenticate the administrator.
2. Authorize the administrator role.
3. Validate CSRF.
4. Parse multipart data with the configured file-size limit.
5. Validate file presence, content type, and supported image format.
6. Validate image content or file signature where practical.
7. Generate a server-controlled Cloudinary public ID.
8. Upload through the official Cloudinary SDK.
9. Persist the resulting metadata in MongoDB.
10. Return a controlled response.

If MongoDB persistence fails after Cloudinary upload succeeds, attempt a compensating Cloudinary deletion. If compensation fails, report the orphaned asset clearly for later reconciliation.

Do not store file bytes in MongoDB or write persistent temporary files unnecessarily.

### Step 5 — Media service and controller

Implement:
- Upload image.
- List media with bounded pagination.
- Retrieve one media record.
- Delete an unused media record.

Keep provider communication inside the service or a dedicated provider adapter.

Controllers must remain thin and use existing centralized error handling.

### Step 6 — Profile integration

Inspect the current Profile schema and service.

Integrate managed image references while:
- Preserving the existing `profileImageUrl` public field.
- Storing a reliable media reference or Cloudinary public ID.
- Validating that selected media exists and is an image.
- Preserving current draft and publication behavior.
- Avoiding accidental deletion of images still referenced elsewhere.
- Maintaining compatibility with existing records that contain HTTPS image URLs.

If a schema migration is required, propose it before implementation and preserve existing data.

### Step 7 — Project integration

Inspect the current Project schema and service.

Integrate managed thumbnail references while:
- Preserving the existing `thumbnailUrl` public field.
- Storing a reliable media reference or Cloudinary public ID.
- Validating that the selected media exists and is an image.
- Preserving project publication and visibility behavior.
- Maintaining compatibility with existing HTTPS thumbnail URLs.
- Preventing deletion of referenced media.

Do not duplicate project CRUD logic in the media module.

### Step 8 — Safe deletion

Implement a reference-checking process.

Before deletion:
1. Retrieve the media record.
2. Check profile references.
3. Check project references.
4. Check any additional managed references found during inspection.
5. Reject with `409 Conflict` if referenced.
6. Delete the Cloudinary asset.
7. Delete the MongoDB metadata record only after successful provider deletion, with a documented strategy for provider success followed by database failure.

MongoDB and Cloudinary cannot participate in one atomic transaction. Handle this explicitly.

Do not report deletion as successful if the Cloudinary operation fails.

### Step 9 — Automated testing

Create `backend/tests/media.test.js` using existing conventions.

Test:
- Cloudinary configuration.
- Valid image uploads.
- Invalid formats.
- Oversized files.
- Missing files.
- File signature mismatches.
- Cloudinary provider errors.
- MongoDB persistence failures and compensating cleanup.
- Media listing and pagination.
- Media retrieval.
- Referenced-media deletion protection.
- Profile integration.
- Project integration.
- Legacy URL compatibility.
- Authentication, authorization, and CSRF.

Use mocked Cloudinary calls for deterministic automated tests. Do not require live Cloudinary credentials in the normal test suite.

### Step 10 — Final verification

Execute:

```bash
npm run check
npm test
```

Inspect:
- Actual test results and exit codes.
- Database schemas and indexes.
- Cloudinary environment configuration.
- Profile and Project compatibility.
- File-size and content validation.
- Reference protection.
- Git branch and working-tree status.
- Changed files and dependencies.
- Environment-file exclusion.

Do not commit, push, merge, or deploy.

## 4. Expected API Endpoints

```text
/api/v1
  /admin
    /media
      POST /images
      GET /
      GET /:id
      DELETE /:id
```

All endpoints require administrator authentication and authorization. Upload and deletion additionally require CSRF protection.

## 5. Expected Deliverables

- Centralized Cloudinary configuration.
- Media Mongoose model.
- Media validation module.
- Media service.
- Media controller.
- Media routes.
- Profile image integration.
- Project thumbnail integration.
- Automated media tests.
- Updated environment example.
- Updated route index.
- Updated package scripts only if necessary.
- Implementation report.

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Cloudinary credentials exposed | Server-only configuration |
| Malicious file upload | File size, format, and signature validation |
| Local storage accumulation | In-memory upload pipeline |
| Orphaned Cloudinary asset | Compensating cleanup and documented reconciliation |
| Referenced asset deletion | Reference checks |
| Provider failure | Explicit error handling |
| Existing URL breakage | Backward-compatible fields |
| Duplicate upload | Server-generated unique public IDs |
| Regression | Full Phase 0–6 test suite |

## 7. Completion Report Requirements

Provide:
1. Implementation summary.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Environment variables.
6. Database schema and indexes.
7. API endpoints.
8. Upload validation and security details.
9. Profile and Project integration details.
10. Deletion and failure-recovery behavior.
11. Exact test results.
12. Regression results.
13. Known limitations.
14. Git branch and working-tree status.
15. Recommended next steps.

Clearly distinguish actual test execution results from assumptions.