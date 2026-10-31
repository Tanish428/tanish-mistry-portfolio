---
trigger: always_on
---

# Security Rules

## 1. Security Objective

Security must be considered throughout the development lifecycle.

The application contains a private administrator dashboard and content management functionality. Protect administrator access, user data, API endpoints, database operations, and uploaded media.

## 2. Secrets and Environment Variables

Never hardcode:

- MongoDB connection strings
- JWT secrets
- Cloudinary credentials
- Email service credentials
- API keys
- Deployment secrets

Store secrets in environment variables.

Rules:

- Keep `.env` files out of Git.
- Maintain an `.env.example` with placeholder values only.
- Validate required variables during startup.
- Never print secret values in logs.
- Never expose server-side secrets through frontend environment variables.
- Rotate credentials if they are accidentally exposed.

## 3. Password Security

- Use bcrypt for password hashing.
- Never store plaintext passwords.
- Never log passwords.
- Never return password hashes in API responses.
- Enforce reasonable password strength requirements.
- Protect authentication endpoints against brute-force attempts.
- Use generic login failure messages where appropriate.

## 4. JWT and Cookie Security

Use JWT-based administrator authentication with secure HttpOnly cookies.

Cookie configuration must be appropriate for the deployment environment:

- `httpOnly: true`
- `secure: true` in production over HTTPS
- Appropriate `sameSite` policy
- Appropriate expiration
- Restricted cookie path and domain where applicable

Additional requirements:

- Verify token signatures.
- Verify expiration.
- Reject invalid or expired tokens.
- Do not trust client-provided user roles.
- Implement logout by clearing the authentication cookie.
- Protect cookie-authenticated state-changing requests against CSRF.

Never expose JWT secrets or authentication tokens in client-side code or logs.

## 5. Authentication and Authorization

- Only the authorized administrator may access CMS management endpoints.
- Protect all administrator routes.
- Do not rely only on frontend route protection.
- Verify authentication and authorization on the backend.
- Do not implement public administrator registration.
- Do not assume that hiding a UI element secures its corresponding API endpoint.

## 6. API Protection

- Configure CORS with explicitly trusted origins.
- Use Helmet.
- Apply rate limiting to authentication and other sensitive endpoints.
- Validate and sanitize external inputs.
- Limit request body sizes.
- Avoid exposing stack traces or internal errors.
- Use safe database query construction.
- Prevent mass assignment by explicitly selecting accepted fields.
- Do not pass untrusted user input directly into database operators or query structures.

## 7. MongoDB Security

- Use secure database credentials.
- Restrict Atlas network access.
- Apply least-privilege database permissions.
- Validate data before database writes.
- Avoid exposing internal document fields.
- Use appropriate indexes and constraints.
- Never run destructive database operations without explicit approval.

## 8. Cloudinary Security

- Keep Cloudinary API secrets on the backend.
- Validate uploaded file size and actual file content.
- Restrict accepted formats and resource types.
- Use generated identifiers instead of trusting original filenames.
- Avoid accepting arbitrary remote URLs for server-side uploads.
- Handle upload and deletion failures safely.
- Never expose private upload credentials.

## 9. XSS and Content Rendering

- Treat CMS content as untrusted input.
- Prefer safe text rendering.
- Avoid unsafe HTML injection.
- Sanitize rich text when rich text is required.
- Do not render arbitrary scripts or executable content stored in MongoDB.
- Restrict dynamic block types to an approved allowlist.

## 10. Error Handling and Logging

- Never return secrets in error responses.
- Never log passwords, tokens, or sensitive credentials.
- Keep production error messages generic.
- Record useful operational information.
- Avoid logging unnecessary personal information.

## 11. Agent Safety Restrictions

The coding agent must never:

- Commit secrets.
- Disable authentication to bypass an issue.
- Remove security middleware without approval.
- Weaken validation to make tests pass.
- Expose private administrator endpoints.
- Execute destructive database operations without approval.
- Deploy security-sensitive changes without approval.
- Change production credentials or infrastructure without approval.

If a security requirement cannot be implemented safely, stop and explain the issue.

## 12. Security Verification

For every security-sensitive feature, verify:

- Unauthorized requests are rejected.
- Authenticated requests are accepted only when appropriate.
- Invalid inputs are rejected.
- Secrets are not exposed.
- Cookie behavior is correct.
- Access control is enforced on the server.
- Error responses do not leak internal details.

Security is a mandatory acceptance criterion, not an optional improvement.