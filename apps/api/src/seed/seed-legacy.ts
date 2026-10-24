import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Tenant, UserRecord, MediaAsset, ScaleCategory } from '@gunpla/shared';
import { getDb, saveDb, PlatformDatabaseState } from '../core/db';
import { INITIAL_KITS, INITIAL_PAINTS } from './seed-catalog';

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
      createdAt: now
    }
  ];

  // 2. Seed Users (Platform Owner rpineda + 4 Founding Builders from plamoscale.com)
  const defaultPasswordHash = bcrypt.hashSync('PlamoScale2026!', 10);

  const users: UserRecord[] = [
    {
      id: 'user-rpineda',
      username: 'rpineda',
      displayName: 'Roberto Pineda',
      email: 'rpineda@x-codec.net',
      passwordHash: defaultPasswordHash,
      googleId: null,
      authProviders: ['local'],
      roles: ['user', 'moderator', 'tenant_admin', 'admin'],
      primaryTenantSlug: 'plamoscale',
      bio: 'Founder at x-codec.net. Compartimos experiencia y buena onda con los Model Kits.',
      socialLinks: [
        'https://www.instagram.com/robertdpl_ec/',
        'https://www.facebook.com/robertdpl',
        'https://x-codec.net'
      ],
      isFounder: true,
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

  const nextState: PlatformDatabaseState = {
    tenants,
    users,
    mediaAssets,
    emailOutbox: db.emailOutbox || [],
    kits,
    paints,
    lastSeededAt: now
  };

  saveDb(nextState);
  return nextState;
}
