import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import SkillCategory, { generateSlug } from '../src/modules/skills/skill-category.model.js';
import Skill, { PROFICIENCY_LEVELS } from '../src/modules/skills/skill.model.js';

const TEST_DB_NAME = 'tanish_portfolio_skills_test';

describe('Skills Management Test Suite', () => {
  let server;
  let baseUrl;
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  const testAdmin = {
    name: 'Skills Test Admin',
    email: 'skillsadmin@example.com',
    password: 'TestPassword123!',
  };

  before(async () => {
    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await SkillCategory.deleteMany({});
    await Skill.deleteMany({});
    await Promise.all([Admin.init(), SkillCategory.init(), Skill.init()]);

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
      await Skill.deleteMany({});
      await SkillCategory.deleteMany({});
      await Admin.deleteMany({});
      await mongoose.connection.close();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Models, Schema Constraints & Slugs', () => {
    test('generateSlug generates clean URL-friendly slugs', () => {
      assert.equal(generateSlug('Frontend Development'), 'frontend-development');
      assert.equal(generateSlug('CI / CD & DevOps!'), 'ci-cd-devops');
      assert.equal(generateSlug('Node.js & Express.js'), 'nodejs-expressjs');
    });

    test('SkillCategory defaults isPublished to false, isVisible to true, and displayOrder to 0', async () => {
      const cat = await SkillCategory.create({
        name: 'Backend Technologies',
        slug: 'backend-technologies-test',
      });

      assert.equal(cat.name, 'Backend Technologies');
      assert.equal(cat.slug, 'backend-technologies-test');
      assert.equal(cat.isPublished, false);
      assert.equal(cat.isVisible, true);
      assert.equal(cat.displayOrder, 0);

      await SkillCategory.findByIdAndDelete(cat._id);
    });

    test('SkillCategory enforces unique slug in database', async () => {
      const cat1 = await SkillCategory.create({
        name: 'Databases',
        slug: 'unique-cat-slug',
      });

      await assert.rejects(
        async () => {
          await SkillCategory.create({
            name: 'Databases Duplicate',
            slug: 'unique-cat-slug',
          });
        },
        (err) => err.code === 11000 || /duplicate key/i.test(err.message)
      );

      await SkillCategory.findByIdAndDelete(cat1._id);
    });

    test('Skill enforces proficiencyLevel enum and unique slug in database', async () => {
      const cat = await SkillCategory.create({
        name: 'Languages',
        slug: 'languages-test-slug',
      });

      // Invalid proficiency level
      await assert.rejects(
        async () => {
          await Skill.create({
            name: 'Python',
            slug: 'python-test',
            category: cat._id,
            proficiencyLevel: 'ninja',
          });
        },
        (err) => /Proficiency level must be one of/i.test(err.message)
      );

      // Valid skill creation
      const skill1 = await Skill.create({
        name: 'JavaScript',
        slug: 'javascript-test',
        category: cat._id,
        proficiencyLevel: 'expert',
      });
      assert.equal(skill1.isPublished, false);
      assert.equal(skill1.isFeatured, false);
      assert.equal(skill1.isVisible, true);
      assert.equal(skill1.displayOrder, 0);

      // Duplicate slug
      await assert.rejects(
        async () => {
          await Skill.create({
            name: 'JS Duplicate',
            slug: 'javascript-test',
            category: cat._id,
            proficiencyLevel: 'intermediate',
          });
        },
        (err) => err.code === 11000 || /duplicate key/i.test(err.message)
      );

      await Skill.findByIdAndDelete(skill1._id);
      await SkillCategory.findByIdAndDelete(cat._id);
    });
  });

  describe('2. Administrator Skill Categories API', () => {
    let createdCatId = null;
    let createdCatSlug = null;

    test('POST /api/v1/admin/skill-categories rejects unauthenticated request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Web Development' }),
      });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/admin/skill-categories rejects missing CSRF token with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
        body: JSON.stringify({ name: 'Web Development' }),
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/admin/skill-categories creates draft category with auto-generated slug', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'Frontend Frameworks',
          description: 'Client-side UI libraries and frameworks',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.category.name, 'Frontend Frameworks');
      assert.equal(body.data.category.slug, 'frontend-frameworks');
      assert.equal(body.data.category.isPublished, false);
      assert.equal(body.data.category.isVisible, true);

      createdCatId = body.data.category.id;
      createdCatSlug = body.data.category.slug;
    });

    test('POST /api/v1/admin/skill-categories duplicate slug returns 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'Frontend Frameworks',
        }),
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.match(body.message, /already exists/i);
    });

    test('GET /api/v1/admin/skill-categories lists categories including drafts', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.data.categories));
      assert.ok(body.data.categories.length >= 1);
    });

    test('GET /api/v1/admin/skill-categories/:id returns category detail', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories/${createdCatId}`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.category.id, createdCatId);
      assert.equal(body.data.category.slug, createdCatSlug);
    });

    test('PATCH /api/v1/admin/skill-categories/:id partially updates category and preserves slug on name change', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories/${createdCatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'Modern Frontend Frameworks',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.category.name, 'Modern Frontend Frameworks');
      assert.equal(body.data.category.slug, createdCatSlug); // Slug preserved!
    });

    test('PATCH /api/v1/admin/skill-categories/:id/publish sets isPublished to true', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories/${createdCatId}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.category.isPublished, true);
    });

    test('PATCH /api/v1/admin/skill-categories/:id/unpublish sets isPublished to false', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skill-categories/${createdCatId}/unpublish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.category.isPublished, false);
    });

    test('PATCH /api/v1/admin/skill-categories/reorder safely updates display orders', async () => {
      // Create second category
      const createRes = await fetch(`${baseUrl}/api/v1/admin/skill-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ name: 'Backend Technologies' }),
      });
      assert.equal(createRes.status, 201);
      const cat2 = (await createRes.json()).data.category;

      const reorderRes = await fetch(`${baseUrl}/api/v1/admin/skill-categories/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          categories: [
            { id: cat2.id, displayOrder: 1 },
            { id: createdCatId, displayOrder: 2 },
          ],
        }),
      });

      assert.equal(reorderRes.status, 200);

      const check1 = await SkillCategory.findById(createdCatId);
      const check2 = await SkillCategory.findById(cat2.id);
      assert.equal(check1.displayOrder, 2);
      assert.equal(check2.displayOrder, 1);

      await SkillCategory.findByIdAndDelete(cat2.id);
    });

    test('DELETE /api/v1/admin/skill-categories/:id blocked with 409 Conflict when skills reference it', async () => {
      // Create a skill referencing createdCatId
      const skill = await Skill.create({
        name: 'React.js',
        slug: 'react-js-dep-test',
        category: createdCatId,
        proficiencyLevel: 'expert',
      });

      const deleteRes = await fetch(`${baseUrl}/api/v1/admin/skill-categories/${createdCatId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(deleteRes.status, 409);
      const body = await deleteRes.json();
      assert.match(body.message, /Cannot delete category with associated skills/i);

      // Clean up the dependent skill
      await Skill.findByIdAndDelete(skill._id);
    });
  });

  describe('3. Administrator Skills API', () => {
    let testCategoryId = null;
    let createdSkillId = null;
    let createdSkillSlug = null;

    before(async () => {
      // Ensure we have an active category for skills
      const cat = await SkillCategory.create({
        name: 'Programming Languages',
        slug: 'programming-languages',
        isPublished: true,
        isVisible: true,
      });
      testCategoryId = cat._id.toString();
    });

    test('POST /api/v1/admin/skills rejects non-existent category with 400', async () => {
      const fakeCatId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/v1/admin/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'Python',
          category: fakeCatId,
          proficiencyLevel: 'advanced',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /Referenced category does not exist/i);
    });

    test('POST /api/v1/admin/skills successfully creates draft skill with auto-generated slug', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'TypeScript',
          category: testCategoryId,
          proficiencyLevel: 'advanced',
          iconName: 'si-typescript',
          description: 'Strongly typed programming language built on JavaScript',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.skill.name, 'TypeScript');
      assert.equal(body.data.skill.slug, 'typescript');
      assert.equal(body.data.skill.isPublished, false);
      assert.equal(body.data.skill.isFeatured, false);
      assert.equal(body.data.skill.category.id, testCategoryId);

      createdSkillId = body.data.skill.id;
      createdSkillSlug = body.data.skill.slug;
    });

    test('POST /api/v1/admin/skills duplicate slug returns 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'TypeScript',
          category: testCategoryId,
          proficiencyLevel: 'intermediate',
        }),
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.match(body.message, /already exists/i);
    });

    test('GET /api/v1/admin/skills lists skills with category populated', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skills`, {
        method: 'GET',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.data.skills));
      assert.ok(body.data.skills.length >= 1);
      assert.ok(body.data.skills[0].category.name);
    });

    test('PATCH /api/v1/admin/skills/:id/featured updates featured status without publishing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skills/${createdSkillId}/featured`, {
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
      assert.equal(body.data.skill.isFeatured, true);
      assert.equal(body.data.skill.isPublished, false); // Remains draft!
    });

    test('PATCH /api/v1/admin/skills/:id/publish sets isPublished to true', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/skills/${createdSkillId}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.skill.isPublished, true);
    });

    test('PATCH /api/v1/admin/skills/reorder rejects skill outside specified category', async () => {
      // Create a second category and a skill in it
      const cat2 = await SkillCategory.create({
        name: 'Cloud & Infrastructure',
        slug: 'cloud-infrastructure-reorder',
      });
      const skillOtherCat = await Skill.create({
        name: 'Docker',
        slug: 'docker-reorder-test',
        category: cat2._id,
        proficiencyLevel: 'intermediate',
      });

      // Try reordering with testCategoryId but including skill from cat2
      const reorderRes = await fetch(`${baseUrl}/api/v1/admin/skills/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          categoryId: testCategoryId,
          skills: [
            { id: createdSkillId, displayOrder: 1 },
            { id: skillOtherCat._id.toString(), displayOrder: 2 },
          ],
        }),
      });

      assert.equal(reorderRes.status, 400);
      const body = await reorderRes.json();
      assert.match(body.message, /does not belong to category/i);

      await Skill.findByIdAndDelete(skillOtherCat._id);
      await SkillCategory.findByIdAndDelete(cat2._id);
    });

    test('DELETE /api/v1/admin/skills/:id deletes skill', async () => {
      const tempSkill = await Skill.create({
        name: 'Temporary Skill',
        slug: 'temp-skill-delete',
        category: testCategoryId,
        proficiencyLevel: 'beginner',
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/skills/${tempSkill._id}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const check = await Skill.findById(tempSkill._id);
      assert.equal(check, null);
    });
  });

  describe('4. Public Portfolio APIs & Cascading Filtering', () => {
    let publishedCatId = null;
    let draftCatId = null;
    let publishedSkillId = null;
    let draftSkillInPubCatId = null;
    let publishedSkillInDraftCatId = null;

    before(async () => {
      // Clear skills and categories to set up controlled visibility matrix
      await Skill.deleteMany({});
      await SkillCategory.deleteMany({});

      // 1. Published Category
      const pubCat = await SkillCategory.create({
        name: 'Frontend Frameworks',
        slug: 'frontend-frameworks-public',
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });
      publishedCatId = pubCat._id;

      // 2. Draft Category
      const draftCat = await SkillCategory.create({
        name: 'Unpublished Backend',
        slug: 'unpublished-backend',
        isPublished: false,
        isVisible: true,
        displayOrder: 2,
      });
      draftCatId = draftCat._id;

      // 3. Published Skill in Published Category (SHOULD appear publicly!)
      const s1 = await Skill.create({
        name: 'React',
        slug: 'react-public',
        category: publishedCatId,
        proficiencyLevel: 'expert',
        isPublished: true,
        isVisible: true,
        isFeatured: true,
        displayOrder: 1,
      });
      publishedSkillId = s1._id;

      // 4. Draft Skill in Published Category (SHOULD NOT appear publicly!)
      const s2 = await Skill.create({
        name: 'Svelte',
        slug: 'svelte-draft',
        category: publishedCatId,
        proficiencyLevel: 'intermediate',
        isPublished: false,
        isVisible: true,
      });
      draftSkillInPubCatId = s2._id;

      // 5. Published Skill in Draft Category (SHOULD NOT appear publicly!)
      const s3 = await Skill.create({
        name: 'NestJS',
        slug: 'nestjs-published-in-draft-cat',
        category: draftCatId,
        proficiencyLevel: 'advanced',
        isPublished: true,
        isVisible: true,
      });
      publishedSkillInDraftCatId = s3._id;
    });

    test('GET /api/v1/portfolio/skill-categories returns only published and visible categories', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/skill-categories`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.categories.length, 1);
      assert.equal(body.data.categories[0].slug, 'frontend-frameworks-public');
      // Verifies administrative fields excluded
      assert.equal(body.data.categories[0].isPublished, undefined);
      assert.equal(body.data.categories[0].isVisible, undefined);
    });

    test('GET /api/v1/portfolio/skills cascades category publication and visibility rules', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/skills`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.pagination.total, 1); // Only React!

      const slugs = body.data.skills.map((s) => s.slug);
      assert.ok(slugs.includes('react-public'));
      assert.ok(!slugs.includes('svelte-draft'), 'Draft skill must be excluded');
      assert.ok(!slugs.includes('nestjs-published-in-draft-cat'), 'Skill in draft category must be excluded');

      // Check clean public projection
      assert.equal(body.data.skills[0].isPublished, undefined);
      assert.equal(body.data.skills[0].isVisible, undefined);
      assert.equal(body.data.skills[0].__v, undefined);
    });

    test('GET /api/v1/portfolio/skills?category=... filters by category slug', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/skills?category=frontend-frameworks-public`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.data.skills.length, 1);
      assert.equal(body.data.skills[0].slug, 'react-public');

      // If querying by draft category slug, returns empty
      const resDraft = await fetch(`${baseUrl}/api/v1/portfolio/skills?category=unpublished-backend`);
      assert.equal(resDraft.status, 200);
      const bodyDraft = await resDraft.json();
      assert.equal(bodyDraft.data.skills.length, 0);
    });

    test('GET /api/v1/portfolio/skills?featured=true filters featured skills', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/skills?featured=true`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.data.skills.length, 1);
      assert.equal(body.data.skills[0].isFeatured, true);
    });
  });
});
