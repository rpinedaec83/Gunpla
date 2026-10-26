import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import {
  BuildProjectRecord,
  BuildStep,
  BuildStepStage,
  BuildComment,
  CreateBuildProjectRequest,
  UpdateBuildProjectRequest,
  CreateBuildStepRequest,
  CreateBuildCommentRequest,
  MediaAsset,
  ScaleCategory,
  GenerateSpecCardRequest,
  GenerateSpecCardResponse,
  WhatsAppInquiryType,
  WhatsAppInquiryRequest,
  WhatsAppInquiryResponse,
  BuildExpenseItem,
  BuildExpenseCategory,
  ExpenseCurrency,
  BuildCostSummary,
  AddExpenseRequest,
  BuildCostResponse,
  calculateBuildCostSummary,
  SubassemblyCard,
  SubassemblyStage,
  SubassemblyType,
  CreateSubassemblyDto,
  UpdateSubassemblyDto,
  SubassemblyOverallProgress,
  generateDefaultSubassemblies,
  calculateSubassemblyOverallProgress,
  generateSubassemblyWorksheetHtml
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';
import { uploadMedia, getStorageDiagnostics } from '../../core/storage';
import { sendTenantEmailViaResend } from '../notifications-resend/resend.slice';
import { dispatchNotification } from '../notifications-bell/notifications.slice';

export const buildsRouter = Router();
export const mediaRouter = Router();

const UPLOADS_DIR = path.resolve(__dirname, '../../../data/uploads');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Media Upload Pipeline (Cap: 15MB) - Dual Engine: Cloudflare R2 / Local Disk
// ---------------------------------------------------------------------------

async function handleUpload(req: Request, res: Response) {
  const user = req.user!;
  const { fileName, dataBase64, category, title, altText, buildId } = req.body;

  if (!dataBase64 || typeof dataBase64 !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Datos de Imagen Requeridos',
      'Debe proporcionar dataBase64 con la imagen a subir.',
      'validation-error'
    );
  }

  // Enforce 15MB file size limit (Rule 5: Memory and bounded upload protection)
  const estimatedSizeBytes = (dataBase64.length * 3) / 4;
  if (estimatedSizeBytes > 15 * 1024 * 1024) {
    return sendProblem(
      req,
      res,
      413,
      'Archivo Demasiado Grande',
      'El tamaño máximo por imagen es de 15 MB.',
      'payload-too-large'
    );
  }

  const matches = dataBase64.match(/^data:image\/([a-zA-Z0-9-+]+);base64,(.+)$/);
  const ext = matches ? matches[1].replace('jpeg', 'jpg') : 'jpg';
  const rawBase64 = matches ? matches[2] : dataBase64;
  const mimeType = matches ? `image/${matches[1]}` : (ext === 'png' ? 'image/png' : 'image/jpeg');

  const mediaId = `media-${randomUUID().slice(0, 8)}`;
  const cleanFileName = `${mediaId}.${ext}`;
  const buffer = Buffer.from(rawBase64, 'base64');

  // Cloudflare R2 / S3 upload with local fallback
  const uploadResult = await uploadMedia(
    buffer,
    cleanFileName,
    mimeType,
    (category as string) || 'gunpla-mecha'
  );

  const now = new Date().toISOString();

  const mediaAsset: MediaAsset = {
    id: mediaId,
    builderUsername: user.username,
    buildId: buildId || undefined,
    fileName: fileName || cleanFileName,
    thumbUrl: uploadResult.thumbUrl,
    fullUrl: uploadResult.publicUrl,
    category: (category as ScaleCategory) || 'gunpla-mecha',
    title: title || `${user.username} - Upload`,
    altText: altText || `Scale model photo uploaded by ${user.username}`,
    createdAt: now
  };

  const db = getDb();
  db.mediaAssets.push(mediaAsset);
  saveDb(db);

  return res.status(201).json({
    media: mediaAsset,
    thumbUrl: uploadResult.thumbUrl,
    fullUrl: uploadResult.publicUrl,
    storageProvider: uploadResult.provider,
    format: uploadResult.format,
    compressionRatio: uploadResult.compressionRatio,
    originalSizeBytes: uploadResult.originalSizeBytes,
    optimizedSizeBytes: uploadResult.sizeBytes,
    dimensions: uploadResult.dimensions
  });
}

/**
 * Diagnostic & Status of storage engine (Cloudflare R2 or local disk)
 */
mediaRouter.get('/storage-diagnostics', (_req: Request, res: Response) => {
  res.json(getStorageDiagnostics());
});

/**
 * POST /api/v1/media/upload or POST /api/v1/builds/upload
 * Photo upload endpoint supporting base64 data URIs or binary buffers
 */
mediaRouter.post('/upload', requireAuth, handleUpload);
buildsRouter.post('/upload', requireAuth, handleUpload);
buildsRouter.get('/storage-diagnostics', (_req: Request, res: Response) => {
  res.json(getStorageDiagnostics());
});

// ---------------------------------------------------------------------------
// Build Logs Feed & Queries
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/builds
 * Scoped by active tenant allowedCategories!
 * Query params: category, status, username, search, limit, offset
 */
buildsRouter.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const tenant = req.tenant;

  let allowedCategories = tenant ? tenant.allowedCategories : [];
  if (allowedCategories.length === 0) {
    allowedCategories = ['gunpla-mecha', 'military', 'aviation', 'automotive', 'naval', 'figures', 'scifi', 'diorama'];
  }

  let filtered = db.builds.filter(b => allowedCategories.includes(b.category));

  const categoryParam = req.query.category as ScaleCategory | undefined;
  const statusParam = req.query.status as string | undefined;
  const usernameParam = req.query.username as string | undefined;
  const searchParam = (req.query.search as string | undefined)?.toLowerCase().trim();

  if (categoryParam) {
    if (!allowedCategories.includes(categoryParam)) {
      return res.json({ items: [], totalCount: 0 });
    }
    filtered = filtered.filter(b => b.category === categoryParam);
  }

  if (statusParam) {
    filtered = filtered.filter(b => b.status === statusParam);
  }

  if (usernameParam) {
    filtered = filtered.filter(b => b.username.toLowerCase() === usernameParam.toLowerCase());
  }

  if (searchParam) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(searchParam) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(searchParam)) ||
      b.tags.some(t => t.toLowerCase().includes(searchParam))
    );
  }

  // Populate kit metadata
  const populated = filtered.map(b => ({
    ...b,
    kit: db.kits.find(k => k.id === b.kitId)
  }));

  return res.json({
    items: populated,
    totalCount: populated.length
  });
});

/**
 * GET /api/v1/builds/:slugOrId
 */
buildsRouter.get('/:slugOrId', (req: Request, res: Response) => {
  const db = getDb();
  const build = db.builds.find(b => b.id === req.params.slugOrId || b.slug === req.params.slugOrId);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitácora No Encontrada',
      `No se encontró el proyecto de construcción '${req.params.slugOrId}'.`,
      'not-found'
    );
  }

  // Increment view count
  build.viewCount += 1;
  saveDb(db);

  // Populate kit and paint details
  const populatedKit = db.kits.find(k => k.id === build.kitId);
  const populatedSteps = build.steps.map(step => ({
    ...step,
    paintUsages: step.paintUsages.map(usage => ({
      ...usage,
      paint: db.paints.find(p => p.id === usage.paintId)
    }))
  }));

  return res.json({
    ...build,
    kit: populatedKit,
    steps: populatedSteps
  });
});

export function generateWhatsAppInquiry(params: {
  builderUsername: string;
  builderDisplayName: string;
  targetWhatsapp: string;
  itemTitle: string;
  tenantName: string;
  inquiryType: WhatsAppInquiryType;
  clientName?: string;
  itemUrl?: string;
}): WhatsAppInquiryResponse {
  const {
    builderUsername,
    builderDisplayName,
    targetWhatsapp,
    itemTitle,
    tenantName,
    inquiryType,
    clientName,
    itemUrl
  } = params;

  let message = '';
  const greeting = clientName
    ? `¡Hola ${builderDisplayName}! Soy ${clientName}.`
    : `¡Hola ${builderDisplayName}!`;

  switch (inquiryType) {
    case 'paint_recipe':
      message = `${greeting} Vi tu obra "${itemTitle}" en ${tenantName}. Me encantó el acabado y quería consultarte qué recetas de pintura o diluciones utilizaste. ¿Podrías darme algunos consejos?`;
      break;
    case 'custom_commission':
      message = `${greeting} Vi tu trabajo en "${itemTitle}" en ${tenantName} y me interesa cotizar un encargo de pintura / armado personalizado de estilo similar. ¿Tienes cupos disponibles en tu taller?`;
      break;
    case 'purchase_build':
      message = `${greeting} Te escribo desde ${tenantName} porque estoy muy interesado en adquirir o consultar si tienes a la venta tu maqueta terminada "${itemTitle}". ¿Está disponible?`;
      break;
    case 'general':
    default:
      message = `${greeting} Vi tu maqueta "${itemTitle}" en ${tenantName} y quería hacerte una consulta sobre tu proceso de construcción.`;
      break;
  }

  if (itemUrl) {
    message += ` Link: ${itemUrl}`;
  }

  let whatsappUrl = '';
  if (targetWhatsapp.startsWith('https://chat.whatsapp.com/')) {
    whatsappUrl = targetWhatsapp;
  } else {
    const cleanDigits = targetWhatsapp.replace(/[^0-9]/g, '');
    whatsappUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
  }

  return {
    builderUsername,
    builderDisplayName,
    targetWhatsapp,
    whatsappUrl,
    prefilledMessage: message,
    inquiryType
  };
}

/**
 * GET /api/v1/builds/:slugOrId/whatsapp-inquiry
 * Generate prefilled WhatsApp deep-link to inquire with the modeler about this build
 */
buildsRouter.get('/:slugOrId/whatsapp-inquiry', (req: Request, res: Response) => {
  const db = getDb();
  const build = db.builds.find(
    (b) => b.id === req.params.slugOrId || b.slug === req.params.slugOrId
  );

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitácora No Encontrada',
      `No se encontró el proyecto de construcción '${req.params.slugOrId}'.`,
      'not-found'
    );
  }

  const inquiryType = (req.query.inquiryType as WhatsAppInquiryType) || 'general';
  const clientName = (req.query.clientName as string) || '';
  const tenantSlug = req.tenant ? req.tenant.slug : 'gunplajunkies';
  const tenantName = tenantSlug === 'plamoscale' ? 'PlamoScale' : 'GunplaJunkies';

  const author = db.users.find(
    (u) => u.id === build.userId || u.username === build.username
  );
  const commBuilder = (db.commissionBuilders || []).find(
    (cb) => cb.username === build.username
  );

  const targetWhatsapp =
    author?.whatsapp || commBuilder?.whatsappUrl || '+51 987 654 321';
  const builderDisplayName =
    author?.displayName || build.userDisplayName || build.username;

  const result = generateWhatsAppInquiry({
    builderUsername: build.username,
    builderDisplayName,
    targetWhatsapp,
    itemTitle: build.title,
    tenantName,
    inquiryType,
    clientName,
    itemUrl: `https://${
      tenantSlug === 'plamoscale' ? 'www.plamoscale.com' : 'www.gunplajunkies.com'
    }#build-${build.slug}`
  });

  return res.json(result);
});

/**
 * POST /api/v1/builds/whatsapp-inquiry
 * Generate prefilled WhatsApp deep-link from arbitrary showcase or gallery item
 */
buildsRouter.post('/whatsapp-inquiry', (req: Request, res: Response) => {
  const { builderUsername, itemTitle, inquiryType, clientName, itemUrl } = req.body || {};
  if (!builderUsername || !itemTitle) {
    return sendProblem(
      req,
      res,
      400,
      'Parámetros Requeridos Faltantes',
      'Se requieren los campos builderUsername y itemTitle.'
    );
  }

  const db = getDb();
  const cleanUname = String(builderUsername).replace(/^@/, '').toLowerCase();
  const author = db.users.find(
    (u) => u.username.toLowerCase() === cleanUname
  );
  const commBuilder = (db.commissionBuilders || []).find(
    (cb) => cb.username.toLowerCase() === cleanUname
  );

  const tenantSlug = req.tenant ? req.tenant.slug : 'gunplajunkies';
  const tenantName = tenantSlug === 'plamoscale' ? 'PlamoScale' : 'GunplaJunkies';

  const targetWhatsapp =
    author?.whatsapp || commBuilder?.whatsappUrl || '+51 987 654 321';
  const builderDisplayName =
    author?.displayName || builderUsername;

  const result = generateWhatsAppInquiry({
    builderUsername,
    builderDisplayName,
    targetWhatsapp,
    itemTitle,
    tenantName,
    inquiryType: (inquiryType as WhatsAppInquiryType) || 'general',
    clientName,
    itemUrl
  });

  return res.json(result);
});

/**
 * POST /api/v1/builds/:slugOrId/spec-card
 * Generate printable contest/exhibition spec card with custom dimensions and dynamic QR code
 */
buildsRouter.post('/:slugOrId/spec-card', async (req: Request, res: Response) => {
  const db = getDb();
  const build = db.builds.find(b => b.id === req.params.slugOrId || b.slug === req.params.slugOrId);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitácora No Encontrada',
      `No se encontró el proyecto de construcción '${req.params.slugOrId}'.`,
      'not-found'
    );
  }

  const {
    widthMm = 150,
    heightMm = 100,
    format = 'flat',
    theme = 'light_ink_saver',
    contestName = 'Gunpla & Scale Model Open Cup 2026',
    entryCode,
    includeQr = true,
    includeCoverImage = true,
    includePaints = true,
    includeJudgeScoreBox = false,
    customNotes = ''
  } = req.body as Partial<GenerateSpecCardRequest>;

  const cleanWidth = Math.max(50, Math.min(420, Number(widthMm) || 150));
  const cleanHeight = Math.max(30, Math.min(297, Number(heightMm) || 100));

  const tenant = req.tenant;
  const domain = tenant?.domain || (req.headers.host ? req.headers.host.split(':')[0] : 'gunplajunkies.com');
  const targetUrl = `https://${domain}/#build-${build.slug}`;

  let qrDataUrl = '';
  let qrSvg = '';
  if (includeQr) {
    try {
      qrDataUrl = await QRCode.toDataURL(targetUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: theme === 'dark_mecha' ? '#0F172A' : '#000000',
          light: '#FFFFFF'
        }
      });
      qrSvg = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 1
      });
    } catch (err) {
      console.warn('[SpecCard QR Error]:', err);
    }
  }

  const populatedKit = db.kits.find(k => k.id === build.kitId);
  const paintUsages = build.steps.flatMap(s => s.paintUsages || []).map(usage => ({
    ...usage,
    paint: db.paints.find(p => p.id === usage.paintId)
  }));
  const uniquePaints = Array.from(new Map(paintUsages.filter(p => p.paint).map(p => [p.paintId, p.paint!])).values());

  const populatedBuild: BuildProjectRecord = {
    ...build,
    kit: populatedKit
  };

  const response: GenerateSpecCardResponse = {
    build: populatedBuild,
    qrDataUrl,
    qrSvg,
    targetUrl,
    widthMm: cleanWidth,
    heightMm: cleanHeight,
    format,
    theme,
    htmlPreview: ''
  };

  return res.json(response);
});

// ---------------------------------------------------------------------------
// Build Logs Mutation Endpoints
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/builds
 * Create a new build project
 */
buildsRouter.post('/', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { kitId, title, subtitle, status, coverImageUrl, tags, category, categoryOverride, scale, grade } = req.body as CreateBuildProjectRequest;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Título Requerido',
      'El campo "title" es obligatorio.',
      'validation-error',
      [{ name: 'title', reason: 'Debe ser una cadena de texto no vacía' }]
    );
  }

  const db = getDb();
  let kit = undefined;
  if (kitId) {
    kit = db.kits.find(k => k.id === kitId);
    if (!kit) {
      return sendProblem(
        req,
        res,
        404,
        'Kit No Encontrado',
        `El kit con id '${kitId}' no existe en el catálogo maestro.`,
        'not-found'
      );
    }
  }

  const id = `build-${randomUUID().slice(0, 8)}`;
  const cleanTitle = title.trim();
  const baseSlug = slugify(cleanTitle);
  const slugExists = db.builds.some(b => b.slug === baseSlug);
  const slug = slugExists ? `${baseSlug}-${id.slice(-4)}` : baseSlug;
  const now = new Date().toISOString();

  const finalCategory: ScaleCategory = category || categoryOverride || kit?.category || 'gunpla-mecha';

  const newBuild: BuildProjectRecord = {
    id,
    slug,
    userId: user.id,
    username: user.username,
    userDisplayName: user.username,
    kitId: kitId || undefined,
    kit,
    category: finalCategory,
    scale: scale || kit?.scale,
    grade: grade || kit?.grade,
    title: cleanTitle,
    subtitle: subtitle?.trim() || undefined,
    status: status || 'wip',
    coverImageUrl: coverImageUrl?.trim() || kit?.boxartUrl || undefined,
    likeCount: 0,
    likedByUserIds: [],
    viewCount: 0,
    steps: [],
    comments: [],
    tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
    createdAt: now,
    updatedAt: now
  };

  db.builds.push(newBuild);
  saveDb(db);

  return res.status(201).json(newBuild);
});

/**
 * PATCH /api/v1/builds/:id
 */
buildsRouter.patch('/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const buildId = req.params.id;
  const { title, subtitle, status, coverImageUrl, tags } = req.body as UpdateBuildProjectRequest;

  const db = getDb();
  const build = db.builds.find(b => b.id === buildId);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitácora No Encontrada',
      `No se encontró el proyecto con id '${buildId}'.`,
      'not-found'
    );
  }

  if (build.userId !== user.id) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso Prohibido',
      'No tienes autorización para editar el proyecto de otro modelista.',
      'forbidden'
    );
  }

  if (title) build.title = title.trim();
  if (subtitle !== undefined) build.subtitle = subtitle.trim();
  if (status) build.status = status;
  if (coverImageUrl !== undefined) build.coverImageUrl = coverImageUrl.trim();
  if (Array.isArray(tags)) build.tags = tags.map(t => String(t).trim()).filter(Boolean);
  build.updatedAt = new Date().toISOString();

  saveDb(db);
  return res.json(build);
});

/**
 * DELETE /api/v1/builds/:id
 */
buildsRouter.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const buildId = req.params.id;

  const db = getDb();
  const index = db.builds.findIndex(b => b.id === buildId);

  if (index === -1) {
    return sendProblem(req, res, 404, 'Bitácora No Encontrada', `No se encontró el proyecto con id '${buildId}'.`);
  }

  if (db.builds[index].userId !== user.id) {
    return sendProblem(req, res, 403, 'Acceso Prohibido', 'No tienes autorización para eliminar esta bitácora.');
  }

  db.builds.splice(index, 1);
  saveDb(db);

  return res.json({ deleted: true, id: buildId });
});

/**
 * POST /api/v1/builds/:id/steps
 * Add a step to a build log
 */
buildsRouter.post('/:id/steps', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const buildId = req.params.id;
  const { stage, title, description, photoUrls, paintUsages } = req.body as CreateBuildStepRequest;

  const db = getDb();
  const build = db.builds.find(b => b.id === buildId);

  if (!build) {
    return sendProblem(req, res, 404, 'Bitácora No Encontrada', `No se encontró el proyecto con id '${buildId}'.`);
  }

  if (build.userId !== user.id) {
    return sendProblem(req, res, 403, 'Acceso Prohibido', 'No tienes autorización para agregar pasos a esta bitácora.');
  }

  if (!stage || !title) {
    return sendProblem(
      req,
      res,
      400,
      'Datos Incompletos',
      'Los campos "stage" y "title" son obligatorios para registrar un paso de construcción.',
      'validation-error'
    );
  }

  const stepId = `step-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  // Populate paints in recipe
  const verifiedPaints = (paintUsages || []).map(u => ({
    ...u,
    paint: db.paints.find(p => p.id === u.paintId)
  }));

  const newStep: BuildStep = {
    id: stepId,
    buildId,
    stage,
    orderIndex: build.steps.length,
    title: title.trim(),
    description: description?.trim() || '',
    photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
    paintUsages: verifiedPaints,
    createdAt: now
  };

  build.steps.push(newStep);
  build.updatedAt = now;
  saveDb(db);

  return res.status(201).json(newStep);
});

/**
 * PATCH /api/v1/builds/:id/steps/reorder
 * Reorder steps in a build project
 */
buildsRouter.patch('/:id/steps/reorder', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const buildId = req.params.id;
  const { stepIds } = req.body || {};

  if (!Array.isArray(stepIds) || stepIds.length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Datos Inválidos',
      'El campo stepIds debe ser un array no vacío con los IDs de los pasos ordenados.',
      'validation-error'
    );
  }

  const db = getDb();
  const build = db.builds.find(b => b.id === buildId || b.slug === buildId);

  if (!build) {
    return sendProblem(req, res, 404, 'Bitácora No Encontrada', `No se encontró el proyecto con id '${buildId}'.`);
  }

  if (build.userId !== user.id) {
    return sendProblem(req, res, 403, 'Acceso Prohibido', 'Solo el autor puede reordenar los pasos de esta bitácora.');
  }

  const stepMap = new Map(build.steps.map(s => [s.id, s]));
  const reordered: BuildStep[] = [];

  for (let i = 0; i < stepIds.length; i++) {
    const sId = String(stepIds[i]);
    const step = stepMap.get(sId);
    if (step) {
      step.orderIndex = i;
      reordered.push(step);
      stepMap.delete(sId);
    }
  }

  // Preserve any steps that were not in stepIds
  for (const remaining of stepMap.values()) {
    remaining.orderIndex = reordered.length;
    reordered.push(remaining);
  }

  build.steps = reordered;
  build.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({
    success: true,
    steps: build.steps
  });
});

/**
 * PATCH /api/v1/builds/:id/steps/:stepId
 * Update details or media photos of an existing build step
 */
buildsRouter.patch('/:id/steps/:stepId', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { id: buildId, stepId } = req.params;
  const { title, description, stage, photoUrls, paintUsages } = req.body || {};

  const db = getDb();
  const build = db.builds.find(b => b.id === buildId || b.slug === buildId);

  if (!build) {
    return sendProblem(req, res, 404, 'Bitácora No Encontrada', `No se encontró el proyecto con id '${buildId}'.`);
  }

  if (build.userId !== user.id) {
    return sendProblem(req, res, 403, 'Acceso Prohibido', 'Solo el autor puede editar pasos de esta bitácora.');
  }

  const step = build.steps.find(s => s.id === stepId);
  if (!step) {
    return sendProblem(req, res, 404, 'Paso No Encontrado', `No se encontró el paso con id '${stepId}'.`);
  }

  if (title !== undefined && typeof title === 'string' && title.trim().length > 0) {
    step.title = title.trim();
  }
  if (description !== undefined && typeof description === 'string') {
    step.description = description.trim();
  }
  if (stage !== undefined && typeof stage === 'string') {
    step.stage = stage as any;
  }
  if (Array.isArray(photoUrls)) {
    step.photoUrls = photoUrls;
  }
  if (Array.isArray(paintUsages)) {
    step.paintUsages = paintUsages.map(u => ({
      ...u,
      paint: db.paints.find(p => p.id === u.paintId)
    }));
  }

  build.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json(step);
});

/**
 * DELETE /api/v1/builds/:id/steps/:stepId
 * Delete a step from a build log
 */
buildsRouter.delete('/:id/steps/:stepId', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { id: buildId, stepId } = req.params;

  const db = getDb();
  const build = db.builds.find(b => b.id === buildId || b.slug === buildId);

  if (!build) {
    return sendProblem(req, res, 404, 'Bitácora No Encontrada', `No se encontró el proyecto con id '${buildId}'.`);
  }

  if (build.userId !== user.id) {
    return sendProblem(req, res, 403, 'Acceso Prohibido', 'Solo el autor puede eliminar pasos de esta bitácora.');
  }

  const stepIdx = build.steps.findIndex(s => s.id === stepId);
  if (stepIdx === -1) {
    return sendProblem(req, res, 404, 'Paso No Encontrado', `No se encontró el paso con id '${stepId}'.`);
  }

  build.steps.splice(stepIdx, 1);
  build.steps.forEach((s, idx) => {
    s.orderIndex = idx;
  });

  build.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({
    success: true,
    deletedStepId: stepId,
    remainingStepsCount: build.steps.length
  });
});

/**
 * POST /api/v1/builds/:id/like
 * Toggle like for current user
 */
buildsRouter.post('/:id/like', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const buildId = req.params.id;

  const db = getDb();
  const build = db.builds.find(b => b.id === buildId);

  if (!build) {
    return sendProblem(req, res, 404, 'Bitácora No Encontrada', `No se encontró el proyecto con id '${buildId}'.`);
  }

  const hasLiked = build.likedByUserIds.includes(userId);
  if (hasLiked) {
    build.likedByUserIds = build.likedByUserIds.filter(id => id !== userId);
    build.likeCount = Math.max(build.likeCount - 1, 0);
  } else {
    build.likedByUserIds.push(userId);
    build.likeCount += 1;
  }

  saveDb(db);

  return res.json({
    liked: !hasLiked,
    likeCount: build.likeCount
  });
});

/**
 * POST /api/v1/builds/:id/comments
 * Add comment to a build log
 */
buildsRouter.post('/:id/comments', requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  const buildId = req.params.id;
  const { comment } = req.body as CreateBuildCommentRequest;

  if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
    return sendProblem(req, res, 400, 'Comentario Vacío', 'El comentario no puede estar vacío.');
  }

  const db = getDb();
  const build = db.builds.find(b => b.id === buildId);

  if (!build) {
    return sendProblem(req, res, 404, 'Bitácora No Encontrada', `No se encontró el proyecto con id '${buildId}'.`);
  }

  const newComment: BuildComment = {
    id: `comment-${randomUUID().slice(0, 8)}`,
    buildId,
    userId: user.id,
    username: user.username,
    userDisplayName: user.username,
    comment: comment.trim(),
    createdAt: new Date().toISOString()
  };

  build.comments.push(newComment);
  saveDb(db);

  // Trigger transactional notification email to build owner (if commenter is not the author)
  if (build.userId !== user.id) {
    const buildOwner = db.users.find(
      u => u.id === build.userId || u.username.toLowerCase() === build.username.toLowerCase()
    );
    const ownerEmail = buildOwner?.email || `${build.username}@plamoscale.com`;
    const activeTenant =
      req.tenant ||
      (build.category === 'gunpla-mecha'
        ? db.tenants.find(t => t.slug === 'gunplajunkies')
        : db.tenants.find(t => t.slug === 'plamoscale')) ||
      db.tenants[0];

    try {
      await sendTenantEmailViaResend({
        tenant: activeTenant,
        to: [ownerEmail],
        replyTo: user.email || activeTenant.contactEmail,
        subject: `[${activeTenant.name}] Nuevo comentario en tu bitacora: ${build.title}`,
        html: `<h2>Nuevo comentario en tu bitacora de armado</h2>
<p>Hola <strong>${build.userDisplayName || build.username}</strong>,</p>
<p>El modelista <strong>${user.username}</strong> ha dejado un comentario en tu proyecto <strong>${build.title}</strong>:</p>
<blockquote style="background:#1a2332;padding:12px;border-left:4px solid #38bdf8;color:#e2e8f0;margin:16px 0;font-family:sans-serif;">
  ${newComment.comment}
</blockquote>
<p>Entra a tu taller para responder y compartir tecnicas con la comunidad.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to dispatch build comment email notification:', emailErr);
    }

    try {
      await dispatchNotification({
        recipientUserId: build.userId,
        tenantSlug: activeTenant.slug,
        type: 'build_comment',
        title: 'Nuevo comentario en tu bitácora',
        message: `${user.username} comentó: "${newComment.comment.slice(0, 80)}"`,
        link: `#/builds/${build.slug || build.id}`,
        metadata: { buildId: build.id, commentId: newComment.id }
      });
    } catch (notifErr) {
      console.error('Failed to dispatch build comment in-app notification:', notifErr);
    }
  }

  return res.status(201).json(newComment);
});

// ---------------------------------------------------------------------------
// Project Cost Accounting & Consumables Estimator (DT17)
// ---------------------------------------------------------------------------

buildsRouter.get('/:idOrSlug/costs', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const db = getDb();
  const build = db.builds.find(b => b.id === idOrSlug || b.slug === idOrSlug);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id o slug '${idOrSlug}'.`
    );
  }

  const hourlyRate = parseFloat(req.query.hourlyRate as string) || 15;
  const currency = (req.query.currency as ExpenseCurrency) || 'USD';
  const summary = calculateBuildCostSummary(build.id, build.expenses || [], hourlyRate, currency);

  return res.json({
    buildId: build.id,
    buildTitle: build.title,
    currency: summary.currency,
    summary
  });
});

buildsRouter.post('/:id/costs', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();
  const build = db.builds.find(b => b.id === id);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id '${id}'.`
    );
  }

  // Ownership verification
  if (build.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'Solo el autor del proyecto o un administrador puede gestionar sus costos y gastos.'
    );
  }

  const { category, name, amount, currency, paintId, paintBottleFraction, laborHours, notes } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return sendProblem(
      req,
      res,
      400,
      'Nombre de Gasto Requerido',
      'Debe especificar un nombre o descripcion para el gasto.',
      'validation-error'
    );
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return sendProblem(
      req,
      res,
      400,
      'Monto Invalido',
      'El monto del gasto debe ser un numero mayor o igual a 0.',
      'validation-error'
    );
  }

  const validCategories: BuildExpenseCategory[] = [
    'kit',
    'paint',
    'consumable',
    'aftermarket',
    'decal',
    'labor',
    'other'
  ];
  const finalCategory = (category && validCategories.includes(category)) ? category : 'other';
  const finalCurrency: ExpenseCurrency = (currency === 'PEN' || currency === 'EUR') ? currency : 'USD';

  const newExpense: BuildExpenseItem = {
    id: `exp-${randomUUID().slice(0, 8)}`,
    buildId: build.id,
    category: finalCategory,
    name: name.trim(),
    amount: Math.round(numAmount * 100) / 100,
    currency: finalCurrency,
    paintId: paintId ? String(paintId).trim() : undefined,
    paintBottleFraction: paintBottleFraction ? parseFloat(paintBottleFraction) : undefined,
    laborHours: laborHours ? parseFloat(laborHours) : undefined,
    notes: notes ? String(notes).trim() : undefined,
    createdAt: new Date().toISOString()
  };

  if (!build.expenses) {
    build.expenses = [];
  }
  build.expenses.push(newExpense);
  build.updatedAt = new Date().toISOString();
  saveDb(db);

  const summary = calculateBuildCostSummary(build.id, build.expenses);

  return res.status(201).json({
    expense: newExpense,
    summary
  });
});

buildsRouter.delete('/:id/costs/:expenseId', requireAuth, (req: Request, res: Response) => {
  const { id, expenseId } = req.params;
  const user = req.user!;
  const db = getDb();
  const build = db.builds.find(b => b.id === id);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id '${id}'.`
    );
  }

  // Ownership verification
  if (build.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'Solo el autor del proyecto o un administrador puede eliminar gastos.'
    );
  }

  if (!build.expenses || build.expenses.length === 0) {
    return sendProblem(
      req,
      res,
      404,
      'Gasto No Encontrado',
      `No se encontro ningun gasto registrado para el proyecto '${id}'.`
    );
  }

  const expIndex = build.expenses.findIndex(e => e.id === expenseId);
  if (expIndex === -1) {
    return sendProblem(
      req,
      res,
      404,
      'Gasto No Encontrado',
      `No se encontro el gasto con id '${expenseId}'.`
    );
  }

  build.expenses.splice(expIndex, 1);
  build.updatedAt = new Date().toISOString();
  saveDb(db);

  const summary = calculateBuildCostSummary(build.id, build.expenses);

  return res.json({
    removedExpenseId: expenseId,
    summary
  });
});

// ---------------------------------------------------------------------------
// DT23: Parts Breakdown & Assembly Subassembly Cards
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/builds/:id/subassemblies
 * List subassembly cards and overall progress breakdown for a build log
 */
buildsRouter.get('/:id/subassemblies', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const build = db.builds.find(b => b.id === id);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id '${id}'.`
    );
  }

  // Auto-initialize with default subassemblies if none exist yet
  if (!build.subassemblies || build.subassemblies.length === 0) {
    build.subassemblies = generateDefaultSubassemblies(build.id, build.category, build.grade);
    build.updatedAt = new Date().toISOString();
    saveDb(db);
  }

  const progress = calculateSubassemblyOverallProgress(build.subassemblies);

  return res.json({
    buildId: build.id,
    buildTitle: build.title,
    kitName: build.kit?.name || build.title,
    scale: build.scale,
    grade: build.grade,
    items: build.subassemblies,
    progress
  });
});

/**
 * POST /api/v1/builds/:id/subassemblies
 * Create a new subassembly card or bulk reset/regenerate default subassembly cards
 */
buildsRouter.post('/:id/subassemblies', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();
  const build = db.builds.find(b => b.id === id);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id '${id}'.`
    );
  }

  // Ownership verification
  if (build.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'Solo el autor del proyecto o un administrador puede gestionar los subensambles.'
    );
  }

  const body = req.body as CreateSubassemblyDto;

  if (body.autoGenerate) {
    build.subassemblies = generateDefaultSubassemblies(build.id, build.category, build.grade);
    build.updatedAt = new Date().toISOString();
    saveDb(db);

    const progress = calculateSubassemblyOverallProgress(build.subassemblies);
    return res.status(201).json({
      message: 'Subensambles generados automáticamente',
      items: build.subassemblies,
      progress
    });
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    return sendProblem(
      req,
      res,
      400,
      'Nombre Requerido',
      'El campo name es obligatorio para crear una ficha de subensamble.',
      'invalid-name'
    );
  }

  if (!build.subassemblies) {
    build.subassemblies = [];
  }

  const now = new Date().toISOString();
  const newCard: SubassemblyCard = {
    id: `sub-${randomUUID().slice(0, 8)}`,
    buildId: build.id,
    name: body.name.trim(),
    type: (body.type || 'custom') as SubassemblyType,
    icon: body.icon || '🧩',
    runners: Array.isArray(body.runners) ? body.runners.map(r => String(r).trim().toUpperCase()).filter(Boolean) : [],
    partCountEstimated: Number(body.partCountEstimated) >= 0 ? Number(body.partCountEstimated) : 0,
    stages: {
      cut: !!body.stages?.cut,
      cleaned: !!body.stages?.cleaned,
      primed: !!body.stages?.primed,
      painted: !!body.stages?.painted,
      topcoated: !!body.stages?.topcoated
    },
    customNotes: body.customNotes || '',
    colorPaletteNotes: body.colorPaletteNotes || '',
    orderIndex: build.subassemblies.length,
    createdAt: now,
    updatedAt: now
  };

  build.subassemblies.push(newCard);
  build.updatedAt = now;
  saveDb(db);

  const progress = calculateSubassemblyOverallProgress(build.subassemblies);

  return res.status(201).json({
    item: newCard,
    progress
  });
});

/**
 * PATCH /api/v1/builds/:id/subassemblies/:subId
 * Update stage completion, runners, parts count, or notes for a subassembly
 */
buildsRouter.patch('/:id/subassemblies/:subId', requireAuth, (req: Request, res: Response) => {
  const { id, subId } = req.params;
  const user = req.user!;
  const db = getDb();
  const build = db.builds.find(b => b.id === id);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id '${id}'.`
    );
  }

  if (build.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'Solo el autor del proyecto o un administrador puede modificar los subensambles.'
    );
  }

  if (!build.subassemblies || build.subassemblies.length === 0) {
    return sendProblem(
      req,
      res,
      404,
      'Subensamble No Encontrado',
      `No existen subensambles para el proyecto '${id}'.`
    );
  }

  const card = build.subassemblies.find(c => c.id === subId);
  if (!card) {
    return sendProblem(
      req,
      res,
      404,
      'Subensamble No Encontrado',
      `No se encontro la ficha de subensamble con id '${subId}'.`
    );
  }

  const body = req.body as UpdateSubassemblyDto;

  if (body.name !== undefined) card.name = String(body.name).trim();
  if (body.type !== undefined) card.type = body.type;
  if (body.icon !== undefined) card.icon = body.icon;
  if (body.runners !== undefined && Array.isArray(body.runners)) {
    card.runners = body.runners.map(r => String(r).trim().toUpperCase()).filter(Boolean);
  }
  if (body.partCountEstimated !== undefined) {
    card.partCountEstimated = Math.max(0, Number(body.partCountEstimated) || 0);
  }
  if (body.stages !== undefined && typeof body.stages === 'object') {
    if (body.stages.cut !== undefined) card.stages.cut = !!body.stages.cut;
    if (body.stages.cleaned !== undefined) card.stages.cleaned = !!body.stages.cleaned;
    if (body.stages.primed !== undefined) card.stages.primed = !!body.stages.primed;
    if (body.stages.painted !== undefined) card.stages.painted = !!body.stages.painted;
    if (body.stages.topcoated !== undefined) card.stages.topcoated = !!body.stages.topcoated;
  }
  if (body.customNotes !== undefined) card.customNotes = String(body.customNotes);
  if (body.colorPaletteNotes !== undefined) card.colorPaletteNotes = String(body.colorPaletteNotes);
  if (body.orderIndex !== undefined) card.orderIndex = Number(body.orderIndex);

  const now = new Date().toISOString();
  card.updatedAt = now;
  build.updatedAt = now;
  saveDb(db);

  const progress = calculateSubassemblyOverallProgress(build.subassemblies);

  return res.json({
    item: card,
    progress
  });
});

/**
 * DELETE /api/v1/builds/:id/subassemblies/:subId
 * Remove a subassembly card from a build project
 */
buildsRouter.delete('/:id/subassemblies/:subId', requireAuth, (req: Request, res: Response) => {
  const { id, subId } = req.params;
  const user = req.user!;
  const db = getDb();
  const build = db.builds.find(b => b.id === id);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id '${id}'.`
    );
  }

  if (build.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'Solo el autor del proyecto o un administrador puede eliminar subensambles.'
    );
  }

  if (!build.subassemblies || build.subassemblies.length === 0) {
    return sendProblem(
      req,
      res,
      404,
      'Subensamble No Encontrado',
      `No existen subensambles en el proyecto '${id}'.`
    );
  }

  const idx = build.subassemblies.findIndex(c => c.id === subId);
  if (idx === -1) {
    return sendProblem(
      req,
      res,
      404,
      'Subensamble No Encontrado',
      `No se encontro la ficha con id '${subId}'.`
    );
  }

  build.subassemblies.splice(idx, 1);
  build.updatedAt = new Date().toISOString();
  saveDb(db);

  const progress = calculateSubassemblyOverallProgress(build.subassemblies);

  return res.json({
    removedId: subId,
    progress
  });
});

/**
 * GET /api/v1/builds/:id/subassemblies/export
 * Printable A4 organizer tray cards sheet for physical workbench trays
 */
buildsRouter.get('/:id/subassemblies/export', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const build = db.builds.find(b => b.id === id);

  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitacora No Encontrada',
      `No se encontro el proyecto con id '${id}'.`
    );
  }

  if (!build.subassemblies || build.subassemblies.length === 0) {
    build.subassemblies = generateDefaultSubassemblies(build.id, build.category, build.grade);
    build.updatedAt = new Date().toISOString();
    saveDb(db);
  }

  if (req.query.format === 'json') {
    const progress = calculateSubassemblyOverallProgress(build.subassemblies);
    return res.json({
      buildId: build.id,
      items: build.subassemblies,
      progress
    });
  }

  const html = generateSubassemblyWorksheetHtml({
    buildTitle: build.title,
    kitName: build.kit?.name || build.title,
    scale: build.scale,
    grade: build.grade,
    builderName: build.userDisplayName || build.username,
    tenantTitle: 'PlamoScale / GunplaJunkies',
    cards: build.subassemblies
  });

  return res.type('html').send(html);
});
