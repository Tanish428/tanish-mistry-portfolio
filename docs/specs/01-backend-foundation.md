# Backend Foundation — Functional and Technical Specification

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Document ID:** SPEC-01  
**Version:** 1.0  
**Status:** Initial Draft  
**Phase:** Phase 0 — Project Foundation  
**Priority:** Critical  
**Technology:** Node.js + Express.js + MongoDB Atlas  
**Language:** JavaScript (ES Modules)

---

# 1. Objective

Establish a reliable, secure, maintainable backend foundation for the personal developer portfolio.

The backend must provide:

- A properly configured Express application.
- MongoDB Atlas connectivity through Mongoose.
- Environment-based configuration.
- Centralized middleware.
- Centralized error handling.
- API versioning.
- Health-check endpoints.
- A modular and extensible folder structure.
- Graceful server startup and shutdown.

This phase establishes the foundation for all subsequent backend modules.

Do not implement administrator authentication, CMS functionality, or other business modules in this phase.

# 2. Scope

## 2.1 Included

1. Node.js project configuration.
2. Express.js application initialization.
3. ES module configuration.
4. Environment variable management.
5. Environment validation.
6. MongoDB Atlas connection.
7. Express middleware configuration.
8. API route registration.
9. Health-check endpoints.
10. Centralized 404 handling.
11. Centralized error handling.
12. Server startup and shutdown.
13. Basic logging.
14. Development scripts.
15. Backend configuration documentation.

## 2.2 Excluded

The following features must not be implemented in this phase:

- Administrator authentication.
- JWT implementation.
- Password hashing.
- Administrator registration.
- Profile management.
- Project management.
- Skills management.
- Experience and education management.
- Cloudinary uploads.
- Dynamic homepage sections.
- Publishing workflows.
- Contact form functionality.
- External API integrations.
- Frontend integration.

These features belong to subsequent specifications.

# 3. Technology Requirements

| Technology | Responsibility |
|---|---|
| Node.js 24 LTS | JavaScript runtime |
| Express.js 5.x | HTTP server framework |
| JavaScript ES Modules | Module system |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB ODM |
| dotenv | Environment variable loading |
| cors | Cross-origin resource sharing |
| helmet | HTTP security headers |
| morgan | HTTP request logging |
| nodemon | Development auto-restart |

Use compatible, currently maintained package versions.

Do not manually invent dependency versions. Use the package manager to resolve compatible versions and preserve the package lock file.

# 4. Project Structure

The backend must follow this initial structure:

```text
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── health.controller.js
│   │
│   ├── middleware/
│   │   ├── notFound.js
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   ├── utils/
│   │
│   ├── app.js
│   └── server.js
│
├── scripts/
│
├── tests/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

Rules:

- Keep configuration separate from application logic.
- Keep database connection logic separate from server initialization.
- Keep routes separate from controllers.
- Keep error-handling middleware centralized.
- Do not create unnecessary files or empty business modules.
- Future feature modules will be introduced according to their respective specifications.

# 5. Node.js Project Configuration

## 5.1 Module System

Configure the backend to use ES modules.

The package configuration must include:

```json
{
  "type": "module"
}
```

Use:

```javascript
import express from "express";
```

Do not mix CommonJS `require()` with ES module imports.

## 5.2 Package Scripts

The backend must provide appropriate scripts for:

- Development server.
- Production server.
- Syntax validation.

Expected script names:

```text
dev
start
check
```

Requirements:

- `dev`: Start the application using nodemon.
- `start`: Start the application using Node.js.
- `check`: Perform the agreed syntax checks on the backend source files.

Do not claim that the check script performs full application testing.

## 5.3 Dependency Management

Required runtime dependencies:

- express
- mongoose
- dotenv
- cors
- helmet
- morgan

Development dependency:

- nodemon

Additional dependencies require justification and approval.

# 6. Environment Configuration

## 6.1 Environment File

The backend must use environment variables for configuration.

Create `.env.example` with placeholder values.

Expected variables:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string
DB_NAME=tanish_portfolio

CLIENT_URL=http://localhost:5173
```

The actual `.env` file must contain real local configuration and must never be committed.

## 6.2 Environment Validation

Create:

`src/config/env.js`

Responsibilities:

1. Load environment variables.
2. Validate required variables.
3. Validate numeric port configuration.
4. Provide centralized configuration exports.
5. Fail startup when required configuration is missing or invalid.

Do not expose sensitive environment variables to the frontend.

## 6.3 Environment Security

- Add `.env` to `.gitignore`.
- Keep `.env.example` free of real credentials.
- Never log MongoDB credentials.
- Never print secret environment variable values.
- Never commit real database connection strings.

# 7. Database Configuration

## 7.1 MongoDB Atlas

Use MongoDB Atlas as the primary database.

Database name:

`tanish_portfolio`

The database connection must be managed using Mongoose.

## 7.2 Database Connection Module

Create:

`src/config/db.js`

Responsibilities:

- Establish MongoDB connection.
- Use the validated MongoDB connection URI.
- Apply the configured database name.
- Handle connection errors.
- Report connection status without exposing credentials.
- Export reusable connection functionality.

## 7.3 Startup Dependency

The Express server must not begin listening for requests until the database connection has succeeded.

Expected startup sequence:

```text
Application Starts
       |
       v
Load Environment
       |
       v
Validate Configuration
       |
       v
Connect to MongoDB
       |
       v
Connection Successful?
       |
   -------------
   |           |
  YES          NO
   |           |
   v           v
Start       Report Error
Server      and Exit
```

If the database connection fails, the application must fail safely.

Do not silently start a partially operational server.

# 8. Express Application Configuration

Create:

`src/app.js`

Responsibilities:

- Initialize Express.
- Register security middleware.
- Configure CORS.
- Configure request parsing.
- Configure request logging.
- Register API routes.
- Register 404 middleware.
- Register centralized error-handling middleware.

## 8.1 Middleware Order

Use an appropriate middleware order.

Expected logical sequence:

1. Helmet.
2. CORS.
3. Morgan.
4. JSON body parser.
5. URL-encoded body parser.
6. API routes.
7. 404 handler.
8. Centralized error handler.

Ensure the error handler is registered after the routes and 404 handler.

## 8.2 Helmet

Use Helmet to configure appropriate HTTP security headers.

Do not disable security protections without a documented reason.

## 8.3 CORS

Configure CORS using the validated frontend origin.

Development origin:

`http://localhost:5173`

Requirements:

- Allow only configured origins.
- Support credentials where required for future cookie-based authentication.
- Do not use unrestricted wildcard origins with credentialed requests.
- Keep origin configuration environment-based.
- Reject or appropriately handle untrusted origins.

CORS is not an authentication or authorization mechanism.

## 8.4 Request Parsing

Configure:

- JSON request parsing.
- URL-encoded request parsing.

Apply reasonable request body size limits.

Do not accept unnecessarily large request bodies.

## 8.5 Morgan

Use Morgan for HTTP request logging.

Requirements:

- Use an appropriate development logging format.
- Avoid logging sensitive request information.
- Keep production logging appropriate for deployment.
- Never log passwords, tokens, or credentials.

# 9. API Versioning and Route Registration

## 9.1 API Base Path

All versioned application endpoints must use:

`/api/v1`

## 9.2 Route Registration

Create:

`src/routes/index.js`

Register the initial application routes.

Expected route:

```text
/api/v1/health/live
/api/v1/health/ready
```

Keep route registration centralized.

Do not create business endpoints in this phase.

# 10. Health-Check Endpoints

Create:

`src/controllers/health.controller.js`

Implement two endpoints.

## 10.1 Liveness Endpoint

Endpoint:

`GET /api/v1/health/live`

Purpose:

Determine whether the Node.js application process is running and responding.

Expected response:

```json
{
  "success": true,
  "message": "Application is running",
  "data": {
    "status": "alive"
  }
}
```

Requirements:

- Must not require database connectivity.
- Must not expose environment variables.
- Must return an appropriate successful HTTP status.

## 10.2 Readiness Endpoint

Endpoint:

`GET /api/v1/health/ready`

Purpose:

Determine whether the application is ready to serve database-dependent requests.

Requirements:

- Check the actual MongoDB connection state.
- Return HTTP 200 when the database connection is ready.
- Return HTTP 503 when the database is unavailable.
- Do not expose connection credentials or internal infrastructure details.

Example successful response:

```json
{
  "success": true,
  "message": "Application is ready",
  "data": {
    "status": "ready",
    "database": "connected"
  }
}
```

Example unavailable response:

```json
{
  "success": false,
  "message": "Application is not ready",
  "data": {
    "status": "not_ready",
    "database": "disconnected"
  }
}
```

Do not make the liveness endpoint depend on MongoDB availability.

# 11. Error Handling

## 11.1 Not Found Middleware

Create:

`src/middleware/notFound.js`

Responsibilities:

- Handle unknown routes.
- Return HTTP 404.
- Return a consistent JSON response.
- Avoid exposing internal implementation details.

Example:

```json
{
  "success": false,
  "message": "Route not found",
  "data": null
}
```

## 11.2 Centralized Error Handler

Create:

`src/middleware/errorHandler.js`

Responsibilities:

- Handle errors passed through Express.
- Return consistent error responses.
- Use appropriate HTTP status codes.
- Avoid exposing stack traces in production.
- Log useful technical details on the server.
- Avoid leaking secrets.

Example:

```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

Handle malformed JSON and other relevant request errors appropriately.

Do not silently swallow errors.

# 12. Server Initialization and Lifecycle

Create:

`src/server.js`

Responsibilities:

1. Load and validate configuration.
2. Establish the database connection.
3. Initialize the Express application.
4. Start the HTTP server.
5. Log successful startup.
6. Handle unexpected startup failures.
7. Implement graceful shutdown.

## 12.1 Startup Behavior

- Validate configuration before startup.
- Connect to MongoDB before accepting requests.
- Start listening only after successful database connection.
- Use the configured port.
- Handle port conflicts and startup errors.

## 12.2 Graceful Shutdown

Handle:

- SIGINT
- SIGTERM

Expected behavior:

1. Stop accepting new connections.
2. Allow existing requests to finish within a reasonable shutdown period.
3. Close the HTTP server.
4. Close the MongoDB connection.
5. Exit with an appropriate status.

Avoid introducing unnecessary lifecycle complexity.

# 13. Security Requirements

Even though authentication is not part of this phase, the foundation must follow security best practices.

Mandatory requirements:

- Helmet configured.
- CORS restricted to configured origins.
- Environment variables validated.
- Secrets excluded from source control.
- Request body limits configured.
- Safe error responses.
- No sensitive request logging.
- No unrestricted database access exposed through APIs.

Do not implement incomplete authentication or placeholder authorization mechanisms in this phase.

# 14. Testing and Verification Requirements

The implementation must be verified before completion.

## 14.1 Configuration Verification

Verify:

- Required environment variables are detected.
- Missing variables cause startup failure.
- Invalid port configuration is rejected.
- Secrets are not printed in logs.

## 14.2 Database Verification

Verify:

- Valid MongoDB URI establishes a connection.
- Invalid URI produces a clear failure.
- Server does not start listening when the database connection fails.
- Readiness endpoint reflects the actual connection state.

## 14.3 API Verification

Test:

| Method | Endpoint | Expected Result |
|---|---|---|
| GET | `/api/v1/health/live` | HTTP 200 |
| GET | `/api/v1/health/ready` | HTTP 200 when DB is connected |
| GET | `/api/v1/health/ready` | HTTP 503 when DB is unavailable |
| GET | `/unknown-route` | HTTP 404 |

Also verify:

- Malformed JSON produces an appropriate client error.
- Unexpected errors produce safe error responses.
- CORS rejects untrusted origins.
- The application starts successfully with valid configuration.

## 14.4 Build and Code Verification

Execute the relevant checks:

- Package scripts.
- JavaScript syntax checks.
- Server startup.
- API requests.
- Database connectivity.
- Git diff review.

Report the actual outcome of each test.

Do not claim tests passed without executing them.

# 15. Acceptance Criteria

The backend foundation is accepted only when:

1. The backend uses JavaScript ES modules.
2. Express initializes successfully.
3. Environment configuration is centralized.
4. Environment variables are validated.
5. MongoDB Atlas connects through Mongoose.
6. The server waits for database connectivity before listening.
7. Security middleware is configured.
8. CORS is restricted to configured origins.
9. API versioning uses `/api/v1`.
10. Liveness endpoint works independently of database connectivity.
11. Readiness endpoint accurately checks database availability.
12. Unknown routes return HTTP 404.
13. Errors are handled centrally.
14. Graceful shutdown is implemented.
15. `.env` is excluded from Git.
16. `.env.example` contains placeholder values.
17. Relevant verification has been executed.
18. No out-of-scope functionality has been introduced.

# 16. Implementation Constraints

The coding agent must:

- Read `AGENTS.md`.
- Read all applicable `.agents/rules/`.
- Read `docs/specs/00-project-overview.md`.
- Read this specification.
- Inspect the existing backend before making changes.
- Preserve existing working functionality.
- Avoid unnecessary dependencies.
- Avoid unrelated refactoring.
- Follow the approved backend architecture.
- Stop if existing project configuration conflicts with this specification.
- Report conflicts instead of silently modifying unrelated files.

Do not overwrite existing project configuration without reviewing it.

# 17. Expected Deliverables

At the end of this phase, the backend must contain:

- Configured Node.js project.
- Express application.
- Environment configuration module.
- MongoDB connection module.
- Health-check controller and routes.
- Centralized 404 middleware.
- Centralized error middleware.
- Server lifecycle management.
- Environment example file.
- Git ignore configuration.
- Working development and production scripts.

Also provide:

1. Implementation summary.
2. List of created and modified files.
3. Dependency list.
4. Database connection verification result.
5. API test results.
6. Known limitations.
7. Confirmation that no out-of-scope features were implemented.

---

**End of Specification 01**

**Document Status:** Initial Draft — Requires Review and Approval.