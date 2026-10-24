import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { seedPlatformDatabase, resolveLegacyPlamoscaleDir } from './seed/seed-legacy';
import { getDb } from './core/db';
import { resolveTenantMiddleware } from './core/tenant.middleware';
import { sendProblem } from './core/problem-details';
import { tenantsRouter } from './slices/tenants/tenants.slice';
import { authRouter } from './slices/auth-sso/auth.slice';
import { buildersRouter } from './slices/builders/builders.slice';
import { notificationsRouter } from './slices/notifications-resend/resend.slice';
import { catalogRouter } from './slices/catalog-scalemates/catalog.slice';
import { openApiSpec } from './openapi/openapi-spec';

dotenv.config();

export function createApp() {
  // Ensure seed data (2 tenants + 4 founding builders + 92 photos) is initialized
  seedPlatformDatabase(false);

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve preserved legacy images from plamoscale.com so all 92 photos work out of the box
  const legacyDir = resolveLegacyPlamoscaleDir();
  app.use(
    '/legacy-media/plamoscale/images',
    express.static(path.join(legacyDir, 'images'))
  );

  // OpenAPI 3.1 JSON & Swagger UI (/doc)
  app.get('/openapi.json', (_req: Request, res: Response) => {
    res.status(200).json(openApiSpec);
  });
  app.use('/doc', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Health & Readiness Endpoint
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    const db = getDb();
    res.status(200).json({
      status: 'ok',
      service: 'gunpla-plamoscale-central-api',
      version: '1.0.0',
      tenantsCount: db.tenants.length,
      tenants: db.tenants.map((t) => ({
        slug: t.slug,
        domain: t.domain,
        emailFrom: t.emailFrom
      })),
      usersCount: db.users.length,
      foundingBuildersCount: db.users.filter((u) => u.isFounder && u.username !== 'rpineda').length,
      seededPhotosCount: db.mediaAssets.length,
      kitsCount: db.kits ? db.kits.length : 0,
      paintsCount: db.paints ? db.paints.length : 0,
      authModes: ['local-credentials', 'google-oauth-oidc-sso'],
      emailProvider: 'resend.com',
      lastSeededAt: db.lastSeededAt,
      timestamp: new Date().toISOString()
    });
  });

  // Apply Multi-Tenant Context Resolution to all /api/v1/* tenant-scoped slices
  app.use('/api/v1', resolveTenantMiddleware);

  // Mount Vertical Slices
  app.use('/api/v1/tenants', tenantsRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/builders', buildersRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/catalog', catalogRouter);

  // Fallback 404 in RFC 7807 Problem Details format
  app.use((req: Request, res: Response) => {
    sendProblem(
      req,
      res,
      404,
      'Resource Not Found',
      `Route '${req.method} ${req.originalUrl}' does not exist on this API.`,
      'not-found'
    );
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  const app = createApp();
  app.listen(port, () => {
    console.log(`Central Multi-Tenant API running on http://localhost:${port} (Swagger UI at http://localhost:${port}/doc)`);
  });
}
