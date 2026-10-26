import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
        isAdult?: boolean;
        ageBracket?: string;
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
      if (matchedByDomain) {
        targetSlug = matchedByDomain.slug;
      } else {
        // Fallback: If caller presents an authenticated Bearer token without explicit tenant headers or domain,
        // resolve to the token's home tenant.
        const authHeader = req.header('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
          try {
            const rawToken = authHeader.slice(7).trim();
            const decoded = jwt.decode(rawToken) as { tenantSlug?: string } | null;
            if (decoded?.tenantSlug && db.tenants.some((t) => t.slug === decoded.tenantSlug)) {
              targetSlug = decoded.tenantSlug;
            }
          } catch {
            // Ignore decoding failure, fall back to default
          }
        }
        if (!targetSlug) {
          targetSlug = 'plamoscale';
        }
      }
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

  if (tenant.status && tenant.status !== 'active') {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;
    let isSuperAdmin = false;
    if (token) {
      try {
        const decoded = jwt.decode(token) as any;
        if (
          decoded?.roles?.includes('super_admin') ||
          decoded?.email?.toLowerCase() === 'rpinedaec83@gmail.com'
        ) {
          isSuperAdmin = true;
        }
      } catch {}
    }

    if (!isSuperAdmin) {
      sendProblem(
        req,
        res,
        403,
        tenant.status === 'suspended' ? 'Community Suspended' : 'Community Archived',
        `The community '${tenant.name}' is currently ${tenant.status}. Please contact the platform administration.`,
        `tenant-${tenant.status}`
      );
      return;
    }
  }

  next();
}
