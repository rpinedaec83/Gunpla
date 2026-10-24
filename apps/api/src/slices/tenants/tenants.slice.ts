import { Router, Request, Response } from 'express';
import { PaginatedResult, Tenant } from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';

export const tenantsRouter = Router();

tenantsRouter.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit || '20'), 10) || 20, 1),
    100
  );
  const offset = Math.max(parseInt(String(req.query.offset || '0'), 10) || 0, 0);

  const items = db.tenants.slice(offset, offset + limit);
  const result: PaginatedResult<Tenant> = {
    items,
    nextCursor:
      offset + limit < db.tenants.length
        ? Buffer.from(String(offset + limit)).toString('base64')
        : null,
    hasMore: offset + limit < db.tenants.length,
    totalCount: db.tenants.length
  };

  res.status(200).json(result);
});

tenantsRouter.get('/current', (req: Request, res: Response) => {
  if (!req.tenant) {
    sendProblem(
      req,
      res,
      404,
      'Tenant Not Resolved',
      'Active tenant could not be resolved for this request.',
      'tenant-not-resolved'
    );
    return;
  }

  res.status(200).json(req.tenant);
});

tenantsRouter.post('/', (req: Request, res: Response) => {
  const { slug, name, domain, emailFrom, contactEmail, tagline, allowedCategories } =
    req.body || {};

  if (!slug || !name || !domain) {
    sendProblem(
      req,
      res,
      400,
      'Validation Error',
      'Fields slug, name, and domain are required to register a tenant.',
      'validation-error',
      [
        { name: 'slug', reason: 'Required unique slug' },
        { name: 'name', reason: 'Required portal display name' },
        { name: 'domain', reason: 'Required primary domain' }
      ]
    );
    return;
  }

  const db = getDb();
  const normalizedSlug = String(slug).trim().toLowerCase();
  if (db.tenants.some((t) => t.slug === normalizedSlug || t.domain === domain)) {
    sendProblem(
      req,
      res,
      409,
      'Duplicate Tenant',
      `Tenant with slug '${normalizedSlug}' or domain '${domain}' already exists.`,
      'duplicate-tenant'
    );
    return;
  }

  const newTenant: Tenant = {
    id: `tenant-${normalizedSlug}`,
    slug: normalizedSlug,
    name: String(name),
    domain: String(domain),
    emailFrom: emailFrom || `${name} <noreply@${domain}>`,
    contactEmail: contactEmail || `contact@${domain}`,
    tagline: tagline || `${name} Scale Modeling Community`,
    mission: req.body.mission || '',
    vision: req.body.vision || '',
    allowedCategories: Array.isArray(allowedCategories)
      ? allowedCategories
      : ['gunpla-mecha'],
    themeConfig: req.body.themeConfig || {
      primaryColor: '#1e293b',
      accentColor: '#3b82f6',
      surfaceColor: '#0f172a',
      logoText: String(name).toUpperCase(),
      uxPatternId: 'uxp-01-modern-app-shell-layout'
    },
    communityLinks: req.body.communityLinks || {},
    createdAt: new Date().toISOString()
  };

  db.tenants.push(newTenant);
  saveDb(db);

  res.status(201).location(`/api/v1/tenants/${newTenant.slug}`).json(newTenant);
});
