---
trigger: always_on
---

# Architecture Rules

## 1. Architectural Objective

Maintain a scalable, maintainable, and modular architecture for the personal portfolio and its CMS.

Use a **MERN modular monolithic architecture**.

Do not introduce microservices unless explicitly justified and approved.

## 2. Technology Constraints

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Language: JavaScript (ES Modules)
- Database: MongoDB Atlas
- ODM: Mongoose
- Media storage: Cloudinary
- API style: REST
- API prefix: `/api/v1`

Do not introduce TypeScript, GraphQL, or another database system without approval.

## 3. Frontend Architecture

Organize the frontend by responsibility.

Recommended structure:

```text
frontend/src/
├── assets/
├── components/
│   ├── common/
│   ├── portfolio/
│   └── admin/
├── layouts/
├── pages/
│   ├── portfolio/
│   └── admin/
├── routes/
├── services/
├── hooks/
├── context/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

Rules:

- Separate public portfolio pages from administrator pages.
- Use reusable components.
- Keep API communication inside service modules.
- Avoid direct API requests scattered across components.
- Keep business logic separate from presentation.
- Protect administrator routes.
- Maintain responsive design.
- Reuse shared layouts where appropriate.

The structure may evolve when justified by the actual application.

## 4. Backend Architecture

Organize backend functionality into independent feature modules.

Recommended structure:

```text
backend/src/
├── config/
├── modules/
│   ├── auth/
│   ├── profile/
│   ├── projects/
│   ├── skills/
│   ├── experience/
│   ├── education/
│   ├── achievements/
│   ├── media/
│   ├── sections/
│   ├── settings/
│   └── messages/
├── middleware/
├── routes/
├── utils/
├── app.js
└── server.js
```

Each module may contain:

- Model
- Routes
- Controller
- Service
- Validation

Do not create unnecessary files when a module does not need them.

## 5. Layer Responsibilities

### Routes
- Define API endpoints.
- Attach middleware.
- Connect endpoints to controllers.

### Controllers
- Handle HTTP requests and responses.
- Extract validated request data.
- Call service functions.
- Avoid complex business logic.

### Services
- Implement business rules.
- Coordinate database operations.
- Handle application-level workflows.

### Models
- Define MongoDB document structures.
- Apply schema validation and indexes.
- Define appropriate relationships and references.

### Middleware
- Authentication
- Authorization
- Validation
- Error handling
- Request processing

## 6. Database Design

- Use Mongoose schemas.
- Define appropriate data types, constraints, and indexes.
- Use references when separate documents should be independently managed.
- Avoid unnecessary duplication.
- Avoid embedding large or independently managed collections without justification.
- Use timestamps where appropriate.
- Handle missing, invalid, and deleted references safely.

For dynamic homepage sections, store references to actual content records rather than duplicating entire project or skill records.

## 7. Dynamic CMS Architecture

The public website must render supported sections using structured configuration stored in MongoDB.

Rules:

- Define an explicit allowlist of supported block types.
- Validate block configuration against the corresponding schema.
- Separate section configuration from content entities.
- Support ordering and visibility.
- Support draft and published states where specified.
- Do not evaluate arbitrary JavaScript, HTML, or executable database content.
- Do not allow database content to define arbitrary component imports.

Adding a completely new block type may require code changes. Ordinary content changes must not require frontend source modifications.

## 8. API Design

- Use RESTful conventions.
- Keep endpoints under `/api/v1`.
- Separate public and administrator operations.
- Use appropriate HTTP methods and status codes.
- Validate parameters, query strings, and request bodies.
- Return consistent response structures.
- Avoid exposing internal database or server details.

## 9. Configuration

- Centralize environment configuration.
- Keep secrets outside source control.
- Validate required environment variables during startup.
- Separate development and production configuration.
- Avoid hardcoding deployment-specific values.

## 10. Architecture Change Policy

Before introducing a significant architectural change:

1. Explain the problem.
2. Present the proposed change.
3. Explain alternatives.
4. Explain trade-offs.
5. Update the relevant architecture documentation.
6. Obtain approval.

Do not silently change the agreed technology stack or architectural direction.