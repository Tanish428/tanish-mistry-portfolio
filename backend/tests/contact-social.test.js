import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import SocialLink from '../src/modules/contact-social/social-link.model.js';
import ContactMessage from '../src/modules/contact-social/contact-message.model.js';

const TEST_DB_NAME = 'tanish_portfolio_contact_social_test';

describe('Contact & Social Links Management Test Suite', () => {
  let server;
  let baseUrl;
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  const testAdmin = {
    name: 'ContactSocial Test Admin',
    email: 'contactadmin@example.com',
    password: 'TestPassword123!',
  };

  const sampleSocialLink1 = {
    platform: 'github',
    label: 'GitHub',
    url: 'https://github.com/tanishmistry',
    iconName: 'github_icon',
    displayOrder: 1,
    isVisible: true,
  };

  const sampleSocialLink2 = {
    platform: 'linkedin',
    label: 'LinkedIn',
    url: 'https://linkedin.com/in/tanishmistry',
    iconName: 'linkedin_icon',
    displayOrder: 2,
    isVisible: true,
  };

  const sampleContactMessage1 = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    subject: 'Project Collaboration Inquiry',
    message: 'Hello Tanish, I was impressed by your portfolio and would like to discuss a project.',
  };

  before(async () => {
    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await SocialLink.deleteMany({});
    await ContactMessage.deleteMany({});
    await SocialLink.syncIndexes();
    await ContactMessage.syncIndexes();

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
      await SocialLink.deleteMany({});
      await ContactMessage.deleteMany({});
      await mongoose.connection.close();
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ==========================================
  // 1. MODEL & SCHEMA VALIDATION TESTS
  // ==========================================
  describe('1. Model & Validation Unit Tests', () => {
    test('SocialLink model rejects non-HTTPS URLs', async () => {
      const link = new SocialLink({
        platform: 'insecure-link',
        label: 'Insecure',
        url: 'http://example.com',
      });
      await assert.rejects(link.save(), /URL must be a valid HTTPS URL/);
    });

    test('SocialLink model rejects invalid platform identifiers with spaces or uppercase', async () => {
      const link = new SocialLink({
        platform: 'Invalid Platform!',
        label: 'Invalid',
        url: 'https://example.com',
      });
      await assert.rejects(link.save(), /Platform identifier must only contain/);
    });

    test('SocialLink model rejects unsafe iconName characters', async () => {
      const link = new SocialLink({
        platform: 'unsafe-icon',
        label: 'Unsafe',
        url: 'https://example.com',
        iconName: 'bad<script>icon',
      });
      await assert.rejects(link.save(), /iconName must be a safe alphanumeric/);
    });

    test('SocialLink enforces platform uniqueness at the schema level', async () => {
      const link1 = new SocialLink({
        platform: 'unique-platform',
        label: 'First Link',
        url: 'https://example.com/1',
      });
      await link1.save();

      const link2 = new SocialLink({
        platform: 'unique-platform',
        label: 'Second Link',
        url: 'https://example.com/2',
      });
      await assert.rejects(link2.save(), (err) => err.code === 11000);

      await SocialLink.deleteOne({ platform: 'unique-platform' });
    });

    test('ContactMessage model rejects invalid email formats', async () => {
      const msg = new ContactMessage({
        name: 'John',
        email: 'invalid-email-address',
        subject: 'Inquiry',
        message: 'This is a test message that is long enough.',
      });
      await assert.rejects(msg.save(), /valid email/);
    });

    test('ContactMessage defaults status to "new"', async () => {
      const msg = new ContactMessage({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Hello',
        message: 'A nice test message that meets minimum length.',
      });
      await msg.save();
      assert.equal(msg.status, 'new');
      await ContactMessage.deleteOne({ _id: msg._id });
    });
  });

  // ==========================================
  // 2. PUBLIC CONTACT SUBMISSION & CSRF TESTS
  // ==========================================
  describe('2. Public Contact Submission API & Security', () => {
    let anonCsrfToken = null;
    let anonCsrfCookie = null;

    test('Anonymous client can obtain a valid CSRF token from /api/v1/auth/csrf-token', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/csrf-token`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.csrfToken);
      anonCsrfToken = data.data.csrfToken;

      const setCookie = res.headers.get('set-cookie');
      assert.ok(setCookie);
      const match = setCookie.match(/portfolio\.x-csrf-token=([^;]+)/);
      assert.ok(match);
      anonCsrfCookie = `portfolio.x-csrf-token=${match[1]}`;
    });

    test('POST /api/v1/portfolio/contact rejects submissions without CSRF token with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleContactMessage1),
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /CSRF/i);
    });

    test('POST /api/v1/portfolio/contact succeeds with valid anonymous CSRF token', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': anonCsrfToken,
          Cookie: anonCsrfCookie,
        },
        body: JSON.stringify(sampleContactMessage1),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      // Privacy check: Generic response with data: null
      assert.equal(data.data, null);
      assert.match(data.message, /received successfully/i);

      // Verify record exists in DB with status "new"
      const saved = await ContactMessage.findOne({ email: sampleContactMessage1.email });
      assert.ok(saved);
      assert.equal(saved.status, 'new');
      assert.equal(saved.name, sampleContactMessage1.name);
    });

    test('POST /api/v1/portfolio/contact rejects prohibited administrative fields with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': anonCsrfToken,
          Cookie: anonCsrfCookie,
        },
        body: JSON.stringify({
          ...sampleContactMessage1,
          status: 'read',
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /status.*not allowed/i);
    });

    test('POST /api/v1/portfolio/contact rejects invalid email formats with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': anonCsrfToken,
          Cookie: anonCsrfCookie,
        },
        body: JSON.stringify({
          ...sampleContactMessage1,
          email: 'not-an-email',
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /valid email/i);
    });

    test('POST /api/v1/portfolio/contact rejects empty / too-short message with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': anonCsrfToken,
          Cookie: anonCsrfCookie,
        },
        body: JSON.stringify({
          ...sampleContactMessage1,
          message: 'short',
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /between 10 and 5000 characters/i);
    });

    test('POST /api/v1/portfolio/contact rate limits after 5 requests with 429', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': anonCsrfToken,
          Cookie: anonCsrfCookie,
        },
        body: JSON.stringify(sampleContactMessage1),
      });

      assert.equal(res.status, 429);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /Too many contact messages/i);
    });

    test('No public GET endpoint exists for contact messages (returns 404)', async () => {
      const res1 = await fetch(`${baseUrl}/api/v1/portfolio/contact`);
      assert.equal(res1.status, 404);

      const res2 = await fetch(`${baseUrl}/api/v1/portfolio/contact-messages`);
      assert.equal(res2.status, 404);
    });
  });

  // ==========================================
  // 3. ADMIN CONTACT INBOX API TESTS
  // ==========================================
  describe('3. Administrator Contact Inbox API', () => {
    let createdMessageId = null;

    before(async () => {
      // Seed a couple of test messages directly
      const msg = await ContactMessage.create({
        name: 'Alice Cooper',
        email: 'alice@example.com',
        subject: 'Consulting Opportunity',
        message: 'We are looking for a senior full-stack developer to join our team.',
        status: 'new',
      });
      createdMessageId = msg._id.toString();

      await ContactMessage.create({
        name: 'Bob Marley',
        email: 'bob@example.com',
        subject: 'General Question',
        message: 'Could you share what technologies you prefer for state management?',
        status: 'read',
      });
    });

    test('GET /api/v1/admin/contact-messages rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages`);
      assert.equal(res.status, 401);
    });

    test('GET /api/v1/admin/contact-messages lists messages with pagination and newest first', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages?page=1&limit=5`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data.messages));
      assert.ok(data.data.pagination);
      assert.equal(data.data.pagination.page, 1);
      assert.equal(data.data.pagination.limit, 5);
      assert.ok(data.data.pagination.total >= 2);
    });

    test('GET /api/v1/admin/contact-messages filters by status', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages?status=read`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      for (const msg of data.data.messages) {
        assert.equal(msg.status, 'read');
      }
    });

    test('GET /api/v1/admin/contact-messages rejects invalid status query with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages?status=unknown_status`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    test('GET /api/v1/admin/contact-messages/:id retrieves a single message', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages/${createdMessageId}`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.id, createdMessageId);
      assert.equal(data.data.name, 'Alice Cooper');
    });

    test('GET /api/v1/admin/contact-messages/:id returns 404 for nonexistent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages/${fakeId}`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /not found/i);
    });

    test('PATCH /api/v1/admin/contact-messages/:id/status updates status to "archived"', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages/${createdMessageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ status: 'archived' }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.status, 'archived');

      // Verify in DB
      const updated = await ContactMessage.findById(createdMessageId);
      assert.equal(updated.status, 'archived');
    });

    test('PATCH /api/v1/admin/contact-messages/:id/status rejects invalid status with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages/${createdMessageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ status: 'invalid_status_value' }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    test('DELETE /api/v1/admin/contact-messages/:id removes the message', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages/${createdMessageId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      // Verify deleted from DB
      const check = await ContactMessage.findById(createdMessageId);
      assert.equal(check, null);
    });

    test('DELETE /api/v1/admin/contact-messages/:id returns 404 for already deleted message', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/contact-messages/${createdMessageId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
    });
  });

  // ==========================================
  // 4. SOCIAL LINKS API TESTS (ADMIN & PUBLIC)
  // ==========================================
  describe('4. Social Links API (Admin & Public)', () => {
    let linkId1 = null;
    let linkId2 = null;

    test('POST /api/v1/admin/social-links rejects unauthenticated requests with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleSocialLink1),
      });

      assert.equal(res.status, 401);
    });

    test('POST /api/v1/admin/social-links creates social link as draft (isPublished: false)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleSocialLink1),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.platform, sampleSocialLink1.platform);
      assert.equal(data.data.isPublished, false);
      assert.equal(data.data.isVisible, true);
      linkId1 = data.data.id;
    });

    test('POST /api/v1/admin/social-links creates second social link', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleSocialLink2),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      linkId2 = data.data.id;
    });

    test('POST /api/v1/admin/social-links rejects duplicate platform with 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          platform: 'github',
          label: 'Another GitHub',
          url: 'https://github.com/another',
        }),
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /already exists/i);
    });

    test('GET /api/v1/admin/social-links returns all links including unpublished', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.length >= 2);
    });

    test('GET /api/v1/portfolio/social-links returns empty array when all links are unpublished', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/social-links`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.length, 0);
    });

    test('PATCH /api/v1/admin/social-links/:id/publish publishes the first link', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links/${linkId1}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.isPublished, true);
    });

    test('PATCH /api/v1/admin/social-links/:id/publish publishes the second link', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links/${linkId2}/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.isPublished, true);
    });

    test('GET /api/v1/portfolio/social-links returns published & visible links with safe projection', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/social-links`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.length, 2);

      // Verify safe projection: internal flags excluded
      const first = data.data[0];
      assert.equal(first.isPublished, undefined);
      assert.equal(first.isVisible, undefined);
      assert.equal(first.__v, undefined);
      assert.ok(first.id);
      assert.ok(first.platform);
      assert.ok(first.label);
      assert.ok(first.url);
    });

    test('PATCH /api/v1/admin/social-links/reorder safely updates displayOrder', async () => {
      const reorderPayload = [
        { id: linkId1, displayOrder: 10 },
        { id: linkId2, displayOrder: 5 },
      ];

      const res = await fetch(`${baseUrl}/api/v1/admin/social-links/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(reorderPayload),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      // Verify new order in public endpoint (displayOrder 5 comes before 10)
      const pubRes = await fetch(`${baseUrl}/api/v1/portfolio/social-links`);
      const pubData = await pubRes.json();
      assert.equal(pubData.data[0].id, linkId2);
      assert.equal(pubData.data[1].id, linkId1);
    });

    test('PATCH /api/v1/admin/social-links/reorder rejects payload with nonexistent ID with 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const reorderPayload = [
        { id: linkId1, displayOrder: 1 },
        { id: fakeId.toString(), displayOrder: 2 },
      ];

      const res = await fetch(`${baseUrl}/api/v1/admin/social-links/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(reorderPayload),
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /not found/i);
    });

    test('PATCH /api/v1/admin/social-links/:id updates social link details', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links/${linkId1}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ label: 'GitHub - Personal' }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.label, 'GitHub - Personal');
    });

    test('PATCH /api/v1/admin/social-links/:id/unpublish hides link from public response', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links/${linkId1}/unpublish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.isPublished, false);

      // Verify public response now only returns 1 link
      const pubRes = await fetch(`${baseUrl}/api/v1/portfolio/social-links`);
      const pubData = await pubRes.json();
      assert.equal(pubData.data.length, 1);
      assert.equal(pubData.data[0].id, linkId2);
    });

    test('DELETE /api/v1/admin/social-links/:id permanently deletes link', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/social-links/${linkId1}`, {
        method: 'DELETE',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      // Confirm 404 on subsequent get
      const getRes = await fetch(`${baseUrl}/api/v1/admin/social-links/${linkId1}`, {
        headers: { Cookie: `${authCookie}; ${csrfCookie}` },
      });
      assert.equal(getRes.status, 404);
    });
  });
});
