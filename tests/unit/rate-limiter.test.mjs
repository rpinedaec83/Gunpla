import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../../apps/api/dist/core/rate-limit.middleware.js';

test('RateLimiter Middleware', async (t) => {
  await t.test('allows requests within window and sets rate-limit headers', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 3 });
    const headers = {};
    const res = {
      setHeader: (key, val) => {
        headers[key] = val;
      }
    };
    let nextCalled = 0;
    const next = () => {
      nextCalled++;
    };

    // First request
    const req1 = {
      headers: {},
      socket: { remoteAddress: '192.168.1.50' }
    };
    limiter(req1, res, next);
    assert.equal(nextCalled, 1);
    assert.equal(headers['X-RateLimit-Limit'], 3);
    assert.equal(headers['X-RateLimit-Remaining'], 2);
    assert.ok(headers['X-RateLimit-Reset'] > 0);

    // Second request
    limiter(req1, res, next);
    assert.equal(nextCalled, 2);
    assert.equal(headers['X-RateLimit-Remaining'], 1);

    // Third request (at limit)
    limiter(req1, res, next);
    assert.equal(nextCalled, 3);
    assert.equal(headers['X-RateLimit-Remaining'], 0);
  });

  await t.test('blocks requests when max limit is exceeded with RFC 7807 problem', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2, message: 'Too many requests for test' });
    const headers = {};
    let problemStatus = null;
    let problemBody = null;

    const statusObj = {
      setHeader: (key, val) => {
        headers[key] = val;
        return statusObj;
      },
      json: (body) => {
        problemBody = body;
      }
    };
    const res = {
      setHeader: (key, val) => {
        headers[key] = val;
      },
      status: (code) => {
        problemStatus = code;
        return statusObj;
      }
    };

    let nextCalled = 0;
    const next = () => {
      nextCalled++;
    };

    const req = {
      headers: {},
      socket: { remoteAddress: '10.0.0.99' },
      originalUrl: '/api/v1/test',
      tenant: { slug: 'plamoscale' }
    };

    limiter(req, res, next); // 1st: ok
    limiter(req, res, next); // 2nd: ok
    assert.equal(nextCalled, 2);

    // 3rd request: exceeded
    limiter(req, res, next);
    assert.equal(nextCalled, 2, 'next() should not be called when limit exceeded');
    assert.equal(problemStatus, 429);
    assert.ok(problemBody);
    assert.equal(problemBody.status, 429);
    assert.ok(problemBody.type.includes('rate-limit-exceeded'));
  });

  await t.test('bypasses rate limiter when DISABLE_RATE_LIMIT=true is set', () => {
    process.env.DISABLE_RATE_LIMIT = 'true';
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    let nextCalled = 0;
    const next = () => {
      nextCalled++;
    };

    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    };
    const res = { setHeader: () => {} };

    limiter(req, res, next);
    limiter(req, res, next);
    limiter(req, res, next);

    assert.equal(nextCalled, 3, 'All requests should pass through when disabled');
    delete process.env.DISABLE_RATE_LIMIT;
  });
});
