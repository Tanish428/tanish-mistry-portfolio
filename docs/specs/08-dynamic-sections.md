# SPEC-08: Media Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 7 — Media Management  
**Task ID:** TASK-08  
**Module:** Cloudinary Media Management  
**Status:** Proposed

## 1. Objective

Implement centralized image upload and media management using Cloudinary.

The administrator must be able to upload, view, and delete portfolio images through protected REST APIs. Existing profile and project modules must use Cloudinary-hosted images without exposing Cloudinary credentials to the frontend.

The implementation must preserve the existing public portfolio API response contracts wherever possible.

## 2. Scope

### In scope
- Cloudinary server-side configuration.
- Secure image upload.
- Image type and file-size validation.
- Media metadata persistence.
- Administrator media listing and retrieval.
- Media deletion.
- Profile image integration.
- Project thumbnail integration.
- Safe handling of media replacement and deletion.
- Upload and deletion error handling.
- Automated tests.

### Out of scope
- Video, audio, and document uploads.
- Resume and certificate uploads.
- Frontend upload UI.
- Image editing or cropping UI.
- Image transformations configured by arbitrary user input.
- Public media library browsing.
- Multiple Cloudinary accounts or tenants.
- CDN configuration outside Cloudinary.
- Automatic image optimization workflows beyond Cloudinary's standard delivery behavior.

## 3. Technology and Architecture

Use:
- Cloudinary for remote image storage and delivery.
- The existing Express and Mongoose architecture.
- `multer` for multipart file parsing, if not already installed.
- The official `cloudinary` Node.js SDK, if not already installed.
- In-memory upload handling rather than persistent local temporary files, where supported by the selected implementation.

Before adding dependencies, inspect the existing `package.json` and reuse compatible installed packages.

Cloudinary credentials must remain server-side and must never be exposed through public APIs or frontend environment variables.

## 4. Environment Configuration

Add the following server-side environment variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Requirements:
- Add variable names to `.env.example` with empty placeholder values.
- Validate required Cloudinary configuration when the media module is enabled.
- Do not log credentials.
- Do not expose credentials in error messages or API responses.
- Ensure `.env` remains excluded from Git.
- Follow the existing centralized environment-validation conventions.
- Avoid breaking backend startup in environments where media configuration is intentionally disabled, if the existing project requires non-media development to continue. Define and document the selected behavior.

## 5. Data Model

Implement a `Media` Mongoose model to store metadata for uploaded assets.

### 5.1 Media fields

| Field | Type | Requirements |
|---|---|---|
| publicId | String | Required, unique Cloudinary public ID |
| secureUrl | String | Required HTTPS delivery URL |
| resourceType | String | Fixed enum: `image` |
| format | String | Validated image format |
| bytes | Number | Positive file size |
| width | Number | Positive image width when provided |
| height | Number | Positive image height when provided |
| folder | String | Controlled Cloudinary folder |
| originalFilename | String | Optional, bounded and sanitized |
| altText | String | Optional, trimmed, bounded length |
| timestamps | Mongoose timestamps | Enabled |

Requirements:
- `publicId` must be unique.
- Only image assets are supported in this phase.
- Do not store raw file contents in MongoDB.
- Do not store Cloudinary API secrets or signed upload credentials.
- Store only metadata necessary for media management and integration.
- Never trust an original filename as a filesystem path or Cloudinary public ID.
- Do not allow arbitrary user-supplied Cloudinary folders.

## 6. Upload Requirements

### Administrator API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/media/images` | Upload an image |
| GET | `/admin/media` | List uploaded media with pagination |
| GET | `/admin/media/:id` | Retrieve one media record |
| DELETE | `/admin/media/:id` | Delete a media asset |

All administrator endpoints require authentication and administrator authorization. Mutating operations also require CSRF protection.

### Upload behavior

- Accept multipart/form-data with a single image file under a documented field name, preferably `image`.
- Accept only explicitly allowed image formats, initially JPEG, PNG, and WebP.
- Reject SVG and other potentially active or unsupported formats unless a separately reviewed safe handling strategy is approved.
- Enforce a maximum file size of 5 MB.
- Validate actual file content or file signatures where practical; do not rely only on the client-provided MIME type or filename extension.
- Reject missing, empty, malformed, oversized, or unsupported uploads.
- Use a server-controlled Cloudinary folder, such as `portfolio`.
- Generate unique public IDs on the server.
- Use Cloudinary upload options that prevent unintended overwrites.
- Do not expose raw upload credentials to the client.
- Return a controlled metadata response containing the media record and HTTPS delivery URL.
- Do not return API secrets or internal provider credentials.

## 7. Profile Integration

The existing Profile module contains `profileImageUrl`.

Requirements:
- Integrate profile image uploads with the Media module.
- Store the Cloudinary delivery URL and the corresponding media reference or Cloudinary public ID.
- Preserve the existing public profile image URL contract.
- Ensure profile updates remain compatible with existing profile validation and publication behavior.
- Replacing a profile image must not immediately delete an asset that may still be referenced elsewhere.
- Do not delete the old image automatically unless reference safety is established.

## 8. Project Integration

The existing Project module contains `thumbnailUrl`.

Requirements:
- Integrate project thumbnail uploads with the Media module.
- Store the Cloudinary delivery URL and corresponding media reference or Cloudinary public ID.
- Preserve the existing public project thumbnail URL contract.
- Support project creation and updates using managed media.
- Validate that the referenced media record exists and is an image.
- Prevent accidental deletion of an image still referenced by a project.
- Do not break existing project records that currently use valid HTTPS image URLs.

## 9. Media Deletion and Reference Safety

Deleting media requires special care.

Before deleting a Media record or Cloudinary asset:
- Check whether the media is referenced by the profile.
- Check whether it is referenced by any project.
- Include any additional managed references discovered during repository inspection.
- Reject deletion with `409 Conflict` when the asset is still in use.
- Do not delete the MongoDB record if the Cloudinary deletion fails.
- Do not silently treat provider failure as successful deletion.
- Handle cases where the Cloudinary asset is already missing without creating inconsistent local records.

Define and document a safe deletion sequence that handles failures between MongoDB and Cloudinary. Do not claim that operations across MongoDB and Cloudinary are transactional.

## 10. Security Requirements

- All upload and delete operations require administrator authentication, authorization, and CSRF protection.
- Validate multipart requests.
- Restrict file size and supported formats.
- Validate actual image content where practical.
- Use server-controlled Cloudinary folders and public IDs.
- Never expose Cloudinary secrets.
- Prevent path traversal and unsafe filename usage.
- Do not permit arbitrary remote URL fetching through Cloudinary.
- Do not allow users to choose unrestricted Cloudinary transformation or upload options.
- Avoid logging credentials or raw uploaded content.
- Return generic, controlled errors.

## 11. Validation and Error Handling

Expected responses:
- `400 Bad Request`: missing file, malformed request, unsupported file, invalid media reference.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: insufficient authorization or CSRF failure.
- `404 Not Found`: missing media record.
- `409 Conflict`: media is still referenced or duplicate resource conflict.
- `413 Payload Too Large`: file exceeds the configured limit.
- `415 Unsupported Media Type`: unsupported file format.
- `502` or an appropriate server error: Cloudinary provider failure, following existing error conventions.

Do not expose provider credentials, raw provider errors, or stack traces in production.

## 12. Database Indexes

Add indexes justified by implemented queries:
- Unique index on `publicId`.
- Index on `createdAt` for media listing and sorting.
- Any additional index only if required by actual reference or filtering queries.

Avoid redundant indexes.

## 13. Testing and Acceptance Criteria

### Configuration tests
- Required environment variables.
- Missing or invalid Cloudinary configuration.
- Secret exclusion from logs and responses.

### Upload tests
- Valid JPEG, PNG, and WebP uploads.
- Missing file.
- Unsupported formats.
- Oversized files.
- Invalid multipart requests.
- MIME type and file signature mismatch.
- Cloudinary success and provider failure.
- Metadata persistence.

### Media API tests
- Administrator listing and pagination.
- Retrieve one media record.
- Delete unused media.
- Reject deletion of referenced media.
- Authentication, authorization, and CSRF.

### Integration tests
- Profile image upload and reference.
- Project thumbnail upload and reference.
- Existing HTTPS image URLs remain compatible.
- Public profile and project responses preserve their expected image URL fields.
- Replacement does not prematurely delete referenced media.

### Regression tests
Run all existing Phase 0–6 suites.

### Acceptance criteria
1. Cloudinary configuration is centralized and secure.
2. Only supported image uploads are accepted.
3. Upload size is limited to 5 MB.
4. Media metadata is persisted in MongoDB.
5. Administrator media APIs are protected.
6. Profile and project image integration works.
7. Existing public response contracts remain compatible.
8. Referenced media cannot be accidentally deleted.
9. Cloudinary failures do not silently create inconsistent records.
10. All automated tests pass.
11. `npm run check` passes.
12. No Git commit, push, merge, or deployment occurs without explicit approval.