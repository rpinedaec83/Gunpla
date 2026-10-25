import { Router, Request, Response } from 'express';
import sharp from 'sharp';
import { generateSocialCardSvg, SocialCardOptions } from '@gunpla/shared';
import { getDb } from '../../core/db';
import { getContestAwards, getHallOfFame } from '../community/community.slice';

export const ogRouter = Router();

async function sendSvgOrPng(svg: string, req: Request, res: Response) {
  const format = String(req.query.format || '').toLowerCase();
  if (format === 'svg') {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(svg);
  }

  try {
    const pngBuffer = await sharp(Buffer.from(svg))
      .resize(1200, 630)
      .png({ quality: 90 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(pngBuffer);
  } catch (err) {
    console.warn('[OG Card] Sharp PNG generation fallback to SVG:', err);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(svg);
  }
}

/**
 * GET /api/v1/og/builds/:slugOrId
 * Dynamic 1200x630 social preview card for a specific build project
 */
ogRouter.get('/builds/:slugOrId', async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const db = getDb();

  const build = db.builds?.find((b) => b.slug === slugOrId || b.id === slugOrId);

  const tenantSlug = req.tenant?.slug || (build?.category === 'gunpla-mecha' ? 'gunplajunkies' : 'plamoscale');
  const tenantName = req.tenant?.name || (tenantSlug === 'gunplajunkies' ? 'GunplaJunkies' : 'PlamoScale');
  const isGunpla = tenantSlug === 'gunplajunkies';

  if (!build) {
    const defaultOptions: SocialCardOptions = {
      tenantName,
      tenantSlug: isGunpla ? 'gunplajunkies' : 'plamoscale',
      badge: isGunpla ? 'GUNPLA JUNKIES PERU' : 'PLAMOSCALE LATAM',
      title: 'Bitácora de Armado y Pintura',
      subtitle: 'Comunidad de modelismo a escala y bitácoras de proyectos',
      metadataPills: ['Modelismo a Escala', 'Bitácoras', 'Comunidad'],
      canonicalDomain: isGunpla ? 'gunplajunkies.com' : 'plamoscale.com'
    };
    const svg = generateSocialCardSvg(defaultOptions);
    return sendSvgOrPng(svg, req, res);
  }

  const author = db.users.find((u) => u.username === build.username || u.id === build.userId);
  const kit = build.kitId ? db.kits?.find((k) => k.id === build.kitId) : undefined;

  const metadataPills = [
    build.scale || kit?.scale,
    build.grade || kit?.grade,
    build.category === 'gunpla-mecha' ? 'Gunpla & Mecha' : (build.category || 'Modelismo'),
    build.status === 'completed' ? 'Terminado' : 'En Progreso'
  ].filter(Boolean) as string[];

  const stepsCount = (build.steps || []).length || 0;
  const likeCount = build.likeCount || (build.likedByUserIds || []).length || 0;

  const options: SocialCardOptions = {
    tenantName,
    tenantSlug: isGunpla ? 'gunplajunkies' : 'plamoscale',
    badge: 'BITACORA DE MONTAJE Y PINTURA',
    title: build.title,
    subtitle: build.subtitle,
    authorDisplayName: build.userDisplayName || author?.displayName || build.username,
    authorUsername: build.username,
    metadataPills,
    stats: [
      { label: 'Pasos', value: String(stepsCount) },
      { label: 'Likes', value: String(likeCount) },
      { label: 'Estado', value: build.status === 'completed' ? 'Armado' : 'WIP' }
    ],
    canonicalDomain: isGunpla ? 'gunplajunkies.com' : 'plamoscale.com'
  };

  const svg = generateSocialCardSvg(options);
  return sendSvgOrPng(svg, req, res);
});

/**
 * GET /api/v1/og/contests/:id
 * Dynamic 1200x630 social preview card for contest podium and winner results
 */
ogRouter.get('/contests/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const contest = db.contests?.find((c) => c.id === id || c.slug === id);

  const tenantSlug = req.tenant?.slug || (contest?.tenantSlug === 'gunplajunkies' ? 'gunplajunkies' : 'plamoscale');
  const tenantName = req.tenant?.name || (tenantSlug === 'gunplajunkies' ? 'GunplaJunkies' : 'PlamoScale');
  const isGunpla = tenantSlug === 'gunplajunkies';

  const podiumData = contest ? getContestAwards(contest.id) : null;
  const podiumEntries: SocialCardOptions['podium'] = [];

  if (podiumData && podiumData.podium.length > 0) {
    for (const p of podiumData.podium.slice(0, 3)) {
      podiumEntries.push({
        rankTitle: p.awardTitle,
        medal: p.medalIcon || (p.rank === 1 ? '🥇' : (p.rank === 2 ? '🥈' : '🥉')),
        entryTitle: p.entryTitle,
        builderName: p.userDisplayName || p.username,
        score: p.judgeAverageScore ? `${p.judgeAverageScore}/40` : undefined
      });
    }
  }

  const options: SocialCardOptions = {
    tenantName,
    tenantSlug: isGunpla ? 'gunplajunkies' : 'plamoscale',
    badge: 'PODIO DE CONCURSOS & SALON DE LA FAMA',
    title: contest ? contest.title : 'Concurso Oficial de Modelismo',
    subtitle: contest ? `Certamen ${contest.status === 'completed' ? 'Finalizado' : 'Activo'} · Premiación Oficial` : 'Podio y Ganadores',
    podium: podiumEntries.length > 0 ? podiumEntries : undefined,
    canonicalDomain: isGunpla ? 'gunplajunkies.com' : 'plamoscale.com'
  };

  const svg = generateSocialCardSvg(options);
  return sendSvgOrPng(svg, req, res);
});

/**
 * GET /api/v1/og/hall-of-fame
 * Dynamic 1200x630 social preview card for public Hall of Fame
 */
ogRouter.get('/hall-of-fame', async (req: Request, res: Response) => {
  const tenantSlug = req.tenant?.slug || 'plamoscale';
  const tenantName = req.tenant?.name || (tenantSlug === 'gunplajunkies' ? 'GunplaJunkies' : 'PlamoScale');
  const isGunpla = tenantSlug === 'gunplajunkies';

  const hofItems = getHallOfFame(tenantSlug === 'all' ? undefined : tenantSlug);
  const podiumEntries: SocialCardOptions['podium'] = [];

  for (const h of hofItems.slice(0, 3)) {
    podiumEntries.push({
      rankTitle: h.awardTitle,
      medal: h.medalIcon || (h.rank === 1 ? '🥇' : (h.rank === 2 ? '🥈' : '🥉')),
      entryTitle: h.entryTitle,
      builderName: h.userDisplayName || h.username,
      score: h.judgeAverageScore ? `${h.judgeAverageScore}/40` : undefined
    });
  }

  const options: SocialCardOptions = {
    tenantName,
    tenantSlug: isGunpla ? 'gunplajunkies' : 'plamoscale',
    badge: 'SALON DE LA FAMA Y GALERIA DE HONOR',
    title: 'Salón de la Fama de Modelismo',
    subtitle: 'Obras maestras condecoradas con Oro, Plata, Bronce y Voto Popular',
    podium: podiumEntries.length > 0 ? podiumEntries : undefined,
    canonicalDomain: isGunpla ? 'gunplajunkies.com' : 'plamoscale.com'
  };

  const svg = generateSocialCardSvg(options);
  return sendSvgOrPng(svg, req, res);
});

/**
 * GET /api/v1/og/default
 * Default tenant social preview card
 */
ogRouter.get('/default', async (req: Request, res: Response) => {
  const tenantSlug = req.tenant?.slug || 'plamoscale';
  const tenantName = req.tenant?.name || (tenantSlug === 'gunplajunkies' ? 'GunplaJunkies' : 'PlamoScale');
  const isGunpla = tenantSlug === 'gunplajunkies';

  const options: SocialCardOptions = {
    tenantName,
    tenantSlug: isGunpla ? 'gunplajunkies' : 'plamoscale',
    badge: isGunpla ? 'GUNPLA JUNKIES PERU' : 'PLAMOSCALE LATAM',
    title: isGunpla ? 'Gunpla & Mecha Modeling Hub' : 'Ecosistema de Modelismo a Escala',
    subtitle: 'Bitácoras de Armado · Catálogo de Pinturas & Kits · Concursos Oficiales',
    metadataPills: isGunpla ? ['Gunpla & Mecha', 'Bitácoras', 'Torneos Gunpla'] : ['Militar 1/35', 'Aviación 1/48', 'Automotriz 1/24', 'Naval'],
    stats: [
      { label: 'Modelistas', value: '50+' },
      { label: 'Bitácoras', value: '100+' },
      { label: 'Pinturas', value: '4 Familias' }
    ],
    canonicalDomain: isGunpla ? 'gunplajunkies.com' : 'plamoscale.com'
  };

  const svg = generateSocialCardSvg(options);
  return sendSvgOrPng(svg, req, res);
});
