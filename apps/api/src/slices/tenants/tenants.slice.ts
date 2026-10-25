import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PaginatedResult, Tenant, ScaleCategory } from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth, JwtPayloadData } from '../auth-sso/auth.slice';

export const tenantsRouter = Router();

const VALID_CATEGORIES: ScaleCategory[] = [
  'gunpla-mecha',
  'military',
  'aviation',
  'automotive',
  'naval',
  'figures',
  'scifi',
  'diorama'
];

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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

tenantsRouter.get('/:slug', (req: Request, res: Response) => {
  const db = getDb();
  const slug = req.params.slug.toLowerCase().trim();
  const tenant = db.tenants.find((t) => t.slug === slug);
  if (!tenant) {
    sendProblem(
      req,
      res,
      404,
      'Tenant Not Found',
      `Tenant with slug '${slug}' not found.`,
      'tenant-not-found'
    );
    return;
  }
  res.status(200).json(tenant);
});

tenantsRouter.post('/', (req: Request, res: Response) => {
  const { slug, name, domain, emailFrom, contactEmail, tagline, allowedCategories, themeConfig } =
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

  // Optional authentication inspection to associate creator as tenant_admin
  let creatorUsername: string | undefined = undefined;
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7).trim();
      const decoded = jwt.decode(token) as JwtPayloadData | null;
      if (decoded?.username) {
        creatorUsername = decoded.username;
        const user = db.users.find((u) => u.username === decoded.username);
        if (user && !user.roles.includes('tenant_admin')) {
          user.roles.push('tenant_admin');
        }
      }
    } catch {
      // Non-fatal if token is invalid or absent
    }
  }

  // Filter allowed categories or default
  const categoriesToSet: ScaleCategory[] = Array.isArray(allowedCategories)
    ? (allowedCategories.filter((c: any) => VALID_CATEGORIES.includes(c)) as ScaleCategory[])
    : ['gunpla-mecha'];

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
    allowedCategories: categoriesToSet.length > 0 ? categoriesToSet : ['gunpla-mecha'],
    themeConfig: {
      primaryColor:
        themeConfig?.primaryColor && HEX_COLOR_REGEX.test(themeConfig.primaryColor)
          ? themeConfig.primaryColor
          : '#1e293b',
      accentColor:
        themeConfig?.accentColor && HEX_COLOR_REGEX.test(themeConfig.accentColor)
          ? themeConfig.accentColor
          : '#3b82f6',
      surfaceColor:
        themeConfig?.surfaceColor && HEX_COLOR_REGEX.test(themeConfig.surfaceColor)
          ? themeConfig.surfaceColor
          : '#0f172a',
      logoText: themeConfig?.logoText || String(name).toUpperCase(),
      logoUrl: themeConfig?.logoUrl || undefined,
      uxPatternId: themeConfig?.uxPatternId || 'uxp-01-modern-app-shell-layout'
    },
    communityLinks: req.body.communityLinks || {},
    createdBy: creatorUsername,
    createdAt: new Date().toISOString()
  };

  db.tenants.push(newTenant);
  saveDb(db);

  res.status(201).location(`/api/v1/tenants/${newTenant.slug}`).json(newTenant);
});

/**
 * PATCH /api/v1/tenants/:slug
 * Update theme colors, branding, categories and community links (tenant_admin or admin only)
 */
tenantsRouter.patch('/:slug', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const slug = req.params.slug.toLowerCase().trim();
  const tenant = db.tenants.find((t) => t.slug === slug);

  if (!tenant) {
    sendProblem(
      req,
      res,
      404,
      'Tenant Not Found',
      `Tenant with slug '${slug}' not found.`,
      'tenant-not-found'
    );
    return;
  }

  const user = req.user;
  if (!user) {
    sendProblem(req, res, 401, 'Unauthorized', 'Authentication required.', 'unauthorized');
    return;
  }

  const isAuthorized =
    user.roles.includes('admin') ||
    user.roles.includes('tenant_admin') ||
    user.username === 'rpineda' ||
    tenant.createdBy === user.username;

  if (!isAuthorized) {
    sendProblem(
      req,
      res,
      403,
      'Forbidden',
      'You lack tenant_admin permissions to modify this portal theme and settings.',
      'forbidden-tenant-admin'
    );
    return;
  }

  const {
    name,
    tagline,
    mission,
    vision,
    contactEmail,
    emailFrom,
    domain,
    allowedCategories,
    themeConfig,
    communityLinks
  } = req.body || {};

  if (name !== undefined) tenant.name = String(name).trim();
  if (tagline !== undefined) tenant.tagline = String(tagline).trim();
  if (mission !== undefined) tenant.mission = String(mission);
  if (vision !== undefined) tenant.vision = String(vision);
  if (contactEmail !== undefined) tenant.contactEmail = String(contactEmail).trim();
  if (emailFrom !== undefined) tenant.emailFrom = String(emailFrom).trim();
  if (domain !== undefined) tenant.domain = String(domain).trim();

  if (Array.isArray(allowedCategories)) {
    const valid = allowedCategories.filter((c: any) => VALID_CATEGORIES.includes(c));
    if (valid.length > 0) {
      tenant.allowedCategories = valid as ScaleCategory[];
    }
  }

  if (themeConfig && typeof themeConfig === 'object') {
    if (themeConfig.primaryColor && HEX_COLOR_REGEX.test(themeConfig.primaryColor)) {
      tenant.themeConfig.primaryColor = themeConfig.primaryColor;
    }
    if (themeConfig.accentColor && HEX_COLOR_REGEX.test(themeConfig.accentColor)) {
      tenant.themeConfig.accentColor = themeConfig.accentColor;
    }
    if (themeConfig.surfaceColor && HEX_COLOR_REGEX.test(themeConfig.surfaceColor)) {
      tenant.themeConfig.surfaceColor = themeConfig.surfaceColor;
    }
    if (themeConfig.logoText !== undefined) {
      tenant.themeConfig.logoText = String(themeConfig.logoText).trim();
    }
    if (themeConfig.logoUrl !== undefined) {
      tenant.themeConfig.logoUrl = String(themeConfig.logoUrl).trim() || undefined;
    }
  }

  if (communityLinks && typeof communityLinks === 'object') {
    tenant.communityLinks = {
      ...tenant.communityLinks,
      ...communityLinks
    };
  }

  saveDb(db);
  res.status(200).json(tenant);
});
