import { Router, Request, Response } from 'express';
import { ContestRecord, ShopRecord } from '@gunpla/shared';

export const communityRouter = Router();

export const INITIAL_CONTESTS: ContestRecord[] = [
  {
    id: 'contest-gunpla-cup-2026',
    slug: 'gunpla-open-cup-2026',
    title: 'Gunpla Open Cup Peru 2026',
    description: 'Competencia anual abierta de Gunpla. Categorías Open Course, Junior y Custom Paint. Juzgamiento por panel de modelistas expertos.',
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
    participantsCount: 18
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
    status: 'upcoming',
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
    participantsCount: 24
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
 * Scoped by active tenant context
 */
communityRouter.get('/contests', (req: Request, res: Response) => {
  const tenant = req.tenant;
  let items = INITIAL_CONTESTS;

  if (tenant) {
    items = items.filter(c => c.tenantSlug === 'all' || c.tenantSlug === tenant.slug);
  }

  return res.json({
    items,
    totalCount: items.length
  });
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
