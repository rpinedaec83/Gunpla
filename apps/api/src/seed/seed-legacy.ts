import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Tenant, UserRecord, MediaAsset, ScaleCategory, TenantShopLink, CommunityNewsArticle, CommunityFeaturedPhoto } from '@gunpla/shared';
import { getDb, saveDb, PlatformDatabaseState } from '../core/db';
import { INITIAL_KITS, INITIAL_PAINTS } from './seed-catalog';
import { INITIAL_BUILDS } from './seed-builds';
import { INITIAL_CONTESTS, INITIAL_CONTEST_ENTRIES, INITIAL_SHOPS, INITIAL_SHOP_STOCK } from '../slices/community/community.slice';
import { INITIAL_GROUP_BUILDS } from '../slices/community/group-builds.slice';
import { INITIAL_LISTINGS, INITIAL_COMMISSION_BUILDERS, INITIAL_COMMISSION_REQUESTS } from '../slices/marketplace/marketplace.slice';

const ALL_CATEGORIES: ScaleCategory[] = [
  'gunpla-mecha',
  'military',
  'aviation',
  'automotive',
  'naval',
  'figures',
  'scifi',
  'diorama'
];

const GUNPLA_CATEGORIES: ScaleCategory[] = ['gunpla-mecha', 'scifi', 'figures'];

interface LegacyBuilderSeed {
  username: string;
  displayName: string;
  email: string;
  bio: string;
  socialLinks: string[];
  defaultCategory: ScaleCategory;
}

const FOUNDING_BUILDERS: LegacyBuilderSeed[] = [
  {
    username: 'aperich',
    displayName: 'Aldo Perich',
    email: 'aperich@plamoscale.com',
    bio: 'Modelista fundador de PlamoScale Peru (@gunpla_warrior_peru). Especialista en Gunpla, custom builds y pintura.',
    socialLinks: ['https://www.instagram.com/gunpla_warrior_peru/'],
    defaultCategory: 'gunpla-mecha'
  },
  {
    username: 'dcampos',
    displayName: 'Daniel Campos',
    email: 'dcampos@plamoscale.com',
    bio: 'Modelista fundador de PlamoScale Peru (@pun.san_gunpla / @d.de.daniel). Creador de Gunpla y modelos a escala.',
    socialLinks: [
      'https://www.instagram.com/d.de.daniel',
      'https://www.instagram.com/pun.san_gunpla'
    ],
    defaultCategory: 'gunpla-mecha'
  },
  {
    username: 'cluna',
    displayName: 'Cristhian Luna',
    email: 'cluna@plamoscale.com',
    bio: 'Modelista fundador de PlamoScale Peru (@cristhian_ls17). Plastimodelismo y personalizacion de kits.',
    socialLinks: [
      'https://www.instagram.com/cristhian_ls17',
      'https://www.tiktok.com/@rayitothecat'
    ],
    defaultCategory: 'gunpla-mecha'
  },
  {
    username: 'fog1labs1',
    displayName: 'Fernando Garaicoa - fog1labs',
    email: 'fog1labs@plamoscale.com',
    bio: 'Modelista fundador en Fog1Labs Model Builder (@fog1labs). Construccion, modificacion, weathering y pintura avanzada de Model Kits.',
    socialLinks: [
      'https://www.instagram.com/fog1labs',
      'https://www.facebook.com/Fog1Labsmodelbuilder',
      'https://www.tiktok.com/@fog1labs1'
    ],
    defaultCategory: 'gunpla-mecha'
  }
];

export function resolveLegacyPlamoscaleDir(): string {
  // Check relative to repo root from either src/ or dist/
  const candidates = [
    path.resolve(process.cwd(), 'docs/reference/preexisting-root/plamoscale.com'),
    path.resolve(__dirname, '../../../../docs/reference/preexisting-root/plamoscale.com'),
    path.resolve(__dirname, '../../../../../docs/reference/preexisting-root/plamoscale.com')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return candidates[0];
}

export const INITIAL_TENANT_SHOPS: TenantShopLink[] = [
  {
    id: 'tshop-gunpla-peru',
    tenantSlug: 'gunplajunkies',
    shopId: 'shop-gunpla-peru-store',
    isTrusted: true,
    discountCode: 'GUNPLA10',
    discountDescription: '10% de descuento en Gunpla Bandai Spirits y herramientas GodHand',
    customNotes: 'Tienda aliada oficial con stock prioritario para miembros de GunplaJunkies.',
    badgeLabel: 'Tienda Oficial Aliada',
    addedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'tshop-gunpla-catalog',
    tenantSlug: 'gunplajunkies',
    shopId: 'shop-plamoscale-trusted-catalog',
    isTrusted: true,
    discountCode: 'JUNKIES5',
    discountDescription: '5% de descuento en pinturas laca Mr. Color y thinner nivelador',
    customNotes: 'Distribuidor certificado con envios express en Lima.',
    badgeLabel: 'Distribuidor Autorizado',
    addedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'tshop-gunpla-scale-art',
    tenantSlug: 'gunplajunkies',
    shopId: 'shop-scale-hobby-art',
    isTrusted: true,
    discountCode: 'GUNPLAART5',
    discountDescription: '5% en accesorios, pigmentos y materiales de diorama',
    customNotes: 'Materiales para bases de exhibicion y dioramas mecha.',
    badgeLabel: 'Aliado Dioramas',
    addedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'tshop-plamo-scale-art',
    tenantSlug: 'plamoscale',
    shopId: 'shop-scale-hobby-art',
    isTrusted: true,
    discountCode: 'PLAMO7',
    discountDescription: '7% en fotograbados, kits militares y pigmentos de envejecido',
    customNotes: 'Especialista en dioramas y modelismo militar historico.',
    badgeLabel: 'Aliado Escala Militar',
    addedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'tshop-plamo-catalog',
    tenantSlug: 'plamoscale',
    shopId: 'shop-plamoscale-trusted-catalog',
    isTrusted: true,
    discountCode: 'PLAMOFAMILY',
    discountDescription: 'Envio prioritario y 5% de descuento en compras de kits Tamiya y Eduard',
    customNotes: 'Catalogo maestro general de maquetas y aerografia.',
    badgeLabel: 'Catalogo Central',
    addedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'tshop-plamo-gunpla-peru',
    tenantSlug: 'plamoscale',
    shopId: 'shop-gunpla-peru-store',
    isTrusted: true,
    discountCode: 'PLAMOGUNPLA5',
    discountDescription: '5% en kits Mecha y Sci-Fi para modelistas de PlamoScale',
    customNotes: 'Stock de figuras y mecha para diversificar tu taller.',
    badgeLabel: 'Sección Mecha',
    addedAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_COMMUNITY_NEWS: CommunityNewsArticle[] = [
  {
    id: 'news-gunpla-rg2',
    tenantSlug: 'gunplajunkies',
    category: 'lanzamientos',
    tag: 'Gunpla Oficial',
    tagColor: 'rgba(239, 68, 68, 0.2); color: #f87171;',
    date: '24 Oct 2026',
    readTime: '4 min',
    title: 'Bandai Spirits anuncia nuevas lineas RG 2.0 y reediciones Ver.Ka para 2026',
    summary: 'La division Hobby de Bandai confirma el lanzamiento de tres nuevos modelos con estructura interna multi-bloque articulada y plastico pre-sombreado de inyeccion multicapa.',
    content: 'Bandai Spirits ha revelado de forma oficial su calendario de lanzamientos para la temporada. Entre las novedades mas destacadas se encuentra la evolucion del estandar Real Grade hacia el formato RG 2.0, que elimina completamente los conectores fragiles de polietileno (poly-caps) en favor de aleaciones de resina termoplastica de alta friccion. Ademas, el maestro Katoki Hajime anuncio una nueva version Ver.Ka con calcas al agua exclusivas y doble sistema de apertura de compuertas para exhibicion de mantenimiento. Disponibles para pre-orden en tiendas autorizadas.',
    authorUsername: 'rpineda',
    isPublished: true,
    createdAt: '2026-10-24T00:00:00Z'
  },
  {
    id: 'news-gunpla-panel-lining',
    tenantSlug: 'gunplajunkies',
    category: 'tecnicas',
    tag: 'Tutorial Armado',
    tagColor: 'rgba(59, 130, 246, 0.2); color: #60a5fa;',
    date: '22 Oct 2026',
    readTime: '6 min',
    title: 'Guia definitiva de Panel Lining: Tamiya Accent Color vs Rotuladores Gundam Marker',
    summary: 'Analisis tecnico sobre tension superficial, reaccion quimica sobre plastico PS y ABS sin imprimar, y metodos seguros de limpieza con Enamel Thinner.',
    content: 'Uno de los errores mas frecuentes en el armado de kits Master Grade y Real Grade es aplicar lavados de esmalte directamente sobre uniones de plastico ABS o piezas bajo tension mecanica. En esta guia detallamos la quimica de los solventes de esmalte, por que el capilar de Tamiya Panel Line Accent puede provocar micro-fracturas si no se aplica una capa previa de barniz brillante (Gloss Clear), y cuando es preferible utilizar rotuladores micropunta de flujo capilar a base de alcohol para acabados limpios y seguros.',
    authorUsername: 'aperich',
    isPublished: true,
    createdAt: '2026-10-22T00:00:00Z'
  },
  {
    id: 'news-plamo-tamiya-panzer',
    tenantSlug: 'plamoscale',
    category: 'lanzamientos',
    tag: 'Blindados 1/35',
    tagColor: 'rgba(16, 185, 129, 0.2); color: #34d399;',
    date: '24 Oct 2026',
    readTime: '5 min',
    title: 'Nuevos Moldes 2026: Tamiya 1/35 Panzer y Eduard 1/48 Spitfire con remaches 3D',
    summary: 'Las marcas lideres en modelismo estatico presentan sus novedades con fotograbados incluidos de fabrica y orugas articuladas eslabon por eslabon.',
    content: 'Tamiya da un salto generacional en su serie de vehiculos militares 1/35 presentando un nuevo molde de ingenieria computarizada con textura de fundicion de acero reproducida por laser. Paralelamente, Eduard lanza su edicion ProfiPACK del Spitfire Mk.IX con calcas de instrumentos en relieve 3D pre-pintadas y mascaras troqueladas para cabinas de alta precision.',
    authorUsername: 'rpineda',
    isPublished: true,
    createdAt: '2026-10-24T00:00:00Z'
  },
  {
    id: 'news-plamo-weathering',
    tenantSlug: 'plamoscale',
    category: 'tecnicas',
    tag: 'Masterclass Pintura',
    tagColor: 'rgba(245, 158, 11, 0.2); color: #fbbf24;',
    date: '20 Oct 2026',
    readTime: '7 min',
    title: 'Masterclass Weathering: Efectos de oxido, polvo desertico y barro acumulado',
    summary: 'Metodologia paso a paso para aplicar pigmentos en seco, fijadores de esmalte y decapados con laca para lograr texturas realistas en blindados y aviacion.',
    content: 'El envejecimiento a escala requiere comprender la escala fisica del desgaste. En este articulo exploramos el metodo de la esponja para desportillados aleatorios, la tecnica del mapa de tonos con oleos para variar paneles y la aplicacion por capas de pigmentos terrosos utilizando fijador por capilaridad sin alterar la dispersion del polvo.',
    authorUsername: 'dcampos',
    isPublished: true,
    createdAt: '2026-10-20T00:00:00Z'
  }
];

export const INITIAL_FEATURED_PHOTOS: CommunityFeaturedPhoto[] = [
  {
    id: 'feat-photo-1',
    tenantSlug: 'gunplajunkies',
    photoUrl: '/legacy-media/plamoscale/images/aperich/fulls/01.jpg',
    title: 'RG 1/144 Hi-Nu Gundam Titanium Custom',
    builderUsername: 'aperich',
    scale: '1/144',
    grade: 'RG (Real Grade)',
    featuredOrder: 1,
    featuredAt: '2026-10-24T00:00:00Z'
  },
  {
    id: 'feat-photo-2',
    tenantSlug: 'gunplajunkies',
    photoUrl: '/legacy-media/plamoscale/images/dan_gunpla/fulls/01.jpg',
    title: 'MG 1/100 Barbatos Lupus Rex Custom Inner Frame',
    builderUsername: 'dan_gunpla',
    scale: '1/100',
    grade: 'MG (Master Grade)',
    featuredOrder: 2,
    featuredAt: '2026-10-24T00:00:00Z'
  },
  {
    id: 'feat-photo-3',
    tenantSlug: 'plamoscale',
    photoUrl: '/legacy-media/plamoscale/images/marcus_plamo/fulls/01.jpg',
    title: 'Tiger I Early Production 1/35 Battle of Kursk',
    builderUsername: 'marcus_plamo',
    scale: '1/35',
    grade: 'Escala Militar',
    featuredOrder: 1,
    featuredAt: '2026-10-24T00:00:00Z'
  },
  {
    id: 'feat-photo-4',
    tenantSlug: 'plamoscale',
    photoUrl: '/legacy-media/plamoscale/images/dcampos/fulls/01.jpg',
    title: 'Spitfire Mk.VIII 1/48 Desert Camouflage Diorama',
    builderUsername: 'dcampos',
    scale: '1/48',
    grade: 'Aviación Militar',
    featuredOrder: 2,
    featuredAt: '2026-10-24T00:00:00Z'
  }
];

export function seedPlatformDatabase(forceReset = false): PlatformDatabaseState {
  const db = getDb();
  if (!forceReset && db.tenants.length >= 2 && db.mediaAssets.length >= 90) {
    return db;
  }

  const now = new Date().toISOString();

  // 1. Seed Tenants (plamoscale.com & gunplajunkies.com) with Resend.com verified sender domains
  const tenants: Tenant[] = [
    {
      id: 'tenant-plamoscale',
      slug: 'plamoscale',
      name: 'Plamo Scale by x-codec',
      domain: 'plamoscale.com',
      emailFrom: 'PlamoScale <noreply@plamoscale.com>',
      contactEmail: 'contacto@plamoscale.com',
      tagline: 'Comunidad apasionada por los plastimodelos y el modelismo a escala',
      mission:
        'Queremos inspirar y conectar a la comunidad apasionada por los plastimodelos en Peru, impulsando la creatividad, el aprendizaje y el intercambio a traves de la coleccion, modificacion y personalizacion de Model Kits.',
      vision:
        'Ser el punto de encuentro lider para los amantes de los plastimodelos en Peru, creando un espacio de encuentro virtual y fisico donde los apasionados del hobby puedan compartir, aprender y crear.',
      allowedCategories: ALL_CATEGORIES,
      themeConfig: {
        primaryColor: '#1f2937',
        accentColor: '#3b82f6',
        surfaceColor: '#111827',
        logoText: 'PLAMO SCALE',
        uxPatternId: 'uxp-01-modern-app-shell-layout'
      },
      communityLinks: {
        facebookGroup: 'https://www.facebook.com/groups/1397980650669863/?ref=share',
        whatsappGroup: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
        googleDrive:
          'https://drive.google.com/drive/folders/1j2w2F9t6F413S7qPGjRwroTDkwqHUB9h?usp=sharing',
        gundamHobbyLife: 'https://1drv.ms/f/s!AgQu-4xfFGycxSQ-HpvT4fSr1kkU?e=8zJQNN',
        trustedShopsCatalog: 'https://bit.ly/45m7bII'
      },
      status: 'active',
      createdAt: now
    },
    {
      id: 'tenant-gunplajunkies',
      slug: 'gunplajunkies',
      name: 'Gunpla Junkies',
      domain: 'gunplajunkies.com',
      emailFrom: 'GunplaJunkies <noreply@gunplajunkies.com>',
      contactEmail: 'hello@gunplajunkies.com',
      tagline: 'The Mecha, Gunpla & Sci-Fi Scale Modeling Hangar',
      mission:
        'Conectar a los constructores de Gunpla, Mecha y Sci-Fi con bitacoras paso a paso, recetas de pintura y genealogia de kits.',
      vision:
        'Ser el hangar digital de referencia para constructores de Gunpla y Mecha a nivel global.',
      allowedCategories: GUNPLA_CATEGORIES,
      themeConfig: {
        primaryColor: '#0f172a',
        accentColor: '#ef4444',
        surfaceColor: '#020617',
        logoText: 'GUNPLA JUNKIES',
        uxPatternId: 'uxp-01-modern-app-shell-layout'
      },
      communityLinks: {
        facebookGroup: 'https://www.facebook.com/groups/1397980650669863/?ref=share',
        whatsappGroup: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
        trustedShopsCatalog: 'https://bit.ly/45m7bII'
      },
      status: 'active',
      createdAt: now
    }
  ];

  // 2. Seed Users (Platform Owner rpineda + 4 Founding Builders from plamoscale.com)
  const defaultPasswordHash = bcrypt.hashSync(process.env.SEED_DEFAULT_CREDENTIAL || 'PlamoScaleDev2026!', 10);

  const users: UserRecord[] = [
    {
      id: 'user-superadmin-rpineda',
      username: 'rpineda',
      displayName: 'Roberto Pineda',
      email: 'rpinedaec83@gmail.com',
      passwordHash: defaultPasswordHash,
      googleId: null,
      authProviders: ['local', 'google'],
      roles: ['super_admin', 'admin', 'moderator', 'user'],
      primaryTenantSlug: 'plamoscale',
      bio: 'Super Admin de la plataforma. Modelismo y tecnologia.',
      socialLinks: [
        'https://www.instagram.com/robertdpl_ec/',
        'https://www.facebook.com/robertdpl',
        'https://x-codec.net'
      ],
      isFounder: true,
      createdAt: now
    },
    {
      id: 'user-rpineda-legacy',
      username: 'rpineda_legacy',
      displayName: 'Roberto Pineda (Legacy)',
      email: 'rpineda@x-codec.net',
      passwordHash: defaultPasswordHash,
      googleId: null,
      authProviders: ['local'],
      roles: ['super_admin', 'admin', 'moderator', 'user'],
      primaryTenantSlug: 'plamoscale',
      bio: 'Founder at x-codec.net. Compartimos experiencia y buena onda con los Model Kits.',
      socialLinks: [
        'https://x-codec.net'
      ],
      isFounder: false,
      createdAt: now
    }
  ];

  const mediaAssets: MediaAsset[] = [];
  const legacyDir = resolveLegacyPlamoscaleDir();
  const imagesRoot = path.join(legacyDir, 'images');

  for (const founder of FOUNDING_BUILDERS) {
    users.push({
      id: `user-${founder.username}`,
      username: founder.username,
      displayName: founder.displayName,
      email: founder.email,
      passwordHash: defaultPasswordHash,
      googleId: null,
      authProviders: ['local'],
      roles: ['user', 'moderator'],
      primaryTenantSlug: 'plamoscale',
      bio: founder.bio,
      socialLinks: founder.socialLinks,
      isFounder: true,
      createdAt: now
    });

    const fullsDir = path.join(imagesRoot, founder.username, 'fulls');
    const thumbsDir = path.join(imagesRoot, founder.username, 'thumbs');

    if (fs.existsSync(fullsDir)) {
      const files = fs
        .readdirSync(fullsDir)
        .filter((f) => !f.startsWith('.') && /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        });

      for (const fileName of files) {
        const thumbExists = fs.existsSync(path.join(thumbsDir, fileName));
        const baseNumber = fileName.replace(/\.[^.]+$/, '');
        mediaAssets.push({
          id: `media-${founder.username}-${baseNumber}`,
          builderUsername: founder.username,
          fileName,
          thumbUrl: thumbExists
            ? `/legacy-media/plamoscale/images/${founder.username}/thumbs/${fileName}`
            : `/legacy-media/plamoscale/images/${founder.username}/fulls/${fileName}`,
          fullUrl: `/legacy-media/plamoscale/images/${founder.username}/fulls/${fileName}`,
          category: founder.defaultCategory,
          title: `${founder.displayName} - Build #${baseNumber}`,
          altText: `Scale model build #${baseNumber} by ${founder.displayName}`,
          createdAt: now
        });
      }
    }
  }

  // Preserve existing kits/paints on soft startup, or reset to starter catalog on forced seed
  const kits = !forceReset && db.kits && db.kits.length > 0 ? db.kits : INITIAL_KITS;
  const paints = !forceReset && db.paints && db.paints.length > 0 ? db.paints : INITIAL_PAINTS;
  const builds = !forceReset && db.builds && db.builds.length > 0 ? db.builds : INITIAL_BUILDS;
  const contests = !forceReset && db.contests && db.contests.length > 0 ? db.contests : INITIAL_CONTESTS;
  const contestEntries = !forceReset && db.contestEntries && db.contestEntries.length > 0 ? db.contestEntries : INITIAL_CONTEST_ENTRIES;
  const marketplaceListings = !forceReset && db.marketplaceListings && db.marketplaceListings.length > 0 ? db.marketplaceListings : INITIAL_LISTINGS;
  const commissionBuilders = !forceReset && db.commissionBuilders && db.commissionBuilders.length > 0 ? db.commissionBuilders : INITIAL_COMMISSION_BUILDERS;
  const commissionRequests = !forceReset && db.commissionRequests && db.commissionRequests.length > 0 ? db.commissionRequests : INITIAL_COMMISSION_REQUESTS;
  const shops = !forceReset && db.shops && db.shops.length > 0 ? db.shops : INITIAL_SHOPS;
  const shopStock = !forceReset && db.shopStock && db.shopStock.length > 0 ? db.shopStock : INITIAL_SHOP_STOCK;
  const groupBuilds = !forceReset && db.groupBuilds && db.groupBuilds.length > 0 ? db.groupBuilds : INITIAL_GROUP_BUILDS;
  const tenantShops = !forceReset && db.tenantShops && db.tenantShops.length > 0 ? db.tenantShops : INITIAL_TENANT_SHOPS;
  const tenantNews = !forceReset && db.tenantNews && db.tenantNews.length > 0 ? db.tenantNews : INITIAL_COMMUNITY_NEWS;
  const featuredPhotos = !forceReset && db.featuredPhotos && db.featuredPhotos.length > 0 ? db.featuredPhotos : INITIAL_FEATURED_PHOTOS;

  const nextState: PlatformDatabaseState = {
    tenants,
    users,
    mediaAssets,
    emailOutbox: db.emailOutbox || [],
    kits,
    paints,
    stashItems: db.stashItems || [],
    paintRackItems: db.paintRackItems || [],
    builds,
    contests,
    contestEntries,
    marketplaceListings,
    commissionBuilders,
    commissionRequests,
    shops,
    shopStock,
    notifications: db.notifications || [],
    pushSubscriptions: db.pushSubscriptions || [],
    groupBuilds,
    tools: db.tools || [],
    tenantShops,
    tenantNews,
    featuredPhotos,
    lastSeededAt: now
  };

  saveDb(nextState);
  return nextState;
}
