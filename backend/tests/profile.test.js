import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import Profile, { AVAILABILITY_STATUSES } from '../src/modules/profile/profile.model.js';

const TEST_DB_NAME = 'tanish_portfolio_profile_test';

describe('Profile Management Test Suite', () => {
  let server;
  let baseUrl;
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  const testAdmin = {
    name: 'Profile Test Admin',
    email: 'profileadmin@example.com',
    password: 'TestPassword123!',
  };

  const sampleProfileData = {
    fullName: 'Tanish Mistry',
    professionalTitle: 'Computer Engineering Student | Full-Stack Developer',
    shortIntroduction: 'Passionate about building scalable modern web applications and developer tools.',
    about: 'I am a computer engineering student with a strong focus on full-stack development using the MERN stack.',
    location: 'India',
    publicEmail: 'tanish@example.com',
    profileImageUrl: 'https://images.example.com/avatar.jpg',
    profileImageAlt: 'Tanish Mistry profile portrait',
    availabilityStatus: 'open_to_internships',
  };

  before(async () => {
    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await Profile.deleteMany({});
    await Promise.all([Admin.init(), Profile.init()]);

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
    // Cleanup test database
    if (mongoose.connection.readyState === 1) {
      await Profile.deleteMany({});
      await Admin.deleteMany({});
      await mongoose.connection.close();
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Profile Model & Database Singleton Enforcement', () => {
    test('Can create first profile and defaults isPublished to false', async () => {
      const profile = await Profile.create({
        ...sampleProfileData,
        singletonKey: 'primary',
      });

      assert.ok(profile._id);
      assert.equal(profile.fullName, sampleProfileData.fullName);
      assert.equal(profile.isPublished, false);
      assert.equal(profile.isVisible, true);
      assert.equal(profile.singletonKey, 'primary');

      // Cleanup for subsequent API tests
      await Profile.deleteMany({});
    });

    test('Single-Profile enforcement: second profile creation fails via singletonKey unique index', async () => {
      await Profile.create({
        ...sampleProfileData,
        singletonKey: 'primary',
      });

      await assert.rejects(
        async () => {
          await Profile.create({
            fullName: 'Second Profile',
            professionalTitle: 'Another Developer',
            shortIntroduction: 'Another short intro with 10 chars',
            about: 'Another about section with at least 10 characters',
            singletonKey: 'primary',
          });
        },
        (err) => {
          assert.equal(err.code, 11000);
          return true;
        }
      );

      // Cleanup
      await Profile.deleteMany({});
    });

    test('Availability status enum enforces allowed values', () => {
      assert.deepEqual(AVAILABILITY_STATUSES, [
        'open_to_opportunities',
        'not_available',
        'open_to_internships',
        'open_to_full_time',
      ]);
    });
  });

  describe('2. Administrator Profile API', () => {
    test('GET /api/v1/admin/profile returns 404 when profile does not exist', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        headers: { Cookie: authCookie },
      });
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.message, 'Profile not found');
    });

    test('POST /api/v1/admin/profile rejects unauthenticated request with HTTP 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleProfileData),
      });
      assert.equal(res.status, 401);
    });

    test('POST /api/v1/admin/profile rejects request missing CSRF token with HTTP 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
        body: JSON.stringify(sampleProfileData),
      });
      assert.equal(res.status, 403);
    });

    test('POST /api/v1/admin/profile rejects non-HTTPS profile image URL with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ...sampleProfileData,
          profileImageUrl: 'http://insecure-site.com/avatar.jpg',
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /HTTPS URL/i);
    });

    test('POST /api/v1/admin/profile rejects protected fields in request body with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ...sampleProfileData,
          singletonKey: 'custom-key',
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /singletonKey/);
    });

    test('POST /api/v1/admin/profile successfully creates profile with valid authentication & CSRF', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleProfileData),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.profile.fullName, sampleProfileData.fullName);
      assert.equal(body.data.profile.isPublished, false);
      assert.equal(body.data.profile.isVisible, true);
    });

    test('POST /api/v1/admin/profile duplicate attempt returns HTTP 409', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(sampleProfileData),
      });

      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /already been created/i);
    });

    test('GET /api/v1/admin/profile returns existing profile including draft state', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        headers: { Cookie: authCookie },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.profile.fullName, sampleProfileData.fullName);
      assert.equal(body.data.profile.isPublished, false);
    });

    test('PATCH /api/v1/admin/profile rejects empty update body with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /empty/i);
    });

    test('PATCH /api/v1/admin/profile rejects protected fields in update with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ isPublished: true }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /protected/i);
    });

    test('PATCH /api/v1/admin/profile successfully partially updates allowed fields', async () => {
      const updateData = {
        location: 'Mumbai, India',
        availabilityStatus: 'open_to_full_time',
      };

      const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(updateData),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.profile.location, 'Mumbai, India');
      assert.equal(body.data.profile.availabilityStatus, 'open_to_full_time');
      // Preserved fields
      assert.equal(body.data.profile.fullName, sampleProfileData.fullName);
      assert.equal(body.data.profile.isPublished, false);
    });
  });

  describe('3. Publication Workflow & Public Profile API', () => {
    test('GET /api/v1/portfolio/profile returns 404 when profile is unpublished', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/profile`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test('PATCH /api/v1/admin/profile/publish sets isPublished to true', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.profile.isPublished, true);
    });

    test('GET /api/v1/portfolio/profile returns clean projection when published & visible', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/profile`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.profile.fullName, sampleProfileData.fullName);
      assert.equal(body.data.profile.location, 'Mumbai, India');

      // Verify internal fields are strictly excluded
      assert.equal(body.data.profile._id, undefined);
      assert.equal(body.data.profile.singletonKey, undefined);
      assert.equal(body.data.profile.isPublished, undefined);
      assert.equal(body.data.profile.isVisible, undefined);
      assert.equal(body.data.profile.createdAt, undefined);
      assert.equal(body.data.profile.updatedAt, undefined);
    });

    test('PATCH /api/v1/admin/profile/unpublish sets isPublished to false', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/profile/unpublish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.profile.isPublished, false);
    });

    test('GET /api/v1/portfolio/profile immediately returns 404 after unpublishing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/portfolio/profile`);
      assert.equal(res.status, 404);
    });

    test('GET /api/v1/portfolio/profile returns 404 when published but isVisible is false', async () => {
      // Publish profile
      await fetch(`${baseUrl}/api/v1/admin/profile/publish`, {
        method: 'PATCH',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      // Set isVisible: false
      await fetch(`${baseUrl}/api/v1/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ isVisible: false }),
      });

      // Public endpoint must now return 404
      const res = await fetch(`${baseUrl}/api/v1/portfolio/profile`);
      assert.equal(res.status, 404);
    });
  });
});
