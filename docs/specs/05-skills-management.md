# SPEC-05: Skills Management

**Project:** Dynamic Personal Portfolio  
**Phase:** 4 — Skills Management  
**Module:** Skills  
**Status:** Proposed

## 1. Objective

Implement a database-driven Skills Management module that allows the administrator to create, update, organize, publish, hide, and delete skill categories and individual skills.

The public portfolio must retrieve published skills dynamically through REST APIs. Adding or updating a skill must not require frontend source-code changes or a frontend redeployment.

## 2. Scope

### In scope
- Skill category management.
- Individual skill management.
- Skill proficiency levels.
- Featured skills.
- Visibility and publication controls.
- Display ordering for categories and skills.
- Public APIs for retrieving published skill categories and skills.
- Validation, authorization, CSRF protection, and automated tests.

### Out of scope
- Frontend admin dashboard or public UI implementation.
- Cloudinary integration or skill icon uploads.
- Automatic skill verification through GitHub, LinkedIn, or other services.
- AI-generated skill recommendations.
- Skill endorsements, ratings, or user-submitted reviews.
- Analytics and skill assessment tests.

## 3. Data Models

Use two independent Mongoose models: `SkillCategory` and `Skill`.

### 3.1 SkillCategory

Fields:

| Field | Type | Requirements |
|---|---|---|
| name | String | Required, trimmed, bounded length |
| slug | String | Required, lowercase URL-friendly, unique |
| description | String | Optional, trimmed, bounded length |
| displayOrder | Number | Default `0`, non-negative integer |
| isVisible | Boolean | Default `true` |
| isPublished | Boolean | Default `false` |
| timestamps | Mongoose timestamps | Enabled |

Requirements:
- Category names must be unique according to a clearly defined case-insensitive normalization policy, or category slugs must be unique at minimum.
- Category slugs must follow `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Generate a slug from the category name when omitted.
- Preserve an existing slug when the category name changes unless the administrator explicitly changes the slug.
- Enforce slug uniqueness with a database index.
- New categories must be drafts by default.

### 3.2 Skill

Fields:

| Field | Type | Requirements |
|---|---|---|
| name | String | Required, trimmed, bounded length |
| slug | String | Required, lowercase URL-friendly, unique |
| category | ObjectId | Required reference to `SkillCategory` |
| description | String | Optional, trimmed, bounded length |
| proficiencyLevel | String | Required enum |
| iconName | String | Optional identifier for a frontend-supported icon |
| isFeatured | Boolean | Default `false` |
| isVisible | Boolean | Default `true` |
| isPublished | Boolean | Default `false` |
| displayOrder | Number | Default `0`, non-negative integer |
| timestamps | Mongoose timestamps | Enabled |

Proficiency levels:
- `beginner`
- `intermediate`
- `advanced`
- `expert`

These levels are administrator-entered, self-assessed descriptions. They must not be presented as independently verified certifications or measured scores.

Requirements:
- Skill slug must be unique at the database level.
- Generate a slug from the skill name when omitted.
- Preserve the current slug when the skill name changes unless explicitly changed.
- A skill must reference an existing category.
- Prevent deletion of a category while skills still reference it. Return a conflict response and require the administrator to reassign or remove its skills first.
- New skills must be drafts by default.
- `iconName` is an identifier only. Do not store executable code, arbitrary HTML, or arbitrary component definitions in the database.

## 4. Publication and Visibility Rules

A skill is publicly available only when all of the following are true:

- `Skill.isPublished === true`
- `Skill.isVisible === true`
- Its referenced category exists.
- `SkillCategory.isPublished === true`
- `SkillCategory.isVisible === true`

A category is publicly available only when it is both published and visible.

Unpublishing or hiding a category must prevent its skills from appearing in public API responses, even if those skills are individually published.

Admin APIs must continue to show draft and hidden records.

## 5. API Requirements

All endpoints use the existing `/api/v1` prefix.

### 5.1 Administrator — Skill Categories

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/skill-categories` | Create a category |
| GET | `/admin/skill-categories` | List all categories |
| GET | `/admin/skill-categories/:id` | Get category details |
| PATCH | `/admin/skill-categories/:id` | Update category |
| DELETE | `/admin/skill-categories/:id` | Delete category if it has no skills |
| PATCH | `/admin/skill-categories/:id/publish` | Publish category |
| PATCH | `/admin/skill-categories/:id/unpublish` | Unpublish category |
| PATCH | `/admin/skill-categories/reorder` | Reorder categories |

### 5.2 Administrator — Skills

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/skills` | Create a skill |
| GET | `/admin/skills` | List all skills |
| GET | `/admin/skills/:id` | Get skill details |
| PATCH | `/admin/skills/:id` | Update skill |
| DELETE | `/admin/skills/:id` | Delete skill |
| PATCH | `/admin/skills/:id/publish` | Publish skill |
| PATCH | `/admin/skills/:id/unpublish` | Unpublish skill |
| PATCH | `/admin/skills/:id/featured` | Update featured status |
| PATCH | `/admin/skills/reorder` | Reorder skills |

Register static routes such as `/reorder` before parameterized `/:id` routes where necessary.

### 5.3 Public Portfolio APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/portfolio/skill-categories` | Retrieve published and visible categories |
| GET | `/portfolio/skills` | Retrieve published and visible skills |

Public API requirements:
- Return only skills whose categories are also published and visible.
- Support optional `category` filtering using a validated category slug or ID. Choose one consistent public contract and document it.
- Support optional `featured=true` filtering.
- Sort categories by `displayOrder` ascending, with a deterministic tie-breaker.
- Sort skills by featured status first, then `displayOrder` ascending, then a deterministic tie-breaker.
- Return category information in a controlled response shape.
- Do not expose internal publication flags, internal identifiers where unnecessary, `__v`, or other administrative metadata.
- Do not return MongoDB documents directly.

## 6. Validation and Security

- Reuse the existing authentication, authorization, CSRF, error-handling, and routing infrastructure.
- Every administrator mutation must require authentication, administrator authorization, and CSRF protection.
- Validate all request bodies, query parameters, route parameters, ObjectIds, enums, and numeric ordering values.
- Use strict field allowlists. Reject unknown fields and protected/internal fields.
- Reject MongoDB operator keys and unsafe nested objects.
- Never pass unvalidated request objects directly into Mongoose queries or updates.
- Validate category references before creating or updating a skill.
- Handle duplicate key errors consistently as HTTP `409 Conflict`.
- Return `404 Not Found` for missing records.
- Return `400 Bad Request` for invalid input.
- Return `409 Conflict` when a category cannot be deleted because skills reference it.
- Avoid exposing stack traces or internal database details in production responses.

## 7. Reordering Requirements

Category and skill reordering must:
- Accept a clearly defined list of record IDs and their new display-order values.
- Reject malformed IDs, duplicate IDs, duplicate order values if the API contract requires unique ordering, negative values, and non-integer values.
- Verify that every submitted record exists.
- Avoid modifying records not included in the request.
- Validate the entire payload before performing writes.
- Use a transaction if the operation requires all-or-nothing behavior and the MongoDB deployment supports transactions.
- If a transaction is unavailable, implement and document a safe alternative. Do not claim multi-document atomicity from `bulkWrite()` alone.

For skill reordering, define whether the operation is global or scoped to one category. Prefer category-scoped ordering so each category can independently order its skills. If this is selected, require a category identifier in the reorder request and reject skills outside that category.

## 8. Database Indexes

Create indexes appropriate to actual query patterns:
- Unique index on category slug.
- Unique index on skill slug.
- Category lookup index on `Skill.category`.
- Public category filtering and ordering index.
- Public skill filtering and ordering index.
- Any additional compound index only when justified by the implemented query and sort patterns.

Avoid redundant indexes. Document the purpose of each compound index.

## 9. Error Handling

Use the existing centralized error-handling conventions. The module must handle:
- Duplicate category or skill slug.
- Missing category.
- Invalid category reference.
- Category deletion while skills still reference it.
- Invalid proficiency level.
- Invalid ordering payload.
- Missing category or skill.
- Attempts to access administrator endpoints without valid authorization or CSRF tokens.

## 10. Testing and Acceptance Criteria

### Model and validation tests
- Required fields and defaults.
- Slug generation and normalization.
- Slug uniqueness.
- Proficiency enum validation.
- Category reference validation.
- Invalid display order rejection.
- Unknown and protected fields rejection.

### Administrator API tests
- Category CRUD.
- Skill CRUD.
- Publish and unpublish.
- Featured toggle.
- Category deletion conflict when skills exist.
- Invalid and duplicate slug handling.
- Category-scoped skill reordering.
- Authentication, authorization, and CSRF enforcement.

### Public API tests
- Only published and visible categories are returned.
- Only published and visible skills are returned.
- Skills in hidden or unpublished categories are excluded.
- Category filtering works.
- Featured filtering works.
- Ordering is deterministic.
- Administrative metadata is excluded.

### Regression tests
Run the complete existing test suite for:
- Phase 0 — Backend Foundation.
- Phase 1 — Administrator Authentication.
- Phase 2 — Profile Management.
- Phase 3 — Project Management.
- Phase 4 — Skills Management.

### Acceptance criteria
The phase is complete only when:
1. Both models and all required indexes are implemented.
2. Administrator APIs support the specified operations.
3. Public APIs enforce both skill and category publication rules.
4. All mutations are protected by the existing security middleware.
5. Validation and error responses follow the existing API conventions.
6. Automated tests pass without skipped or failing tests.
7. Existing phase regression tests pass.
8. `npm run check` passes.
9. Implementation documentation and test results are reported.
10. No Git commit, push, merge, or deployment is performed without explicit approval.