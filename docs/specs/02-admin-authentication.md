# Administrator Authentication — Functional and Technical Specification

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Document ID:** SPEC-02  
**Version:** 1.0  
**Status:** Initial Draft  
**Phase:** Phase 1 — Administrator Authentication  
**Priority:** Critical  
**Related Specification:** `docs/specs/01-backend-foundation.md`  
**Master Specification:** `docs/specs/00-project-overview.md`

---

# 1. Objective

Implement a secure administrator authentication system for the personal developer portfolio.

The application will initially support exactly one administrator.

The administrator must be able to authenticate securely and access protected CMS endpoints.

The authentication system must provide:

- Secure administrator account storage.
- Password hashing using bcrypt.
- Administrator login.
- JWT generation and verification.
- JWT storage in secure HttpOnly cookies.
- Authentication middleware.
- Authorization middleware.
- Administrator session verification.
- Secure logout.
- Login rate limiting.
- Controlled initial administrator creation.
- Protection against unauthorized access.

The implementation must integrate with the existing Phase 0 backend foundation.

# 2. Scope

## 2.1 Included

1. Administrator Mongoose model.
2. Administrator password hashing.
3. Initial administrator provisioning.
4. Administrator login API.
5. JWT generation.
6. Secure cookie configuration.
7. Authentication middleware.
8. Administrator authorization middleware.
9. Current administrator API.
10. Logout API.
11. Login rate limiting.
12. Input validation.
13. Authentication error handling.
14. Security verification.
15. Authentication tests.

## 2.2 Excluded

The following are outside this phase:

- Public user registration.
- Multiple administrator accounts.
- User roles and permissions.
- Role-based access control.
- Password reset through email.
- Email verification.
- Social login.
- OAuth authentication.
- Refresh-token rotation.
- Multi-device session management.
- Administrator profile management.
- CMS CRUD functionality.
- Frontend login page.
- Admin dashboard UI.

These features must not be implemented without separate approval.

# 3. Authentication Architecture

## 3.1 Authentication Method

Use:

- JWT for authentication.
- bcrypt for password hashing.
- HttpOnly cookies for token storage.
- Express middleware for authentication and authorization.
- MongoDB for administrator account storage.

The frontend must not store the JWT in localStorage or sessionStorage.

## 3.2 Authentication Flow

```text
          ADMINISTRATOR
                |
                v
          LOGIN REQUEST
                |
                v
         EXPRESS AUTH API
                |
                v
         INPUT VALIDATION
                |
                v
        FIND ADMIN ACCOUNT
                |
                v
        VERIFY PASSWORD
           USING BCRYPT
                |
          -------------
          |           |
       INVALID       VALID
          |           |
          v           v
       REJECT      GENERATE JWT
                      |
                      v
              SET HTTPONLY COOKIE
                      |
                      v
               AUTHENTICATED
```

## 3.3 Protected Request Flow

```text
       ADMINISTRATOR REQUEST
                 |
                 v
          HTTPONLY COOKIE
                 |
                 v
        AUTHENTICATION MIDDLEWARE
                 |
                 v
           VERIFY JWT
                 |
          ---------------
          |             |
       INVALID         VALID
          |             |
          v             v
       HTTP 401     LOAD ADMIN
                        |
                        v
                 ATTACH ADMIN
                  TO REQUEST
                        |
                        v
                 AUTHORIZATION
                        |
                        v
                  NEXT ROUTE
```

# 4. Administrator Account Model

## 4.1 Model Location

Create:

`backend/src/modules/auth/admin.model.js`

The administrator model must use Mongoose.

## 4.2 Administrator Fields

The initial administrator document should contain:

| Field | Type | Requirements |
|---|---|---|
| `_id` | ObjectId | Automatically generated |
| `name` | String | Required |
| `email` | String | Required, unique, normalized |
| `password` | String | Required, hashed |
| `isActive` | Boolean | Default true |
| `createdAt` | Date | Automatically generated |
| `updatedAt` | Date | Automatically generated |

## 4.3 Schema Requirements

- Email must be normalized to lowercase.
- Email must be trimmed.
- Email must have a unique database index.
- Password must never be stored in plaintext.
- Password must be excluded from normal query results by default.
- Timestamps must be enabled.
- The model must use appropriate validation.

## 4.4 Password Hashing

Use bcrypt.

Requirements:

- Hash passwords before database storage.
- Use an appropriate configurable bcrypt work factor.
- Never return password hashes through APIs.
- Never log passwords.
- Verify passwords using bcrypt comparison.
- Avoid hashing the password repeatedly when an already-hashed password is unchanged.

Prefer implementing password hashing in a clearly defined model or service workflow.

Do not implement both model hooks and service-level hashing in a way that causes double hashing.

# 5. Initial Administrator Provisioning

## 5.1 Objective

Create the first administrator through a controlled server-side provisioning process.

There must be no public registration endpoint.

## 5.2 Provisioning Method

Create a dedicated script:

`backend/scripts/create-admin.js`

The script must:

1. Load and validate environment configuration.
2. Connect to MongoDB.
3. Read administrator details securely from environment variables or another approved secure input method.
4. Validate the administrator name and email.
5. Validate the password against the defined password policy.
6. Check whether an administrator already exists.
7. Create the administrator using the approved password hashing mechanism.
8. Close the database connection.
9. Exit with an appropriate status code.

## 5.3 Single Administrator Enforcement

The system must enforce the single-administrator requirement at the application and database levels.

Requirements:

- Do not allow public administrator registration.
- Do not create a second administrator through the provisioning script.
- Enforce uniqueness on administrator email.
- Use a database-level strategy to ensure only one administrator account can exist.
- Handle concurrent provisioning attempts safely.

A unique email index alone does not guarantee a single administrator because multiple different email addresses could still be created.

Use an appropriate single-document constraint, such as a fixed unique singleton key, in the administrator schema.

## 5.4 Provisioning Security

- Never hardcode administrator credentials.
- Never commit real administrator credentials.
- Never print passwords.
- Do not expose provisioning through an HTTP endpoint.
- Do not run the provisioning script automatically during normal server startup.
- Do not overwrite an existing administrator account.
- Do not silently reset an existing password.

## 5.5 Provisioning Script Behavior

If an administrator already exists, the script must stop and report that the administrator has already been provisioned.

Password reset or replacement must be a separate controlled operation requiring explicit authorization.

# 6. Password Policy

Define and enforce a reasonable password policy.

Initial requirements:

- Minimum 12 characters.
- Maximum length compatible with bcrypt's 72-byte input limit.
- Reject empty passwords.
- Do not silently truncate passwords.
- Validate password input before hashing.
- Never expose password policy details that reveal sensitive account information during login.

The implementation must account for bcrypt's byte-length limit, not just JavaScript string character count.

# 7. Authentication API

All authentication endpoints must use:

`/api/v1/auth`

## 7.1 Administrator Login

**Endpoint:**

`POST /api/v1/auth/login`

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "your-secure-password"
}
```

### Responsibilities

1. Validate the request body.
2. Normalize the email.
3. Apply login rate limiting.
4. Find the administrator account.
5. Verify the account is active.
6. Compare the supplied password with the stored bcrypt hash.
7. Generate a signed JWT.
8. Set the JWT in a secure HttpOnly cookie.
9. Return a safe administrator response.

### Successful Response

HTTP 200

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": "admin-id",
      "name": "Tanish Mistry",
      "email": "admin@example.com"
    }
  }
}
```

Do not return the JWT in the JSON response.

Do not return the password hash.

### Failed Login

Return a generic authentication failure response.

Use the same public-facing message for an unknown email and an incorrect password to reduce account enumeration.

Appropriate status:

HTTP 401

## 7.2 Current Administrator

**Endpoint:**

`GET /api/v1/auth/me`

### Requirements

- Must require authentication.
- Must verify the JWT.
- Must retrieve the current administrator.
- Must confirm the account remains active.
- Must return safe administrator information.
- Must never return the password hash.

### Successful Response

HTTP 200

```json
{
  "success": true,
  "message": "Administrator authenticated",
  "data": {
    "admin": {
      "id": "admin-id",
      "name": "Tanish Mistry",
      "email": "admin@example.com"
    }
  }
}
```

## 7.3 Logout

**Endpoint:**

`POST /api/v1/auth/logout`

### Requirements

- Clear the authentication cookie.
- Use cookie-clearing options consistent with the original cookie configuration.
- Return a successful response.
- Ensure the browser no longer sends the authentication cookie.

### Successful Response

HTTP 200

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

Because this phase uses stateless JWT authentication, clearing the cookie removes the browser's normal authentication mechanism but does not independently revoke a previously copied, unexpired token.

Do not claim that stateless JWTs are immediately revoked unless a revocation mechanism is implemented.

# 8. JWT Configuration

## 8.1 Token Generation

Use a maintained JWT library.

The token must contain only the minimum required claims.

Recommended claims:

- `sub`: Administrator ID.
- `iss`: Configured token issuer.
- `aud`: Configured token audience.
- `iat`: Issued-at timestamp.
- `exp`: Expiration timestamp.

Do not include passwords, password hashes, or unnecessary administrator information.

## 8.2 JWT Secret

Add the required environment variable:

`JWT_SECRET`

Requirements:

- Must be sufficiently strong and unpredictable.
- Must not be committed.
- Must not be exposed to the frontend.
- Must be validated during application startup.
- Must be different between development and production.

Use a cryptographically secure random secret.

## 8.3 Token Expiration

Configure token expiration through environment variables.

Initial default:

`15m`

The implementation must support a configurable expiration value.

Reject expired or invalid tokens.

## 8.4 Token Verification

Verify:

- Signature.
- Expiration.
- Issuer.
- Audience.
- Expected algorithm.

Do not accept arbitrary JWT algorithms.

# 9. Cookie Security

## 9.1 Cookie Configuration

Use an HttpOnly cookie.

Recommended cookie properties:

| Property | Requirement |
|---|---|
| `httpOnly` | true |
| `secure` | true in production over HTTPS |
| `sameSite` | Configurable, secure deployment policy |
| `path` | Restricted appropriately |
| `maxAge` | Consistent with JWT expiration |

Cookie name must be configurable.

## 9.2 Cookie Handling

- Set the cookie after successful authentication.
- Clear it during logout.
- Do not expose the token through frontend JavaScript.
- Do not log cookie contents.
- Keep cookie options centralized.

## 9.3 SameSite and Deployment

The cookie policy must account for the actual frontend and backend deployment origins.

Prefer same-site deployment and an appropriate `Lax` policy when possible.

If the frontend and backend require cross-site cookies:

- Use `SameSite=None`.
- Require `Secure=true`.
- Use HTTPS.
- Implement appropriate CSRF protection.
- Restrict CORS to the exact frontend origin.

Do not select `SameSite=None` without understanding the deployment and CSRF implications.

# 10. CSRF Protection

Because authentication uses cookies, state-changing authenticated requests require CSRF protection.

The implementation must define a CSRF protection strategy.

For this phase:

- Use a suitable CSRF protection mechanism for cookie-based authentication.
- Ensure protected state-changing endpoints reject invalid or missing CSRF tokens.
- Ensure login and logout behavior is handled safely.
- Do not treat CORS as a replacement for CSRF protection.
- Do not expose JWT values to JavaScript merely to implement CSRF protection.

The exact mechanism must be documented in the implementation plan and verified through tests.

# 11. Authentication Middleware

Create:

`backend/src/modules/auth/auth.middleware.js`

Responsibilities:

1. Read the JWT from the configured authentication cookie.
2. Reject missing tokens.
3. Verify token signature.
4. Verify expiration, issuer, audience, and algorithm.
5. Load the administrator from MongoDB.
6. Verify the administrator exists.
7. Verify the administrator is active.
8. Attach safe administrator information to the request.
9. Pass control to the next middleware.

If authentication fails, return HTTP 401.

Do not trust administrator identity supplied through request body, headers, or query parameters.

# 12. Authorization Middleware

Create:

`backend/src/modules/auth/authorization.middleware.js`

The initial application has one administrator.

The authorization middleware must:

- Ensure an authenticated administrator exists.
- Restrict CMS access to the administrator.
- Return HTTP 403 when an authenticated identity is not authorized.

Do not introduce role-based access control in this phase.

The middleware must be designed so future authorization rules can be added without rewriting authentication.

# 13. Login Rate Limiting

Protect the login endpoint against brute-force attempts.

Use a maintained Express-compatible rate-limiting package.

Requirements:

- Apply rate limiting specifically to login.
- Configure a reasonable request limit and time window.
- Return HTTP 429 when the limit is exceeded.
- Do not expose sensitive account information.
- Document how rate limiting behaves behind a trusted reverse proxy.
- Do not blindly trust arbitrary forwarded IP headers.

Use a shared rate-limit store for multi-instance production deployments if required later.

An in-memory store may be sufficient for the initial single-instance deployment, provided its limitations are documented.

# 14. Validation

All authentication inputs must be validated server-side.

Login validation:

- Email is required.
- Email must be syntactically valid.
- Password is required.
- Password must be a string.
- Request body must contain only accepted fields or safely ignore/reject unexpected fields according to the validation policy.

Provisioning validation:

- Administrator name is required.
- Email is required and valid.
- Password meets the password policy.
- Single-administrator constraint is enforced.

Do not trust frontend validation.

# 15. Error Handling

Use the existing centralized error-handling system from Phase 0.

Handle:

- Missing credentials.
- Invalid credentials.
- Invalid JWT.
- Expired JWT.
- Missing authentication cookie.
- Inactive administrator.
- Missing administrator record.
- Invalid request body.
- Duplicate administrator provisioning.
- Rate-limit violations.
- Database errors.

Do not reveal whether an email address exists during login.

Do not expose stack traces, JWT secrets, passwords, or database details.

Use consistent JSON response structures.

# 16. Backend Module Structure

The authentication module should follow this structure:

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

The exact file structure may be adjusted when justified, but responsibilities must remain separated.

Do not duplicate the existing Phase 0 error-handling or database modules.

# 17. Environment Configuration Changes

Extend the existing environment configuration.

Potential variables:

```env
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=15m

AUTH_COOKIE_NAME=portfolio_admin_token
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax

ADMIN_NAME=Your Name
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
```

Important requirements:

- `JWT_SECRET` is required for application startup.
- Cookie configuration must be validated.
- The production configuration must require secure cookies.
- Administrator provisioning credentials should be used only by the provisioning script.
- Do not require provisioning credentials for ordinary server startup.
- Do not log environment values.
- Keep `.env.example` updated with placeholder values only.

Do not place real credentials in the example file.

# 18. Dependency Requirements

Evaluate and use appropriate maintained packages for:

- bcrypt password hashing.
- JWT generation and verification.
- Cookie parsing.
- Login rate limiting.
- Request validation.
- CSRF protection.

Potential packages may include:

- `bcrypt`
- `jsonwebtoken`
- `cookie-parser`
- `express-rate-limit`
- A suitable maintained validation library.
- A suitable maintained CSRF protection implementation.

Do not blindly install every listed package.

Select compatible dependencies, explain the rationale, and preserve package-lock consistency.

# 19. Testing Requirements

Testing must cover authentication functionality and security behavior.

## 19.1 Administrator Provisioning

Verify:

- First administrator can be created.
- Password is stored as a bcrypt hash.
- Password is not stored in plaintext.
- Duplicate provisioning is rejected.
- A second administrator cannot be created.
- Invalid provisioning inputs are rejected.
- Database connections close correctly after script execution.

## 19.2 Login

Verify:

- Valid credentials authenticate successfully.
- Invalid email is rejected.
- Incorrect password is rejected.
- Inactive administrator cannot authenticate.
- Missing credentials are rejected.
- JWT cookie is set correctly.
- JWT is not returned in the JSON response.
- Password hash is never returned.

## 19.3 JWT

Verify:

- Valid JWT is accepted.
- Invalid signature is rejected.
- Expired JWT is rejected.
- Incorrect issuer is rejected.
- Incorrect audience is rejected.
- Unsupported algorithms are rejected.

## 19.4 Authentication Middleware

Verify:

- Missing cookie returns HTTP 401.
- Invalid token returns HTTP 401.
- Expired token returns HTTP 401.
- Deleted administrator returns HTTP 401.
- Inactive administrator returns HTTP 401.
- Valid administrator reaches protected routes.

## 19.5 Logout

Verify:

- Authentication cookie is cleared.
- Cookie-clearing attributes match the original cookie configuration.
- Subsequent browser requests without the cookie are unauthorized.

Document the stateless JWT revocation limitation.

## 19.6 Rate Limiting

Verify:

- Requests within the configured limit are handled.
- Excessive login attempts receive HTTP 429.
- Rate limiting does not expose account information.

## 19.7 CSRF and Cookie Security

Verify:

- Appropriate CSRF protection is applied.
- Missing or invalid CSRF tokens are rejected for protected state-changing requests.
- Cookie HttpOnly attribute is present.
- Secure attribute is enabled in production.
- SameSite behavior matches the selected deployment policy.
- Untrusted origins are not allowed.

## 19.8 API Testing

Expected endpoints:

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/api/v1/auth/login` | Public, rate-limited |
| GET | `/api/v1/auth/me` | Required |
| POST | `/api/v1/auth/logout` | Required, CSRF protected |

Use an isolated test database and test credentials.

Do not use production administrator credentials in automated tests.

# 20. Acceptance Criteria

Phase 1 is accepted only when:

1. The administrator model is implemented.
2. Exactly one administrator account is supported.
3. Administrator passwords are securely hashed.
4. No public registration endpoint exists.
5. Initial provisioning is controlled and secure.
6. Login works with valid credentials.
7. Invalid credentials are rejected.
8. JWT generation and verification work correctly.
9. JWT is stored in an HttpOnly cookie.
10. Cookie configuration is secure for the deployment environment.
11. Authentication middleware works correctly.
12. Authorization middleware protects administrator operations.
13. Current administrator endpoint works.
14. Logout clears the authentication cookie.
15. Login rate limiting is operational.
16. CSRF protection is correctly implemented.
17. Sensitive information is never exposed.
18. Relevant tests are executed and verified.
19. Existing Phase 0 functionality remains operational.
20. Documentation reflects the actual implementation.

# 21. Implementation Restrictions

The coding agent must:

- Read `AGENTS.md`.
- Read all applicable `.agents/rules/`.
- Read the master project specification.
- Read the Phase 0 specification.
- Read this Phase 1 specification.
- Inspect the existing backend before implementation.
- Preserve existing Phase 0 functionality.
- Reuse existing database and error-handling modules.
- Avoid unnecessary dependencies.
- Avoid unrelated refactoring.
- Never implement public administrator registration.
- Never hardcode administrator credentials.
- Never expose JWTs or password hashes.
- Never modify production data without approval.
- Never commit, push, merge, or deploy without approval.

If a security requirement conflicts with the existing implementation, stop and explain the issue.

# 22. Expected Deliverables

At the end of Phase 1, provide:

1. Administrator Mongoose model.
2. Secure administrator provisioning script.
3. Login endpoint.
4. Current administrator endpoint.
5. Logout endpoint.
6. JWT utility or service.
7. Authentication middleware.
8. Authorization middleware.
9. Input validation.
10. Login rate limiting.
11. Cookie security configuration.
12. CSRF protection.
13. Updated environment configuration.
14. Updated `.env.example`.
15. Updated dependency configuration.
16. Authentication tests.
17. Implementation report.
18. Security verification report.

---

**End of Specification 02**

**Document Status:** Initial Draft — Requires Review and Approval.