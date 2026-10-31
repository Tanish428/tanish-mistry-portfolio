# PROMPT-09: Dynamic Homepage Sections

**Phase:** 8 — Dynamic Homepage Sections  
**Task ID:** TASK-09  
**Specification:** `docs/specs/09-dynamic-sections.md`  
**Plan:** `docs/plans/09-dynamic-sections-plan.md`

---

## 1. Role

Act as a senior backend engineer working on the existing MERN portfolio backend.

Implement the Dynamic Homepage Sections module according to the approved specification and implementation plan.

Prioritize correctness, security, maintainability, compatibility, and test coverage over speed.

## 2. Mandatory Instructions

Before implementation:

- Read `AGENTS.md`.
- Read all applicable `.agents/rules/*.md` files.
- Read the TASK-09 specification and plan.
- Inspect the existing backend architecture and module conventions.
- Inspect all existing public services that provide section content.
- Confirm actual API response shapes and publication filters.
- Inspect the current Git branch and working tree.

Do not assume that the previous implementation reports perfectly describe the current source code.

## 3. Functional Scope

Implement the following:

1. HomepageSection Mongoose model.
2. Strict section-type allowlist.
3. Type-specific configuration validation.
4. Admin CRUD operations.
5. Publish and unpublish operations.
6. Visibility management.
7. Safe section reordering.
8. Public homepage section aggregation.
9. Automated tests for all relevant behavior.

Use the existing supported section types:

- `hero`
- `about`
- `projects`
- `skills`
- `experience`
- `education`
- `social_links`
- `contact`

Initially, permit one section per type.

Do not introduce arbitrary custom component types.

## 4. Data Composition Requirements

Sections define homepage presentation and configuration, not copies of business data.

Resolve content from existing modules:

- Hero and About: Profile.
- Projects: Projects.
- Skills: Skills.
- Experience: Experience.
- Education: Education.
- Social Links: Contact & Social.
- Contact: existing profile and contact functionality.

Reuse existing public service logic where possible.

Never bypass existing publication or visibility rules.

Do not use internal HTTP requests between backend modules.

Do not expose private fields, unpublished records, or hidden content.

If a source module has no suitable reusable service, inspect its implementation and propose the smallest safe integration rather than duplicating business logic.

## 5. Configuration and Security Requirements

- Use strict configuration validation for every section type.
- Reject unknown fields and unknown section types.
- Bound all text and numeric configuration values.
- Keep section type immutable after creation.
- Do not accept arbitrary HTML, JavaScript, JSX, templates, or executable code.
- Never dynamically import or execute a component based on a database value.
- Use the existing authentication, authorization, and CSRF middleware.
- Follow existing API response and error conventions.

## 6. Reordering Requirements

Reordering must:

- Validate all IDs before writing.
- Reject duplicate IDs.
- Reject missing or unrelated IDs.
- Ensure the payload represents the intended section set.
- Use a transaction where supported.
- Otherwise implement a safe recovery strategy.
- Never silently report success after a partial update.

Do not treat `bulkWrite()` alone as an atomic transaction.

## 7. Testing Requirements

Test at least:

- Valid and invalid section types.
- Duplicate section types.
- Defaults and model constraints.
- Type-specific configuration validation.
- Unknown configuration fields.
- Admin authentication and authorization.
- CSRF enforcement.
- CRUD operations.
- Publish and unpublish.
- Visibility changes.
- Reordering validation and failure behavior.
- Public published/visible filtering.
- Deterministic ordering.
- Content composition.
- Missing optional source content.
- Nested publication and visibility filtering.
- Public response privacy.
- Existing module regression behavior.

Run the full backend test suite and syntax check.

## 8. Scope Restrictions

Do not implement:

- React UI.
- Admin dashboard screens.
- Drag-and-drop functionality.
- Arbitrary page builder features.
- Multiple page management.
- Navigation management.
- Custom code execution.
- Redis or new infrastructure.
- New media upload functionality.

Do not refactor unrelated modules.

## 9. Git and File Safety

- Work only on `develop`.
- Do not switch branches.
- Do not commit or push.
- Do not merge or deploy.
- Do not overwrite existing documentation without inspection and approval.
- Preserve unrelated changes in the working tree.
- Modify only files required for TASK-09.

## 10. Final Report

After implementation, report:

1. Summary of implementation.
2. Exact files created.
3. Exact files modified.
4. Database model and index decisions.
5. API endpoints implemented.
6. Section types and configuration supported.
7. Public content composition approach.
8. Security measures.
9. Reordering and failure-recovery strategy.
10. Tests added.
11. Actual test results per suite and total.
12. `npm run check` result.
13. Git branch and working tree status.
14. Known limitations and deferred work.

Do not claim tests passed unless they were actually executed.

Stop after implementation and verification. Wait for explicit approval before any Git operation.