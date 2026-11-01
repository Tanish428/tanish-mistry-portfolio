import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import rateLimit from 'express-rate-limit';
import config, { parseTrustProxy } from '../src/config/env.js';
import app from '../src/app.js';

describe('Operational Hardening & Production Configuration Test Suite', () => {
  describe('1. parseTrustProxy Unit Validation', () => {
    test('defaults safely to false when undefined, null, empty string, or whitespace', () => {
      assert.strictEqual(parseTrustProxy(undefined), false);
      assert.strictEqual(parseTrustProxy(null), false);
      assert.strictEqual(parseTrustProxy(''), false);
      assert.strictEqual(parseTrustProxy('   '), false);
      assert.strictEqual(parseTrustProxy(false), false);
    });

    test('parses boolean false and case-insensitive string "false"', () => {
      assert.strictEqual(parseTrustProxy(false), false);
      assert.strictEqual(parseTrustProxy('false'), false);
      assert.strictEqual(parseTrustProxy('FALSE'), false);
      assert.strictEqual(parseTrustProxy('False'), false);
    });

    test('parses boolean true and case-insensitive string "true"', () => {
      assert.strictEqual(parseTrustProxy(true), true);
      assert.strictEqual(parseTrustProxy('true'), true);
      assert.strictEqual(parseTrustProxy('TRUE'), true);
      assert.strictEqual(parseTrustProxy('True'), true);
    });

    test('parses integer hop counts from numbers and numeric strings', () => {
      assert.strictEqual(parseTrustProxy(0), 0);
      assert.strictEqual(parseTrustProxy(1), 1);
      assert.strictEqual(parseTrustProxy(2), 2);
      assert.strictEqual(parseTrustProxy('0'), 0);
      assert.strictEqual(parseTrustProxy('1'), 1);
      assert.strictEqual(parseTrustProxy('3'), 3);
    });

    test('parses Express predefined keywords and subnets/IPs', () => {
      assert.strictEqual(parseTrustProxy('loopback'), 'loopback');
      assert.strictEqual(parseTrustProxy('linklocal'), 'linklocal');
      assert.strictEqual(parseTrustProxy('uniquelocal'), 'uniquelocal');
      assert.strictEqual(parseTrustProxy('127.0.0.1'), '127.0.0.1');
      assert.strictEqual(parseTrustProxy('10.0.0.0/8'), '10.0.0.0/8');
      assert.strictEqual(parseTrustProxy('loopback, 10.0.0.0/8, 192.168.1.1'), 'loopback, 10.0.0.0/8, 192.168.1.1');
    });

    test('rejects negative numbers, decimals, and invalid values', () => {
      assert.throws(() => parseTrustProxy(-1), /hop count must be a non-negative integer/);
      assert.throws(() => parseTrustProxy('-1'), /Invalid TRUST_PROXY component/);
      assert.throws(() => parseTrustProxy(1.5), /hop count must be a non-negative integer/);
      assert.throws(() => parseTrustProxy('1.5'), /Invalid TRUST_PROXY component/);
      assert.throws(() => parseTrustProxy('invalid_keyword'), /Invalid TRUST_PROXY component/);
      assert.throws(() => parseTrustProxy('999.999.999.999'), /Invalid TRUST_PROXY component/);
      assert.throws(() => parseTrustProxy('10.0.0.0/35'), /Invalid TRUST_PROXY component/);
    });
  });

  describe('2. Express App Configuration Verification', () => {
    test('app applies trust proxy from config.trustProxy', () => {
      assert.strictEqual(app.get('trust proxy'), config.trustProxy);
    });
  });

  describe('3. Client IP Resolution Topology Verification', () => {
    test('does not trust X-Forwarded-For when trust proxy is false (zero-trust)', async () => {
      const testApp = express();
      testApp.set('trust proxy', false);
      testApp.get('/ip-test', (req, res) => {
        res.json({ ip: req.ip });
      });

      const server = await new Promise((resolve) => {
        const s = testApp.listen(0, () => resolve(s));
      });
      const port = server.address().port;

      try {
        const response = await fetch(`http://127.0.0.1:${port}/ip-test`, {
          headers: {
            'x-forwarded-for': '203.0.113.195',
          },
        });
        const data = await response.json();

        // Must NOT trust the forwarded header; must resolve to local loopback socket IP
        assert.notStrictEqual(data.ip, '203.0.113.195');
        assert.ok(data.ip === '127.0.0.1' || data.ip === '::ffff:127.0.0.1' || data.ip === '::1');
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    test('resolves client IP from X-Forwarded-For when trust proxy is set to 1 hop', async () => {
      const testApp = express();
      testApp.set('trust proxy', 1);
      testApp.get('/ip-test', (req, res) => {
        res.json({ ip: req.ip });
      });

      const server = await new Promise((resolve) => {
        const s = testApp.listen(0, () => resolve(s));
      });
      const port = server.address().port;

      try {
        const response = await fetch(`http://127.0.0.1:${port}/ip-test`, {
          headers: {
            'x-forwarded-for': '203.0.113.195',
          },
        });
        const data = await response.json();

        // Trusted single proxy hop correctly extracts client IP
        assert.strictEqual(data.ip, '203.0.113.195');
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    test('resolves client IP from X-Forwarded-For when trust proxy is set to "loopback"', async () => {
      const testApp = express();
      testApp.set('trust proxy', 'loopback');
      testApp.get('/ip-test', (req, res) => {
        res.json({ ip: req.ip });
      });

      const server = await new Promise((resolve) => {
        const s = testApp.listen(0, () => resolve(s));
      });
      const port = server.address().port;

      try {
        const response = await fetch(`http://127.0.0.1:${port}/ip-test`, {
          headers: {
            'x-forwarded-for': '198.51.100.42',
          },
        });
        const data = await response.json();

        assert.strictEqual(data.ip, '198.51.100.42');
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });

  describe('4. Rate Limiting Under Trusted Proxy Topology', () => {
    test('isolates rate-limiting buckets per forwarded client IP under trust proxy 1', async () => {
      const testApp = express();
      testApp.set('trust proxy', 1);

      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 2, // Limit each client IP to 2 requests per window
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: 'Too many requests' },
      });

      testApp.get('/limited-route', limiter, (req, res) => {
        res.json({ success: true, clientIp: req.ip });
      });

      const server = await new Promise((resolve) => {
        const s = testApp.listen(0, () => resolve(s));
      });
      const port = server.address().port;

      try {
        // Client A: Request 1 (should succeed)
        const resA1 = await fetch(`http://127.0.0.1:${port}/limited-route`, {
          headers: { 'x-forwarded-for': '198.51.100.10' },
        });
        assert.strictEqual(resA1.status, 200);

        // Client A: Request 2 (should succeed)
        const resA2 = await fetch(`http://127.0.0.1:${port}/limited-route`, {
          headers: { 'x-forwarded-for': '198.51.100.10' },
        });
        assert.strictEqual(resA2.status, 200);

        // Client A: Request 3 (should be blocked by rate limiter)
        const resA3 = await fetch(`http://127.0.0.1:${port}/limited-route`, {
          headers: { 'x-forwarded-for': '198.51.100.10' },
        });
        assert.strictEqual(resA3.status, 429);

        // Client B: Request 1 from distinct forwarded IP (must NOT be blocked by Client A's bucket)
        const resB1 = await fetch(`http://127.0.0.1:${port}/limited-route`, {
          headers: { 'x-forwarded-for': '198.51.100.20' },
        });
        assert.strictEqual(resB1.status, 200);
        const dataB1 = await resB1.json();
        assert.strictEqual(dataB1.clientIp, '198.51.100.20');
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });
});
