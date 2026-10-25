import { Request, Response, NextFunction } from 'express';
import { sendProblem } from './problem-details';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, options.windowMs * 2).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiter in test mode if explicitly disabled
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const now = Date.now();
    let entry = store.get(ip);

    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + options.windowMs };
      store.set(ip, entry);
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', options.max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
      return next();
    }

    entry.count++;
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > options.max) {
      return sendProblem(
        req,
        res,
        429,
        'Demasiadas Peticiones',
        options.message || 'Has excedido el limite de peticiones permitido. Por favor espera antes de intentar nuevamente.',
        'rate-limit-exceeded'
      );
    }

    return next();
  };
}
