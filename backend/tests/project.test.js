import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import Project, { generateSlug, PROJECT_CATEGORIES } from '../src/modules/projects/project.model.js';

const TEST_DB_NAME = 'tanish_portfolio_project_test';

describe('Project Management Test Suite', () => {
  let server;
  let baseUrl;
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  const testAdmin = {
    name: 'Project Test Admin',
    email: 'projectadmin@example.com',
    password: 'TestPassword123!',
  };

  const sampleProject1 = {
    title: 'Developer Portfolio CMS',
    shortDescription: 'Dynamic personal portfolio with content management system.',
    description: 'A modular monolithic MERN stack portfolio featuring draft and published content controls.',
    technologies: ['React', 'Node.js', 'Express.js', 'MongoDB'],
    category: 'fullstack',
    thumbnailUrl: 'https://images.example.com/portfolio.jpg',
    thumbnailAlt: 'Portfolio screenshot',
    liveDemoUrl: 'https://demo.example.com/portfolio',
    repositoryUrl: 'https://github.com/example/portfolio',
    role: 'Lead Architect',
    keyFeatures: ['Draft/Published workflow', 'CSRF and rate-limiting security', 'Clean public projection'],
    startDate: '2026-01-01',
    endDate: '2026-03-01',
  };

  const sampleProject2 = {
    title: 'Mobile Fitness Tracker',
    shortDescription: 'Cross-platform mobile application for tracking workouts and nutrition.',
    description: 'Flutter and Node.js backend application with real-time analytics and charts.',
    technologies: ['Flutter', 'Node.js', 'MongoDB'],
    category: 'mobile',
  };

  before(async () => {
    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await Project.deleteMany({});
    await Promise.all([Admin.init(), Project.init()]);

    // Create test admin
    await Admin.create({
      name: testAdmin.name,
      email: testAdmin.email,
      password: testAdmin.password,
      singletonKey: 'primary',
    });

    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Authenticate test admin to obtain authCookie and CSRF credentials
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password,
      }),
    });

    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    csrfToken = loginBody.data.csrfToken;

    const setCookies = loginRes.headers.getSetCookie
      ? loginRes.headers.getSetCookie()
      : [loginRes.headers.get('set-cookie')];

    for (const sc of setCookies) {
      const cookiePart = sc.split(';')[0].trim();
      if (cookiePart.startsWith(`${config.authCookieName}=`)) {
        authCookie = cookiePart;
      }
      if (cookiePart.includes('x-csrf-token=')) {
        csrfCookie = cookiePart;
      }
    }

    assert.ok(authCookie, 'Expected auth cookie to be set');
    assert.ok(csrfCookie, 'Expected CSRF cookie to be set');
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await Project.deleteMany({});
      await Admin.deleteMany({});
      await mongoose.connection.close();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Model, Schema Constraints & Slug Generation', () => {
    test('generateSlug generates clean URL-friendly slugs', () => {
      assert.equal(generateSlug('My Awesome Project!'), 'my-awesome-project');
      assert.equal(generateSlug('  RESTful API - v2.0  '), 'restful-api-v20');
      assert.equal(generateSlug('Tanish Mistry: Portfolio'), 'tanish-mistry-portfolio');
    });

    test('Valid project creation defaults isPublished to false, isVisible to true, isFeatured to false, and displayOrder to 0', async () => {
      const project = await Project.create({
        ...sampleProject1,
        slug: 'developer-portfolio-cms',
      });

      assert.equal(project.title, sampleProject1.title);
      assert.equal(project.slug, 'developer-portfolio-cms');
      assert.equal(project.isPublished, false);
      assert.equal(project.isVisible, true);
      assert.equal(project.isFeatured, false);
      assert.equal(project.displayOrder, 0);

      await Project.findByIdAndDelete(project._id);
    });

    test('Enforces unique slug index in MongoDB', async () => {
      const project1 = await Project.create({
        ...sampleProject1,
        slug: 'unique-slug-test',
      });

      await assert.rejects(
        async () => {
          await Project.create({
            ...sampleProject2,
            slug: 'unique-slug-test',
          });
        },
        (err) => err.code === 11000 || /duplicate key/i.test(err.message)
      );

      await Project.findByIdAndDelete(project1._id);
    });

    test('Category validation rejects invalid categories', async () => {
      await assert.rejects(
        async () => {
          await Project.create({
            ...sampleProject1,
            slug: 'category-test',
            category: 'invalid_category_xyz',
          });
        },
        (err) => /Category must be one of/i.test(err.message)
      );
    });
  });

  describe('2. Administrator Project API & Security', () => {
    let createdProjectId = null;
    let createdProjectSlug = null;

    test('POST /api/v1/admin/projects rejects unauthenticated request with HTTP 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleProject1),
      });

      assert.equal(res.status, 401);
    });

    test('POST /api/v1/admin/projects rejects request missing CSRF token with HTTP 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
        body: JSON.stringify(sampleProject1),
      });

      assert.equal(res.status, 403);
    });

    test('POST /api/v1/admin/projects rejects non-HTTPS URL with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ...sampleProject1,
          liveDemoUrl: 'http://insecure-url.com',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /valid HTTPS URL/i);
    });

    test('POST /api/v1/admin/projects rejects protected fields in request body with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ...sampleProject1,
          isPublished: true,
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /is protected/i);
    });

    test('POST /api/v1/admin/projects successfully creates draft project with auto-generated slug', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleProject1),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.project.title, sampleProject1.title);
      assert.equal(body.data.project.slug, 'developer-portfolio-cms');
      assert.equal(body.data.project.isPublished, false);
      assert.equal(body.data.project.isVisible, true);

      createdProjectId = body.data.project.id;
      createdProjectSlug = body.data.project.slug;
    });

    test('POST /api/v1/admin/projects duplicate slug returns HTTP 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleProject1),
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.match(body.message, /already exists/i);
    });

    test('GET /api/v1/admin/projects lists projects including drafts with pagination', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects?page=1&limit=10`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.projects));
      assert.ok(body.data.projects.length >= 1);
      assert.equal(body.data.pagination.page, 1);
      assert.equal(body.data.pagination.limit, 10);
    });

    test('GET /api/v1/admin/projects/:id returns project detail', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${createdProjectId}`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.project.id, createdProjectId);
      assert.equal(body.data.project.slug, createdProjectSlug);
    });

    test('GET /api/v1/admin/projects/:id with non-existent ObjectId returns HTTP 404', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${fakeId}`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 404);
    });

    test('PATCH /api/v1/admin/projects/:id rejects empty body with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${createdProjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 400);
    });

    test('PATCH /api/v1/admin/projects/:id partially updates allowed fields and preserves slug on title change', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${createdProjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          title: 'Developer Portfolio CMS v2',
          role: 'Full Stack Engineer & Architect',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.project.title, 'Developer Portfolio CMS v2');
      assert.equal(body.data.project.role, 'Full Stack Engineer & Architect');
      // Slug must remain unchanged because it was not explicitly supplied
      assert.equal(body.data.project.slug, createdProjectSlug);
    });

    test('PATCH /api/v1/admin/projects/:id/featured toggles isFeatured without publishing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${createdProjectId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ isFeatured: true }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.project.isFeatured, true);
      assert.equal(body.data.project.isPublished, false); // Remains draft!
    });

    test('PATCH /api/v1/admin/projects/:id/publish sets isPublished to true', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${createdProjectId}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.project.isPublished, true);
    });

    test('PATCH /api/v1/admin/projects/:id/unpublish sets isPublished to false', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/projects/${createdProjectId}/unpublish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.project.isPublished, false);
    });

    test('PATCH /api/v1/admin/projects/reorder validates and updates display orders', async () => {
      // Create a second project for reordering
      const createRes = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleProject2),
      });
      assert.equal(createRes.status, 201);
      const project2 = (await createRes.json()).data.project;

      // Reorder: project2 -> order 1, createdProject -> order 2
      const reorderRes = await fetch(`${baseUrl}/api/v1/admin/projects/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          projects: [
            { id: project2.id, displayOrder: 1 },
            { id: createdProjectId, displayOrder: 2 },
          ],
        }),
      });

      assert.equal(reorderRes.status, 200);

      // Verify new orders
      const check1 = await Project.findById(createdProjectId);
      const check2 = await Project.findById(project2.id);
      assert.equal(check1.displayOrder, 2);
      assert.equal(check2.displayOrder, 1);

      // Clean up second project
      await Project.findByIdAndDelete(project2.id);
    });

    test('DELETE /api/v1/admin/projects/:id deletes project permanently', async () => {
      // Create a temporary project to delete
      const createRes = await fetch(`${baseUrl}/api/v1/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          title: 'Temporary Project',
          shortDescription: 'Temporary short description for deletion test.',
          description: 'Detailed description for testing project deletion endpoint.',
          technologies: ['Node.js'],
          category: 'backend',
        }),
      });

      assert.equal(createRes.status, 201);
      const tempId = (await createRes.json()).data.project.id;

      const deleteRes = await fetch(`${baseUrl}/api/v1/admin/projects/${tempId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(deleteRes.status, 200);

      // Confirm deletion in database
      const exists = await Project.findById(tempId);
      assert.equal(exists, null);
    });
  });

  describe('3. Public Portfolio Project API & Filtering', () => {
    let publishedFeaturedId = null;
    let publishedStandardId = null;
    let draftProjectId = null;
    let invisibleProjectId = null;

    before(async () => {
      // Clear projects and create controlled set for public API testing
      await Project.deleteMany({});

      // 1. Published and Featured (displayOrder: 2)
      const p1 = await Project.create({
        ...sampleProject1,
        slug: 'featured-portfolio',
        isPublished: true,
        isVisible: true,
        isFeatured: true,
        displayOrder: 2,
      });
      publishedFeaturedId = p1._id;

      // 2. Published and Standard (displayOrder: 1)
      const p2 = await Project.create({
        ...sampleProject2,
        slug: 'standard-fitness-tracker',
        isPublished: true,
        isVisible: true,
        isFeatured: false,
        displayOrder: 1,
      });
      publishedStandardId = p2._id;

      // 3. Draft Project (isPublished: false)
      const p3 = await Project.create({
        title: 'Draft Secret Project',
        slug: 'draft-secret-project',
        shortDescription: 'Unpublished project description here.',
        description: 'Detailed description for unpublished secret draft project.',
        technologies: ['SecretTech'],
        category: 'other',
        isPublished: false,
        isVisible: true,
      });
      draftProjectId = p3._id;

      // 4. Invisible Project (isVisible: false)
      const p4 = await Project.create({
        title: 'Archived Hidden Project',
        slug: 'archived-hidden-project',
        shortDescription: 'Published but hidden project description.',
        description: 'Detailed description for published but invisible project.',
        technologies: ['OldTech'],
        category: 'other',
        isPublished: true,
        isVisible: false,
      });
      invisibleProjectId = p4._id;
    });

    test('GET /api/v1/portfolio/projects returns only published and visible projects', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.pagination.total, 2); // Only p1 and p2!

      const slugs = body.data.projects.map((p) => p.slug);
      assert.ok(slugs.includes('featured-portfolio'));
      assert.ok(slugs.includes('standard-fitness-tracker'));
      assert.ok(!slugs.includes('draft-secret-project'));
      assert.ok(!slugs.includes('archived-hidden-project'));
    });

    test('GET /api/v1/portfolio/projects orders featured projects first', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.data.projects[0].slug, 'featured-portfolio');
      assert.equal(body.data.projects[0].isFeatured, true);
      assert.equal(body.data.projects[1].slug, 'standard-fitness-tracker');
      assert.equal(body.data.projects[1].isFeatured, false);
    });

    test('GET /api/v1/portfolio/projects filters by category', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects?category=mobile`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.data.projects.length, 1);
      assert.equal(body.data.projects[0].slug, 'standard-fitness-tracker');
    });

    test('GET /api/v1/portfolio/projects searches by title', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects?search=portfolio`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.data.projects.length, 1);
      assert.equal(body.data.projects[0].slug, 'featured-portfolio');
    });

    test('GET /api/v1/portfolio/projects/:slug returns project detail when published & visible', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects/featured-portfolio`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.project.slug, 'featured-portfolio');
      assert.equal(body.data.project.title, sampleProject1.title);

      // Verify internal fields are excluded from public detail
      assert.equal(body.data.project.isPublished, undefined);
      assert.equal(body.data.project.isVisible, undefined);
      assert.equal(body.data.project.__v, undefined);
    });

    test('GET /api/v1/portfolio/projects/:slug returns HTTP 404 for draft project', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects/draft-secret-project`);
      assert.equal(res.status, 404);

      const body = await res.json();
      assert.match(body.message, /not found or currently unavailable/i);
    });

    test('GET /api/v1/portfolio/projects/:slug returns HTTP 404 for published but invisible project', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects/archived-hidden-project`);
      assert.equal(res.status, 404);

      const body = await res.json();
      assert.match(body.message, /not found or currently unavailable/i);
    });

    test('GET /api/v1/portfolio/projects/:slug returns HTTP 404 for non-existent slug', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/projects/non-existent-slug-xyz`);
      assert.equal(res.status, 404);
    });
  });
});
