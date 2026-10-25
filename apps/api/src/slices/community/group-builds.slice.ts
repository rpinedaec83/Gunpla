import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  GroupBuildRecord,
  GroupBuildEntry,
  GroupBuildStatus,
  CreateGroupBuildRequest,
  JoinGroupBuildRequest
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';
import { dispatchNotification } from '../notifications-bell/notifications.slice';

export const groupBuildsRouter = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const INITIAL_GROUP_BUILDS: GroupBuildRecord[] = [
  {
    id: 'gb-pacifico-wwii',
    tenantSlug: 'plamoscale',
    title: 'Proyecto Grupal: Escuadrones del Pacífico WWII',
    slug: 'escuadrones-del-pacifico-wwii',
    description:
      'Construcción colaborativa a escala 1/48 y 1/72 de cazas y bombarderos navales del frente del Pacífico (Hellcats, Corsairs, Zeros y Dauntless). Documenta camuflajes históricos y efectos de intemperie marina.',
    rules: [
      'Modelos aéreos o navales de la Guerra del Pacífico (1941-1945)',
      'Escalas permitidas: 1/72, 1/48, 1/32',
      'Mínimo 2 pasos documentados en la bitácora con recetas de pintura y envejecido'
    ],
    bannerImageUrl: '/legacy-media/plamoscale/images/aperich/fulls/01.jpg',
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-12-15T23:59:59Z',
    status: 'active',
    creatorUserId: 'user-aperich',
    creatorUsername: 'aperich',
    creatorDisplayName: 'Arturo Perich',
    category: 'aviation',
    entries: [
      {
        id: 'gbe-aperich-zero',
        groupBuildId: 'gb-pacifico-wwii',
        buildId: 'build-mitsubishi-a6m-zero',
        userId: 'user-aperich',
        username: 'aperich',
        userDisplayName: 'Arturo Perich',
        buildTitle: 'Mitsubishi A6M Zero 1/48 Tamiya',
        buildSlug: 'mitsubishi-a6m-zero-tamiya',
        coverImageUrl: '/legacy-media/plamoscale/images/aperich/thumbs/01.jpg',
        stage: 'painting',
        stepsCount: 3,
        joinedAt: '2026-10-02T10:00:00Z'
      }
    ],
    participantsCount: 1,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z'
  },
  {
    id: 'gb-a-baoa-qu',
    tenantSlug: 'gunplajunkies',
    title: 'Proyecto Grupal: Asalto a la Fortaleza Espacial A Baoa Qu',
    slug: 'asalto-a-la-fortaleza-espacial-a-baoa-qu',
    description:
      'Diorama masivo y bitácoras colaborativas recreando la última gran batalla de la Guerra de Un Año (UC 0079). Mobile Suits de la Federación Terrestre y del Principado de Zeon.',
    rules: [
      'Kits HG, RG o MG de Mobile Suits participantes en la batalla de A Baoa Qu',
      'Efectos de daño de combate espacial, panel line y quemaduras de propulsores',
      'Mínimo 2 hitos de construcción registrados en la bitácora de Mi Taller'
    ],
    bannerImageUrl: '/legacy-media/plamoscale/images/fog1labs1/fulls/01.jpg',
    startDate: '2026-10-15T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    status: 'active',
    creatorUserId: 'user-rpineda',
    creatorUsername: 'rpineda',
    creatorDisplayName: 'Rodrigo Pineda',
    category: 'gunpla-mecha',
    entries: [],
    participantsCount: 0,
    createdAt: '2026-10-15T00:00:00Z'
  }
];

// ---------------------------------------------------------------------------
// GET /api/v1/group-builds
// List group builds scoped by tenant and optional status
// ---------------------------------------------------------------------------
groupBuildsRouter.get('/', (req: Request, res: Response) => {
  const db = getDb();
  if (!db.groupBuilds) db.groupBuilds = [];

  const tenantSlug = req.tenant?.slug || (req.query.tenant as string) || 'all';
  const statusFilter = req.query.status as GroupBuildStatus | undefined;

  let items = db.groupBuilds;

  if (tenantSlug !== 'all') {
    items = items.filter(
      (gb) => gb.tenantSlug === 'all' || gb.tenantSlug === tenantSlug
    );
  }

  if (statusFilter) {
    items = items.filter((gb) => gb.status === statusFilter);
  }

  // Recalculate participantsCount accurately
  items.forEach((gb) => {
    gb.participantsCount = new Set((gb.entries || []).map((e) => e.userId)).size;
  });

  return res.json({
    total: items.length,
    items
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/group-builds
// Create a new collaborative group build project
// ---------------------------------------------------------------------------
groupBuildsRouter.post('/', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const body = req.body as CreateGroupBuildRequest;

  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Datos Inválidos',
      'El título del proyecto grupal es obligatorio.',
      'validation-error'
    );
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Datos Inválidos',
      'La descripción del proyecto grupal es obligatoria.',
      'validation-error'
    );
  }

  if (!body.startDate || !body.endDate) {
    return sendProblem(
      req,
      res,
      400,
      'Datos Inválidos',
      'Las fechas de inicio y finalización son obligatorias.',
      'validation-error'
    );
  }

  const db = getDb();
  if (!db.groupBuilds) db.groupBuilds = [];

  const slug = slugify(body.title.trim());
  const tenantSlug = req.tenant?.slug || (user.tenantSlug as any) || 'all';

  const now = new Date();
  const start = new Date(body.startDate);
  const end = new Date(body.endDate);

  let status: GroupBuildStatus = 'active';
  if (now < start) {
    status = 'upcoming';
  } else if (now > end) {
    status = 'completed';
  }

  const userRecord = db.users.find(u => u.id === user.id);
  const creatorDisplayName = userRecord?.displayName || user.username;

  const newGroupBuild: GroupBuildRecord = {
    id: `gb-${Date.now()}-${randomUUID().slice(0, 6)}`,
    tenantSlug,
    title: body.title.trim(),
    slug,
    description: body.description.trim(),
    rules: Array.isArray(body.rules) ? body.rules : [],
    bannerImageUrl: body.bannerImageUrl || undefined,
    startDate: body.startDate,
    endDate: body.endDate,
    status,
    creatorUserId: user.id,
    creatorUsername: user.username,
    creatorDisplayName,
    category: body.category || 'all',
    entries: [],
    participantsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.groupBuilds.unshift(newGroupBuild);
  saveDb(db);

  return res.status(201).json(newGroupBuild);
});

// ---------------------------------------------------------------------------
// GET /api/v1/group-builds/:idOrSlug
// Get group build details by ID or Slug
// ---------------------------------------------------------------------------
groupBuildsRouter.get('/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const db = getDb();
  if (!db.groupBuilds) db.groupBuilds = [];

  const groupBuild = db.groupBuilds.find(
    (gb) => gb.id === idOrSlug || gb.slug === idOrSlug
  );

  if (!groupBuild) {
    return sendProblem(
      req,
      res,
      404,
      'Proyecto Grupal No Encontrado',
      `No se encontró ningún proyecto grupal con el identificador '${idOrSlug}'.`
    );
  }

  groupBuild.participantsCount = new Set((groupBuild.entries || []).map((e) => e.userId)).size;

  return res.json(groupBuild);
});

// ---------------------------------------------------------------------------
// POST /api/v1/group-builds/:idOrSlug/join
// Join an active group build with an existing build project
// ---------------------------------------------------------------------------
groupBuildsRouter.post('/:idOrSlug/join', requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  const { idOrSlug } = req.params;
  const { buildId } = req.body as JoinGroupBuildRequest;

  if (!buildId || typeof buildId !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Datos Inválidos',
      'Debe seleccionar una bitácora de armado (buildId) para unirse al proyecto grupal.',
      'validation-error'
    );
  }

  const db = getDb();
  if (!db.groupBuilds) db.groupBuilds = [];

  const groupBuild = db.groupBuilds.find(
    (gb) => gb.id === idOrSlug || gb.slug === idOrSlug
  );

  if (!groupBuild) {
    return sendProblem(
      req,
      res,
      404,
      'Proyecto Grupal No Encontrado',
      `No se encontró el proyecto grupal '${idOrSlug}'.`
    );
  }

  if (groupBuild.status === 'completed') {
    return sendProblem(
      req,
      res,
      400,
      'Proyecto Grupal Finalizado',
      'Este proyecto grupal ya ha concluido y no acepta nuevas inscripciones.'
    );
  }

  const build = db.builds.find((b) => b.id === buildId || b.slug === buildId);
  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitácora No Encontrada',
      `No se encontró la bitácora de armado con id '${buildId}'.`
    );
  }

  if (build.userId !== user.id) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso Prohibido',
      'Solo puedes inscribir bitácoras creadas por ti mismo.'
    );
  }

  if (!groupBuild.entries) {
    groupBuild.entries = [];
  }

  const alreadyJoined = groupBuild.entries.some((e) => e.buildId === build.id);
  if (alreadyJoined) {
    return sendProblem(
      req,
      res,
      409,
      'Bitácora Ya Inscrita',
      'Esta bitácora ya forma parte de este proyecto grupal.'
    );
  }

  const userRecord = db.users.find((u) => u.id === user.id);
  const userDisplayName = userRecord?.displayName || user.username;

  const entry: GroupBuildEntry = {
    id: `gbe-${Date.now()}-${randomUUID().slice(0, 6)}`,
    groupBuildId: groupBuild.id,
    buildId: build.id,
    userId: user.id,
    username: user.username,
    userDisplayName,
    buildTitle: build.title,
    buildSlug: build.slug,
    coverImageUrl:
      build.coverImageUrl ||
      (build.steps && build.steps[0]?.photoUrls && build.steps[0].photoUrls[0]) ||
      '',
    stage: build.steps && build.steps.length > 0
      ? build.steps[build.steps.length - 1].stage
      : 'assembly',
    stepsCount: build.steps?.length || 0,
    joinedAt: new Date().toISOString()
  };

  groupBuild.entries.push(entry);
  groupBuild.participantsCount = new Set(groupBuild.entries.map((e) => e.userId)).size;
  groupBuild.updatedAt = new Date().toISOString();
  saveDb(db);

  // Notify organizer if it is another user
  if (groupBuild.creatorUserId && groupBuild.creatorUserId !== user.id) {
    try {
      await dispatchNotification({
        recipientUserId: groupBuild.creatorUserId,
        tenantSlug: groupBuild.tenantSlug === 'all' ? (req.tenant?.slug || 'plamoscale') : groupBuild.tenantSlug,
        type: 'system',
        title: 'Nuevo participante en Proyecto Grupal',
        message: `@${user.username} se ha unido a "${groupBuild.title}" con su obra "${build.title}"`,
        link: '#/contests',
        metadata: {
          groupBuildId: groupBuild.id,
          buildId: build.id,
          participantUsername: user.username
        }
      });
    } catch {
      // Non-blocking notification dispatch
    }
  }

  return res.status(201).json({
    success: true,
    entry,
    participantsCount: groupBuild.participantsCount
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/group-builds/:idOrSlug/leave
// Leave a group build project
// ---------------------------------------------------------------------------
groupBuildsRouter.delete('/:idOrSlug/leave', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { idOrSlug } = req.params;
  const buildId = (req.body?.buildId || req.query?.buildId) as string;

  const db = getDb();
  if (!db.groupBuilds) db.groupBuilds = [];

  const groupBuild = db.groupBuilds.find(
    (gb) => gb.id === idOrSlug || gb.slug === idOrSlug
  );

  if (!groupBuild) {
    return sendProblem(
      req,
      res,
      404,
      'Proyecto Grupal No Encontrado',
      `No se encontró el proyecto grupal '${idOrSlug}'.`
    );
  }

  if (!groupBuild.entries) {
    groupBuild.entries = [];
  }

  const initialCount = groupBuild.entries.length;
  // If buildId is specified, remove matching entry owned by user; otherwise remove all entries by user
  if (buildId) {
    groupBuild.entries = groupBuild.entries.filter(
      (e) => !(e.buildId === buildId && (e.userId === user.id || groupBuild.creatorUserId === user.id))
    );
  } else {
    groupBuild.entries = groupBuild.entries.filter(
      (e) => e.userId !== user.id
    );
  }

  const removed = initialCount - groupBuild.entries.length;
  if (removed === 0) {
    return sendProblem(
      req,
      res,
      404,
      'Inscripción No Encontrada',
      'No se encontró ninguna inscripción activa de tu usuario en este proyecto grupal.'
    );
  }

  groupBuild.participantsCount = new Set(groupBuild.entries.map((e) => e.userId)).size;
  groupBuild.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({
    success: true,
    removedCount: removed,
    remainingEntriesCount: groupBuild.entries.length,
    participantsCount: groupBuild.participantsCount
  });
});
