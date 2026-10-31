# AGENTS.md — Project Instructions

## 1. Project Identity

**Project:** Tanish Mistry — Personal Developer Portfolio  
**Project Type:** Dynamic Personal Portfolio with Content Management System (CMS)  
**Architecture:** MERN Stack — Modular Monolithic Architecture  
**Primary Language:** JavaScript (ES Modules)

The objective is to develop a professional, responsive, dynamic personal portfolio that presents the developer's profile, technical skills, projects, experience, achievements, and professional activities.

The portfolio must include a secure, private administrator dashboard that allows the administrator to manage website content through a CMS without modifying source code or redeploying the frontend for ordinary content updates.

## 2. Technology Stack

### Frontend
- React
- Vite
- JavaScript (ES Modules)
- React Router
- CSS / modern responsive styling
- Reusable component architecture

### Backend
- Node.js
- Express.js
- JavaScript (ES Modules)
- RESTful API architecture
- Mongoose ODM

### Database
- MongoDB Atlas
- MongoDB document-based data modeling

### Authentication and Security
- JWT-based authentication
- Secure HttpOnly cookies
- bcrypt password hashing
- Express middleware for authentication and authorization
- Input validation and sanitization

### Media Management
- Cloudinary for image and media storage
- Server-side upload validation
- MongoDB stores media metadata and Cloudinary identifiers, not binary files

## 3. Core Product Requirements

The application must provide:

1. A public-facing personal portfolio.
2. A private administrator dashboard.
3. Dynamic portfolio content managed through MongoDB.
4. CRUD operations for supported CMS modules.
5. Draft and published content states where applicable.
6. Reusable, configurable homepage sections.
7. Media uploads through Cloudinary.
8. Responsive layouts for desktop, tablet, and mobile.
9. Secure administrator authentication.
10. Contact message management.

### CMS Modules

The planned modules include:

- Profile
- Projects
- Skills
- Experience
- Education
- Achievements and certifications
- Social links
- Statistics
- Resume
- Contact messages
- Website settings
- Homepage sections

Do not implement all modules at once. Follow their approved specifications and implementation plans.

## 4. Architecture Principles

- Use a modular monolithic backend.
- Maintain clear separation of routes, controllers, services, models, middleware, and validation.
- Keep frontend components reusable and maintainable.
- Separate public portfolio routes from administrator routes.
- Use a versioned REST API under `/api/v1`.
- Keep database access inside appropriate service or repository layers.
- Avoid unnecessary dependencies and abstractions.
- Follow separation of concerns and single-responsibility principles.
- Use environment variables for configuration and secrets.
- Never execute arbitrary code or database-stored scripts to generate website sections.
- Use an explicit allowlist of supported dynamic section/block types.

## 5. Agent Operating Instructions

Before starting any implementation task:

1. Read this `AGENTS.md`.
2. Read all applicable files inside `.agents/rules/`.
3. Inspect the existing repository and understand its current state.
4. Read the specification referenced by the task.
5. Read the corresponding implementation plan.
6. Identify dependencies and existing functionality.
7. Explain the proposed implementation approach before making significant changes.

Do not assume that a file, feature, package, endpoint, or database model does not exist without inspecting the repository.

When documentation and existing implementation conflict, identify the conflict and ask for clarification instead of silently changing the architecture.

## 6. Specification and Planning Discipline

The following directories have separate responsibilities:

- `docs/specs/`: Defines what the system must do.
- `docs/plans/`: Defines how approved requirements will be implemented.
- `docs/prompts/`: Contains bounded implementation instructions.
- `docs/reports/`: Records actual implementation and testing outcomes.
- `docs/decisions/`: Records significant architectural decisions.

Specifications are the source of truth for functional requirements.

Implementation plans must remain consistent with their corresponding specifications.

Never silently change an approved requirement. Propose changes and obtain approval first.

## 7. Coding Standards

- Use JavaScript, not TypeScript, unless explicitly approved.
- Use ES modules (`import` and `export`).
- Prefer `const`; use `let` only when reassignment is necessary.
- Use meaningful variable, function, class, and file names.
- Keep functions focused and maintainable.
- Avoid duplicate code.
- Use centralized error handling.
- Validate all external inputs.
- Keep controllers thin and business logic in services.
- Use asynchronous error handling consistently.
- Avoid unnecessary comments; document non-obvious decisions.
- Do not leave unfinished TODOs or placeholder implementations without reporting them.

## 8. Git Workflow

- `main` is the stable branch.
- `develop` is the primary development branch.
- All development must happen on `develop` or approved feature branches created from `develop`.
- Do not commit implementation work directly to `main`.
- Never force-push.
- Never merge into `main` without explicit approval.
- Never push changes without explicit approval.
- Do not discard or overwrite existing user changes.
- Before implementation, inspect `git status` and the current branch.
- Create meaningful commits only when authorized.

## 9. Testing and Verification

Every implementation task must include appropriate verification.

Depending on the task, this may include:

- Syntax and build checks
- Unit tests
- Integration tests
- API endpoint testing
- Authentication and authorization tests
- Input validation tests
- Database operation tests
- Security checks

Never claim a test passed unless it was actually executed and its result was checked.

Clearly distinguish:
- Tests passed
- Tests failed
- Tests not executed
- Tests blocked by environment or configuration

## 10. Scope Control and Approval

The agent must:

- Implement only the explicitly approved task.
- Avoid unrelated refactoring.
- Avoid unnecessary dependency installation.
- Never expose or print secrets.
- Never modify production data.
- Never perform destructive database operations without explicit approval.
- Never deploy the application without explicit approval.
- Never push, merge, or rewrite Git history without explicit approval.
- Stop and ask when requirements are ambiguous or contradictory.

## 11. Completion Report

After each implementation task, provide:

1. Summary of completed work.
2. Files created.
3. Files modified.
4. Dependencies added or changed.
5. Important implementation decisions.
6. Tests executed and their actual results.
7. Known limitations or unresolved issues.
8. Suggested next step.

Do not mark a task complete if its required acceptance criteria have not been satisfied.

---

**Final Principle:** Understand first, plan second, obtain approval, implement carefully, verify thoroughly, and report honestly.