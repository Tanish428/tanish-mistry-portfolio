# ANTIGRAVITY IMPLEMENTATION PROMPT
## Phase 1 — Administrator Authentication

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Task ID:** TASK-02  
**Phase:** Phase 1 — Administrator Authentication  
**Related Specification:** `docs/specs/02-admin-authentication.md`  
**Related Plan:** `docs/plans/02-admin-authentication-plan.md`  
**Previous Phase:** Phase 0 — Backend Foundation

---

# 1. Your Role

Act as a senior backend engineer with expertise in:

- Node.js
- Express.js
- MongoDB
- Mongoose
- Authentication architecture
- JWT security
- Cookie-based authentication
- Application security
- Backend testing

Your responsibility is to implement the single-administrator authentication system for this portfolio.

Prioritize security, correctness, maintainability, and compatibility with the existing backend.

Do not treat this as a new project. Phase 0 has already been implemented.

# 2. Mandatory Documentation

Read the following files completely before beginning:

1. `AGENTS.md`
2. `.agents/rules/architecture.md`
3. `.agents/rules/backend.md`
4. `.agents/rules/security.md`
5. `.agents/rules/git-workflow.md`
6. `docs/specs/00-project-overview.md`
7. `docs/specs/01-backend-foundation.md`
8. `docs/specs/02-admin-authentication.md`
9. `docs/plans/01-backend-foundation-plan.md`
10. `docs/plans/02-admin-authentication-plan.md`

These documents define the approved requirements and architectural constraints.

Do not silently override them.

If requirements conflict, identify the conflict and ask for clarification.

# 3. Stage One — Repository Inspection

Before making any changes, inspect the complete existing backend.

Inspect:

- `backend/package.json`
- `backend/package-lock.json`
- `backend/.env.example`
- `backend/.gitignore`
- `backend/src/config/env.js`
- `backend/src/config/db.js`
- `backend/src/controllers/health.controller.js`
- `backend/src/middleware/notFound.js`
- `backend/src/middleware/errorHandler.js`
- `backend/src/routes/index.js`
- `backend/src/app.js`
- `backend/src/server.js`
- Existing tests and scripts.

Also inspect:

```bash
git status
git branch --show-current
git log -5 --oneline
```

The expected development branch is:

```text
develop
```

If the current branch is `main`, stop and ask the user to switch to `develop`.

Preserve all existing changes.

Do not overwrite or recreate Phase 0 functionality unnecessarily.

# 4. Stage Two — Implementation Analysis

Compare the actual backend with SPEC-02 and PLAN-02.

Identify:

1. Existing reusable functionality.
2. Required new files.
3. Required modifications.
4. Dependencies already installed.
5. Dependencies that must be added.
6. Environment changes.
7. Database schema changes.
8. Authentication middleware integration.
9. Cookie and CSRF implementation approach.
10. Testing requirements.
11. Security risks.

Prepare a detailed implementation proposal.

The proposal must explain:

- Administrator singleton enforcement.
- Password hashing strategy.
- JWT signing and verification strategy.
- Cookie configuration.
- CSRF protection mechanism.
- Login rate limiting.
- Administrator provisioning.
- Middleware ordering.
- Database migration or index considerations.
- Testing approach.

# 5. Stage Three — Approval Gate

STOP after completing repository inspection and implementation analysis.

Do not:

- Modify source files.
- Install dependencies.
- Modify environment files.
- Create database records.
- Run administrator provisioning.
- Change Git history.

Present your implementation proposal and wait for explicit user approval.

Only proceed when the user authorizes implementation.

# 6. Stage Four — Implementation

After approval, implement the approved scope.

## A. Administrator Model

Create:

`backend/src/modules/auth/admin.model.js`

Requirements:

- Mongoose schema.
- Name.
- Normalized email.
- Password hash.
- Active status.
- Timestamps.
- Unique email constraint.
- Database-level single-administrator constraint.

A unique email index is insufficient.

Use a fixed singleton key or another correctly enforced database-level constraint.

Ensure the relevant unique index is actually created and verified.

Prevent concurrent provisioning from creating multiple administrator accounts.

Never expose password hashes.

## B. Password Security

Use bcrypt.

Requirements:

- Hash passwords before persistence.
- Use an appropriate configurable work factor.
- Avoid double hashing.
- Verify passwords using bcrypt comparison.
- Respect bcrypt's 72-byte input limitation.
- Reject oversized passwords rather than silently truncating them.

Never store plaintext passwords.

## C. Administrator Provisioning

Create:

`backend/scripts/create-admin.js`

Implement a controlled one-time administrator creation workflow.

Requirements:

- Read provisioning credentials securely.
- Validate administrator details.
- Connect through the existing database module.
- Create the first administrator.
- Reject duplicate provisioning.
- Enforce the singleton database constraint.
- Close the database connection.
- Exit safely.

Do not:

- Add a public registration endpoint.
- Run provisioning during normal server startup.
- Hardcode administrator credentials.
- Print administrator passwords.
- Reset an existing account automatically.

Add an appropriate package script if required.

## D. JWT Management

Use a maintained JWT library.

Implement reusable signing and verification logic.

Requirements:

- Explicit signing algorithm.
- Strong secret.
- Expiration.
- Issuer validation.
- Audience validation.
- Administrator ID as subject.
- Safe verification errors.

Never include password information in JWT claims.

Do not return JWTs in authentication JSON responses.

## E. Cookie Management

Implement centralized cookie configuration.

Requirements:

- HttpOnly authentication cookie.
- Secure production configuration.
- Appropriate SameSite policy.
- Appropriate cookie path.
- Expiration consistent with JWT.
- Consistent cookie-clearing options.

Ensure production cookies require HTTPS.

Do not expose the authentication token to browser JavaScript.

## F. CSRF Protection

Select and implement a maintained CSRF protection mechanism.

The implementation must:

- Protect cookie-authenticated state-changing operations.
- Use a separate CSRF token mechanism.
- Keep the JWT cookie HttpOnly.
- Validate the token correctly.
- Handle login and logout safely.
- Respect the configured trusted frontend origin.
- Avoid treating CORS as CSRF protection.

Explain the selected mechanism and its limitations.

Do not create an unverified custom cryptographic mechanism.

## G. Authentication Service

Implement the business logic for:

- Administrator lookup.
- Password comparison.
- Active-account verification.
- JWT generation.
- JWT verification.
- Safe administrator retrieval.

Keep authentication logic out of controllers.

Use generic public login failure messages.

## H. Request Validation

Validate:

- Login email.
- Login password.
- Provisioning name.
- Provisioning email.
- Provisioning password.
- Request body structure.

Reject invalid requests before database operations.

## I. Authentication Controller

Implement:

`backend/src/modules/auth/auth.controller.js`

Support:

- Login.
- Current administrator.
- Logout.

Ensure:

- Login sets the authentication cookie.
- Login returns safe administrator information.
- `/me` returns only safe account details.
- Logout clears the cookie using matching attributes.
- No endpoint returns password hashes or JWT secrets.

## J. Authentication Middleware

Implement:

`backend/src/modules/auth/auth.middleware.js`

Requirements:

- Read JWT from the authentication cookie.
- Reject missing tokens.
- Verify JWT signature.
- Verify expiration.
- Verify issuer and audience.
- Verify the allowed algorithm.
- Retrieve the administrator.
- Check active status.
- Attach safe administrator data to the request.

Return HTTP 401 for authentication failures.

## K. Authorization Middleware

Implement:

`backend/src/modules/auth/authorization.middleware.js`

Ensure that protected administrator operations require an authenticated, authorized administrator.

Do not implement unnecessary role-based access control.

## L. Login Rate Limiting

Protect the login endpoint against brute-force attempts.

Use a maintained rate-limiting package.

Requirements:

- Configure a sensible limit.
- Configure a suitable time window.
- Return HTTP 429 when exceeded.
- Configure proxy trust safely.
- Do not expose account information.

Document in-memory store limitations.

## M. Authentication Routes

Create:

`backend/src/modules/auth/auth.routes.js`

Implement:

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

Apply the correct validation, rate-limiting, authentication, and CSRF middleware.

Do not implement registration.

## N. Application Integration

Modify the existing:

- `backend/src/config/env.js`
- `backend/src/app.js`
- `backend/src/routes/index.js`
- `backend/.env.example`
- `backend/package.json`

Only modify what is required.

Preserve all Phase 0 functionality.

Do not duplicate existing error handlers, database connections, or server lifecycle logic.

# 7. Environment Configuration

Extend the existing configuration with the approved authentication variables.

Expected configuration includes:

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

These are placeholder values for documentation.

Do not place real credentials in `.env.example`.

Important:

- JWT variables are needed by the application.
- Provisioning credentials must only be required by the provisioning script.
- Production cookie configuration must be secure.
- Environment validation must remain centralized.
- Never print secret values.

# 8. Testing and Verification

Execute relevant tests after implementation.

## Administrator Model

Verify:

- Password hashing.
- Email normalization.
- Unique email constraint.
- Singleton constraint.
- Second administrator rejection.
- Concurrent provisioning safety.

## Provisioning

Verify:

- Initial account creation.
- Duplicate provisioning rejection.
- Invalid credentials rejection.
- Database cleanup.
- No password logging.

## Login

Verify:

- Valid login.
- Invalid email.
- Incorrect password.
- Missing password.
- Inactive administrator.
- Rate limiting.
- Cookie creation.
- No token in JSON response.

## JWT

Verify:

- Valid signature.
- Invalid signature.
- Expiration.
- Issuer.
- Audience.
- Algorithm restrictions.

## Middleware

Verify:

- Missing authentication.
- Invalid authentication.
- Expired authentication.
- Deleted administrator.
- Inactive administrator.
- Valid authenticated administrator.

## CSRF

Verify:

- Valid token.
- Missing token.
- Invalid token.
- Untrusted origin.
- Protected state-changing request.

## Logout

Verify:

- Cookie clearing.
- Matching cookie attributes.
- Unauthorized access after the browser stops sending the cookie.

Document that stateless JWT logout does not revoke a copied token before expiration.

## Regression Testing

Verify that Phase 0 still works:

- Database connection.
- Liveness endpoint.
- Readiness endpoint.
- 404 handling.
- Centralized error handling.
- Graceful server shutdown.

Use an isolated test database.

Never run destructive tests against production data.

Do not claim a test passed unless it was actually executed.

# 9. Security Restrictions

The following are mandatory:

- No public registration.
- No plaintext passwords.
- No JWT in localStorage.
- No JWT in API JSON responses.
- No exposed JWT secrets.
- No password hashes in API responses.
- No administrator credentials in Git.
- No arbitrary JWT algorithm acceptance.
- No unrestricted credentialed CORS.
- No bypass of CSRF protection.
- No automatic administrator creation during server startup.
- No production data modifications without approval.

If a security requirement cannot be implemented safely, stop and report the issue.

# 10. Scope Restrictions

Do not implement:

- Frontend login page.
- Admin dashboard.
- Profile management.
- Project management.
- Skills management.
- Cloudinary.
- Contact management.
- Multiple administrator accounts.
- Public registration.
- OAuth.
- Password reset.
- Refresh token rotation.
- Redis.
- Microservices.

These are outside TASK-02.

Do not perform unrelated refactoring.

# 11. Git Restrictions

All work must remain on `develop` or an approved feature branch created from `develop`.

Never:

- Commit automatically.
- Push automatically.
- Merge into `main`.
- Force-push.
- Rewrite history.
- Discard user changes.
- Deploy automatically.

Before completion, inspect:

```bash
git status
git diff --check
git diff
```

Report the actual working tree status.

# 12. Completion Report

After implementation, provide:

## A. Summary

Explain the completed authentication functionality.

## B. Files Created

List every new file.

## C. Files Modified

List every modified existing file.

## D. Dependencies

List added or changed dependencies with reasons.

## E. Administrator Provisioning

Report whether initial administrator creation was verified.

Never reveal credentials.

## F. Authentication Tests

Report actual results.

## G. Security Tests

Report actual results for:

- Password hashing.
- Singleton enforcement.
- JWT.
- Cookie configuration.
- CSRF.
- Rate limiting.
- Authentication middleware.

## H. Phase 0 Regression

Report whether previous functionality remains operational.

## I. Known Issues

List unresolved issues and limitations.

## J. Git Status

Report:

- Current branch.
- Working tree state.
- Changed files.
- Whether changes are committed.
- Whether changes are pushed.

Do not commit or push automatically.

# 13. Final Instructions

Implement only the approved scope.

Prioritize security over convenience.

Do not silently weaken authentication, authorization, or CSRF protections to make tests pass.

Do not modify production data.

If a requirement is ambiguous, stop and request clarification.

If an architectural change is necessary, explain its rationale and obtain approval.

**First action: Inspect the repository, read all required documentation, and prepare a detailed implementation proposal. Do not modify files or install dependencies until the user approves the proposal.**

---

**End of Implementation Prompt 02**