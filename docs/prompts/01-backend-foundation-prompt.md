# ANTIGRAVITY IMPLEMENTATION PROMPT
## Backend Foundation — Phase 0

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Task ID:** TASK-01  
**Phase:** Backend Foundation  
**Related Specification:** `docs/specs/01-backend-foundation.md`  
**Related Plan:** `docs/plans/01-backend-foundation-plan.md`  
**Master Specification:** `docs/specs/00-project-overview.md`

---

# 1. Your Role

Act as a senior backend engineer responsible for implementing the backend foundation of this project.

You must follow professional software engineering practices, maintainable architecture, security principles, and the approved project documentation.

You are working on an existing repository. Do not assume that the repository is empty or that its current implementation can be replaced.

Your responsibility is to implement only the approved backend foundation task.

# 2. Mandatory Documentation

Before doing anything, read these files completely:

1. `AGENTS.md`
2. `.agents/rules/architecture.md`
3. `.agents/rules/backend.md`
4. `.agents/rules/security.md`
5. `.agents/rules/git-workflow.md`
6. `docs/specs/00-project-overview.md`
7. `docs/specs/01-backend-foundation.md`
8. `docs/plans/01-backend-foundation-plan.md`

These documents define the project's architecture, requirements, constraints, and implementation approach.

Do not ignore or silently override their instructions.

If any documents conflict, identify the conflict and ask for clarification.

# 3. Stage One — Repository Inspection

Before modifying any files, inspect the repository.

Check:

- Current working directory.
- Repository structure.
- Backend directory.
- Existing package.json.
- Existing package-lock.json.
- Existing dependencies.
- Existing environment configuration.
- Existing server files.
- Existing Git branch.
- Git working tree status.

Execute the relevant Git inspection commands:

```bash
git status
git branch --show-current
git log -5 --oneline
```

The expected development branch is:

```text
develop
```

If the current branch is `main`, STOP. Do not implement anything on `main`.

If there are uncommitted changes, preserve them.

Do not delete, overwrite, reset, or discard existing user work.

# 4. Stage Two — Implementation Analysis

After repository inspection, compare the existing project against:

- Backend Foundation Specification.
- Backend Foundation Implementation Plan.

Identify:

1. Existing functionality that can be reused.
2. Missing files and configurations.
3. Required modifications.
4. Dependency changes.
5. Potential implementation risks.
6. Conflicts with existing architecture.

Prepare a concise implementation proposal.

The proposal must contain:

- Current repository state.
- Proposed file-level changes.
- Dependency changes.
- Implementation sequence.
- Database configuration requirements.
- Testing strategy.
- Risks and unresolved questions.

# 5. Approval Gate

STOP after completing repository inspection and implementation analysis.

Do not create, modify, delete, install, or execute implementation changes yet.

Present your implementation proposal and wait for explicit user approval.

Only proceed when the user explicitly authorizes implementation.

# 6. Stage Three — Implementation

After receiving approval, implement the backend foundation according to the approved specification and plan.

## Required Functionality

### A. Node.js Configuration

- Use JavaScript ES modules.
- Configure Express 5.x.
- Install only approved dependencies.
- Configure development and production scripts.
- Preserve package lock consistency.

### B. Environment Configuration

Implement:

`backend/src/config/env.js`

Requirements:

- Load environment variables.
- Validate required variables.
- Validate port configuration.
- Centralize application configuration.
- Fail safely when required variables are missing.
- Never expose secrets in logs.

### C. MongoDB Configuration

Implement:

`backend/src/config/db.js`

Requirements:

- Connect through Mongoose.
- Use MongoDB Atlas.
- Use the configured database name.
- Handle connection failures.
- Export reusable connection functionality.

The server must not start accepting requests until MongoDB connectivity succeeds.

### D. Express Application

Implement:

`backend/src/app.js`

Configure:

- Helmet.
- CORS.
- Morgan.
- JSON parsing.
- URL-encoded parsing.
- Centralized API routes.
- 404 middleware.
- Error-handling middleware.

Use the configured frontend origin.

Support credentialed requests for future cookie authentication without using wildcard origins.

### E. API Routes

Implement:

`backend/src/routes/index.js`

Use the API base path:

`/api/v1`

Register:

- GET `/api/v1/health/live`
- GET `/api/v1/health/ready`

Do not create business endpoints.

### F. Health Checks

Implement:

`backend/src/controllers/health.controller.js`

Liveness:

- Must work independently of MongoDB.
- Must return HTTP 200 when the application process is responding.

Readiness:

- Must check the actual MongoDB connection state.
- Must return HTTP 200 when ready.
- Must return HTTP 503 when MongoDB is unavailable.

Never expose credentials or infrastructure secrets.

### G. Error Handling

Implement:

- `backend/src/middleware/notFound.js`
- `backend/src/middleware/errorHandler.js`

Requirements:

- Centralized error handling.
- Consistent JSON responses.
- Appropriate status codes.
- Safe production messages.
- No stack traces exposed in production.

### H. Server Lifecycle

Implement:

`backend/src/server.js`

Requirements:

- Validate configuration.
- Connect to MongoDB.
- Initialize Express.
- Start listening only after successful database connection.
- Handle startup failures.
- Handle SIGINT and SIGTERM.
- Close the HTTP server gracefully.
- Close MongoDB connections during shutdown.

### I. Git Ignore and Environment Example

Ensure:

- `.env` is ignored.
- `.env.example` contains placeholders only.
- No credentials are committed.
- Existing ignore rules are preserved.

# 7. Scope Restrictions

Do not implement any of the following:

- Administrator authentication.
- JWT authentication.
- Password hashing.
- Administrator model.
- Profile management.
- Project management.
- Skills management.
- Experience management.
- Education management.
- Achievements management.
- Cloudinary integration.
- Media management.
- Dynamic homepage sections.
- Publishing workflow.
- Contact form.
- Email integration.
- GitHub integration.
- LeetCode integration.
- Redis.
- Microservices.
- Frontend implementation.

These belong to future approved tasks.

Do not perform unrelated refactoring.

# 8. Engineering Requirements

Follow these requirements throughout implementation:

- Use JavaScript ES modules.
- Follow the existing approved architecture.
- Keep controllers focused on HTTP handling.
- Keep configuration centralized.
- Use meaningful names.
- Handle asynchronous errors consistently.
- Validate external inputs.
- Avoid unnecessary abstractions.
- Avoid duplicate code.
- Preserve existing functionality.
- Do not hardcode secrets.
- Do not introduce unapproved dependencies.

Do not create placeholder implementations that falsely suggest a feature is complete.

# 9. Testing and Verification

After implementation, execute relevant checks.

## Static Checks

- Verify JavaScript syntax.
- Verify module imports.
- Verify package scripts.
- Verify dependency consistency.

## Configuration Checks

- Verify valid environment configuration.
- Verify missing variables are rejected.
- Verify invalid port configuration is rejected.
- Verify secrets are not logged.

## Database Checks

- Verify MongoDB connection.
- Verify failed connections prevent server startup.
- Verify readiness reflects the actual database state.

## API Checks

| Endpoint | Expected |
|---|---|
| GET `/api/v1/health/live` | HTTP 200 |
| GET `/api/v1/health/ready` with connected DB | HTTP 200 |
| GET `/api/v1/health/ready` without DB | HTTP 503 |
| GET unknown route | HTTP 404 |

Also test:

- Malformed JSON.
- Untrusted CORS origin.
- Safe error responses.
- Graceful shutdown.

Use an appropriate test environment.

Do not perform destructive tests against production data.

Never report tests as passed unless they were actually executed.

If a test cannot be executed because of missing credentials or environment configuration, clearly report it as blocked or not executed.

# 10. Git Safety

All implementation work must remain on `develop` or an approved feature branch created from `develop`.

Never:

- Commit directly to `main`.
- Push automatically.
- Merge automatically.
- Force-push.
- Rewrite Git history.
- Discard user changes.
- Deploy without approval.

Do not create commits unless explicitly authorized.

# 11. Completion Report

After implementation, provide a structured report.

## A. Implementation Summary

Explain what was implemented.

## B. Files Created

List every newly created file.

## C. Files Modified

List every modified existing file.

## D. Dependencies

List:

- Dependencies added.
- Dependencies updated.
- Reason for each change.

## E. Database Verification

Report the actual MongoDB connection result without revealing credentials.

## F. Testing Results

Use these statuses:

- PASSED
- FAILED
- NOT EXECUTED
- BLOCKED

Report the actual outcome of each relevant test.

## G. Known Issues

Identify:

- Remaining problems.
- Unverified behavior.
- Environment limitations.
- Technical risks.

## H. Git Status

Report:

- Current branch.
- Working tree status.
- Files changed.
- Whether changes are committed.
- Whether changes are pushed.

Do not commit or push automatically.

# 12. Final Instructions

Work in small, controlled steps.

Prioritize correctness, security, maintainability, and consistency with the approved documentation.

Do not implement anything outside the approved scope.

If an important requirement is ambiguous, stop and ask.

If implementation requires changing an approved architectural decision, explain the reason and request approval.

**First action: Inspect the repository, read the required documentation, and prepare the implementation proposal. Do not modify any files until the user approves the proposal.**

---

**End of Implementation Prompt 01**