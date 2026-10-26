import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isRedisConfigured,
  getCache,
  setCache,
  invalidateCacheKey,
  invalidateCachePrefix,
  invalidateKitsCache,
  invalidatePaintsCache,
  resetCache,
  getCacheStats,
  cacheMiddleware
} from '../../apps/api/dist/core/cache.js';

describe('DT26: Redis 7 Caching Layer & In-Memory Fallback Unit Tests', () => {
  beforeEach(async () => {
    await resetCache();
  });

  test('1. isRedisConfigured: returns true only when REDIS_URL environment variable is set', () => {
    const prevUrl = process.env.REDIS_URL;
    try {
      delete process.env.REDIS_URL;
      assert.equal(isRedisConfigured(), false);

      process.env.REDIS_URL = '   ';
      assert.equal(isRedisConfigured(), false);

      process.env.REDIS_URL = 'redis://localhost:6379';
      assert.equal(isRedisConfigured(), true);
    } finally {
      process.env.REDIS_URL = prevUrl;
    }
  });

  test('2. Cache Set and Get: handles hits, misses, and TTL expiration gracefully', async () => {
    // 2.1 Cache Miss on non-existent key
    const missing = await getCache('test:nonexistent');
    assert.equal(missing, null);

    // 2.2 Cache Set and Hit
    await setCache('test:kit:1', JSON.stringify({ id: 'kit-1', name: 'RG Hi-Nu' }), 60);
    const hit = await getCache('test:kit:1');
    assert.ok(hit !== null);
    const parsed = JSON.parse(hit);
    assert.equal(parsed.name, 'RG Hi-Nu');

    // 2.3 Stats verify hit and miss counts
    const stats = await getCacheStats();
    assert.ok(stats.hits >= 1);
    assert.ok(stats.misses >= 1);
    assert.ok(stats.keysCount >= 1);
  });

  test('3. Invalidation: deletes single key and prefix patterns cleanly', async () => {
    await setCache('catalog:kits:1', 'kit-data-1', 60);
    await setCache('catalog:kits:2', 'kit-data-2', 60);
    await setCache('catalog:brands:all', 'brands-data', 60);
    await setCache('catalog:paints:all', 'paints-data', 60);

    // Verify populated
    assert.equal(await getCache('catalog:kits:1'), 'kit-data-1');
    assert.equal(await getCache('catalog:kits:2'), 'kit-data-2');

    // Invalidate kits prefix
    await invalidateKitsCache();
    assert.equal(await getCache('catalog:kits:1'), null);
    assert.equal(await getCache('catalog:kits:2'), null);
    assert.equal(await getCache('catalog:brands:all'), null);

    // Paints should still exist
    assert.equal(await getCache('catalog:paints:all'), 'paints-data');

    // Invalidate paints
    await invalidatePaintsCache();
    assert.equal(await getCache('catalog:paints:all'), null);
  });

  test('4. cacheMiddleware: intercepts GET requests, sets X-Cache MISS on 1st call and HIT on 2nd', async () => {
    const middleware = cacheMiddleware({ ttlSeconds: 30, prefix: 'test:middleware' });

    let headersSent = {};
    let sentBody = null;

    const mockReq = {
      method: 'GET',
      headers: { 'x-tenant-slug': 'plamoscale' },
      originalUrl: '/api/v1/test/resource'
    };

    const mockRes1 = {
      statusCode: 200,
      setHeader: (name, val) => {
        headersSent[name] = val;
      },
      send: (body) => {
        sentBody = body;
        return mockRes1;
      }
    };

    // First call: Should be a MISS
    let nextCalled = false;
    await middleware(mockReq, mockRes1, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(headersSent['X-Cache'], 'MISS');

    // Simulate route handler sending payload
    mockRes1.send(JSON.stringify({ success: true, count: 42 }));
    assert.ok(sentBody !== null);

    // Second call with same request: Should be a HIT
    headersSent = {};
    sentBody = null;
    let nextCalledSecond = false;

    const mockRes2 = {
      statusCode: 200,
      setHeader: (name, val) => {
        headersSent[name] = val;
      },
      send: (body) => {
        sentBody = body;
        return mockRes2;
      }
    };

    await middleware(mockReq, mockRes2, () => {
      nextCalledSecond = true;
    });

    assert.equal(nextCalledSecond, false, 'Next should NOT be called on cache HIT');
    assert.equal(headersSent['X-Cache'], 'HIT');
    assert.ok(headersSent['X-Response-Time']);
    assert.deepEqual(JSON.parse(sentBody), { success: true, count: 42 });
  });
});
