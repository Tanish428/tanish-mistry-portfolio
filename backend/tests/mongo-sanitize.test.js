import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { hasMongoOperators, mongoSanitize } from '../src/middleware/mongoSanitize.js';
import { validateImageFile } from '../src/modules/media/media.validation.js';
import { validateProjectId, validateSlugParam } from '../src/modules/projects/project.validation.js';
import { validateObjectId as validateMediaId } from '../src/modules/media/media.validation.js';
import app from '../src/app.js';

describe('Centralized MongoDB Operator Injection Protection Test Suite', () => {
  describe('1. hasMongoOperators Unit Verification', () => {
    test('returns false for primitives, null, and undefined', () => {
      assert.strictEqual(hasMongoOperators(null), false);
      assert.strictEqual(hasMongoOperators(undefined), false);
      assert.strictEqual(hasMongoOperators(123), false);
      assert.strictEqual(hasMongoOperators('ordinary string'), false);
      assert.strictEqual(hasMongoOperators(true), false);
      assert.strictEqual(hasMongoOperators(false), false);
    });

    test('returns false for empty objects and empty arrays', () => {
      assert.strictEqual(hasMongoOperators({}), false);
      assert.strictEqual(hasMongoOperators([]), false);
    });

    test('returns false for legitimate strings containing dots, dollars, and punctuation', () => {
      const payload = {
        email: 'tanish.mistry@example.com',
        website: 'https://portfolio.tanish.dev/projects?ref=dev.to',
        price: 'Project cost is $5,000.50 USD.',
        bio: 'Software engineer with 3.5+ years of experience in Node.js, Express, and MongoDB.',
        tags: ['web.dev', 'react-19.0', '$100k-club'],
      };
      assert.strictEqual(hasMongoOperators(payload), false);
    });

    test('detects top-level operator keys beginning with "$"', () => {
      assert.strictEqual(hasMongoOperators({ $gt: '' }), true);
      assert.strictEqual(hasMongoOperators({ $where: 'sleep(1000)' }), true);
      assert.strictEqual(hasMongoOperators({ $ne: null }), true);
      assert.strictEqual(hasMongoOperators({ $regex: '.*' }), true);
    });

    test('detects nested operator keys beginning with "$"', () => {
      assert.strictEqual(hasMongoOperators({ filter: { $gt: 10 } }), true);
      assert.strictEqual(hasMongoOperators({ credentials: { password: { $ne: '' } } }), true);
      assert.strictEqual(hasMongoOperators({ deep: { nested: { level: { $exists: true } } } }), true);
    });

    test('detects arrays containing nested objects with prohibited operator keys', () => {
      assert.strictEqual(hasMongoOperators([{ $gt: 0 }]), true);
      assert.strictEqual(hasMongoOperators(['valid string', { safe: true }, { $where: 'test' }]), true);
      assert.strictEqual(hasMongoOperators({ items: [{ details: [{ $ne: 1 }] }] }), true);
    });

    test('detects dotted object keys relevant to path injection', () => {
      assert.strictEqual(hasMongoOperators({ 'user.role': 'admin' }), true);
      assert.strictEqual(hasMongoOperators({ 'profile.email': 'test@example.com' }), true);
      assert.strictEqual(hasMongoOperators({ nested: { 'config.options': true } }), true);
    });

    test('detects and halts traversal on excessively deep structures (> 20 levels)', () => {
      // Create deeply nested structure with 25 levels of nesting
      let deepObj = { level: 25 };
      for (let i = 24; i >= 0; i--) {
        deepObj = { child: deepObj };
      }
      // Should be flagged as suspicious / bounded traversal
      assert.strictEqual(hasMongoOperators(deepObj), true);
    });

    test('handles circular references safely without infinite recursion', () => {
      const circularObj = { name: 'safe' };
      circularObj.self = circularObj;
      assert.strictEqual(hasMongoOperators(circularObj), false);

      const dangerousCircular = { $gt: 1 };
      dangerousCircular.self = dangerousCircular;
      assert.strictEqual(hasMongoOperators(dangerousCircular), true);
    });
  });

  describe('2. mongoSanitize Express Middleware Integration', () => {
    let testApp;
    let server;
    let baseUrl;

    test('setup test server with mongoSanitize middleware', async () => {
      testApp = express();
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));
      testApp.use(mongoSanitize);

      testApp.post('/test/echo', (req, res) => {
        res.status(200).json({ success: true, received: req.body });
      });

      testApp.get('/test/query', (req, res) => {
        res.status(200).json({ success: true, query: req.query });
      });

      server = await new Promise((resolve) => {
        const s = testApp.listen(0, () => resolve(s));
      });
      baseUrl = `http://localhost:${server.address().port}`;
    });

    test('allows requests with legitimate dots and dollar signs in values', async () => {
      const res = await fetch(`${baseUrl}/test/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin.user@example.com',
          message: 'The rate is $150.00 per hour. Version 2.0 is live.',
        }),
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.received.email, 'admin.user@example.com');
    });

    test('rejects top-level operator key with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/test/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          $gt: '',
        }),
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, 'Prohibited operator character in request data');
      assert.strictEqual(data.data, null);
    });

    test('rejects nested operator key with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/test/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            $ne: null,
          },
        }),
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, 'Prohibited operator character in request data');
    });

    test('rejects dotted object key with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/test/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'user.role': 'admin',
        }),
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, 'Prohibited operator character in request data');
    });

    test('rejects query parameter with operator key with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/test/query?%24where=1`);
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, 'Prohibited operator character in request data');

      const resBracket = await fetch(`${baseUrl}/test/query?filter[%24gt]=1`);
      assert.strictEqual(resBracket.status, 400);
      const dataBracket = await resBracket.json();
      assert.strictEqual(dataBracket.success, false);
      assert.strictEqual(dataBracket.message, 'Prohibited operator character in request data');
    });

    test('rejects query parameter with dotted key with HTTP 400', async () => {
      const res = await fetch(`${baseUrl}/test/query?filter.role=admin`);
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, 'Prohibited operator character in request data');
    });

    test('allows legitimate query parameters with dots in values', async () => {
      const res = await fetch(`${baseUrl}/test/query?search=node.js&category=web.development`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.query.search, 'node.js');
      assert.strictEqual(data.query.category, 'web.development');
    });

    test('cleanup test server', async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });

  describe('3. Main Application End-to-End Pipeline Verification', () => {
    let mainServer;
    let mainBaseUrl;

    test('setup main application server instance', async () => {
      mainServer = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      mainBaseUrl = `http://localhost:${mainServer.address().port}`;
    });

    test('main app blocks operator injection on /api/v1/auth/login before controller', async () => {
      const res = await fetch(`${mainBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          $gt: '',
          password: 'Password123!',
        }),
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, 'Prohibited operator character in request data');
    });

    test('main app blocks dotted-key injection on public contact route before validation', async () => {
      const res = await fetch(`${mainBaseUrl}/api/v1/portfolio/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'contact.email': 'test@example.com',
          name: 'Attacker',
          subject: 'Inquiry',
          message: 'Trying dot path injection',
        }),
      });

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, 'Prohibited operator character in request data');
    });

    test('cleanup main application server instance', async () => {
      if (mainServer) {
        await new Promise((resolve) => mainServer.close(resolve));
      }
    });
  });

  describe('4. Multipart Form Field Sanitization Verification (validateImageFile)', () => {
    const validPngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);

    const createMockRes = () => {
      const res = {
        statusCode: null,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      };
      return res;
    };

    test('validateImageFile rejects multipart request when req.body contains operator keys ($where, $ne)', () => {
      const req = {
        file: { buffer: validPngBuffer },
        body: {
          $where: 'sleep(1000)',
          altText: 'A safe image description',
        },
      };
      const res = createMockRes();
      let nextCalled = false;

      validateImageFile(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Prohibited operator character in request data');
    });

    test('validateImageFile rejects multipart request when req.body contains dotted path keys', () => {
      const req = {
        file: { buffer: validPngBuffer },
        body: {
          'metadata.category': 'admin-exploit',
        },
      };
      const res = createMockRes();
      let nextCalled = false;

      validateImageFile(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Prohibited operator character in request data');
    });

    test('validateImageFile allows legitimate multipart field values containing $ and . (altText, URLs)', () => {
      const req = {
        file: { buffer: validPngBuffer },
        body: {
          altText: 'Profile photo taken at developer conference. Valued at $150.00 USD (version 2.0).',
        },
      };
      const res = createMockRes();
      let nextCalled = false;

      validateImageFile(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(res.statusCode, null);
      assert.strictEqual(req.file.detectedFormat, 'png');
    });
  });

  describe('5. Route Parameter Lifecycle and Guard Verification', () => {
    let lifecycleApp;
    let lifecycleServer;
    let lifecycleBaseUrl;
    let globalObservedParams = null;
    let routeObservedParams = null;

    test('setup lifecycle observation server', async () => {
      lifecycleApp = express();
      lifecycleApp.use(express.json());

      // Global middleware mounted before router mounts
      lifecycleApp.use((req, res, next) => {
        // Express 5 req.params is empty object prior to route matching
        globalObservedParams = { ...req.params };
        next();
      });

      // Mount global mongoSanitize
      lifecycleApp.use(mongoSanitize);

      // Route-level handler with route parameter :id
      lifecycleApp.get('/test/projects/:id', (req, res) => {
        routeObservedParams = { ...req.params };
        res.status(200).json({ success: true, params: req.params });
      });

      lifecycleServer = await new Promise((resolve) => {
        const s = lifecycleApp.listen(0, () => resolve(s));
      });
      lifecycleBaseUrl = `http://localhost:${lifecycleServer.address().port}`;
    });

    test('verifies global middleware observes req.params as empty {} while route handler receives populated params', async () => {
      const res = await fetch(`${lifecycleBaseUrl}/test/projects/my-sample-project`);
      assert.strictEqual(res.status, 200);

      // Global middleware before route matching saw empty req.params
      assert.deepStrictEqual(globalObservedParams, {});

      // Route handler after route matching saw populated req.params
      assert.deepStrictEqual(routeObservedParams, { id: 'my-sample-project' });
    });

    test('cleanup lifecycle observation server', async () => {
      if (lifecycleServer) {
        await new Promise((resolve) => lifecycleServer.close(resolve));
      }
    });

    test('validateProjectId rejects operator strings in req.params.id with HTTP 400', () => {
      const mockRes = () => ({
        statusCode: null,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      });

      // Operator string as id
      const req1 = { params: { id: '$gt' } };
      const res1 = mockRes();
      let nextCalled1 = false;
      validateProjectId(req1, res1, () => { nextCalled1 = true; });
      assert.strictEqual(nextCalled1, false);
      assert.strictEqual(res1.statusCode, 400);
      assert.strictEqual(res1.body.message, 'Invalid project ID format');

      // Operator injection attempt as id
      const req2 = { params: { id: '{ $ne: null }' } };
      const res2 = mockRes();
      let nextCalled2 = false;
      validateProjectId(req2, res2, () => { nextCalled2 = true; });
      assert.strictEqual(nextCalled2, false);
      assert.strictEqual(res2.statusCode, 400);
      assert.strictEqual(res2.body.message, 'Invalid project ID format');
    });

    test('validateSlugParam rejects operator strings in req.params.slug with HTTP 400', () => {
      const mockRes = () => ({
        statusCode: null,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      });

      // Operator string as slug
      const req1 = { params: { slug: '$gt' } };
      const res1 = mockRes();
      let nextCalled1 = false;
      validateSlugParam(req1, res1, () => { nextCalled1 = true; });
      assert.strictEqual(nextCalled1, false);
      assert.strictEqual(res1.statusCode, 400);
      assert.strictEqual(res1.body.message, 'Invalid slug format');

      // Dotted path as slug
      const req2 = { params: { slug: 'project.name.injection' } };
      const res2 = mockRes();
      let nextCalled2 = false;
      validateSlugParam(req2, res2, () => { nextCalled2 = true; });
      assert.strictEqual(nextCalled2, false);
      assert.strictEqual(res2.statusCode, 400);
      assert.strictEqual(res2.body.message, 'Invalid slug format');
    });

    test('validateMediaId rejects operator strings in req.params.id with HTTP 400', () => {
      const mockRes = () => ({
        statusCode: null,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      });

      const req = { params: { id: '$ne' } };
      const res = mockRes();
      let nextCalled = false;
      validateMediaId(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.message, 'Invalid media ID format');
    });
  });
});
