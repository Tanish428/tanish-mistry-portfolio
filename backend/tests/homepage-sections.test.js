import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import HomepageSection from '../src/modules/homepage-sections/homepage-section.model.js';
import Profile from '../src/modules/profile/profile.model.js';
import Project from '../src/modules/projects/project.model.js';
import SkillCategory from '../src/modules/skills/skill-category.model.js';
import Skill from '../src/modules/skills/skill.model.js';
import Experience from '../src/modules/experience-education/experience.model.js';
import Education from '../src/modules/experience-education/education.model.js';
import SocialLink from '../src/modules/contact-social/social-link.model.js';

const TEST_DB_NAME = 'tanish_portfolio_homepage_sections_test';

describe('Dynamic Homepage Sections Test Suite', () => {
  let server;
  let baseUrl;
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  const testAdmin = {
    name: 'Sections Admin',
    email: 'sectionsadmin@example.com',
    password: 'TestPassword123!',
  };

  before(async () => {
    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await HomepageSection.deleteMany({});
    await Profile.deleteMany({});
    await Project.deleteMany({});
    await SkillCategory.deleteMany({});
    await Skill.deleteMany({});
    await Experience.deleteMany({});
    await Education.deleteMany({});
    await SocialLink.deleteMany({});
    await HomepageSection.syncIndexes();

    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Create test administrator
    const admin = new Admin(testAdmin);
    await admin.save();

    // Authenticate admin to retrieve cookies and CSRF token
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password,
      }),
    });
    assert.equal(loginRes.status, 200);

    const cookies = loginRes.headers.get('set-cookie');
    assert.ok(cookies, 'Login must set auth cookies');
    const authMatch = cookies.match(new RegExp(`${config.authCookieName}=([^;]+)`));
    assert.ok(authMatch, 'Auth cookie must be present');
    authCookie = `${config.authCookieName}=${authMatch[1]}`;

    // Get CSRF token
    const csrfRes = await fetch(`${baseUrl}/api/v1/auth/csrf-token`);
    assert.equal(csrfRes.status, 200);
    const csrfData = await csrfRes.json();
    csrfToken = csrfData.data.csrfToken;
    const csrfCookieHeader = csrfRes.headers.get('set-cookie');
    assert.ok(csrfCookieHeader, 'CSRF cookie must be present');
    const csrfMatch = csrfCookieHeader.match(/portfolio\.x-csrf-token=([^;]+)/);
    assert.ok(csrfMatch, 'portfolio.x-csrf-token cookie must be present');
    csrfCookie = `portfolio.x-csrf-token=${csrfMatch[1]}`;
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await Admin.deleteMany({});
      await HomepageSection.deleteMany({});
      await Profile.deleteMany({});
      await Project.deleteMany({});
      await SkillCategory.deleteMany({});
      await Skill.deleteMany({});
      await Experience.deleteMany({});
      await Education.deleteMany({});
      await SocialLink.deleteMany({});
      await mongoose.connection.close();
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ==========================================
  // 1. MODEL & SCHEMA VALIDATION TESTS
  // ==========================================
  describe('1. HomepageSection Model Validation Unit Tests', () => {
    test('HomepageSection requires type', async () => {
      const section = new HomepageSection({});
      await assert.rejects(section.save(), /Section type is required/);
    });

    test('HomepageSection rejects non-allowlisted section types', async () => {
      const section = new HomepageSection({
        type: 'unsupported_custom_widget',
      });
      await assert.rejects(section.save(), /Invalid section type/);
    });

    test('HomepageSection enforces unique section type', async () => {
      const s1 = new HomepageSection({
        type: 'hero',
        title: 'Hero 1',
      });
      await s1.save();

      const s2 = new HomepageSection({
        type: 'hero',
        title: 'Hero 2 Duplicate',
      });
      await assert.rejects(s2.save(), (err) => err.code === 11000);

      await HomepageSection.deleteOne({ type: 'hero' });
    });

    test('HomepageSection applies correct defaults', async () => {
      const section = new HomepageSection({
        type: 'contact',
      });
      await section.save();

      assert.equal(section.isPublished, false);
      assert.equal(section.isVisible, true);
      assert.equal(section.displayOrder, 0);
      assert.deepEqual(section.config, {});

      await HomepageSection.deleteOne({ _id: section._id });
    });
  });

  // ==========================================
  // 2. CONFIGURATION VALIDATION MIDDLEWARE TESTS
  // ==========================================
  describe('2. Configuration Validation Middleware Tests', () => {
    test('POST rejects unknown section type with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'arbitrary_block',
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /Invalid section type/i);
    });

    test('POST rejects unknown configuration properties for hero with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'hero',
          config: {
            customInjectedScript: 'alert(1)',
          },
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /Unknown configuration property 'customInjectedScript'/i);
    });

    test('POST rejects invalid data types in section config with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'projects',
          config: {
            featuredOnly: 'not_a_boolean',
            limit: -5,
          },
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /featuredOnly must be a boolean/i);
    });

    test('POST rejects invalid project category filter with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'projects',
          config: {
            category: 'unsupported_category',
          },
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /Invalid category filter/i);
    });

    test('POST rejects forbidden direct assignment of isPublished during creation', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'about',
          isPublished: true,
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /cannot be set directly/i);
    });
  });

  // ==========================================
  // 3. ADMIN CRUD & LIFECYCLE API TESTS
  // ==========================================
  describe('3. Admin CRUD & Lifecycle Operations', () => {
    let createdHeroId = null;

    test('POST /api/v1/admin/homepage-sections rejects unauthenticated request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'hero' }),
      });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/admin/homepage-sections rejects request without CSRF token with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
        body: JSON.stringify({ type: 'hero' }),
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/admin/homepage-sections creates section in draft state', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'hero',
          title: 'Welcome to My Portfolio',
          subtitle: 'Full-Stack Software Engineer',
          displayOrder: 1,
          config: {
            showProfileImage: true,
            showAvailability: true,
            primaryCtaLabel: 'View Projects',
            primaryCtaUrl: '#projects',
          },
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.section.type, 'hero');
      assert.equal(data.data.section.isPublished, false);
      assert.equal(data.data.section.isVisible, true);
      assert.equal(data.data.section.displayOrder, 1);
      assert.equal(data.data.section.config.primaryCtaLabel, 'View Projects');

      createdHeroId = data.data.section.id;
    });

    test('POST /api/v1/admin/homepage-sections rejects duplicate section type with 409', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'hero',
          title: 'Duplicate Hero',
        }),
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /already exists/i);
    });

    test('GET /api/v1/admin/homepage-sections lists all sections (drafts & hidden included)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data.sections));
      assert.ok(data.data.sections.length >= 1);
      assert.equal(data.data.sections[0].id, createdHeroId);
    });

    test('GET /api/v1/admin/homepage-sections/:id retrieves single section', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/${createdHeroId}`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.section.id, createdHeroId);
      assert.equal(data.data.section.type, 'hero');
    });

    test('GET /api/v1/admin/homepage-sections/:id returns 404 for nonexistent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/${fakeId}`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    test('PATCH /api/v1/admin/homepage-sections/:id rejects attempt to change immutable type with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/${createdHeroId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'about',
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /immutable/i);
    });

    test('PATCH /api/v1/admin/homepage-sections/:id updates section details and config', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/${createdHeroId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          title: 'Updated Hero Heading',
          config: {
            showProfileImage: false,
            primaryCtaLabel: 'Explore Work',
            primaryCtaUrl: '/projects',
          },
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.section.title, 'Updated Hero Heading');
      assert.equal(data.data.section.config.showProfileImage, false);
      assert.equal(data.data.section.config.primaryCtaLabel, 'Explore Work');
    });

    test('PATCH /api/v1/admin/homepage-sections/:id/publish publishes section', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/${createdHeroId}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.section.isPublished, true);
    });

    test('PATCH /api/v1/admin/homepage-sections/:id/unpublish unpublishes section', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/${createdHeroId}/unpublish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.section.isPublished, false);
    });

    test('DELETE /api/v1/admin/homepage-sections/:id permanently deletes section', async () => {
      // Create temporary section to delete
      const temp = await HomepageSection.create({
        type: 'education',
        displayOrder: 99,
      });

      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/${temp._id}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      const check = await HomepageSection.findById(temp._id);
      assert.equal(check, null);
    });
  });

  // ==========================================
  // 4. SECTION REORDERING API TESTS
  // ==========================================
  describe('4. Section Reordering API Tests', () => {
    let s1Id, s2Id;

    before(async () => {
      await HomepageSection.deleteMany({});
      const s1 = await HomepageSection.create({
        type: 'hero',
        displayOrder: 0,
      });
      const s2 = await HomepageSection.create({
        type: 'about',
        displayOrder: 1,
      });
      s1Id = s1._id.toString();
      s2Id = s2._id.toString();
    });

    test('PATCH /api/v1/admin/homepage-sections/reorder rejects duplicate IDs with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify([
          { id: s1Id, displayOrder: 0 },
          { id: s1Id, displayOrder: 1 },
        ]),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /Duplicate section ID/i);
    });

    test('PATCH /api/v1/admin/homepage-sections/reorder rejects nonexistent ID with 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify([
          { id: s1Id, displayOrder: 0 },
          { id: fakeId.toString(), displayOrder: 1 },
        ]),
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /not found/i);
    });

    test('PATCH /api/v1/admin/homepage-sections/reorder rejects partial ID set with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify([{ id: s1Id, displayOrder: 0 }]),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /must include all existing homepage sections/i);
    });

    test('PATCH /api/v1/admin/homepage-sections/reorder successfully updates display orders', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/homepage-sections/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify([
          { id: s1Id, displayOrder: 5 },
          { id: s2Id, displayOrder: 2 },
        ]),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      const check1 = await HomepageSection.findById(s1Id);
      const check2 = await HomepageSection.findById(s2Id);
      assert.equal(check1.displayOrder, 5);
      assert.equal(check2.displayOrder, 2);
    });
  });

  // ==========================================
  // 5. PUBLIC HOMEPAGE SECTION COMPOSITION TESTS
  // ==========================================
  describe('5. Public Homepage Section Aggregation Tests', () => {
    before(async () => {
      await HomepageSection.deleteMany({});
      await Profile.deleteMany({});
      await Project.deleteMany({});
      await SkillCategory.deleteMany({});
      await Skill.deleteMany({});
      await Experience.deleteMany({});
      await Education.deleteMany({});
      await SocialLink.deleteMany({});

      // 1. Seed Profile
      await Profile.create({
        fullName: 'Tanish Mistry',
        professionalTitle: 'Full-Stack Engineer',
        shortIntroduction: 'Building dynamic and scalable web applications.',
        about: 'Experienced developer with strong expertise in the MERN modular monolithic stack.',
        location: 'Mumbai, India',
        publicEmail: 'contact@tanishmistry.com',
        profileImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg',
        availabilityStatus: 'open_to_opportunities',
        singletonKey: 'primary',
        isPublished: true,
        isVisible: true,
      });

      // 2. Seed Projects (2 published, 1 draft)
      await Project.create({
        title: 'MealMate App',
        slug: 'mealmate-app',
        shortDescription: 'AI recipe generator and meal planner.',
        description: 'Comprehensive recipe and grocery planning application.',
        technologies: ['React', 'Node.js', 'MongoDB'],
        category: 'fullstack',
        isFeatured: true,
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });
      await Project.create({
        title: 'SmartDeviceMatch',
        slug: 'smart-device-match',
        shortDescription: 'Hardware recommendation engine.',
        description: 'Personalized device matching algorithms.',
        technologies: ['React', 'Python'],
        category: 'web',
        isFeatured: false,
        isPublished: true,
        isVisible: true,
        displayOrder: 2,
      });
      await Project.create({
        title: 'Draft Project Hidden',
        slug: 'draft-project-hidden',
        shortDescription: 'Should never appear in public sections.',
        description: 'Draft project content.',
        technologies: ['Go'],
        category: 'backend',
        isPublished: false,
        isVisible: true,
      });

      // 3. Seed Skills & Categories
      const cat = await SkillCategory.create({
        name: 'Frontend Frameworks',
        slug: 'frontend-frameworks',
        displayOrder: 1,
        isPublished: true,
        isVisible: true,
      });
      await Skill.create({
        name: 'React',
        slug: 'react',
        category: cat._id,
        proficiencyLevel: 'advanced',
        isFeatured: true,
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });

      // 4. Seed Experience & Education
      await Experience.create({
        company: 'Tech Solutions Inc',
        position: 'Software Developer',
        employmentType: 'full_time',
        startDate: new Date('2024-01-01'),
        isCurrent: true,
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });
      await Education.create({
        institution: 'University of Engineering',
        degree: 'Bachelor of Technology in Computer Science',
        startDate: new Date('2020-08-01'),
        endDate: new Date('2024-05-30'),
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });

      // 5. Seed Social Link
      await SocialLink.create({
        platform: 'github',
        url: 'https://github.com/tanishmistry',
        label: 'GitHub',
        isPublished: true,
        isVisible: true,
        displayOrder: 1,
      });

      // 6. Seed Homepage Sections
      // Section 1: Hero (Published & Visible, displayOrder: 1)
      await HomepageSection.create({
        type: 'hero',
        title: 'Welcome',
        subtitle: 'Hello World',
        displayOrder: 1,
        isPublished: true,
        isVisible: true,
        config: {
          showProfileImage: true,
          showAvailability: true,
          primaryCtaLabel: 'View Work',
          primaryCtaUrl: '#projects',
        },
      });

      // Section 2: Projects (Published & Visible, displayOrder: 2, featuredOnly: true)
      await HomepageSection.create({
        type: 'projects',
        title: 'Selected Projects',
        displayOrder: 2,
        isPublished: true,
        isVisible: true,
        config: {
          featuredOnly: true,
          limit: 3,
        },
      });

      // Section 3: Skills (Published & Visible, displayOrder: 3)
      await HomepageSection.create({
        type: 'skills',
        title: 'Core Technologies',
        displayOrder: 3,
        isPublished: true,
        isVisible: true,
        config: {
          limit: 10,
        },
      });

      // Section 4: Experience (Published & Visible, displayOrder: 4)
      await HomepageSection.create({
        type: 'experience',
        title: 'Career History',
        displayOrder: 4,
        isPublished: true,
        isVisible: true,
        config: { limit: 5 },
      });

      // Section 5: Education (Published & Visible, displayOrder: 5)
      await HomepageSection.create({
        type: 'education',
        title: 'Academic Background',
        displayOrder: 5,
        isPublished: true,
        isVisible: true,
        config: { limit: 5 },
      });

      // Section 6: Social Links (Published & Visible, displayOrder: 6)
      await HomepageSection.create({
        type: 'social_links',
        title: 'Connect With Me',
        displayOrder: 6,
        isPublished: true,
        isVisible: true,
        config: { limit: 5 },
      });

      // Section 7: Contact (Published & Visible, displayOrder: 7)
      await HomepageSection.create({
        type: 'contact',
        title: 'Get In Touch',
        displayOrder: 7,
        isPublished: true,
        isVisible: true,
        config: { showContactForm: true },
      });

      // Section 8: About (Draft, isPublished: false, displayOrder: 8 - MUST BE EXCLUDED)
      await HomepageSection.create({
        type: 'about',
        title: 'About Me',
        displayOrder: 8,
        isPublished: false,
        isVisible: true,
      });
    });

    test('GET /api/v1/portfolio/homepage-sections returns only published and visible sections', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data.sections));

      // Should return 7 sections (about is draft, so excluded)
      assert.equal(data.data.sections.length, 7);

      const types = data.data.sections.map((s) => s.type);
      assert.ok(types.includes('hero'));
      assert.ok(types.includes('projects'));
      assert.ok(types.includes('skills'));
      assert.ok(types.includes('experience'));
      assert.ok(types.includes('education'));
      assert.ok(types.includes('social_links'));
      assert.ok(types.includes('contact'));
      assert.ok(!types.includes('about'), 'Draft sections must be strictly excluded');
    });

    test('GET /api/v1/portfolio/homepage-sections returns sections in deterministic display order', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);
      const data = await res.json();

      const orders = data.data.sections.map((s) => s.displayOrder);
      for (let i = 0; i < orders.length - 1; i++) {
        assert.ok(orders[i] <= orders[i + 1], 'Sections must be ordered ascending by displayOrder');
      }
    });

    test('GET /api/v1/portfolio/homepage-sections correctly populates hero content from Profile', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);
      const data = await res.json();

      const hero = data.data.sections.find((s) => s.type === 'hero');
      assert.ok(hero);
      assert.equal(hero.content.fullName, 'Tanish Mistry');
      assert.equal(hero.content.professionalTitle, 'Full-Stack Engineer');
      assert.equal(hero.content.primaryCtaLabel, 'View Work');
      assert.equal(hero.content.primaryCtaUrl, '#projects');
      assert.equal(hero.content.availabilityStatus, 'open_to_opportunities');
    });

    test('GET /api/v1/portfolio/homepage-sections populates projects respecting featuredOnly filter and limits', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);
      const data = await res.json();

      const projSec = data.data.sections.find((s) => s.type === 'projects');
      assert.ok(projSec);
      assert.ok(Array.isArray(projSec.content.projects));
      // Only 1 project was featured in seed
      assert.equal(projSec.content.projects.length, 1);
      assert.equal(projSec.content.projects[0].slug, 'mealmate-app');
      assert.equal(projSec.content.projects[0].isFeatured, true);
    });

    test('GET /api/v1/portfolio/homepage-sections populates skills with category information', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);
      const data = await res.json();

      const skillSec = data.data.sections.find((s) => s.type === 'skills');
      assert.ok(skillSec);
      assert.ok(Array.isArray(skillSec.content.categories));
      assert.ok(Array.isArray(skillSec.content.skills));
      assert.equal(skillSec.content.skills.length, 1);
      assert.equal(skillSec.content.skills[0].name, 'React');
    });

    test('GET /api/v1/portfolio/homepage-sections populates contact section with public contact info', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);
      const data = await res.json();

      const contactSec = data.data.sections.find((s) => s.type === 'contact');
      assert.ok(contactSec);
      assert.equal(contactSec.content.publicEmail, 'contact@tanishmistry.com');
      assert.equal(contactSec.content.showContactForm, true);
      assert.equal(contactSec.content.submitEndpoint, '/api/v1/portfolio/contact');
    });

    test('GET /api/v1/portfolio/homepage-sections excludes hidden section (isVisible: false)', async () => {
      // Hide the hero section
      await HomepageSection.updateOne({ type: 'hero' }, { $set: { isVisible: false } });

      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);
      const data = await res.json();

      const hero = data.data.sections.find((s) => s.type === 'hero');
      assert.equal(hero, undefined, 'Hidden sections must not appear in public response');

      // Restore visibility
      await HomepageSection.updateOne({ type: 'hero' }, { $set: { isVisible: true } });
    });

    test('GET /api/v1/portfolio/homepage-sections gracefully handles empty sections database without 500 error', async () => {
      await HomepageSection.deleteMany({});

      const res = await fetch(`${baseUrl}/api/v1/portfolio/homepage-sections`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.deepEqual(data.data.sections, []);
    });
  });
});
