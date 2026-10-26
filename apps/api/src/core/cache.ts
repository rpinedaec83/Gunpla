import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

export interface CacheStats {
  engine: 'Redis 7' | 'in-memory-lru';
  configured: boolean;
  connected: boolean;
  hits: number;
  misses: number;
  keysCount: number;
}

let redisClient: Redis | null = null;
let isConnected = false;
let hitsCount = 0;
let missesCount = 0;

// In-memory fallback cache when Redis is offline or not configured
interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}
const memoryCache = new Map<string, MemoryCacheEntry>();

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0);
}

export function isRedisConnected(): boolean {
  return isConnected;
}

export function getRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }
  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL!, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        connectTimeout: 3000,
        retryStrategy: (times) => {
          if (times > 3) return null; // Stop retrying after 3 attempts
          return Math.min(times * 500, 2000);
        }
      });

      redisClient.on('connect', () => {
        isConnected = true;
        console.log('[Redis] Connected successfully to Redis 7.');
      });

      redisClient.on('ready', () => {
        isConnected = true;
      });

      redisClient.on('error', (err) => {
        isConnected = false;
        // Suppress noisy reconnection logs in development or test environments
        if (process.env.NODE_ENV !== 'test') {
          console.warn('[Redis] Connection warning (using in-memory fallback):', err.message);
        }
      });

      redisClient.on('close', () => {
        isConnected = false;
      });
    } catch (err: any) {
      console.warn('[Redis] Initialization error (using in-memory fallback):', err.message);
      redisClient = null;
      isConnected = false;
    }
  }
  return redisClient;
}

/**
 * Initializes the Redis connection if configured
 */
export async function initRedis(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await client.connect();
    isConnected = true;
    return true;
  } catch (err: any) {
    isConnected = false;
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Redis] Could not connect on startup; using in-memory fallback:', err.message);
    }
    return false;
  }
}

/**
 * Retrieves a string value from Redis or memory cache
 */
export async function getCache(key: string): Promise<string | null> {
  const fullKey = `gunpla:${key}`;
  const client = getRedisClient();

  if (client && isConnected) {
    try {
      const val = await client.get(fullKey);
      if (val !== null) {
        hitsCount++;
        return val;
      }
      missesCount++;
      return null;
    } catch {
      // Fallback to memory on Redis read error
    }
  }

  // Memory fallback
  const entry = memoryCache.get(fullKey);
  if (entry) {
    if (Date.now() <= entry.expiresAt) {
      hitsCount++;
      return entry.value;
    }
    memoryCache.delete(fullKey);
  }
  missesCount++;
  return null;
}

/**
 * Stores a string value into Redis or memory cache with TTL
 */
export async function setCache(key: string, value: string, ttlSeconds: number): Promise<void> {
  const fullKey = `gunpla:${key}`;
  const client = getRedisClient();

  if (client && isConnected) {
    try {
      await client.set(fullKey, value, 'EX', ttlSeconds);
      return;
    } catch {
      // Fallback to memory on Redis write error
    }
  }

  // Memory fallback
  memoryCache.set(fullKey, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });

  // Simple memory cleanup if map grows too large (> 500 keys)
  if (memoryCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of memoryCache.entries()) {
      if (now > v.expiresAt) {
        memoryCache.delete(k);
      }
    }
  }
}

/**
 * Deletes all keys matching a prefix
 */
export async function invalidateCachePrefix(prefix: string): Promise<number> {
  const searchPattern = `gunpla:${prefix}*`;
  let count = 0;
  const client = getRedisClient();

  if (client && isConnected) {
    try {
      const keys = await client.keys(searchPattern);
      if (keys.length > 0) {
        await client.del(...keys);
        count += keys.length;
      }
    } catch (err: any) {
      console.warn('[Redis] Key invalidation error:', err.message);
    }
  }

  // Also clean memory cache matching prefix
  for (const k of Array.from(memoryCache.keys())) {
    if (k.startsWith(`gunpla:${prefix}`)) {
      memoryCache.delete(k);
      count++;
    }
  }

  return count;
}

/**
 * Deletes a single cache key
 */
export async function invalidateCacheKey(key: string): Promise<boolean> {
  const fullKey = `gunpla:${key}`;
  let removed = false;
  const client = getRedisClient();

  if (client && isConnected) {
    try {
      const res = await client.del(fullKey);
      if (res > 0) removed = true;
    } catch {}
  }

  if (memoryCache.has(fullKey)) {
    memoryCache.delete(fullKey);
    removed = true;
  }

  return removed;
}

/**
 * Helper to invalidate all kits and catalog queries
 */
export async function invalidateKitsCache(): Promise<void> {
  await invalidateCachePrefix('catalog:kits');
  await invalidateCachePrefix('catalog:brands');
}

/**
 * Helper to invalidate all paints queries
 */
export async function invalidatePaintsCache(): Promise<void> {
  await invalidateCachePrefix('catalog:paints');
}

/**
 * Helper to invalidate community feeds
 */
export async function invalidateCommunityCache(): Promise<void> {
  await invalidateCachePrefix('community:feed');
}

/**
 * Resets all cache keys and counters (for testing and maintenance)
 */
export async function resetCache(): Promise<void> {
  hitsCount = 0;
  missesCount = 0;
  memoryCache.clear();
  const client = getRedisClient();
  if (client && isConnected) {
    try {
      const keys = await client.keys('gunpla:*');
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch {}
  }
}

/**
 * Returns diagnostic statistics for the cache layer
 */
export async function getCacheStats(): Promise<CacheStats> {
  const configured = isRedisConfigured();
  const connected = isConnected;
  let keysCount = memoryCache.size;

  const client = getRedisClient();
  if (client && connected) {
    try {
      const keys = await client.keys('gunpla:*');
      keysCount = keys.length;
    } catch {}
  }

  return {
    engine: configured && connected ? 'Redis 7' : 'in-memory-lru',
    configured,
    connected,
    hits: hitsCount,
    misses: missesCount,
    keysCount
  };
}

/**
 * Express middleware for declarative caching of read-only GET endpoints
 */
export function cacheMiddleware(options: { ttlSeconds: number; prefix: string }) {
  const { ttlSeconds, prefix } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const tenantSlug = (req as any).tenantSlug || req.headers['x-tenant-slug'] || 'default';
    const cacheKey = `${prefix}:${tenantSlug}:${req.originalUrl}`;
    const startMs = Date.now();

    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData !== null) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Engine', isConnected ? 'Redis-7' : 'Memory-LRU');
        res.setHeader('X-Response-Time', `${Date.now() - startMs}ms`);
        res.setHeader('Content-Type', 'application/json');
        return res.send(cachedData);
      }
    } catch (err: any) {
      console.warn('[Cache Middleware Error]:', err.message);
    }

    // Intercept res.send/res.json to populate cache on MISS
    const originalSend = res.send.bind(res);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-Engine', isConnected ? 'Redis-7' : 'Memory-LRU');

    res.send = (body: any): Response => {
      // Only cache successful 200 OK responses
      if (res.statusCode === 200 && body) {
        const payloadToCache = typeof body === 'string' ? body : JSON.stringify(body);
        setCache(cacheKey, payloadToCache, ttlSeconds).catch(() => {});
      }
      res.setHeader('X-Response-Time', `${Date.now() - startMs}ms`);
      return originalSend(body);
    };

    next();
  };
}
