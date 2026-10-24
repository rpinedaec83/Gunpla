import { Request, Response, NextFunction } from 'express';
import { Tenant } from '@gunpla/shared';
import { getDb } from './db';
import { sendProblem } from './problem-details';

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      user?: {
        id: string;
        username: string;
        email: string;
        roles: string[];
        tenantSlug: string;
      };
    }
  }
}

export function resolveTenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const db = getDb();
  const headerSlug = req.header('X-Tenant-Slug')?.trim().toLowerCase();
  const querySlug =
    typeof req.query.tenant === 'string'
      ? req.query.tenant.trim().toLowerCase()
      : undefined;
  const hostHeader = (req.hostname || req.header('host') || '').toLowerCase();

  let targetSlug = headerSlug || querySlug;

  if (!targetSlug) {
    if (hostHeader.includes('gunplajunkies')) {
      targetSlug = 'gunplajunkies';
    } else if (hostHeader.includes('plamoscale')) {
      targetSlug = 'plamoscale';
    } else {
      const matchedByDomain = db.tenants.find(
        (t) => t.domain.toLowerCase() === hostHeader
      );
      targetSlug = matchedByDomain ? matchedByDomain.slug : 'plamoscale';
    }
  }

  const tenant = db.tenants.find((t) => t.slug === targetSlug);
  if (!tenant) {
    sendProblem(
      req,
      res,
      404,
      'Tenant Not Found',
      `No registered tenant portal matches identifier '${targetSlug}'.`,
      'tenant-not-found'
    );
    return;
  }

  req.tenant = tenant;
  res.setHeader('X-Resolved-Tenant', tenant.slug);
  next();
}
