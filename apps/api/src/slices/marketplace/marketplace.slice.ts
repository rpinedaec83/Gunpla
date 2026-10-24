import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  MarketplaceListingRecord,
  CreateMarketplaceListingRequest,
  UpdateMarketplaceListingRequest,
  CommissionBuilderRecord,
  ScaleCategory
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';

export const marketplaceRouter = Router();
export const commissionsRouter = Router();

export const INITIAL_LISTINGS: MarketplaceListingRecord[] = [
  {
    id: 'listing-sazabi-verka',
    kitId: 'kit-mg-barbatos',
    userId: 'user-dcampos',
    username: 'dcampos',
    userDisplayName: 'Daniel Campos',
    type: 'both',
    price: 380,
    currency: 'PEN',
    boxCondition: 'mint_sealed',
    notes: 'Completamente sellado en caja original con runners en bolsas cerradas. Se acepta intercambio por kits PG o venta directa.',
    contactWhatsapp: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    contactLocation: 'Lima (Miraflores / San Isidro)',
    category: 'gunpla-mecha',
    status: 'active',
    createdAt: '2026-10-24T00:00:00Z',
    updatedAt: '2026-10-24T00:00:00Z'
  },
  {
    id: 'listing-tiger1-kursk',
    kitId: 'kit-tamiya-tiger1',
    userId: 'user-fog1labs1',
    username: 'fog1labs1',
    userDisplayName: 'Fog1 Labs',
    type: 'sale',
    price: 220,
    currency: 'PEN',
    boxCondition: 'mint_sealed',
    notes: 'Kit militar 1/35 nuevo con fotograbados incluidos. Entrega en estaciones del Metropolitano o envíos a provincia.',
    contactWhatsapp: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    contactLocation: 'Lima / Envíos a todo el Perú',
    category: 'military',
    status: 'active',
    createdAt: '2026-10-24T00:00:00Z',
    updatedAt: '2026-10-24T00:00:00Z'
  }
];

export const INITIAL_COMMISSION_BUILDERS: CommissionBuilderRecord[] = [
  {
    id: 'comm-aperich',
    userId: 'user-aperich',
    username: 'aperich',
    displayName: 'Aldo Perich (@gunpla_warrior_peru)',
    bio: 'Especialista en Gunpla Custom, sombreado con aerógrafo, repintado de inner frame metálico y acabados Titanium Finish.',
    specialties: ['Gunpla MG & PG', 'Airbrush Custom Paint', 'Candy Coat & Metálicos', 'Decales al Agua'],
    acceptingCommissions: true,
    startingPricePEN: 180,
    portfolioSampleUrls: [
      '/legacy-media/plamoscale/images/aperich/fulls/1.jpg',
      '/legacy-media/plamoscale/images/aperich/fulls/14.jpg'
    ],
    whatsappUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    instagramUrl: 'https://www.instagram.com/gunpla_warrior_peru/'
  },
  {
    id: 'comm-fog1labs1',
    userId: 'user-fog1labs1',
    username: 'fog1labs1',
    displayName: 'Fog1 Labs (@fog1labs1)',
    bio: 'Modelista experto en blindados militares 1/35, técnicas avanzadas de intemperizado (barro, óxido, chipping) y dioramas hiperrealistas.',
    specialties: ['Blindados 1/35', 'Weathering Avanzado', 'Pigmentos & Óleo', 'Dioramas Históricos'],
    acceptingCommissions: true,
    startingPricePEN: 200,
    portfolioSampleUrls: [
      '/legacy-media/plamoscale/images/fog1labs1/fulls/1.JPG',
      '/legacy-media/plamoscale/images/fog1labs1/fulls/10.JPG'
    ],
    whatsappUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx'
  },
  {
    id: 'comm-dcampos',
    userId: 'user-dcampos',
    username: 'dcampos',
    displayName: 'Daniel Campos (@d.de.daniel)',
    bio: 'Armado de precisión de maquetas a escala y Gunpla, panel lining prolijo, acabados mate y corrección de líneas de unión (seam lines).',
    specialties: ['Gunpla RG & HG', 'Clean Build', 'Scribing & Panel Lines', 'Acabados Flat/Matte'],
    acceptingCommissions: true,
    startingPricePEN: 150,
    portfolioSampleUrls: [
      '/legacy-media/plamoscale/images/dcampos/fulls/1.jpg',
      '/legacy-media/plamoscale/images/dcampos/fulls/5.jpg'
    ],
    whatsappUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    instagramUrl: 'https://www.instagram.com/d.de.daniel'
  }
];

// ---------------------------------------------------------------------------
// Marketplace Listings Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/marketplace/listings
 * Filtered by tenant allowed categories, status, type, and keyword search
 */
marketplaceRouter.get('/listings', (req: Request, res: Response) => {
  const tenant = req.tenant;
  const db = getDb();

  const allListings = (!db.marketplaceListings || db.marketplaceListings.length === 0)
    ? INITIAL_LISTINGS
    : db.marketplaceListings;

  let allowedCategories = tenant ? tenant.allowedCategories : [];
  if (allowedCategories.length === 0) {
    allowedCategories = ['gunpla-mecha', 'military', 'aviation', 'automotive', 'naval', 'figures', 'scifi', 'diorama'];
  }

  let filtered = allListings.filter(l => allowedCategories.includes(l.category));

  const statusParam = req.query.status as string | undefined;
  const typeParam = req.query.type as string | undefined;
  const categoryParam = req.query.category as ScaleCategory | undefined;
  const searchParam = (req.query.search as string | undefined)?.toLowerCase().trim();

  if (statusParam) {
    filtered = filtered.filter(l => l.status === statusParam);
  } else {
    // Default to active listings
    filtered = filtered.filter(l => l.status === 'active');
  }

  if (typeParam) {
    filtered = filtered.filter(l => l.type === typeParam || l.type === 'both');
  }

  if (categoryParam) {
    filtered = filtered.filter(l => l.category === categoryParam);
  }

  if (searchParam) {
    filtered = filtered.filter(l =>
      l.notes.toLowerCase().includes(searchParam) ||
      (l.kit && l.kit.name.toLowerCase().includes(searchParam)) ||
      l.username.toLowerCase().includes(searchParam)
    );
  }

  // Populate kit details
  const populated = filtered.map(l => ({
    ...l,
    kit: db.kits ? db.kits.find(k => k.id === l.kitId) : undefined
  }));

  return res.json({
    items: populated,
    totalCount: populated.length
  });
});

/**
 * POST /api/v1/marketplace/listings
 * Authenticated builder creates a listing (optionally linking an item from their Stash)
 */
marketplaceRouter.post('/listings', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const {
    stashItemId,
    kitId,
    type,
    price,
    currency,
    boxCondition,
    notes,
    contactWhatsapp,
    contactLocation
  } = req.body as CreateMarketplaceListingRequest;

  if (!kitId || typeof kitId !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Kit Requerido',
      'Debe especificar un "kitId" válido del catálogo maestro.',
      'validation-error'
    );
  }

  const db = getDb();
  const kit = (db.kits || []).find(k => k.id === kitId);
  if (!kit) {
    return sendProblem(
      req,
      res,
      404,
      'Kit No Encontrado',
      `El kit '${kitId}' no existe en el catálogo maestro.`
    );
  }

  // If linked to personal stash, verify ownership and update stash status to 'for_trade'
  if (stashItemId) {
    const stashItem = (db.stashItems || []).find(s => s.id === stashItemId);
    if (!stashItem) {
      return sendProblem(
        req,
        res,
        404,
        'Item de Stash No Encontrado',
        `No se encontró el item de stash '${stashItemId}'.`
      );
    }
    if (stashItem.userId !== user.id) {
      return sendProblem(
        req,
        res,
        403,
        'Acceso Prohibido',
        'Solo puedes publicar items de tu propio Stash personal.'
      );
    }
    // Update stash item status to for_trade
    stashItem.status = 'for_trade';
    stashItem.updatedAt = new Date().toISOString();
  }

  if (!db.marketplaceListings) {
    db.marketplaceListings = [...INITIAL_LISTINGS];
  }

  const listingId = `listing-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const newListing: MarketplaceListingRecord = {
    id: listingId,
    stashItemId,
    kitId,
    kit,
    userId: user.id,
    username: user.username,
    userDisplayName: user.username,
    type: type || 'both',
    price: price || undefined,
    currency: currency || 'PEN',
    boxCondition: boxCondition || 'mint_sealed',
    notes: notes?.trim() || 'Kit disponible para venta o intercambio.',
    contactWhatsapp: contactWhatsapp?.trim() || 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    contactLocation: contactLocation?.trim() || 'Lima, Perú',
    category: kit.category,
    status: 'active',
    createdAt: now,
    updatedAt: now
  };

  db.marketplaceListings.push(newListing);
  saveDb(db);

  return res.status(201).json(newListing);
});

/**
 * PATCH /api/v1/marketplace/listings/:id
 */
marketplaceRouter.patch('/listings/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const listingId = req.params.id;
  const { price, currency, status, notes, contactWhatsapp, contactLocation } = req.body as UpdateMarketplaceListingRequest;

  const db = getDb();
  if (!db.marketplaceListings) {
    db.marketplaceListings = [...INITIAL_LISTINGS];
  }

  const listing = db.marketplaceListings.find(l => l.id === listingId);
  if (!listing) {
    return sendProblem(req, res, 404, 'Publicación No Encontrada', `No se encontró la publicación '${listingId}'.`);
  }

  if (listing.userId !== user.id) {
    return sendProblem(req, res, 403, 'Acceso Prohibido', 'No tienes permiso para modificar esta publicación.');
  }

  if (price !== undefined) listing.price = price;
  if (currency !== undefined) listing.currency = currency;
  if (status !== undefined) listing.status = status;
  if (notes !== undefined) listing.notes = notes;
  if (contactWhatsapp !== undefined) listing.contactWhatsapp = contactWhatsapp;
  if (contactLocation !== undefined) listing.contactLocation = contactLocation;
  listing.updatedAt = new Date().toISOString();

  saveDb(db);

  return res.json(listing);
});

/**
 * DELETE /api/v1/marketplace/listings/:id
 */
marketplaceRouter.delete('/listings/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const listingId = req.params.id;

  const db = getDb();
  if (!db.marketplaceListings) {
    db.marketplaceListings = [...INITIAL_LISTINGS];
  }

  const index = db.marketplaceListings.findIndex(l => l.id === listingId);
  if (index === -1) {
    return sendProblem(req, res, 404, 'Publicación No Encontrada', `No se encontró la publicación '${listingId}'.`);
  }

  if (db.marketplaceListings[index].userId !== user.id) {
    return sendProblem(req, res, 403, 'Acceso Prohibido', 'No tienes permiso para eliminar esta publicación.');
  }

  const [removed] = db.marketplaceListings.splice(index, 1);
  saveDb(db);

  return res.json({ status: 'removed', listing: removed });
});

// ---------------------------------------------------------------------------
// Custom Commissions Directory Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/commissions/builders
 */
commissionsRouter.get('/builders', (_req: Request, res: Response) => {
  return res.json({
    items: INITIAL_COMMISSION_BUILDERS,
    totalCount: INITIAL_COMMISSION_BUILDERS.length
  });
});
