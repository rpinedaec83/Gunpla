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
  GenerateSpecCardResponse
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';
import { uploadMedia, getStorageDiagnostics } from '../../core/storage';

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
    storageProvider: uploadResult.provider
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
buildsRouter.post('/:id/comments', requireAuth, (req: Request, res: Response) => {
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

  return res.status(201).json(newComment);
});
