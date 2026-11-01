# Administrator Authentication — Implementation Plan

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Plan ID:** PLAN-02  
**Version:** 1.0  
**Related Specification:** `docs/specs/02-admin-authentication.md`  
**Previous Specification:** `docs/specs/01-backend-foundation.md`  
**Master Specification:** `docs/specs/00-project-overview.md`  
**Status:** Initial Draft  
**Phase:** Phase 1 — Administrator Authentication

---

# 1. Implementation Objective

Implement a secure, single-administrator authentication system using:

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- bcrypt
- JWT
- Secure HttpOnly cookies

The implementation must integrate with the existing Phase 0 backend without breaking existing functionality.

The administrator must be able to log in, authenticate subsequent requests, access protected endpoints, retrieve their account information, and log out.

No public registration or multiple-administrator functionality is permitted.

# 2. Mandatory Pre-Implementation Checks

Before making changes, the coding agent must:

1. Read `AGENTS.md`.
2. Read all applicable `.agents/rules/` files.
3. Read `docs/specs/00-project-overview.md`.
4. Read `docs/specs/01-backend-foundation.md`.
5. Read `docs/specs/02-admin-authentication.md`.
6. Read `docs/plans/01-backend-foundation-plan.md`.
7. Inspect the existing backend implementation.
8. Inspect `package.json` and `package-lock.json`.
9. Inspect environment configuration.
10. Inspect existing middleware and route registration.
11. Inspect the database connection lifecycle.
12. Inspect current Git status and branch.

Expected branch:

`develop`

Do not implement on `main`.

Preserve all existing user changes.

# 3. Implementation Architecture

Use the existing modular monolithic architecture.

Authentication functionality must be isolated inside:

```text
backend/src/modules/auth/
```

Expected module structure:

```text
backend/
├── src/
│   ├── modules/
│   │   └── auth/
│   │       ├── admin.model.js
│   │       ├── auth.routes.js
│   │       ├── auth.controller.js
│   │       ├── auth.service.js
│   │       ├── auth.middleware.js
│   │       ├── authorization.middleware.js
│   │       └── auth.validation.js
│   │
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── scripts/
│   └── create-admin.js
│
└── tests/
    └── auth/
```

This is the target structure. Adjust only when an existing project convention provides a better equivalent.

Do not duplicate existing configuration, database, or error-handling modules.

# 4. Implementation Sequence

## Step 1 — Repository and Dependency Inspection

Inspect the existing Phase 0 implementation.

Verify:

- Express application initialization.
- Environment configuration.
- Mongoose connection.
- Centralized error handling.
- Route registration.
- Existing package dependencies.
- Existing test setup.

Identify dependencies already installed.

Evaluate the following packages:

| Package | Responsibility |
|---|---|
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT generation and verification |
| `cookie-parser` | Reading cookies |
| `express-rate-limit` | Login rate limiting |
| `csrf-csrf` or another maintained CSRF solution | CSRF protection |
| A maintained validation library | Request validation |

Do not install duplicate or unnecessary dependencies.

Check package compatibility and maintenance before selecting a package.

**Deliverable:** Dependency and compatibility report.

## Step 2 — Environment Configuration Extension

Update:

`backend/src/config/env.js`

Extend the existing configuration without breaking Phase 0.

Add and validate:

```env
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=15m

JWT_ISSUER=tanish-portfolio-api
JWT_AUDIENCE=tanish-portfolio-admin

AUTH_COOKIE_NAME=portfolio_admin_token
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

ADMIN_NAME=Your Name
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
```

Requirements:

- `JWT_SECRET` must be required.
- JWT issuer and audience must be validated.
- Cookie name must be validated.
- Cookie security settings must be validated.
- Production must require secure cookies.
- SameSite configuration must support the intended deployment.
- Provisioning credentials must not be required for normal server startup.
- Provisioning credentials must be read only by the provisioning script.
- Never log secret values.

Do not overwrite existing environment configuration.

Update:

`backend/.env.example`

Use placeholders only.

Keep real credentials out of Git.

**Deliverable:** Centralized and validated authentication configuration.

## Step 3 — Administrator Model

Create:

`backend/src/modules/auth/admin.model.js`

Responsibilities:

- Define administrator schema.
- Normalize email.
- Enforce unique email.
- Enforce the single-administrator constraint.
- Hash passwords using bcrypt.
- Exclude password hashes from ordinary query results.
- Enable timestamps.

### Single-Administrator Enforcement

A unique email index is insufficient.

Use a fixed unique singleton field, for example:

```javascript
singletonKey: {
  type: String,
  required: true,
  unique: true,
  immutable: true,
  default: "primary"
}
```

Ensure the database index is actually created and verified.

The fixed singleton value must prevent a second administrator even if another email address is supplied.

Use an atomic database insertion workflow to handle concurrent provisioning attempts.

Do not rely only on an application-level count query.

### Password Handling

Use bcrypt with an appropriate configurable work factor.

Requirements:

- Hash only when the password is newly assigned or changed.
- Never double-hash.
- Never expose password hashes.
- Enforce the specified password byte-length limit.
- Compare passwords using bcrypt.

**Deliverable:** Secure single-administrator model.

## Step 4 — JWT Utility

Create an appropriate reusable JWT utility, preferably:

`backend/src/modules/auth/auth.service.js`

Separate token-related helpers if justified by existing conventions.

Responsibilities:

- Generate JWTs.
- Verify JWTs.
- Use an explicit signing algorithm.
- Validate issuer and audience.
- Enforce expiration.
- Use administrator ID as the subject.
- Reject malformed or invalid tokens.

Recommended claims:

- `sub`
- `iss`
- `aud`
- `iat`
- `exp`

Do not include passwords or unnecessary account information.

Do not accept arbitrary JWT algorithms.

**Deliverable:** Centralized JWT generation and verification.

## Step 5 — Cookie Configuration

Implement reusable cookie configuration.

Requirements:

- HttpOnly authentication cookie.
- Secure cookie in production.
- Configurable SameSite.
- Restricted cookie path.
- Cookie expiration consistent with JWT expiration.
- Consistent options for cookie creation and deletion.

The cookie must not be accessible through frontend JavaScript.

The implementation must support the actual frontend/backend deployment topology.

For cross-site cookie deployments, require HTTPS, `SameSite=None`, and appropriate CSRF protection.

Do not use wildcard CORS with credentialed requests.

**Deliverable:** Centralized secure authentication cookie handling.

## Step 6 — Administrator Provisioning Script

Create:

`backend/scripts/create-admin.js`

Requirements:

1. Load environment configuration.
2. Validate provisioning credentials.
3. Connect to MongoDB using the existing database configuration.
4. Verify that an administrator does not already exist.
5. Create the administrator.
6. Allow the database unique singleton constraint to enforce exclusivity.
7. Handle duplicate-key errors.
8. Close the database connection.
9. Exit with the correct process status.

The script must never:

- Run automatically during server startup.
- Expose an HTTP registration endpoint.
- Print administrator passwords.
- Reset an existing account.
- Create a second administrator.

Use a safe provisioning workflow.

Prefer a dedicated package script:

`npm run admin:create`

Do not expose provisioning credentials to the frontend.

**Deliverable:** Controlled initial administrator provisioning.

## Step 7 — Request Validation

Create:

`backend/src/modules/auth/auth.validation.js`

Validate:

### Login

- Email required.
- Valid email format.
- Password required.
- Password must be a string.
- Reject malformed request bodies.
- Reject or safely handle unexpected properties.

### Provisioning

- Name required.
- Email valid.
- Password meets the password policy.
- Password does not exceed bcrypt's 72-byte input limit.

Use the selected validation library consistently.

**Deliverable:** Reusable authentication input validation.

## Step 8 — Authentication Service

Implement business logic in:

`backend/src/modules/auth/auth.service.js`

Responsibilities:

- Find the administrator.
- Verify account status.
- Compare password hashes.
- Generate JWT.
- Verify authentication tokens.
- Retrieve safe administrator details.
- Handle account-not-found conditions.
- Handle inactive accounts.

Controllers must not contain complex database or authentication business logic.

Do not expose whether a particular email exists through public login errors.

**Deliverable:** Centralized authentication business logic.

## Step 9 — Authentication Controller

Create:

`backend/src/modules/auth/auth.controller.js`

Implement:

### Login

- Receive validated input.
- Call authentication service.
- Set JWT cookie.
- Return safe administrator information.
- Never return the JWT in the JSON response.

### Current Administrator

- Return the authenticated administrator.
- Exclude sensitive fields.

### Logout

- Clear the authentication cookie.
- Use matching cookie attributes.
- Return a consistent response.

**Deliverable:** HTTP authentication controllers.

## Step 10 — Authentication Middleware

Create:

`backend/src/modules/auth/auth.middleware.js`

Responsibilities:

1. Read the authentication cookie.
2. Reject missing cookies.
3. Verify JWT signature.
4. Verify expiration.
5. Verify issuer and audience.
6. Verify the expected algorithm.
7. Load administrator record.
8. Verify active account status.
9. Attach safe administrator information to the request.

Return HTTP 401 when authentication fails.

Do not trust administrator IDs supplied by the client.

**Deliverable:** Working authentication middleware.

## Step 11 — Authorization Middleware

Create:

`backend/src/modules/auth/authorization.middleware.js`

Requirements:

- Ensure the request has an authenticated administrator.
- Reject requests without an authorized administrator.
- Return HTTP 403 for authenticated but unauthorized identities.
- Keep the implementation extensible.

Do not introduce unnecessary role-based access control.

**Deliverable:** Administrator authorization middleware.

## Step 12 — Login Rate Limiting

Apply `express-rate-limit` or an equivalent maintained solution to the login endpoint.

Requirements:

- Configure an appropriate request limit.
- Configure a suitable time window.
- Return HTTP 429 after the limit is exceeded.
- Avoid leaking account information.
- Configure trusted proxy behavior carefully.
- Do not blindly trust forwarded IP headers.

Document the limitations of an in-memory store in multi-instance deployments.

**Deliverable:** Login brute-force protection.

## Step 13 — CSRF Protection

Implement a maintained CSRF protection solution compatible with cookie-based JWT authentication.

Prefer a well-understood double-submit-cookie or equivalent secure approach.

The design must:

- Keep the JWT authentication cookie HttpOnly.
- Provide a separate CSRF token mechanism.
- Require a valid CSRF token for protected state-changing requests.
- Validate the token against the appropriate cookie or server-side mechanism.
- Restrict accepted origins.
- Handle login and logout safely.
- Avoid treating CORS as a CSRF defense.

Do not invent a custom cryptographic CSRF algorithm.

Document the selected library and its exact configuration.

**Deliverable:** Tested CSRF protection.

## Step 14 — Authentication Routes

Create:

`backend/src/modules/auth/auth.routes.js`

Register:

| Method | Endpoint | Middleware |
|---|---|---|
| POST | `/login` | Validation + login rate limiter |
| GET | `/me` | Authentication |
| POST | `/logout` | Authentication + CSRF protection |

Mount the router through the existing route aggregator:

`/api/v1/auth`

Do not create a public registration endpoint.

**Deliverable:** Versioned authentication API.

## Step 15 — Integrate Cookie and CSRF Middleware

Inspect the existing `backend/src/app.js`.

Add the required cookie parsing and CSRF-related configuration in the correct order.

Do not replace the existing Helmet, CORS, Morgan, body parsing, 404, or error middleware.

Ensure the final middleware ordering is correct.

Document which endpoints require CSRF validation and why.

**Deliverable:** Correctly integrated middleware pipeline.

# 5. Testing Strategy

## 5.1 Administrator Provisioning

Test:

- Initial account creation.
- Password hashing.
- Duplicate email prevention.
- Single-administrator enforcement.
- Concurrent provisioning protection.
- Invalid input rejection.
- Safe database disconnection.

## 5.2 Login

Test:

- Valid credentials.
- Invalid email.
- Incorrect password.
- Missing credentials.
- Inactive administrator.
- Malformed request body.
- Rate-limit response.

## 5.3 JWT

Test:

- Valid token.
- Invalid signature.
- Expired token.
- Wrong issuer.
- Wrong audience.
- Unsupported algorithm.

## 5.4 Cookie Security

Test:

- HttpOnly attribute.
- Secure attribute in production.
- Correct SameSite setting.
- Correct expiration.
- Consistent cookie clearing.
- No JWT in JSON responses.

## 5.5 Authentication Middleware

Test:

- Missing cookie.
- Invalid token.
- Expired token.
- Deleted administrator.
- Inactive administrator.
- Valid authenticated administrator.

## 5.6 CSRF

Test:

- Valid CSRF token.
- Missing CSRF token.
- Invalid CSRF token.
- Incorrect origin.
- Protected state-changing request.

## 5.7 Logout

Test:

- Authenticated logout.
- Cookie cleared with matching attributes.
- Subsequent request without authentication returns HTTP 401.

Document that clearing a stateless JWT cookie does not revoke previously copied tokens.

# 6. Test Environment

Use an isolated test database.

Requirements:

- Do not use production administrator credentials.
- Do not expose actual `.env` values.
- Do not modify production data.
- Ensure test cleanup is controlled.
- Do not run destructive tests against the development database.

Automated tests must not depend on a real production administrator account.

# 7. File-Level Implementation Matrix

| File | Action |
|---|---|
| `src/modules/auth/admin.model.js` | Create |
| `src/modules/auth/auth.routes.js` | Create |
| `src/modules/auth/auth.controller.js` | Create |
| `src/modules/auth/auth.service.js` | Create |
| `src/modules/auth/auth.middleware.js` | Create |
| `src/modules/auth/authorization.middleware.js` | Create |
| `src/modules/auth/auth.validation.js` | Create |
| `scripts/create-admin.js` | Create |
| `src/config/env.js` | Modify |
| `src/app.js` | Modify |
| `src/routes/index.js` | Modify |
| `.env.example` | Modify |
| `package.json` | Modify |
| `package-lock.json` | Modify |
| `tests/auth/` | Create or extend |

The actual changes must be based on repository inspection.

# 8. Risk Management

| Risk | Mitigation |
|---|---|
| Password stored in plaintext | bcrypt hashing |
| Multiple administrator accounts | Database-level singleton constraint |
| Brute-force login | Login rate limiting |
| JWT theft through JavaScript | HttpOnly cookie |
| JWT tampering | Signature verification |
| Expired tokens | Expiration validation |
| Cookie-based CSRF | Dedicated CSRF protection |
| Account enumeration | Generic login errors |
| Secret exposure | Environment variables |
| Incorrect cookie configuration | Centralized cookie options |
| Duplicate hashing | Single password-hashing workflow |
| Provisioning race condition | Atomic database constraint |

# 9. Completion Criteria

Phase 1 is complete only when all applicable acceptance criteria in SPEC-02 are satisfied.

The implementation report must include:

1. Architecture changes.
2. Files created.
3. Files modified.
4. Dependencies installed or changed.
5. Administrator model details.
6. Single-account enforcement verification.
7. Provisioning verification.
8. Login test results.
9. JWT verification results.
10. Cookie security verification.
11. CSRF test results.
12. Rate-limiting test results.
13. Logout verification.
14. Existing Phase 0 regression test results.
15. Known limitations.
16. Git status.

Use the statuses:

- PASSED
- FAILED
- BLOCKED
- NOT EXECUTED

Never claim a test passed without executing it.

# 10. Implementation Approval

Before modifying files, the coding agent must:

1. Inspect the repository.
2. Read the required documentation.
3. Identify existing functionality.
4. Identify dependency changes.
5. Prepare a file-level implementation proposal.
6. Explain security decisions.
7. Identify risks.
8. Wait for explicit user approval.

No automatic commits, pushes, merges, or deployments.

---

**End of Implementation Plan 02**

**Status:** Initial Draft — Requires Review and Approval.