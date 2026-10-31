---
trigger: always_on
---

# Backend Engineering Rules

## 1. Backend Objective

Build a secure, maintainable REST API for the dynamic portfolio and its administrator CMS.

Use:

- Node.js
- Express.js
- JavaScript ES Modules
- MongoDB Atlas
- Mongoose

Follow modular monolithic architecture.

## 2. Module Structure

Use feature-based organization.

Example:

```text
modules/projects/
├── project.model.js
├── project.routes.js
├── project.controller.js
├── project.service.js
└── project.validation.js
```

Create only the files required by the feature.

## 3. Controller and Service Separation

Controllers must:

- Handle HTTP requests and responses.
- Read validated input.
- Call the appropriate service.
- Return appropriate HTTP status codes.
- Forward errors to centralized error handling.

Services must:

- Implement business logic.
- Coordinate database operations.
- Enforce application rules.
- Handle business-level conditions.
- Avoid direct dependency on Express request and response objects.

Do not place complex database queries or business workflows directly inside controllers.

## 4. Database Rules

- Use Mongoose models and schemas.
- Apply validation at the schema level where appropriate.
- Validate request data independently of database validation.
- Use indexes when justified by query patterns.
- Use pagination for potentially large collections.
- Handle duplicate records and missing documents.
- Use transactions only when multiple related operations require atomicity and the MongoDB deployment supports them.
- Avoid unnecessary database queries.
- Select only required fields where appropriate.

Do not store uploaded binary files directly in MongoDB.

## 5. REST API Rules

All API endpoints must use:

```text
/api/v1
```

Maintain a clear distinction between public and administrator endpoints.

Example:

```text
/api/v1/portfolio
/api/v1/projects
/api/v1/auth
/api/v1/admin/projects
```

Use the appropriate HTTP methods:

- GET: Retrieve data
- POST: Create resources
- PATCH: Partially update resources
- PUT: Replace resources when appropriate
- DELETE: Delete resources

Use meaningful status codes and consistent response formats.

## 6. Validation

Validate all external inputs, including:

- Request body
- Route parameters
- Query parameters
- Uploaded files
- Authentication-related inputs

Validation must include:

- Required fields
- Data types
- Length limits
- Allowed values
- Formats
- Business constraints

Reject invalid input before performing database operations.

Do not trust client-side validation alone.

## 7. Error Handling

- Use centralized error-handling middleware.
- Avoid leaking stack traces in production responses.
- Return meaningful client-safe error messages.
- Log technical details on the server.
- Handle asynchronous failures consistently.
- Avoid exposing database credentials or internal infrastructure details.

## 8. Authentication and Authorization

- Use one administrator account.
- Hash passwords with bcrypt.
- Use JWT-based authentication.
- Store authentication tokens in secure HttpOnly cookies.
- Apply authentication middleware to protected routes.
- Apply authorization checks before administrator operations.
- Configure cookie security attributes appropriately for the deployment environment.
- Implement logout and token expiration.
- Consider CSRF protection when using cookie-based authentication.
- Never store plaintext passwords.
- Never expose password hashes or authentication tokens in API responses.

Do not implement public registration unless explicitly approved.

## 9. Media Uploads

Use Cloudinary for media storage.

Rules:

- Upload through the backend.
- Keep Cloudinary credentials on the server.
- Validate file type and size.
- Generate safe upload identifiers.
- Restrict accepted formats.
- Handle upload failures.
- Store Cloudinary public IDs and relevant metadata in MongoDB.
- Implement safe deletion and replacement workflows.
- Never trust the original filename or MIME type without validation.

## 10. Security

Apply appropriate security controls:

- Helmet
- Restricted CORS configuration
- Rate limiting on sensitive endpoints
- Input validation
- Secure cookies
- Authentication and authorization
- Safe error responses
- Environment-based secrets
- Protection against mass assignment
- Appropriate request size limits

Use secure defaults and avoid unnecessary exposure of internal endpoints.

## 11. Performance

- Use database indexes when justified.
- Paginate large result sets.
- Avoid N+1-style query patterns.
- Use caching only when beneficial.
- Implement appropriate HTTP caching for public content.
- Invalidate or refresh cached content when published data changes.

Do not introduce Redis or additional infrastructure without a demonstrated requirement and approval.

## 12. Testing

Test relevant behavior, including:

- Successful requests
- Invalid requests
- Missing resources
- Duplicate resources
- Authentication failures
- Authorization failures
- Database errors
- Upload failures
- Edge cases

Do not claim successful testing without executing the tests.

## 13. Dependency Management

- Install only necessary dependencies.
- Prefer established and maintained packages.
- Check compatibility with the existing project.
- Preserve the package lock file.
- Do not manually invent dependency versions.
- Explain why a new dependency is needed.

## 14. Backend Completion Criteria

A backend feature is complete only when:

1. Its requirements are implemented.
2. Input validation is present.
3. Appropriate security controls are applied.
4. Errors are handled consistently.
5. Relevant tests are executed.
6. API behavior is verified.
7. Documentation is updated where necessary.
8. No unrelated functionality is modified.