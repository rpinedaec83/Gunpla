import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  ContestRecord,
  ShopRecord,
  ContestEntryRecord,
  CreateContestEntryRequest,
  VoteContestEntryResponse
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';

export const communityRouter = Router();

export const INITIAL_CONTESTS: ContestRecord[] = [
  {
    id: 'contest-gunpla-cup-2026',
    slug: 'gunpla-open-cup-2026',
    title: 'Gunpla Open Cup Peru 2026',
    description: 'Competencia anual abierta de Gunpla. Categorías Open Course, Junior y Custom Paint. Juzgamiento por panel de modelistas expertos y votación comunitaria.',
    tenantSlug: 'gunplajunkies',
    category: 'gunpla-mecha',
    bannerUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=1200&q=80',
    startDate: '2026-11-01T00:00:00Z',
    endDate: '2026-12-15T23:59:59Z',
    status: 'active',
    rules: [
      'Modelos auténticos escala 1/144 (HG/RG) o 1/100 (MG/FM).',
      'Pintura y detallado permitidos (se requiere bitácora de construcción con al menos 3 pasos).',
      'Fotografías finales en alta resolución con fondo neutro.'
    ],
    prizes: [
      '1er Puesto: Trofeo Gunpla Cup 2026 + Kit PG Unleashed RX-78-2 Gundam',
      '2do Puesto: Kit MG Ver.Ka a elección + Set Aerógrafo Mr. Hobby',
      '3er Puesto: 2 Kits RG a elección + Set Pinturas Mr. Color'
    ],
    participantsCount: 19
  },
  {
    id: 'contest-plamoscale-masters-2026',
    slug: 'plamoscale-scale-masters-2026',
    title: 'PlamoScale Masters 2026 - Concurso Multidisciplinario',
    description: 'Encuentro nacional de modelismo a escala: Aviación, Vehículos Militares, Automóviles y Dioramas.',
    tenantSlug: 'plamoscale',
    category: 'military',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&q=80',
    startDate: '2026-11-15T00:00:00Z',
    endDate: '2027-01-10T23:59:59Z',
    status: 'active',
    rules: [
      'Kits plásticos a escala en categorías Militar, Aviación, Automotriz y Diorama.',
      'Documentar proceso con técnicas de intemperizado (weathering) y recetas de pintura.',
      'Abierto a modelistas residentes en Latinoamérica.'
    ],
    prizes: [
      'Best of Show: Placa Conmemorativa + Vale de compra $300 en Tiendas de Confianza',
      'Oro por Categoría: Medalla de Oro + Kit escala 1/35 o 1/48 premium',
      'Plata y Bronce: Diplomas de Honor y suministros de acabado'
    ],
    participantsCount: 25
  }
];

export const INITIAL_CONTEST_ENTRIES: ContestEntryRecord[] = [
  {
    id: 'entry-aperich-hinu-cup',
    contestId: 'contest-gunpla-cup-2026',
    buildId: 'build-aperich-hinu',
    userId: 'user-aperich',
    username: 'aperich',
    userDisplayName: 'Aldo Perich',
    title: 'RG 1/144 Hi-Nu Gundam Titanium Finish Custom',
    category: 'gunpla-mecha',
    coverImageUrl: '/legacy-media/plamoscale/images/aperich/fulls/1.jpg',
    voteCount: 14,
    votedByUserIds: ['user-dcampos', 'user-cluna', 'user-fog1labs1'],
    status: 'approved',
    createdAt: '2026-10-24T00:00:00Z'
  },
  {
    id: 'entry-fog1labs1-tiger1-masters',
    contestId: 'contest-plamoscale-masters-2026',
    buildId: 'build-fog1labs1-tiger1',
    userId: 'user-fog1labs1',
    username: 'fog1labs1',
    userDisplayName: 'Fog1 Labs',
    title: 'Tiger I Early Production - Frente Oriental Kursk 1943',
    category: 'military',
    coverImageUrl: '/legacy-media/plamoscale/images/fog1labs1/fulls/1.JPG',
    voteCount: 18,
    votedByUserIds: ['user-aperich', 'user-dcampos'],
    status: 'approved',
    createdAt: '2026-10-24T00:00:00Z'
  }
];

export const INITIAL_SHOPS: ShopRecord[] = [
  {
    id: 'shop-plamoscale-trusted-catalog',
    name: 'Tiendas de Confianza PlamoScale (Catálogo Oficial)',
    description: 'Directorio verificado de distribuidores autorizados de Gunpla, maquetas militares, aerógrafos y pinturas Vallejo, Mr. Color y Tamiya en Perú y la región.',
    country: 'Perú',
    city: 'Lima',
    catalogUrl: 'https://bit.ly/45m7bII',
    whatsappUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    websiteUrl: 'https://www.facebook.com/groups/1397980650669863/?ref=share',
    specialties: ['Gunpla Original Bandai', 'Pinturas Mr. Color & Tamiya', 'Herramientas GodHand & DSPIAE', 'Kits Militares 1/35'],
    isVerified: true
  },
  {
    id: 'shop-gunpla-peru-store',
    name: 'Hobby & Gunpla Perú Store',
    description: 'Importación directa de kits Bandai Spirits, Kotobukiya, pinturas acrílicas y lacas premium para Gunpla y Mecha.',
    country: 'Perú',
    city: 'Lima',
    catalogUrl: 'https://bit.ly/45m7bII',
    whatsappUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    instagramUrl: 'https://www.instagram.com/gunpla_warrior_peru/',
    specialties: ['High Grade (HG)', 'Real Grade (RG)', 'Master Grade (MG)', 'Perfect Grade (PG)', 'Mr. Hobby'],
    isVerified: true
  },
  {
    id: 'shop-scale-hobby-art',
    name: 'Scale Hobby Art & Supplies',
    description: 'Especialistas en fotograbados, orugas metálicas, pigmentos de envejecimiento y maquetas militares de aviación e históricas.',
    country: 'Perú',
    city: 'Arequipa / Lima',
    catalogUrl: 'https://bit.ly/45m7bII',
    whatsappUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    specialties: ['Kits Tamiya & Dragon 1/35', 'Pigmentos Vallejo', 'Aerografía Harder & Steenbeck'],
    isVerified: true
  }
];

/**
 * GET /api/v1/contests
 * Scoped by active tenant context with populated entries
 */
communityRouter.get('/contests', (req: Request, res: Response) => {
  const tenant = req.tenant;
  const db = getDb();

  const allEntries = (db.contestEntries && db.contestEntries.length > 0)
    ? db.contestEntries
    : INITIAL_CONTEST_ENTRIES;

  let items = INITIAL_CONTESTS.map(contest => {
    const entries = allEntries
      .filter(e => e.contestId === contest.id && e.status === 'approved')
      .map(e => ({
        ...e,
        build: db.builds ? db.builds.find(b => b.id === e.buildId) : undefined
      }));

    return {
      ...contest,
      participantsCount: contest.participantsCount + entries.length,
      entries
    };
  });

  if (tenant) {
    items = items.filter(c => c.tenantSlug === 'all' || c.tenantSlug === tenant.slug);
  }

  return res.json({
    items,
    totalCount: items.length
  });
});

/**
 * GET /api/v1/contests/:slugOrId
 */
communityRouter.get('/contests/:slugOrId', (req: Request, res: Response) => {
  const db = getDb();
  const contest = INITIAL_CONTESTS.find(
    c => c.id === req.params.slugOrId || c.slug === req.params.slugOrId
  );

  if (!contest) {
    return sendProblem(
      req,
      res,
      404,
      'Concurso No Encontrado',
      `No se encontró ningún concurso con identificador '${req.params.slugOrId}'.`
    );
  }

  const allEntries = (db.contestEntries && db.contestEntries.length > 0)
    ? db.contestEntries
    : INITIAL_CONTEST_ENTRIES;

  const entries = allEntries
    .filter(e => e.contestId === contest.id && e.status === 'approved')
    .map(e => ({
      ...e,
      build: db.builds ? db.builds.find(b => b.id === e.buildId) : undefined
    }));

  return res.json({
    ...contest,
    entries
  });
});

/**
 * POST /api/v1/contests/:id/entries
 * Submit a personal build project to a contest
 */
communityRouter.post('/contests/:id/entries', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const contestId = req.params.id;
  const { buildId } = req.body as CreateContestEntryRequest;

  if (!buildId || typeof buildId !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'ID de Bitácora Requerido',
      'Debe proporcionar un "buildId" válido para inscribir el proyecto en el concurso.',
      'validation-error'
    );
  }

  const contest = INITIAL_CONTESTS.find(c => c.id === contestId || c.slug === contestId);
  if (!contest) {
    return sendProblem(
      req,
      res,
      404,
      'Concurso No Encontrado',
      `El concurso '${contestId}' no existe.`
    );
  }

  if (contest.status !== 'active') {
    return sendProblem(
      req,
      res,
      400,
      'Concurso No Activo',
      `Las inscripciones para este concurso no están abiertas (Estado: ${contest.status}).`
    );
  }

  const db = getDb();
  const build = (db.builds || []).find(b => b.id === buildId);
  if (!build) {
    return sendProblem(
      req,
      res,
      404,
      'Bitácora No Encontrada',
      `No se encontró el proyecto con id '${buildId}'.`
    );
  }

  if (build.userId !== user.id) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso Prohibido',
      'Solo el modelista autor del proyecto puede inscribirlo en un concurso.'
    );
  }

  // Ensure contestEntries array exists
  if (!db.contestEntries) {
    db.contestEntries = [...INITIAL_CONTEST_ENTRIES];
  }

  // Check duplicate submission
  const alreadySubmitted = db.contestEntries.some(
    e => e.contestId === contest.id && e.buildId === buildId
  );
  if (alreadySubmitted) {
    return sendProblem(
      req,
      res,
      409,
      'Proyecto Ya Inscrito',
      'Esta bitácora ya se encuentra inscrita en este concurso.',
      'duplicate-entry'
    );
  }

  const entryId = `entry-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const newEntry: ContestEntryRecord = {
    id: entryId,
    contestId: contest.id,
    buildId,
    build,
    userId: user.id,
    username: user.username,
    userDisplayName: user.username,
    title: build.title,
    category: build.category,
    coverImageUrl: build.coverImageUrl || build.steps[0]?.photoUrls[0] || '/uploads/sample.jpg',
    voteCount: 0,
    votedByUserIds: [],
    status: 'approved',
    createdAt: now
  };

  db.contestEntries.push(newEntry);
  saveDb(db);

  return res.status(201).json(newEntry);
});

/**
 * POST /api/v1/contests/:id/entries/:entryId/vote
 * Community voting on contest entries
 */
communityRouter.post('/contests/:id/entries/:entryId/vote', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { id: contestId, entryId } = req.params;

  const db = getDb();
  if (!db.contestEntries) {
    db.contestEntries = [...INITIAL_CONTEST_ENTRIES];
  }

  const entry = db.contestEntries.find(
    e => e.id === entryId && (e.contestId === contestId || e.contestId === 'contest-' + contestId)
  );

  if (!entry) {
    return sendProblem(
      req,
      res,
      404,
      'Inscripción No Encontrada',
      `No se encontró la inscripción '${entryId}' en este concurso.`
    );
  }

  const hasVoted = entry.votedByUserIds.includes(user.id);
  if (hasVoted) {
    entry.votedByUserIds = entry.votedByUserIds.filter(id => id !== user.id);
    entry.voteCount = Math.max(entry.voteCount - 1, 0);
  } else {
    entry.votedByUserIds.push(user.id);
    entry.voteCount += 1;
  }

  saveDb(db);

  const response: VoteContestEntryResponse = {
    voted: !hasVoted,
    voteCount: entry.voteCount
  };

  return res.status(200).json(response);
});

/**
 * GET /api/v1/shops
 * List verified trusted shops directory
 */
communityRouter.get('/shops', (_req: Request, res: Response) => {
  return res.json({
    items: INITIAL_SHOPS,
    totalCount: INITIAL_SHOPS.length
  });
});
