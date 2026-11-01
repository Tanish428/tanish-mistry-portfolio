import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import app from '../src/app.js';
import Admin from '../src/modules/auth/admin.model.js';
import { validateProvisioningInput, validateLogin } from '../src/modules/auth/auth.validation.js';
import { generateToken, verifyToken } from '../src/modules/auth/auth.service.js';

const TEST_DB_NAME = 'tanish_portfolio_auth_test';

describe('Administrator Authentication Test Suite', () => {
  let server;
  let baseUrl;
  let testAdminEmail = 'testadmin@example.com';
  let testAdminPassword = 'TestPassword123!';
  let authCookie = null;
  let csrfCookie = null;
  let csrfToken = null;

  before(async () => {
    // Connect to isolated test database
    await mongoose.connect(config.mongodbUri, {
      dbName: TEST_DB_NAME,
    });

    // Clear test collections and build indexes
    await Admin.deleteMany({});
    await Admin.init();

    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Cleanup test database
    if (mongoose.connection.readyState === 1) {
      await Admin.deleteMany({});
      await mongoose.connection.close();
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Model & Validation Unit Tests', () => {
    test('Password validation enforces 12-char minimum', () => {
      const res = validateProvisioningInput({
        name: 'Test Admin',
        email: 'test@example.com',
        password: 'short',
      });
      assert.equal(res.isValid, false);
      assert.match(res.error, /at least 12 characters/);
    });

    test('Password validation enforces 72-byte UTF-8 maximum limit', () => {
      const longPassword = 'A'.repeat(73);
      const res = validateProvisioningInput({
        name: 'Test Admin',
        email: 'test@example.com',
        password: longPassword,
      });
      assert.equal(res.isValid, false);
      assert.match(res.error, /72 bytes/);
    });

    test('First administrator can be created and password is automatically hashed', async () => {
      const admin = await Admin.create({
        name: 'Test Administrator',
        email: testAdminEmail,
        password: testAdminPassword,
      });

      assert.ok(admin._id);
      assert.equal(admin.email, testAdminEmail);
      assert.equal(admin.singletonKey, 'primary');

      // Verify password was hashed and is not plaintext
      const adminWithPassword = await Admin.findById(admin._id).select('+password');
      assert.notEqual(adminWithPassword.password, testAdminPassword);
      assert.ok(adminWithPassword.password.startsWith('$2'));

      // Verify comparePassword method
      const isMatch = await adminWithPassword.comparePassword(testAdminPassword);
      assert.equal(isMatch, true);

      const isNotMatch = await adminWithPassword.comparePassword('WrongPassword!');
      assert.equal(isNotMatch, false);
    });

    test('Single-Administrator enforcement: second administrator creation fails via singletonKey unique index', async () => {
      await assert.rejects(
        async () => {
          await Admin.create({
            name: 'Second Admin',
            email: 'secondadmin@example.com',
            password: 'AnotherPassword123!',
            singletonKey: 'primary',
          });
        },
        (err) => {
          assert.equal(err.code, 11000);
          return true;
        }
      );
    });
  });

  describe('2. JWT Generation & Verification', () => {
    test('generateToken creates valid JWT with explicit claims', () => {
      const mockId = new mongoose.Types.ObjectId();
      const token = generateToken(mockId);
      assert.ok(typeof token === 'string');

      const decoded = verifyToken(token);
      assert.equal(decoded.sub, mockId.toString());
      assert.equal(decoded.iss, config.jwtIssuer);
      assert.equal(decoded.aud, config.jwtAudience);
    });

    test('verifyToken rejects tampered signature', () => {
      const mockId = new mongoose.Types.ObjectId();
      const token = generateToken(mockId);
      const tamperedToken = token.slice(0, -5) + 'abcde';

      assert.throws(() => verifyToken(tamperedToken));
    });
  });

  describe('3. Public Endpoints & CSRF Token', () => {
    test('GET /api/v1/health/live returns 200', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health/live`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'alive');
    });

    test('GET /api/v1/health/ready returns 200 with connected DB', async () => {
      const res = await fetch(`${baseUrl}/api/v1/health/ready`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'ready');
      assert.equal(body.data.database, 'connected');
    });

    test('GET /api/v1/auth/csrf-token generates CSRF token and sets cookie', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/csrf-token`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.csrfToken);

      csrfToken = body.data.csrfToken;

      const setCookieHeader = res.headers.get('set-cookie');
      assert.ok(setCookieHeader);
      csrfCookie = setCookieHeader.split(';')[0];
    });
  });

  describe('4. Login API & Rate Limiting', () => {
    test('POST /api/v1/auth/login rejects incorrect password with generic 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testAdminEmail,
          password: 'IncorrectPassword123!',
        }),
      });

      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.message, 'Invalid email or password');
    });

    test('POST /api/v1/auth/login rejects non-existent email with identical generic 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        }),
      });

      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.message, 'Invalid email or password');
    });

    test('POST /api/v1/auth/login succeeds with valid credentials and sets HttpOnly cookie', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testAdminEmail,
          password: testAdminPassword,
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.admin.email, testAdminEmail);

      // Verify JWT is NOT returned in JSON response body
      assert.equal(body.data.token, undefined);
      assert.equal(body.token, undefined);

      // Verify CSRF token is provided
      assert.ok(body.data.csrfToken);
      csrfToken = body.data.csrfToken;

      // Verify HttpOnly cookie header
      const rawCookies = res.headers.get('set-cookie');
      assert.ok(rawCookies);
      assert.match(rawCookies, new RegExp(config.authCookieName));
      assert.match(rawCookies, /HttpOnly/i);

      // Save cookie for subsequent authenticated tests
      const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
      for (const sc of setCookies) {
        const cookiePart = sc.split(';')[0].trim();
        if (cookiePart.startsWith(`${config.authCookieName}=`)) {
          authCookie = cookiePart;
        }
        if (cookiePart.includes('x-csrf-token=')) {
          csrfCookie = cookiePart;
        }
      }
    });

    test('POST /api/v1/auth/login triggers HTTP 429 after exceeding max rate limit', async () => {
      // 3 attempts have already occurred; 3 more will exceed the limit of 5
      let rateLimitedRes = null;
      for (let i = 0; i < 3; i++) {
        const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testAdminEmail,
            password: 'WrongPassword!',
          }),
        });
        if (res.status === 429) {
          rateLimitedRes = res;
          break;
        }
      }

      assert.ok(rateLimitedRes, 'Expected at least one request to be rate-limited (HTTP 429)');
      assert.equal(rateLimitedRes.status, 429);
      const body = await rateLimitedRes.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Too many login attempts/);
    });
  });

  describe('5. Protected Routes & Session Verification', () => {
    test('GET /api/v1/auth/me rejects request without cookie with HTTP 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/me`);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test('GET /api/v1/auth/me succeeds with valid authentication cookie', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
        headers: {
          Cookie: authCookie,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.admin.email, testAdminEmail);
      assert.equal(body.data.admin.password, undefined);
    });
  });

  describe('6. CSRF Protection & Logout', () => {
    test('POST /api/v1/auth/logout without CSRF token is rejected with HTTP 403', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
        },
      });

      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /CSRF token/i);
    });

    test('POST /api/v1/auth/logout succeeds with valid CSRF token and clears cookie', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `${authCookie}; ${csrfCookie}`,
          'x-csrf-token': csrfToken,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.message, 'Logout successful');

      // Verify cookie cleared
      const setCookieHeader = res.headers.get('set-cookie');
      assert.ok(setCookieHeader);
      assert.match(setCookieHeader, new RegExp(`${config.authCookieName}=;`));
    });
  });
});
