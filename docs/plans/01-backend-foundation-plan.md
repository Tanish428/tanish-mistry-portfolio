# Backend Foundation — Implementation Plan

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Plan ID:** PLAN-01  
**Version:** 1.0  
**Related Specification:** `docs/specs/01-backend-foundation.md`  
**Master Specification:** `docs/specs/00-project-overview.md`  
**Status:** Initial Draft  
**Phase:** Phase 0 — Project Foundation

---

# 1. Implementation Objective

Implement the backend foundation according to the approved specification.

The implementation must establish:

- Node.js and Express configuration.
- JavaScript ES module support.
- Environment configuration and validation.
- MongoDB Atlas connectivity through Mongoose.
- Centralized middleware.
- API route registration.
- Health-check endpoints.
- Centralized error handling.
- Graceful server lifecycle management.

The implementation must remain limited to backend foundation functionality.

# 2. Mandatory Pre-Implementation Checks

Before modifying any files, the coding agent must:

1. Read the root `AGENTS.md`.
2. Read all applicable `.agents/rules/` files.
3. Read `docs/specs/00-project-overview.md`.
4. Read `docs/specs/01-backend-foundation.md`.
5. Inspect the repository structure.
6. Inspect the existing backend files.
7. Inspect `package.json` and `package-lock.json`, if present.
8. Inspect the current Git branch.
9. Inspect `git status`.
10. Identify existing dependencies and configuration.

Expected Git branch:

`develop`

If the working branch is `main`, stop and ask the user to switch to `develop`.

If existing uncommitted changes are present, preserve them.

Do not overwrite existing files without inspecting their contents.

# 3. Implementation Strategy

Implement the backend in the following order.

## Step 1 — Backend Project Inspection

Inspect:

- Node.js installation.
- Existing backend directory.
- Existing package configuration.
- Existing dependencies.
- Existing environment files.
- Existing Git ignore rules.
- Existing server implementation.

Determine whether the backend is:

- Not initialized.
- Partially initialized.
- Already configured.

Do not recreate an existing project unnecessarily.

**Deliverable:** A brief inspection report identifying the existing state and required changes.

## Step 2 — Node.js Project Configuration

Configure the backend package.

Requirements:

- Use JavaScript ES modules.
- Use Express 5.x.
- Use compatible Mongoose.
- Install the required runtime dependencies.
- Install Nodemon as a development dependency.
- Preserve package lock consistency.

Required dependencies:

- express
- mongoose
- dotenv
- cors
- helmet
- morgan

Development dependency:

- nodemon

Required scripts:

| Script | Responsibility |
|---|---|
| `dev` | Start development server with Nodemon |
| `start` | Start production server |
| `check` | Perform agreed JavaScript syntax checks |

Do not introduce unrelated packages.

**Deliverable:** Correctly configured `package.json` and synchronized lock file.

## Step 3 — Backend Directory Structure

Create or adjust the backend structure to match the specification.

Expected structure:

```text
backend/
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── db.js
│   ├── controllers/
│   │   └── health.controller.js
│   ├── middleware/
│   │   ├── notFound.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── index.js
│   ├── utils/
│   ├── app.js
│   └── server.js
├── scripts/
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

Do not create unnecessary placeholder files.

**Deliverable:** Organized backend structure.

## Step 4 — Environment Configuration

Implement:

`src/config/env.js`

Responsibilities:

1. Load environment variables using dotenv.
2. Validate required configuration.
3. Validate the port.
4. Validate the MongoDB URI and database name.
5. Centralize configuration exports.
6. Fail safely when required configuration is missing.

Expected environment variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=tanish_portfolio
CLIENT_URL=http://localhost:5173
```

Create `.env.example` using placeholder values only.

Ensure `.env` is excluded from Git.

Do not log environment secrets.

**Deliverable:** Validated and centralized environment configuration.

## Step 5 — MongoDB Connection

Implement:

`src/config/db.js`

Responsibilities:

1. Connect to MongoDB Atlas using Mongoose.
2. Use the configured database name.
3. Handle connection errors.
4. Report connection status safely.
5. Export reusable connection functionality.

The database connection must complete successfully before the server starts listening.

If connection fails, startup must fail safely.

Do not add database models in this phase.

**Deliverable:** Working MongoDB connection module.

## Step 6 — Express Application

Implement:

`src/app.js`

Configure middleware in the correct order:

1. Helmet.
2. CORS.
3. Morgan.
4. JSON body parser.
5. URL-encoded body parser.
6. API routes.
7. 404 middleware.
8. Error-handling middleware.

Requirements:

- Use the configured frontend origin.
- Support credentialed requests for the future cookie-authentication architecture.
- Do not use wildcard origins with credentials.
- Apply reasonable request body limits.
- Avoid sensitive request logging.
- Keep Express application initialization separate from server startup.

**Deliverable:** Configured and reusable Express application.

## Step 7 — API Route Registration

Implement:

`src/routes/index.js`

Register routes under:

`/api/v1`

Initial endpoints:

```text
GET /api/v1/health/live
GET /api/v1/health/ready
```

Keep the route structure extensible for future feature modules.

Do not implement business endpoints.

**Deliverable:** Centralized API route registration.

## Step 8 — Health-Check Controller

Implement:

`src/controllers/health.controller.js`

### Liveness

`GET /api/v1/health/live`

Requirements:

- Return HTTP 200 when the application process is responding.
- Do not require a database connection.
- Do not expose sensitive information.

### Readiness

`GET /api/v1/health/ready`

Requirements:

- Check actual Mongoose connection readiness.
- Return HTTP 200 when MongoDB is connected and ready.
- Return HTTP 503 when MongoDB is unavailable.
- Return a safe response without exposing infrastructure secrets.

**Deliverable:** Working liveness and readiness endpoints.

## Step 9 — Error-Handling Middleware

Implement:

`src/middleware/notFound.js`

Handle unknown routes with HTTP 404.

Implement:

`src/middleware/errorHandler.js`

Requirements:

- Centralized error processing.
- Consistent JSON response format.
- Appropriate status codes.
- Safe production error messages.
- Useful server-side error logging.
- No secret exposure.
- Correct handling of malformed JSON.

**Deliverable:** Centralized error-handling system.

## Step 10 — Server Lifecycle

Implement:

`src/server.js`

Expected startup sequence:

```text
Load Environment
       |
       v
Validate Configuration
       |
       v
Connect to MongoDB
       |
       v
Initialize Express
       |
       v
Start HTTP Server
       |
       v
Application Ready
```

Requirements:

- Do not listen before database connectivity succeeds.
- Handle startup errors.
- Handle port conflicts.
- Implement SIGINT and SIGTERM handling.
- Stop accepting new requests during graceful shutdown.
- Close the HTTP server.
- Close the MongoDB connection.
- Avoid duplicate shutdown execution.

**Deliverable:** Reliable application startup and shutdown.

# 4. Testing Strategy

Testing must be performed in layers.

## 4.1 Static Verification

Verify:

- ES module syntax.
- Import paths.
- Package scripts.
- Dependency consistency.
- Environment configuration.
- No accidental CommonJS usage.

## 4.2 Environment Tests

Verify:

- Valid configuration loads.
- Missing required configuration is rejected.
- Invalid port values are rejected.
- No secret values appear in logs.

## 4.3 Database Tests

Verify:

- Valid MongoDB configuration connects.
- Invalid connection configuration fails safely.
- Server does not listen before a successful connection.
- Readiness reports actual database state.

## 4.4 API Tests

| Test | Expected Result |
|---|---|
| Liveness endpoint | HTTP 200 |
| Readiness with connected DB | HTTP 200 |
| Readiness without DB | HTTP 503 |
| Unknown route | HTTP 404 |
| Malformed JSON | Appropriate client error |
| Untrusted CORS origin | Rejected by CORS policy |

Use a test database or controlled environment for automated tests.

Do not perform destructive tests against production data.

## 4.5 Lifecycle Tests

Verify:

- Server starts successfully.
- Server stops on SIGINT.
- Server stops on SIGTERM.
- MongoDB connection closes during graceful shutdown.
- Startup failures do not leave the process in a misleading ready state.

# 5. Expected File-Level Changes

| File | Action |
|---|---|
| `backend/package.json` | Create or update |
| `backend/package-lock.json` | Generate or update |
| `backend/.env.example` | Create or update |
| `backend/.gitignore` | Create or update |
| `backend/src/config/env.js` | Create |
| `backend/src/config/db.js` | Create |
| `backend/src/controllers/health.controller.js` | Create |
| `backend/src/middleware/notFound.js` | Create |
| `backend/src/middleware/errorHandler.js` | Create |
| `backend/src/routes/index.js` | Create |
| `backend/src/app.js` | Create |
| `backend/src/server.js` | Create |
| `backend/tests/` | Add relevant tests |

The agent must inspect the actual repository before deciding whether to create or modify a file.

# 6. Scope Restrictions

The following are prohibited during this implementation:

- Creating administrator authentication.
- Creating administrator models.
- Creating portfolio CMS models.
- Implementing CRUD operations.
- Implementing Cloudinary.
- Implementing email services.
- Creating frontend pages.
- Creating dashboard pages.
- Adding Redis.
- Adding microservices.
- Changing the agreed technology stack.
- Performing unrelated refactoring.
- Deploying the backend.

If a dependency or requirement appears necessary but is not approved, explain why before adding it.

# 7. Risk Management

| Risk | Mitigation |
|---|---|
| MongoDB connection failure | Fail startup safely |
| Missing environment variables | Validate before startup |
| Invalid CORS configuration | Use explicit configured origins |
| Incorrect middleware order | Follow the specified middleware sequence |
| Server starts before DB | Connect before listening |
| Secrets accidentally committed | Review Git ignore and staged files |
| Unhandled errors | Use centralized error handling |
| Unclean shutdown | Close server and database gracefully |
| Existing code overwritten | Inspect repository before modifications |

# 8. Completion and Acceptance Review

Before reporting completion, verify every acceptance criterion in:

`docs/specs/01-backend-foundation.md`

The implementation must satisfy all applicable requirements.

Provide an implementation report containing:

1. Initial repository inspection.
2. Files created.
3. Files modified.
4. Dependencies installed.
5. Environment configuration details without secret values.
6. MongoDB connectivity result.
7. Health endpoint test results.
8. Error-handling test results.
9. Startup and shutdown test results.
10. Known limitations.
11. Git working tree status.
12. Confirmation that out-of-scope features were not implemented.

Clearly identify tests that could not be executed because of missing credentials or environment limitations.

Do not claim full acceptance if required tests remain unverified.

# 9. Execution Approval

This plan is intended to guide the implementation of Specification 01.

Before making code changes, the coding agent must:

- Inspect the repository.
- Confirm the current branch.
- Identify conflicts.
- Present its implementation approach.
- Wait for explicit user approval.

No automatic commits, pushes, merges, or deployments are permitted.

---

**End of Implementation Plan 01**

**Status:** Initial Draft — Requires Review and Approval.