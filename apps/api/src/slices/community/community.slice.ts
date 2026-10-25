import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import QRCode from 'qrcode';
import {
  ContestRecord,
  ShopRecord,
  ShopStockItem,
  WishlistStockAlert,
  StashItemRecord,
  ContestEntryRecord,
  CreateContestEntryRequest,
  VoteContestEntryResponse,
  JudgeScoreRecord,
  ContestCertificateRecord
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';
import { sendTenantEmailViaResend } from '../notifications-resend/resend.slice';

export const communityRouter = Router();

export interface RubricValidationResult {
  valid: boolean;
  error?: string;
  scores?: {
    assembly: number;
    painting: number;
    finish: number;
    creativity: number;
  };
}

export function validateRubricScores(scores: any): RubricValidationResult {
  if (!scores || typeof scores !== 'object') {
    return {
      valid: false,
      error: 'Debe proporcionar las puntuaciones de la rúbrica (assembly, painting, finish, creativity).'
    };
  }
  const numAssembly = Number(scores.assembly);
  const numPainting = Number(scores.painting);
  const numFinish = Number(scores.finish);
  const numCreativity = Number(scores.creativity);

  if (
    isNaN(numAssembly) || numAssembly < 1 || numAssembly > 10 ||
    isNaN(numPainting) || numPainting < 1 || numPainting > 10 ||
    isNaN(numFinish) || numFinish < 1 || numFinish > 10 ||
    isNaN(numCreativity) || numCreativity < 1 || numCreativity > 10
  ) {
    return {
      valid: false,
      error: 'Cada criterio de la rúbrica (assembly, painting, finish, creativity) debe ser un número entre 1 y 10.'
    };
  }

  return {
    valid: true,
    scores: {
      assembly: numAssembly,
      painting: numPainting,
      finish: numFinish,
      creativity: numCreativity
    }
  };
}

export function computeJudgeMetrics(judgeScores: Array<{ totalScore: number }>): {
  judgeCount: number;
  judgeScoreAverage: number;
} {
  if (!judgeScores || judgeScores.length === 0) {
    return { judgeCount: 0, judgeScoreAverage: 0 };
  }
  const sum = judgeScores.reduce((acc, curr) => acc + curr.totalScore, 0);
  return {
    judgeCount: judgeScores.length,
    judgeScoreAverage: Number((sum / judgeScores.length).toFixed(1))
  };
}

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
    coverImageUrl: '/legacy-media/plamoscale/images/aperich/fulls/1.JPG',
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
    coverImageUrl: '/legacy-media/plamoscale/images/fog1labs1/fulls/50.jpg',
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

export function getContestsFromDb(): ContestRecord[] {
  const db = getDb();
  if (db.contests && db.contests.length > 0) {
    return db.contests;
  }
  return INITIAL_CONTESTS;
}

export function getShopsFromDb(): ShopRecord[] {
  const db = getDb();
  if (db.shops && db.shops.length > 0) {
    return db.shops;
  }
  return INITIAL_SHOPS;
}

export const INITIAL_SHOP_STOCK: ShopStockItem[] = [
  {
    id: 'stock-hinu-gunplaperu',
    shopId: 'shop-gunpla-peru-store',
    kitId: 'kit-rg-hinu',
    kitName: 'RG 1/144 Hi-Nu Gundam',
    brand: 'Bandai Spirits',
    scale: '1/144',
    grade: 'RG (Real Grade)',
    category: 'gunpla-mecha',
    pricePEN: 239.90,
    inStock: true,
    stockCount: 4,
    discountPercentage: 5,
    promoLabel: 'Llegada Reciente',
    shopUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    lastUpdated: '2026-10-25T00:00:00Z'
  },
  {
    id: 'stock-barbatos-plamoscale',
    shopId: 'shop-plamoscale-trusted-catalog',
    kitId: 'kit-mg-barbatos',
    kitName: 'MG 1/100 Gundam Barbatos',
    brand: 'Bandai Spirits',
    scale: '1/100',
    grade: 'MG (Master Grade)',
    category: 'gunpla-mecha',
    pricePEN: 210.00,
    inStock: true,
    stockCount: 2,
    promoLabel: 'Stock Limitado',
    shopUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    lastUpdated: '2026-10-25T00:00:00Z'
  },
  {
    id: 'stock-tiger1-scalehobby',
    shopId: 'shop-scale-hobby-art',
    kitId: 'kit-tamiya-tiger1',
    kitName: 'Tiger I Early Production',
    brand: 'Tamiya',
    scale: '1/35',
    category: 'military',
    pricePEN: 165.00,
    inStock: true,
    stockCount: 3,
    discountPercentage: 10,
    promoLabel: '10% OFF en Efectivo',
    shopUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    lastUpdated: '2026-10-25T00:00:00Z'
  },
  {
    id: 'stock-spitfire-scalehobby',
    shopId: 'shop-scale-hobby-art',
    kitId: 'kit-tamiya-spitfire',
    kitName: 'Supermarine Spitfire Mk.I',
    brand: 'Tamiya',
    scale: '1/48',
    category: 'aviation',
    pricePEN: 145.00,
    inStock: true,
    stockCount: 5,
    shopUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    lastUpdated: '2026-10-25T00:00:00Z'
  }
];

export function getShopStockFromDb(): ShopStockItem[] {
  const db = getDb();
  if (db.shopStock && db.shopStock.length > 0) {
    return db.shopStock;
  }
  return INITIAL_SHOP_STOCK;
}

export function matchWishlistWithShopStock(
  stashItems: StashItemRecord[],
  stockItems: ShopStockItem[],
  shops: ShopRecord[]
): WishlistStockAlert[] {
  const wishlistItems = (stashItems || []).filter(item => item.status === 'wishlist');
  const availableStock = (stockItems || []).filter(s => s.inStock);
  const alerts: WishlistStockAlert[] = [];

  for (const item of wishlistItems) {
    const matches = availableStock.filter(stock => {
      if (item.kitId && stock.kitId && item.kitId === stock.kitId) {
        return true;
      }
      if (item.kit?.name && stock.kitName) {
        const norm1 = item.kit.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const norm2 = stock.kitName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)) {
          return true;
        }

        // Token-based matching ignoring scale fractions like 1/144, 1/100, etc.
        const cleanWords = (str: string) =>
          str.toLowerCase()
            .replace(/\b1\/\d+\b/g, '') // remove scale like 1/144, 1/100
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 1 && !/^\d+$/.test(w));

        const words1 = cleanWords(item.kit.name);
        const words2 = cleanWords(stock.kitName);
        if (words1.length > 0 && words2.length > 0) {
          const matchCount = words1.filter(w => words2.includes(w)).length;
          if (matchCount >= Math.min(2, words1.length) && (matchCount / words1.length >= 0.6 || matchCount / words2.length >= 0.6)) {
            return true;
          }
        }
      }
      return false;
    });

    for (const match of matches) {
      const shop = shops.find(s => s.id === match.shopId);
      alerts.push({
        stashItemId: item.id,
        kitId: match.kitId || item.kitId,
        kitName: match.kitName || item.kit?.name || 'Kit Deseado',
        brand: match.brand || item.kit?.brand || 'Bandai',
        scale: match.scale || item.kit?.scale,
        shopId: match.shopId,
        shopName: shop ? shop.name : match.shopId,
        shopCity: shop ? shop.city : 'Lima',
        pricePEN: match.pricePEN,
        discountPercentage: match.discountPercentage,
        promoLabel: match.promoLabel,
        shopWhatsappUrl: shop?.whatsappUrl || match.shopUrl,
        shopCatalogUrl: shop?.catalogUrl || match.shopUrl,
        shopWebsiteUrl: shop?.websiteUrl,
        inStock: match.inStock,
        matchedAt: new Date().toISOString()
      });
    }
  }

  return alerts;
}

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

  let items = getContestsFromDb().map(contest => {
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
  const contest = getContestsFromDb().find(
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

  const contest = getContestsFromDb().find(c => c.id === contestId || c.slug === contestId);
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

  const contest = getContestsFromDb().find(c => c.id === contestId || c.slug === contestId);
  if (!contest) {
    return sendProblem(
      req,
      res,
      404,
      'Concurso No Encontrado',
      `El concurso '${contestId}' no existe.`
    );
  }

  const db = getDb();
  if (!db.contestEntries) {
    db.contestEntries = [...INITIAL_CONTEST_ENTRIES];
  }

  const entry = db.contestEntries.find(
    e => e.id === entryId && (e.contestId === contest.id || e.contestId === contest.slug)
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

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildCertificateHtml(cert: ContestCertificateRecord): string {
  const accentGold =
    cert.rank === 1
      ? '#eab308'
      : cert.rank === 2
      ? '#94a3b8'
      : cert.rank === 3
      ? '#d97706'
      : '#38bdf8';
  const badgeEmoji =
    cert.rank === 1 ? '🥇' : cert.rank === 2 ? '🥈' : cert.rank === 3 ? '🥉' : '📜';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado Oficial — ${escapeHtml(cert.entryTitle)}</title>
  <style>
    @page { size: landscape; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', serif;
      background: #0f172a;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .cert-frame {
      width: 100%;
      max-width: 900px;
      background: #fdfbf7;
      border: 12px double ${accentGold};
      border-radius: 12px;
      padding: 40px 50px;
      text-align: center;
      position: relative;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    }
    .cert-header {
      font-family: 'Georgia', serif;
      font-size: 24px;
      letter-spacing: 2px;
      color: #334155;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .cert-title {
      font-family: 'Georgia', serif;
      font-size: 38px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 1px;
      margin-bottom: 18px;
      border-bottom: 2px solid ${accentGold};
      display: inline-block;
      padding-bottom: 6px;
    }
    .cert-body {
      font-size: 18px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .cert-name {
      font-size: 34px;
      font-weight: 700;
      color: #0f172a;
      font-family: 'Georgia', serif;
      margin: 8px 0;
      text-decoration: underline;
      text-decoration-color: ${accentGold};
    }
    .cert-rank-badge {
      display: inline-block;
      background: ${accentGold};
      color: #fff;
      font-weight: 700;
      font-size: 19px;
      padding: 8px 24px;
      border-radius: 9999px;
      margin: 12px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .cert-details-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 20px;
      margin-top: 26px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: left;
    }
    .cert-signature {
      text-align: center;
    }
    .sig-line {
      width: 170px;
      border-bottom: 1px solid #64748b;
      margin: 0 auto 6px;
    }
    .sig-title {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
    }
    .cert-qr {
      text-align: center;
    }
    .cert-code {
      font-family: monospace;
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .cert-frame { box-shadow: none; max-width: 100%; border-width: 8px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="cert-header">${escapeHtml(cert.contestTitle)}</div>
    <div class="cert-title">Diploma Oficial de Honor & Mérito</div>
    
    <div class="cert-body">
      Por cuanto el modelista
      <div class="cert-name">${escapeHtml(cert.builderName)}</div>
      ha participado y presentado con distinción sobresaliente la obra
      <div style="font-size: 21px; font-weight: 700; color: #1e293b; margin: 6px 0;">«${escapeHtml(cert.entryTitle)}»</div>
      haciéndose acreedor al galardón oficial:
      <br>
      <div class="cert-rank-badge">${badgeEmoji} ${escapeHtml(cert.rankTitle)}</div>
      ${cert.judgeAverageScore ? `<div style="font-size: 14px; color: #64748b; margin-top: 4px;">Puntuación Promedio de Rúbrica Oficial: <strong>${cert.judgeAverageScore.toFixed(1)} / 40.0 pts</strong> | Votos Comunitarios: <strong>${cert.voteCount}</strong></div>` : ''}
    </div>

    <div class="cert-details-grid">
      <div class="cert-signature">
        <div class="sig-line"></div>
        <div style="font-weight: 700; font-size: 14px;">Comité de Jueces IPMS / Gunpla</div>
        <div class="sig-title">Jurado Oficial Certificado</div>
      </div>

      <div class="cert-qr">
        <img src="${cert.qrCodeDataUrl}" width="80" height="80" alt="QR Verificación">
        <div class="cert-code">${cert.verificationCode}</div>
      </div>

      <div class="cert-signature">
        <div class="sig-line"></div>
        <div style="font-weight: 700; font-size: 14px;">Comunidad ${cert.tenantSlug === 'gunplajunkies' ? 'GunplaJunkies' : 'PlamoScale'}</div>
        <div class="sig-title">Emisión: ${new Date(cert.issuedAt).toLocaleDateString('es-ES')}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * POST /api/v1/contests/:id/entries/:entryId/judge
 * Official Judge Scoring with Standard 4-Criteria Rubric (Assembly, Painting, Finish, Creativity)
 */
communityRouter.post('/contests/:id/entries/:entryId/judge', requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  const { id: contestId, entryId } = req.params;
  const { scores, feedback } = req.body || {};

  const isJudge =
    user.roles.includes('admin') ||
    user.roles.includes('tenant_admin') ||
    user.username === 'rpineda' ||
    user.roles.includes('moderator');

  if (!isJudge) {
    return sendProblem(
      req,
      res,
      403,
      'Permiso Denegado',
      'Solo jueces designados o administradores pueden emitir calificaciones oficiales de concurso.',
      'forbidden-judge'
    );
  }

  const rubric = validateRubricScores(scores);
  if (!rubric.valid || !rubric.scores) {
    return sendProblem(
      req,
      res,
      400,
      'Puntuaciones Inválidas',
      rubric.error || 'Cada criterio de la rúbrica debe ser un número entre 1 y 10.',
      'validation-error'
    );
  }

  const { assembly: numAssembly, painting: numPainting, finish: numFinish, creativity: numCreativity } = rubric.scores;

  const contest = getContestsFromDb().find(c => c.id === contestId || c.slug === contestId);
  if (!contest) {
    return sendProblem(
      req,
      res,
      404,
      'Concurso No Encontrado',
      `El concurso '${contestId}' no existe.`
    );
  }

  const db = getDb();
  if (!db.contestEntries) {
    db.contestEntries = [...INITIAL_CONTEST_ENTRIES];
  }

  const entry = db.contestEntries.find(
    e => e.id === entryId && (e.contestId === contest.id || e.contestId === contest.slug)
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

  if (!entry.judgeScores) {
    entry.judgeScores = [];
  }

  const totalScore = numAssembly + numPainting + numFinish + numCreativity;
  const existingIndex = entry.judgeScores.findIndex(j => j.judgeUserId === user.id);

  const judgeRecord: JudgeScoreRecord = {
    id: existingIndex >= 0 ? entry.judgeScores[existingIndex].id : `jscore-${randomUUID().slice(0, 8)}`,
    entryId: entry.id,
    judgeUserId: user.id,
    judgeUsername: user.username,
    judgeDisplayName: user.username,
    scores: {
      assembly: numAssembly,
      painting: numPainting,
      finish: numFinish,
      creativity: numCreativity
    },
    totalScore,
    feedback: feedback ? String(feedback).trim().slice(0, 500) : undefined,
    createdAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    entry.judgeScores[existingIndex] = judgeRecord;
  } else {
    entry.judgeScores.push(judgeRecord);
  }

  // Update summary metrics on entry
  const metrics = computeJudgeMetrics(entry.judgeScores);
  entry.judgeCount = metrics.judgeCount;
  entry.judgeScoreAverage = metrics.judgeScoreAverage;

  saveDb(db);

  // Trigger transactional email notification via Resend to entry author
  const authorUser = (db.users || []).find(
    (u) => u.id === entry.userId || u.username.toLowerCase() === entry.username.toLowerCase()
  );
  const authorEmail = authorUser?.email || `${entry.username}@plamoscale.com`;

  const activeTenant =
    req.tenant ||
    (db.tenants || []).find((t) => t.slug === contest.tenantSlug) || {
      slug: contest.tenantSlug || 'gunplajunkies',
      name: contest.tenantSlug === 'plamoscale' ? 'PlamoScale' : 'GunplaJunkies',
      domain: contest.tenantSlug === 'plamoscale' ? 'plamoscale.com' : 'gunplajunkies.com',
      emailFrom:
        contest.tenantSlug === 'plamoscale'
          ? 'PlamoScale <noreply@plamoscale.com>'
          : 'GunplaJunkies <noreply@gunplajunkies.com>',
      contactEmail:
        contest.tenantSlug === 'plamoscale'
          ? 'contacto@plamoscale.com'
          : 'contacto@gunplajunkies.com'
    };

  try {
    await sendTenantEmailViaResend({
      tenant: activeTenant as any,
      to: [authorEmail],
      replyTo: user.email || activeTenant.contactEmail,
      subject: `[${activeTenant.name}] Evaluacion oficial de Jurado: ${entry.title} (${totalScore}/40 pts)`,
      html: `<h2>Evaluacion Oficial de Jurado - ${contest.title}</h2>
<p>Hola <strong>${entry.userDisplayName || entry.username}</strong>,</p>
<p>El juez oficial <strong>${user.username}</strong> ha calificado tu participacion en el concurso <strong>${contest.title}</strong>:</p>
<div style="background:#1a2332;padding:16px;border-radius:8px;color:#e2e8f0;margin:16px 0;font-family:sans-serif;">
  <h3 style="margin-top:0;color:#38bdf8;">Puntuacion Total: ${totalScore} / 40 pts</h3>
  <ul style="line-height:1.6;">
    <li><strong>Montaje & Construccion:</strong> ${numAssembly} / 10 pts</li>
    <li><strong>Pintura & Aerografia:</strong> ${numPainting} / 10 pts</li>
    <li><strong>Acabado & Weathering:</strong> ${numFinish} / 10 pts</li>
    <li><strong>Creatividad & Presentacion:</strong> ${numCreativity} / 10 pts</li>
  </ul>
  <p><strong>Promedio acumulado actual:</strong> ${entry.judgeScoreAverage} pts (${entry.judgeCount} evaluaciones de jurado)</p>
  ${feedback ? `<p><strong>Retroalimentacion del Juez:</strong></p><blockquote style="border-left:3px solid #38bdf8;padding-left:12px;color:#94a3b8;font-style:italic;">${String(feedback).trim()}</blockquote>` : ''}
</div>
<p>Puedes revisar los resultados completos y el podio en la seccion de concursos de la comunidad.</p>`
    });
  } catch (emailErr) {
    console.error('Failed to dispatch contest judge email notification:', emailErr);
  }

  return res.status(200).json({
    entry,
    judgeScore: judgeRecord
  });
});

/**
 * GET /api/v1/contests/:id/entries/:entryId/judge-scores
 * Retrieve all official judge scoring records and feedback for an entry
 */
communityRouter.get('/contests/:id/entries/:entryId/judge-scores', (req: Request, res: Response) => {
  const { id: contestId, entryId } = req.params;
  const contest = getContestsFromDb().find(c => c.id === contestId || c.slug === contestId);
  if (!contest) {
    return sendProblem(
      req,
      res,
      404,
      'Concurso No Encontrado',
      `El concurso '${contestId}' no existe.`
    );
  }

  const db = getDb();
  if (!db.contestEntries) {
    db.contestEntries = [...INITIAL_CONTEST_ENTRIES];
  }

  const entry = db.contestEntries.find(
    e => e.id === entryId && (e.contestId === contest.id || e.contestId === contest.slug)
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

  return res.json({
    entryId: entry.id,
    judgeScores: entry.judgeScores || [],
    judgeScoreAverage: entry.judgeScoreAverage || 0,
    judgeCount: entry.judgeCount || 0
  });
});

/**
 * GET /api/v1/contests/:id/entries/:entryId/certificate
 * Generate official competition certificate / diploma with QR code verification
 */
communityRouter.get('/contests/:id/entries/:entryId/certificate', async (req: Request, res: Response) => {
  const { id: contestId, entryId } = req.params;
  const format = req.query.format as string | undefined;

  const contest = getContestsFromDb().find(c => c.id === contestId || c.slug === contestId);
  if (!contest) {
    return sendProblem(
      req,
      res,
      404,
      'Concurso No Encontrado',
      `El concurso '${contestId}' no existe.`
    );
  }

  const db = getDb();
  if (!db.contestEntries) {
    db.contestEntries = [...INITIAL_CONTEST_ENTRIES];
  }

  const contestEntries = db.contestEntries.filter(
    e => e.contestId === contest.id || e.contestId === contest.slug
  );

  const entry = contestEntries.find(e => e.id === entryId);
  if (!entry) {
    return sendProblem(
      req,
      res,
      404,
      'Inscripción No Encontrada',
      `No se encontró la inscripción '${entryId}' en este concurso.`
    );
  }

  // Sort approved entries by composite score (judgeScoreAverage 70% + voteCount 30%)
  const sorted = [...contestEntries].sort((a, b) => {
    const scoreA = ((a.judgeScoreAverage || 0) * 0.7) + (a.voteCount * 0.3);
    const scoreB = ((b.judgeScoreAverage || 0) * 0.7) + (b.voteCount * 0.3);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.voteCount - a.voteCount;
  });

  const rank = Math.max(1, sorted.findIndex(e => e.id === entry.id) + 1);
  const rankTitle =
    rank === 1
      ? '1er Lugar - Medalla de Oro'
      : rank === 2
      ? '2do Lugar - Medalla de Plata'
      : rank === 3
      ? '3er Lugar - Medalla de Bronce'
      : 'Diploma de Honor y Participación';

  const verificationCode = `CERT-${contest.slug.slice(0, 6).toUpperCase()}-${entry.id.replace('entry-', '').toUpperCase()}`;
  const verifyHost = contest.tenantSlug === 'gunplajunkies' ? 'www.gunplajunkies.com' : 'www.plamoscale.com';
  const verifyUrl = `https://${verifyHost}#entry-${entry.id}`;

  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    });
  } catch (err) {
    qrCodeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  const certificate: ContestCertificateRecord = {
    certificateId: `cert-${randomUUID().slice(0, 8)}`,
    verificationCode,
    contestTitle: contest.title,
    tenantSlug: contest.tenantSlug,
    category: entry.category,
    builderName: entry.userDisplayName || entry.username,
    entryTitle: entry.title,
    rank,
    rankTitle,
    judgeAverageScore: entry.judgeScoreAverage,
    voteCount: entry.voteCount,
    qrCodeDataUrl,
    verifyUrl,
    issuedAt: new Date().toISOString(),
    organizerSignatures: [
      { title: 'Jurado Oficial Certificado', name: 'Comité de Jueces IPMS / Gunpla' },
      { title: 'Organizador', name: contest.tenantSlug === 'gunplajunkies' ? 'GunplaJunkies' : 'PlamoScale' }
    ]
  };

  certificate.htmlTemplate = buildCertificateHtml(certificate);

  if (format === 'html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(certificate.htmlTemplate);
  }

  return res.json(certificate);
});

/**
 * GET /api/v1/shops
 * List verified trusted shops directory
 */
communityRouter.get('/shops', (_req: Request, res: Response) => {
  const shops = getShopsFromDb();
  return res.json({
    items: shops,
    totalCount: shops.length
  });
});

/**
 * GET /api/v1/shops/:id
 * Retrieve shop details with associated stock items
 */
communityRouter.get('/shops/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const shops = getShopsFromDb();
  const shop = shops.find(s => s.id === id);
  if (!shop) {
    return sendProblem(req, res, 404, 'Tienda No Encontrada', `La tienda '${id}' no existe.`);
  }

  const allStock = getShopStockFromDb();
  const shopStock = allStock.filter(s => s.shopId === id);

  return res.json({
    ...shop,
    stockItems: shopStock
  });
});

/**
 * GET /api/v1/shops/:id/stock
 * List stock items for a trusted shop
 */
communityRouter.get('/shops/:id/stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const shops = getShopsFromDb();
  const shop = shops.find(s => s.id === id);
  if (!shop) {
    return sendProblem(req, res, 404, 'Tienda No Encontrada', `La tienda '${id}' no existe.`);
  }

  const allStock = getShopStockFromDb();
  const shopStock = allStock.filter(s => s.shopId === id);

  return res.json({
    shopId: id,
    shopName: shop.name,
    items: shopStock,
    totalCount: shopStock.length
  });
});

/**
 * POST /api/v1/shops/:id/stock
 * Add or update stock item in a trusted shop
 * Emits transactional notification to modelers who have this kit in their wishlist
 */
communityRouter.post('/shops/:id/stock', requireAuth, async (req: Request, res: Response) => {
  const { id: shopId } = req.params;
  const user = req.user!;
  const shops = getShopsFromDb();
  const shop = shops.find(s => s.id === shopId);
  if (!shop) {
    return sendProblem(req, res, 404, 'Tienda No Encontrada', `La tienda '${shopId}' no existe.`);
  }

  const { kitId, kitName, brand, scale, grade, category, pricePEN, inStock, stockCount, discountPercentage, promoLabel, shopUrl } = req.body || {};

  if (!kitName || pricePEN === undefined || pricePEN === null) {
    return sendProblem(
      req,
      res,
      400,
      'Datos Incompletos',
      'kitName y pricePEN son campos obligatorios para registrar inventario.',
      'validation-error'
    );
  }

  const numPrice = Number(pricePEN);
  if (isNaN(numPrice) || numPrice <= 0) {
    return sendProblem(
      req,
      res,
      400,
      'Precio Inválido',
      'El precio (pricePEN) debe ser un número positivo.',
      'validation-error'
    );
  }

  const db = getDb();
  if (!db.shopStock) {
    db.shopStock = [...INITIAL_SHOP_STOCK];
  }

  const now = new Date().toISOString();
  const existingIndex = db.shopStock.findIndex(
    s => s.shopId === shopId && (s.kitId === kitId || s.kitName.toLowerCase() === String(kitName).trim().toLowerCase())
  );

  const stockItem: ShopStockItem = {
    id: existingIndex >= 0 ? db.shopStock[existingIndex].id : `stock-${randomUUID().slice(0, 8)}`,
    shopId,
    kitId: kitId || undefined,
    kitName: String(kitName).trim(),
    brand: brand ? String(brand).trim() : 'Bandai Spirits',
    scale: scale ? String(scale).trim() : undefined,
    grade: grade ? String(grade).trim() : undefined,
    category: category || 'gunpla-mecha',
    pricePEN: numPrice,
    inStock: inStock !== false,
    stockCount: stockCount !== undefined ? Number(stockCount) : 1,
    discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
    promoLabel: promoLabel ? String(promoLabel).trim() : undefined,
    shopUrl: shopUrl ? String(shopUrl).trim() : (shop.whatsappUrl || shop.catalogUrl),
    lastUpdated: now
  };

  if (existingIndex >= 0) {
    db.shopStock[existingIndex] = stockItem;
  } else {
    db.shopStock.push(stockItem);
  }

  saveDb(db);

  // If item is in stock, alert modelers with this kit in their wishlist
  let notifiedUsersCount = 0;
  if (stockItem.inStock) {
    const matchingStashItems = (db.stashItems || []).filter(
      s => s.status === 'wishlist' && (s.kitId === stockItem.kitId || s.kitId === kitId)
    );

    const activeTenant = req.tenant || (db.tenants || [])[0];

    for (const stashItem of matchingStashItems) {
      const targetUser = (db.users || []).find(u => u.id === stashItem.userId);
      if (targetUser && targetUser.email) {
        notifiedUsersCount++;
        const discountText = stockItem.discountPercentage ? ` (${stockItem.discountPercentage}% de descuento)` : '';
        sendTenantEmailViaResend({
          tenant: activeTenant,
          to: [targetUser.email],
          subject: `🔔 ¡Alerta de Stock! ${stockItem.kitName} disponible en ${shop.name}`,
          html: `
            <div style="font-family: sans-serif; background: #0b0f19; color: #f1f5f9; padding: 24px; border-radius: 8px;">
              <h2 style="color: #38bdf8; margin-top: 0;">¡Un kit de tu Wishlist llegó a tienda!</h2>
              <p>Hola <strong>${targetUser.displayName}</strong>,</p>
              <p>El kit que guardaste en tu lista de deseos de tu taller ya tiene stock disponible:</p>
              <div style="background: #111827; border-left: 4px solid #38bdf8; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 8px 0; color: #ffffff;">${stockItem.kitName}</h3>
                <p style="margin: 4px 0; color: #94a3b8;">Tienda: <strong style="color: #ffffff;">${shop.name}</strong> (${shop.city})</p>
                <p style="margin: 4px 0; color: #4ade80; font-size: 1.15rem; font-weight: bold;">Precio: PEN ${stockItem.pricePEN.toFixed(2)}${discountText}</p>
                ${stockItem.promoLabel ? `<p style="margin: 4px 0; color: #facc15; font-size: 0.85rem;">🏷️ ${stockItem.promoLabel}</p>` : ''}
              </div>
              <p>Puedes contactar a la tienda directamente por WhatsApp o revisar su catálogo para coordinar tu compra:</p>
              <div style="margin: 20px 0;">
                ${shop.whatsappUrl ? `<a href="${shop.whatsappUrl}" style="background: #22c55e; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 12px; display: inline-block;">💬 Contactar por WhatsApp</a>` : ''}
                ${shop.catalogUrl ? `<a href="${shop.catalogUrl}" style="background: #3b82f6; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">🌐 Ver Catálogo</a>` : ''}
              </div>
              <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
              <p style="font-size: 0.8rem; color: #64748b;">Notificación automática de Stock Wishlist • ${activeTenant.name}</p>
            </div>
          `
        }).catch(() => {});
      }
    }
  }

  return res.status(201).json({
    stockItem,
    notifiedUsersCount
  });
});
