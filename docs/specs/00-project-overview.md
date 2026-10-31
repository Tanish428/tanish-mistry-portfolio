# Personal Developer Portfolio — Master Project Specification

**Project Name:** Tanish Mistry — Personal Developer Portfolio  
**Document ID:** SPEC-00  
**Version:** 1.0  
**Status:** Initial Draft  
**Architecture:** MERN Modular Monolith  
**Primary Language:** JavaScript (ES Modules)

---

# 1. Project Overview

## 1.1 Purpose

Develop a professional, responsive, dynamic personal developer portfolio with an integrated Content Management System (CMS).

The portfolio will present the developer's professional identity, technical skills, projects, education, experience, achievements, and development activities.

The application will also include a secure administrator dashboard that allows the administrator to manage portfolio content without directly modifying application source code.

## 1.2 Primary Objectives

1. Build a professional recruiter-facing developer portfolio.
2. Create a dynamic content-driven website.
3. Provide a secure administrator dashboard.
4. Allow content management through CRUD operations.
5. Support configurable homepage sections.
6. Provide centralized media management.
7. Maintain clean, scalable, and maintainable architecture.
8. Ensure responsive design and good performance.
9. Support future functionality without unnecessary architectural complexity.

## 1.3 Target Audience

- Technical recruiters
- Software engineering hiring teams
- Internship coordinators
- Developers
- Professional networking contacts
- Visitors interested in the developer's work

---

# 2. Technology Stack

## 2.1 Frontend

| Technology | Purpose |
|---|---|
| React | UI development |
| Vite | Development and build tooling |
| JavaScript | Application programming |
| React Router | Client-side routing |
| CSS | Styling and responsive layouts |

Use reusable components and a modular frontend architecture.

## 2.2 Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| JavaScript ES Modules | Application language and module system |
| Mongoose | MongoDB ODM |
| REST API | Frontend-backend communication |

## 2.3 Database

**MongoDB Atlas**

Use MongoDB to store:

- Administrator account information
- Profile information
- Projects
- Skills
- Experience
- Education
- Achievements
- Social links
- Statistics
- Homepage section configuration
- Website settings
- Contact messages
- Media metadata

## 2.4 Authentication and Security

- JWT authentication
- Secure HttpOnly cookies
- bcrypt password hashing
- Protected administrator APIs
- Input validation
- Authentication and authorization middleware
- Appropriate CORS configuration
- Security headers and rate limiting

## 2.5 Media Management

**Cloudinary**

Cloudinary will handle image and media storage.

The backend will validate uploads and communicate securely with Cloudinary.

MongoDB will store relevant metadata, including:

- Cloudinary public ID
- Secure URL
- Resource type
- Format
- File size
- Associated content reference, where applicable

Binary media files must not be stored directly in MongoDB.

---

# 3. Application Architecture

## 3.1 Architecture Style

Use a Modular Monolithic Architecture.

The application will contain two major parts:

1. Public Portfolio
2. Private Administrator Dashboard

Both frontend experiences will be maintained within the same React application, using separate routes and layouts.

The backend will expose versioned REST APIs.

## 3.2 High-Level Architecture

```text
                 VISITOR / ADMIN
                        |
                        v
                 REACT FRONTEND
                   (Vite)
                        |
              ---------------------
              |                   |
              v                   v
        PUBLIC WEBSITE       ADMIN DASHBOARD
              |                   |
              ---------------------
                        |
                        v
                 REST API CLIENT
                        |
                        v
                NODE.JS + EXPRESS
                        |
          -----------------------------
          |             |             |
          v             v             v
       ROUTES       MIDDLEWARE     SERVICES
                        |             |
                        |             v
                        |          MODELS
                        |             |
                        ---------------
                              |
                              v
                       MONGODB ATLAS
                              |
                              v
                         CLOUDINARY
                      (Media Storage)
```

## 3.3 Architectural Principles

- Separation of concerns
- Modular organization
- Reusable components
- Centralized error handling
- Server-side validation
- Secure configuration
- Consistent API responses
- Maintainable database models
- Avoid unnecessary dependencies
- Avoid premature microservice architecture

---

# 4. User Roles and Access Control

## 4.1 Public Visitor

A public visitor can:

- View the homepage.
- Read profile information.
- Browse projects.
- View technical skills.
- View education and experience.
- View achievements.
- Access social links.
- Download the published resume.
- Submit a contact message.

A public visitor cannot:

- Access administrator routes.
- Create or modify portfolio content.
- View unpublished content.
- Access administrator credentials or private data.

## 4.2 Administrator

The application will initially support a single administrator.

The administrator can:

- Log in securely.
- Access the private dashboard.
- Manage portfolio profile information.
- Create, edit, delete, and publish projects.
- Manage skills and skill categories.
- Manage experience and education.
- Manage achievements and certifications.
- Manage social links.
- Manage statistics.
- Upload and manage media.
- Configure homepage sections.
- Manage website settings.
- Review contact messages.
- Manage the resume.

There must be no public administrator registration.

Administrator creation must be handled through a controlled, secure setup process.

---

# 5. Public Portfolio Requirements

## 5.1 Visual Direction

The portfolio must have a modern, premium, professional technology-oriented appearance.

### Dark Theme

- Dark background.
- Neon-purple visual accents.
- Clear text contrast.
- Subtle glowing effects.
- Modern card layouts.
- Clean typography.
- Visually distinct content sections.

### Light Theme

- White and light neutral backgrounds.
- Pale-purple surfaces.
- Purple accents.
- Clear text hierarchy.
- Consistent spacing and component styling.

### Theme Switching

- Provide a theme toggle.
- Support dark and light themes.
- Maintain visual consistency between themes.
- Avoid duplicated page implementations for different themes.

### Section Separation

Use clear horizontal separators between major homepage sections.

Separators should complement the theme without making the interface visually crowded.

## 5.2 Homepage Sections

The planned homepage sections are:

1. Hero
2. About
3. Projects
4. Skills
5. GitHub and LeetCode Activity
6. Contact

Additional sections, such as experience, education, and achievements, may be introduced through the approved CMS configuration.

The exact ordering and visibility of supported sections should be configurable by the administrator.

## 5.3 Hero Section

Display:

- Developer name
- Professional title or role
- Short introduction
- Primary call-to-action
- Secondary call-to-action
- Profile image or portrait
- Relevant social links

Content must be manageable through the CMS.

## 5.4 About Section

Display:

- Professional introduction
- Background
- Technical interests
- Career objectives
- Relevant personal professional information

Content must be manageable through the administrator dashboard.

## 5.5 Projects Section

Display selected projects with:

- Project name
- Description
- Technology stack
- Project image
- Key features
- GitHub repository link
- Live demonstration link, when available
- Project category or status

Initial featured projects:

1. MealMate
2. SmartDeviceMatch
3. StockRiskTracker

These are initial portfolio entries, not hardcoded permanent website content.

The administrator must be able to manage project records through the CMS.

## 5.6 Skills Section

Display technical skills in organized categories.

Possible categories:

- Programming Languages
- Frontend Development
- Backend Development
- Databases
- Tools and Platforms
- Other Technical Skills

Each skill may contain:

- Name
- Category
- Icon or image
- Proficiency label, if appropriate
- Display order
- Visibility status

Avoid presenting subjective proficiency levels as verified measurements.

## 5.7 Development Activity

Provide an area for GitHub and LeetCode activity.

Possible information:

- GitHub contribution activity
- Repository statistics
- Public development activity
- LeetCode problem-solving statistics

External integrations must use official or appropriately permitted data sources.

If external data is unavailable, the website must handle the situation gracefully.

Do not fabricate activity statistics.

## 5.8 Contact Section

Provide:

- Contact form
- Email information, when configured for public display
- Social links

The contact form must validate user input and submit messages to the backend.

Store submitted messages in MongoDB.

Never expose private administrator information.

---

# 6. Administrator Dashboard Requirements

## 6.1 Dashboard Objective

The administrator dashboard must provide a centralized interface to manage the public portfolio.

It must use a separate layout from the public portfolio.

## 6.2 Dashboard Capabilities

The administrator should be able to:

- View dashboard overview.
- Manage profile information.
- Manage projects.
- Manage skills.
- Manage experience.
- Manage education.
- Manage achievements.
- Manage social links.
- Manage statistics.
- Manage media.
- Configure homepage sections.
- Manage website settings.
- Manage resume.
- Review contact messages.

## 6.3 Dashboard Design

The dashboard should provide:

- Clean sidebar navigation.
- Header/navigation area.
- Responsive layout.
- Consistent forms.
- Reusable data tables or lists.
- Loading states.
- Empty states.
- Error messages.
- Success feedback.
- Confirmation for destructive actions.

Do not introduce unnecessary dashboard complexity.

---

# 7. Content Management System (CMS)

## 7.1 CMS Objective

The CMS must make portfolio content manageable without modifying source code.

Ordinary content changes should not require frontend redeployment.

Examples:

- Updating the developer introduction.
- Adding a project.
- Updating a project description.
- Adding a skill.
- Updating experience information.
- Reordering homepage sections.
- Changing visibility of a supported section.

## 7.2 Planned CMS Modules

| Module | Main Responsibility |
|---|---|
| Profile | Developer information |
| Projects | Portfolio projects |
| Skills | Technical skills |
| Experience | Professional experience |
| Education | Academic information |
| Achievements | Certifications and achievements |
| Social Links | External professional profiles |
| Statistics | Portfolio statistics |
| Resume | Resume management |
| Media | Cloudinary asset management |
| Sections | Homepage section configuration |
| Settings | Website-wide configuration |
| Messages | Contact form submissions |

## 7.3 CRUD Operations

Supported CMS modules must provide appropriate operations:

- Create
- Read
- Update
- Delete

Operations must be protected by administrator authentication.

Not every module necessarily needs every operation. For example, contact messages may use status updates and archival rather than unrestricted editing.

## 7.4 Dynamic Homepage Sections

The homepage must support a structured, configurable section system.

Each section configuration may include:

- Section identifier
- Section title
- Section type
- Display order
- Visibility
- Configuration
- Content references
- Publication status, where applicable

Use an explicit allowlist of supported section types.

Do not store executable code, arbitrary component names, or scripts in MongoDB.

Section configuration must be validated against the supported section schema.

## 7.5 Content References

Sections must reference their underlying content records.

For example:

A Projects section must reference project records rather than duplicating entire project objects inside the section configuration.

This avoids data duplication and makes content management more reliable.

## 7.6 Draft and Publishing

The system should support draft and published content states where appropriate.

Requirements:

- Unpublished content must not appear on the public website.
- Administrator preview must be protected.
- Publishing must make approved content available publicly.
- Unpublishing must remove content from public responses.
- Public APIs must return only published and visible content.

---

# 8. Database Design Requirements

MongoDB Atlas will be the primary database.

Use Mongoose for schema definitions and database access.

## 8.1 Planned Collections

The exact schema design will be defined in individual feature specifications.

Potential collections include:

- admins
- profiles
- projects
- skills
- experiences
- educations
- achievements
- socialLinks
- statistics
- media
- sections
- settings
- messages

Collection names and boundaries may be adjusted after detailed database design.

## 8.2 Database Principles

- Use appropriate schemas and validation.
- Apply timestamps where appropriate.
- Add indexes based on query requirements.
- Avoid unnecessary duplication.
- Use references for independently managed entities.
- Handle missing references safely.
- Protect private fields.
- Apply appropriate uniqueness constraints.
- Use pagination for large collections.

Do not create every collection before its requirements are defined.

---

# 9. API Requirements

## 9.1 API Style

Use RESTful APIs.

Base path:

`/api/v1`

## 9.2 API Separation

Separate public and administrator endpoints.

Example structure:

```text
/api/v1
    /health

    /auth
        /login
        /logout
        /me

    /portfolio
        /profile
        /projects
        /skills
        /experience
        /education
        /achievements
        /sections
        /settings

    /admin
        /profile
        /projects
        /skills
        /experience
        /education
        /achievements
        /media
        /sections
        /settings
        /messages
```

This is an illustrative endpoint structure.

Exact HTTP methods, request schemas, response formats, permissions, and validation requirements will be defined in the individual specifications.

## 9.3 API Principles

- Use correct HTTP methods.
- Use meaningful status codes.
- Validate request data.
- Use consistent response structures.
- Protect administrator endpoints.
- Avoid exposing internal server errors.
- Implement pagination where necessary.
- Keep public and administrator permissions separate.

---

# 10. Media Management

Cloudinary will be the centralized media storage provider.

The backend must:

1. Receive uploads from the administrator.
2. Validate file type and size.
3. Upload approved files to Cloudinary.
4. Store relevant media metadata in MongoDB.
5. Return safe media information to the frontend.
6. Support replacement and deletion workflows.

The system must handle failed uploads without leaving inconsistent database records.

Do not expose Cloudinary secret credentials to the frontend.

---

# 11. External Integrations

Potential integrations include:

## 11.1 GitHub

Use permitted GitHub APIs to retrieve public developer activity and repository information.

## 11.2 LeetCode

Use an appropriately permitted and reliable data source.

Do not assume an unofficial endpoint is stable or supported.

## 11.3 Email

Use an email service for contact notifications if configured.

Email delivery failure must not silently destroy an otherwise successfully stored contact message.

## 11.4 Analytics

Future analytics may include:

- Page views
- Project visits
- Contact form submissions
- Basic traffic information

Analytics must respect privacy and applicable requirements.

External integrations are planned features, not mandatory dependencies for the initial backend foundation.

---

# 12. Security Requirements

Security is mandatory.

The system must:

- Hash administrator passwords with bcrypt.
- Use JWT-based authentication.
- Store tokens in secure HttpOnly cookies.
- Validate all incoming data.
- Protect administrator APIs.
- Apply server-side authorization.
- Configure CORS appropriately.
- Use security headers.
- Apply rate limiting to sensitive endpoints.
- Protect cookie-authenticated operations against CSRF.
- Keep secrets in environment variables.
- Avoid exposing internal errors.
- Protect against mass assignment.
- Validate media uploads.
- Prevent arbitrary executable content in dynamic CMS configuration.

No security requirement may be removed merely to simplify implementation.

---

# 13. Performance and Reliability

The application should:

- Load public content efficiently.
- Use database indexes appropriately.
- Paginate large collections.
- Avoid unnecessary database queries.
- Use suitable image optimization through Cloudinary.
- Use HTTP caching where appropriate.
- Refresh or invalidate cached public content after publishing changes.
- Handle external integration failures gracefully.
- Provide loading, empty, and error states.

Redis and additional infrastructure are not required initially.

Introduce additional infrastructure only when a measurable requirement justifies it.

---

# 14. Deployment Considerations

The application should be designed for deployment using:

- A React-compatible frontend hosting platform.
- A Node.js-compatible backend hosting platform.
- MongoDB Atlas.
- Cloudinary.

Production deployment must use HTTPS and secure environment configuration.

Actual hosting providers, domain configuration, CI/CD, and deployment workflows will be specified separately.

Do not deploy without explicit user approval.

---

# 15. Non-Functional Requirements

## 15.1 Maintainability

- Modular architecture.
- Reusable components.
- Clear naming conventions.
- Separation of concerns.
- Consistent code style.
- Meaningful documentation.

## 15.2 Scalability

The architecture should support additional CMS modules and portfolio content without requiring a complete rewrite.

Avoid premature optimization.

## 15.3 Usability

- Simple navigation.
- Clear content hierarchy.
- Consistent UI.
- Responsive layouts.
- Accessible forms and interactive controls.
- Clear loading and error feedback.

## 15.4 Reliability

- Centralized error handling.
- Graceful failure handling.
- Input validation.
- Safe database operations.
- Reliable publishing behavior.

## 15.5 Accessibility

- Semantic HTML.
- Keyboard-accessible controls.
- Appropriate labels.
- Sufficient contrast.
- Meaningful image alternative text.
- Visible focus states.

---

# 16. Development Scope and Phases

Development must follow approved specifications and implementation plans.

## Phase 0 — Project Foundation

- Repository structure.
- Environment configuration.
- Backend setup.
- Database connection.
- Express application setup.
- Health endpoints.
- Basic error handling.

## Phase 1 — Administrator Authentication

- Administrator model.
- Secure login.
- JWT cookie handling.
- Authentication middleware.
- Authorization middleware.
- Logout.
- Protected administrator routes.

## Phase 2 — Profile Management

- Profile schema.
- Profile APIs.
- Administrator profile management.
- Public profile retrieval.

## Phase 3 — Project Management

- Project schema.
- Project CRUD APIs.
- Publication and visibility.
- Public project retrieval.

## Phase 4 — Skills Management

- Skill schema.
- Skill categories.
- Skill management APIs.
- Public skill retrieval.

## Phase 5 — Experience and Education

- Experience management.
- Education management.
- Public retrieval.

## Phase 6 — Achievements and Certifications

- Achievement schema.
- CRUD operations.
- Public retrieval.

## Phase 7 — Media Management

- Cloudinary configuration.
- Upload validation.
- Media upload APIs.
- Media metadata.
- Deletion and replacement workflows.

## Phase 8 — Dynamic Homepage Sections

- Section schema.
- Supported block types.
- Content references.
- Ordering.
- Visibility.
- Configuration validation.

## Phase 9 — Publishing and Website Configuration

- Draft and published states.
- Preview behavior.
- Website settings.
- Public content resolution.
- Cache invalidation.

## Phase 10 — External Integrations

- GitHub.
- LeetCode data source.
- Contact email notifications.
- Analytics, if approved.

## Phase 11 — Production Readiness

- Security review.
- Testing.
- Logging.
- Error monitoring.
- Database backup strategy.
- Deployment preparation.
- Performance verification.

---

# 17. Development and Agent Workflow

All development must follow this process:

1. Read the root `AGENTS.md`.
2. Read applicable `.agents/rules/`.
3. Inspect the current repository.
4. Read the approved feature specification.
5. Read the corresponding implementation plan.
6. Prepare a bounded implementation proposal.
7. Obtain user approval.
8. Implement the approved scope.
9. Run relevant tests.
10. Review the code and Git diff.
11. Prepare an implementation report.
12. Obtain approval for any commit or push.

## Git Strategy

- `main` is the stable branch.
- `develop` is the primary development branch.
- Feature branches must originate from `develop`.
- No direct development on `main`.
- No automatic pushes, merges, or deployments.

## Agent Restrictions

The coding agent must not:

- Implement unapproved features.
- Change the technology stack without approval.
- Introduce unnecessary dependencies.
- Perform destructive database operations without approval.
- Expose credentials.
- Rewrite unrelated code.
- Claim tests passed without running them.
- Change approved architecture silently.

---

# 18. Acceptance Criteria

The overall project will be considered functionally complete when:

1. The public portfolio displays published content from the backend.
2. The administrator can securely log in.
3. Unauthorized users cannot access administrator APIs.
4. Supported CMS modules can be managed through the dashboard.
5. Content changes appear on the public website without requiring a frontend code change or redeployment.
6. Homepage sections can be configured using approved block types.
7. Media uploads are handled through Cloudinary.
8. Draft content remains private.
9. Published content is available through public APIs.
10. Contact messages can be submitted and managed.
11. Dark and light themes work consistently.
12. The website is responsive.
13. Relevant tests pass.
14. Security and production-readiness requirements are verified.
15. Documentation reflects the actual implementation.

Not every criterion is required for the initial backend foundation. Acceptance must also be evaluated per feature specification.

---

# 19. Out of Scope for Initial Version

Unless separately approved, the initial version will not include:

- Multiple administrator accounts.
- Public user registration.
- Role-based multi-tenant CMS.
- Microservices.
- Complex workflow automation.
- Arbitrary user-defined executable website blocks.
- Direct database editing through the frontend.
- Real-time collaborative editing.
- Unnecessary Redis infrastructure.
- Advanced analytics infrastructure.

These may be considered in future versions if justified.

---

# 20. Relationship with Other Documentation

This document is the master project specification.

All detailed feature specifications must remain consistent with it.

| Document | Responsibility |
|---|---|
| `AGENTS.md` | Global project and agent instructions |
| `.agents/rules/` | Permanent engineering rules |
| `00-project-overview.md` | Overall product requirements |
| `01-backend-foundation.md` | Backend foundation requirements |
| `02-admin-authentication.md` | Administrator authentication requirements |
| `03-profile-management.md` | Profile CMS requirements |
| `04-project-management.md` | Project CMS requirements |
| `05-skills-management.md` | Skills CMS requirements |
| `06-experience-education.md` | Experience and education requirements |
| `07-media-management.md` | Media requirements |
| `08-dynamic-sections.md` | Dynamic homepage CMS requirements |
| `09-publishing-system.md` | Publishing requirements |
| `10-integrations.md` | External integration requirements |

Implementation plans must explain how approved requirements will be delivered.

Implementation prompts must reference the relevant approved specification and plan.

---

# 21. Change Management

Any significant change to:

- Technology stack
- Application architecture
- Authentication approach
- Database design
- CMS behavior
- API conventions
- Security requirements
- Project scope

must be documented and approved before implementation.

When a requirement changes:

1. Identify the affected specification.
2. Explain the reason for the change.
3. Update the relevant specification.
4. Review affected implementation plans.
5. Update implementation prompts if necessary.
6. Record significant architectural changes in `docs/decisions/`.

---

**End of Master Project Specification**

**Document Status:** Initial Draft — Requires Review and Approval.