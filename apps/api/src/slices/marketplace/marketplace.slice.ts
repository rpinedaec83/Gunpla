import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  MarketplaceListingRecord,
  CreateMarketplaceListingRequest,
  UpdateMarketplaceListingRequest,
  CreateListingInquiryRequest,
  ListingInquiryRecord,
  CommissionBuilderRecord,
  CommissionRequestRecord,
  CreateCommissionRequestPayload,
  UpdateCommissionRequestPayload,
  CommissionScopeLevel,
  CommissionKitSupply,
  CommissionRequestStatus,
  ScaleCategory
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth, optionalAuth } from '../auth-sso/auth.slice';
import { sendTenantEmailViaResend } from '../notifications-resend/resend.slice';

const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
      '/legacy-media/plamoscale/images/aperich/fulls/1.JPG',
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
      '/legacy-media/plamoscale/images/fog1labs1/fulls/50.jpg',
      '/legacy-media/plamoscale/images/fog1labs1/fulls/60.jpg'
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
      '/legacy-media/plamoscale/images/dcampos/fulls/29.jpg',
      '/legacy-media/plamoscale/images/dcampos/fulls/35.jpg'
    ],
    whatsappUrl: 'https://chat.whatsapp.com/GJsVix10Hqy2ywwYmh8EYx',
    instagramUrl: 'https://www.instagram.com/d.de.daniel'
  }
];

export const INITIAL_COMMISSION_REQUESTS: CommissionRequestRecord[] = [
  {
    id: 'req-com-sazabi-aperich',
    code: 'COM-2026-7841',
    tenantId: 'gunplajunkies',
    builderUsername: 'aperich',
    builderDisplayName: 'Aldo Perich (@gunpla_warrior_peru)',
    clientUserId: 'user-dcampos',
    clientName: 'Daniel Campos',
    clientEmail: 'dcampos@example.com',
    clientWhatsapp: '+51 987 654 321',
    clientCity: 'Lima',
    kitTitle: 'MG 1/100 MSN-04 Sazabi Ver. Ka',
    scaleCategory: 'gunpla-mecha',
    scopeLevel: 'level_2_custom_paint',
    kitSupply: 'client_provides_kit',
    targetBudget: 450,
    currency: 'PEN',
    targetDeadline: '2026-12-15',
    referenceLinks: ['https://www.gunplajunkies.com/#build-mg-eclipse-gundam-custom-paint'],
    projectNotes: 'Pintura custom con acabado Titanium Finish brillante en dos tonos de rojo, inner frame en tonos gunmetal y calcas al agua completas.',
    status: 'quoted',
    quotePrice: 420,
    estimatedDays: 25,
    builderResponseNotes: 'Excelente proyecto. Cuento con las pinturas Mr. Color GX y aerógrafo Iwata 0.3mm para el acabado espejo. Plazo estimado de 25 días a partir de la entrega del kit.',
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T12:30:00Z'
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

  if (user.isAdult === false) {
    return sendProblem(
      req,
      res,
      403,
      'Restricción de Mayoría de Edad',
      'De conformidad con la Ley N° 29571 (Código de Protección y Defensa del Consumidor de Perú) y los Términos del Servicio, debes ser mayor de edad (18+ años) con plena capacidad civil para publicar kits en el Bazar de compraventa.',
      'adult-required'
    );
  }

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

/**
 * POST /api/v1/marketplace/listings/:id/inquiries
 * Submit an inquiry or counter-offer to a seller via email (Resend)
 */
marketplaceRouter.post('/listings/:id/inquiries', optionalAuth, async (req: Request, res: Response) => {
  const listingId = req.params.id;
  const db = getDb();
  const allListings = (!db.marketplaceListings || db.marketplaceListings.length === 0)
    ? INITIAL_LISTINGS
    : db.marketplaceListings;

  const listing = allListings.find(l => l.id === listingId);
  if (!listing) {
    return sendProblem(req, res, 404, 'Publicación No Encontrada', `No se encontró la publicación '${listingId}'.`);
  }

  const body = req.body as Partial<CreateListingInquiryRequest>;
  const buyerName = (body.buyerName || req.user?.username || '').trim();
  const buyerEmail = (body.buyerEmail || req.user?.email || '').trim();
  const buyerPhone = body.buyerPhone ? String(body.buyerPhone).trim() : undefined;
  const message = (body.message || '').trim();
  const offerPrice = typeof body.offerPrice === 'number' && body.offerPrice > 0 ? body.offerPrice : undefined;

  if (!buyerName) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El nombre del interesado (buyerName) es obligatorio.');
  }

  if (!buyerEmail || !buyerEmail.includes('@')) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El correo de contacto (buyerEmail) es obligatorio y debe ser válido.');
  }

  if (!message || message.length < 5) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El mensaje o consulta debe tener al menos 5 caracteres.');
  }

  const sellerUser = db.users.find(
    u => u.id === listing.userId || u.username.toLowerCase() === listing.username.toLowerCase()
  );
  const sellerEmail = sellerUser?.email || `${listing.username}@plamoscale.com`;

  const kitName = listing.kit?.name || (db.kits || []).find(k => k.id === listing.kitId)?.name || 'Kit de Modelismo';

  const tenant = req.tenant || db.tenants[0];
  const inquiryRecord: ListingInquiryRecord = {
    id: `inq-${Date.now()}-${randomUUID().slice(0, 6)}`,
    listingId: listing.id,
    tenantSlug: tenant.slug,
    buyerUserId: req.user?.id,
    buyerName,
    buyerEmail,
    buyerPhone,
    message,
    offerPrice,
    sellerUserId: listing.userId,
    sellerUsername: listing.username,
    sellerEmail,
    createdAt: new Date().toISOString()
  };

  let emailRecord;
  try {
    emailRecord = await sendTenantEmailViaResend({
      tenant,
      to: [sellerEmail],
      replyTo: buyerEmail,
      subject: `[${tenant.name}] Consulta para tu publicación en el Bazar: ${kitName}`,
      html: `<h2>Nueva consulta de compra para tu publicación</h2>
<p>Hola <strong>${escapeHtml(listing.userDisplayName || listing.username)}</strong>,</p>
<p><strong>${escapeHtml(buyerName)}</strong> (${escapeHtml(buyerEmail)}${buyerPhone ? `, Tel/WhatsApp: ${escapeHtml(buyerPhone)}` : ''}) te ha enviado una consulta sobre tu kit <strong>${escapeHtml(kitName)}</strong> publicado por <strong>${listing.currency} ${listing.price || 'A convenir'}</strong>:</p>
${offerPrice ? `<p><strong>Oferta propuesta por el comprador:</strong> <span style="color:#4ade80;font-weight:bold;">${listing.currency} ${offerPrice}</span></p>` : ''}
<div style="background:#1a2332;padding:14px;border-left:4px solid #10b981;border-radius:4px;color:#e2e8f0;margin:16px 0;font-family:sans-serif;">
  ${escapeHtml(message)}
</div>
<p>Puedes responder directamente a este correo o escribirle al WhatsApp / teléfono indicado para coordinar la entrega.</p>`
    });
  } catch (emailErr) {
    console.error('Failed to dispatch listing inquiry email notification:', emailErr);
  }

  return res.status(201).json({
    status: 'sent',
    inquiry: inquiryRecord,
    emailRecord
  });
});

// ---------------------------------------------------------------------------
// Custom Commissions Directory Routes
// ---------------------------------------------------------------------------

export function getCommissionBuildersFromDb(): CommissionBuilderRecord[] {
  const db = getDb();
  if (db.commissionBuilders && db.commissionBuilders.length > 0) {
    return db.commissionBuilders;
  }
  return INITIAL_COMMISSION_BUILDERS;
}

/**
 * GET /api/v1/commissions/builders
 */
commissionsRouter.get('/builders', (_req: Request, res: Response) => {
  const builders = getCommissionBuildersFromDb();
  return res.json({
    items: builders,
    totalCount: builders.length
  });
});

/**
 * POST /api/v1/commissions/requests
 * Submit a new commission request to a verified builder
 */
commissionsRouter.post('/requests', optionalAuth, async (req: Request, res: Response) => {
  const db = getDb();
  if (!db.commissionRequests) {
    db.commissionRequests = [];
  }
  const body = req.body as Partial<CreateCommissionRequestPayload>;
  const {
    builderUsername,
    kitTitle,
    scaleCategory,
    scopeLevel,
    kitSupply,
    targetBudget,
    currency,
    targetDeadline,
    referenceLinks,
    projectNotes,
    clientName,
    clientEmail,
    clientWhatsapp,
    clientCity
  } = body;

  // Validations
  if (!builderUsername || typeof builderUsername !== 'string' || builderUsername.trim().length === 0) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El nombre de usuario del modelista (builderUsername) es obligatorio.');
  }

  // Verify builder exists in db.commissionBuilders or db.users
  const targetBuilder = getCommissionBuildersFromDb().find(b => b.username.toLowerCase() === builderUsername.trim().toLowerCase())
    || db.users.find(u => u.username.toLowerCase() === builderUsername.trim().toLowerCase());
  if (!targetBuilder) {
    return sendProblem(req, res, 404, 'Modelista No Encontrado', `No se encontró ningún modelista registrado con usuario '${builderUsername}'.`);
  }

  if (!kitTitle || typeof kitTitle !== 'string' || kitTitle.trim().length === 0) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El título de la maqueta o kit (kitTitle) es obligatorio.');
  }

  const validScopes: CommissionScopeLevel[] = [
    'level_1_clean_build',
    'level_2_custom_paint',
    'level_3_weathering',
    'level_4_masterpiece'
  ];
  if (!scopeLevel || !validScopes.includes(scopeLevel)) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El nivel de alcance (scopeLevel) debe ser level_1_clean_build, level_2_custom_paint, level_3_weathering o level_4_masterpiece.');
  }

  const finalClientName = (clientName || req.user?.username || '').trim();
  if (!finalClientName) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El nombre del solicitante (clientName) es obligatorio.');
  }

  const finalClientEmail = (clientEmail || req.user?.email || '').trim();
  if (!finalClientEmail || !finalClientEmail.includes('@')) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El correo de contacto (clientEmail) es obligatorio y debe ser válido.');
  }

  if (!clientWhatsapp || typeof clientWhatsapp !== 'string' || clientWhatsapp.trim().length < 6) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'El número de WhatsApp o teléfono de contacto es obligatorio (mínimo 6 dígitos).');
  }

  if (!projectNotes || typeof projectNotes !== 'string' || projectNotes.trim().length < 5) {
    return sendProblem(req, res, 400, 'Datos Inválidos', 'Las notas o descripción del proyecto deben tener al menos 5 caracteres.');
  }

  const now = new Date().toISOString();
  const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `COM-${new Date().getFullYear()}-${uniqueSuffix}`;
  const id = `req-com-${Date.now()}-${randomUUID().slice(0, 6)}`;

  const newRequest: CommissionRequestRecord = {
    id,
    code,
    tenantId: req.tenant?.slug || 'gunplajunkies',
    builderUsername: targetBuilder.username,
    builderDisplayName: (targetBuilder as any).displayName || targetBuilder.username,
    clientUserId: req.user?.id,
    clientName: finalClientName,
    clientEmail: finalClientEmail,
    clientWhatsapp: clientWhatsapp.trim(),
    clientCity: clientCity ? clientCity.trim() : undefined,
    kitTitle: kitTitle.trim(),
    scaleCategory: scaleCategory || 'gunpla-mecha',
    scopeLevel,
    kitSupply: kitSupply || 'client_provides_kit',
    targetBudget: typeof targetBudget === 'number' && targetBudget > 0 ? targetBudget : undefined,
    currency: currency || 'PEN',
    targetDeadline: targetDeadline ? targetDeadline.trim() : undefined,
    referenceLinks: Array.isArray(referenceLinks) ? referenceLinks.filter(l => typeof l === 'string' && l.trim().length > 0) : [],
    projectNotes: projectNotes.trim(),
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  db.commissionRequests.unshift(newRequest);
  saveDb(db);

  // Trigger asynchronous email notification (if tenant email configured)
  const tenant = req.tenant || db.tenants.find(t => t.slug === newRequest.tenantId) || db.tenants[0];
  if (tenant) {
    sendTenantEmailViaResend({
      tenant,
      to: [finalClientEmail],
      replyTo: tenant.contactEmail,
      subject: `🎨 Solicitud de Encargo Recibida: ${newRequest.kitTitle} (${newRequest.code})`,
      html: `
        <h2>¡Hola ${escapeHtml(finalClientName)}!</h2>
        <p>Hemos recibido tu solicitud de encargo de pintura para <strong>${escapeHtml(newRequest.kitTitle)}</strong> dirigida al modelista <strong>@${escapeHtml(newRequest.builderUsername)}</strong>.</p>
        <p><strong>Código de seguimiento:</strong> <code>${newRequest.code}</code></p>
        <p><strong>Nivel de acabado:</strong> ${escapeHtml(newRequest.scopeLevel)}</p>
        <p>El modelista revisará tu proyecto y responderá con una cotización y plazo estimado pronto.</p>
      `
    }).catch(() => {});
  }

  return res.status(201).json({
    status: 'created',
    request: newRequest
  });
});

/**
 * GET /api/v1/commissions/requests
 * List commission requests with role-based and query scoping
 */
commissionsRouter.get('/requests', optionalAuth, (req: Request, res: Response) => {
  const db = getDb();
  const allRequests = db.commissionRequests || [];

  const builderUsername = req.query.builderUsername as string | undefined;
  const clientEmail = req.query.clientEmail as string | undefined;
  const clientUserId = req.query.clientUserId as string | undefined;
  const status = req.query.status as string | undefined;
  const code = req.query.code as string | undefined;

  let filtered = [...allRequests];

  if (builderUsername) {
    filtered = filtered.filter(r => r.builderUsername.toLowerCase() === builderUsername.toLowerCase());
  }
  if (clientEmail) {
    filtered = filtered.filter(r => r.clientEmail.toLowerCase() === clientEmail.toLowerCase());
  }
  if (clientUserId) {
    filtered = filtered.filter(r => r.clientUserId === clientUserId);
  }
  if (status) {
    filtered = filtered.filter(r => r.status === status);
  }
  if (code) {
    filtered = filtered.filter(r => r.code.toUpperCase() === code.toUpperCase());
  }

  // If no specific query filters are passed and user is authenticated:
  if (!builderUsername && !clientEmail && !clientUserId && !code && req.user) {
    const user = req.user;
    const isAdmin = user.roles.includes('admin') || user.roles.includes('tenant_admin');
    if (!isAdmin) {
      filtered = filtered.filter(r =>
        r.builderUsername.toLowerCase() === user.username.toLowerCase() ||
        r.clientUserId === user.id ||
        r.clientEmail.toLowerCase() === user.email.toLowerCase()
      );
    }
  }

  return res.json({
    items: filtered,
    totalCount: filtered.length
  });
});

/**
 * GET /api/v1/commissions/requests/:idOrCode
 * Single request lookup by UUID or tracking code
 */
commissionsRouter.get('/requests/:idOrCode', (req: Request, res: Response) => {
  const db = getDb();
  const { idOrCode } = req.params;
  const target = (db.commissionRequests || []).find(
    r => r.id === idOrCode || r.code.toUpperCase() === idOrCode.toUpperCase()
  );

  if (!target) {
    return sendProblem(req, res, 404, 'Encargo No Encontrado', `No se encontró la solicitud de encargo '${idOrCode}'.`);
  }

  return res.json({ request: target });
});

/**
 * PATCH /api/v1/commissions/requests/:id
 * Update status, quotePrice, estimatedDays, or responseNotes
 */
commissionsRouter.patch('/requests/:id', requireAuth, async (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;
  const user = req.user!;

  const commission = (db.commissionRequests || []).find(
    r => r.id === id || r.code.toUpperCase() === id.toUpperCase()
  );
  if (!commission) {
    return sendProblem(req, res, 404, 'Encargo No Encontrado', `No se encontró la solicitud de encargo '${id}'.`);
  }

  const isBuilder = commission.builderUsername.toLowerCase() === user.username.toLowerCase();
  const isClient = (commission.clientUserId && commission.clientUserId === user.id) ||
                   (commission.clientEmail.toLowerCase() === user.email.toLowerCase());
  const isAdmin = user.roles.includes('admin') || user.roles.includes('tenant_admin');

  if (!isBuilder && !isClient && !isAdmin) {
    return sendProblem(req, res, 403, 'Acceso Denegado', 'No tienes permiso para actualizar esta solicitud de encargo.');
  }

  const oldStatus = commission.status;
  const body = req.body as Partial<UpdateCommissionRequestPayload>;
  const validStatuses: CommissionRequestStatus[] = [
    'pending',
    'quoted',
    'accepted',
    'in_progress',
    'completed',
    'declined'
  ];

  if (body.status !== undefined) {
    if (!validStatuses.includes(body.status)) {
      return sendProblem(req, res, 400, 'Estado Inválido', 'El estado debe ser pending, quoted, accepted, in_progress, completed o declined.');
    }
    // Clients can only set accepted or declined
    if (isClient && !isBuilder && !isAdmin) {
      if (body.status !== 'accepted' && body.status !== 'declined') {
        return sendProblem(req, res, 403, 'Acción No Permitida', 'Como cliente solo puedes aceptar o rechazar la cotización recibida.');
      }
    }
    commission.status = body.status;
  }

  if (body.quotePrice !== undefined) {
    if (!isBuilder && !isAdmin) {
      return sendProblem(req, res, 403, 'Acción No Permitida', 'Solo el modelista asignado puede fijar el precio de la cotización.');
    }
    if (typeof body.quotePrice !== 'number' || body.quotePrice < 0) {
      return sendProblem(req, res, 400, 'Precio Inválido', 'El precio cotizado debe ser un número positivo.');
    }
    commission.quotePrice = body.quotePrice;
  }

  if (body.estimatedDays !== undefined) {
    if (!isBuilder && !isAdmin) {
      return sendProblem(req, res, 403, 'Acción No Permitida', 'Solo el modelista asignado puede definir los días estimados.');
    }
    if (typeof body.estimatedDays !== 'number' || body.estimatedDays < 1) {
      return sendProblem(req, res, 400, 'Días Inválidos', 'El tiempo estimado debe ser de al menos 1 día.');
    }
    commission.estimatedDays = body.estimatedDays;
  }

  if (body.builderResponseNotes !== undefined) {
    if (!isBuilder && !isAdmin) {
      return sendProblem(req, res, 403, 'Acción No Permitida', 'Solo el modelista puede agregar notas de respuesta.');
    }
    commission.builderResponseNotes = String(body.builderResponseNotes).trim();
  }

  commission.updatedAt = new Date().toISOString();
  saveDb(db);

  const activeTenant =
    req.tenant ||
    db.tenants.find(t => t.slug === commission.tenantId) ||
    db.tenants[0];

  // 1. Notify Client when builder quotes the project
  const wasQuoted = (body.quotePrice !== undefined || body.status === 'quoted') && (oldStatus !== 'quoted' || body.quotePrice !== undefined);
  if (wasQuoted && (isBuilder || isAdmin) && commission.clientEmail) {
    try {
      await sendTenantEmailViaResend({
        tenant: activeTenant,
        to: [commission.clientEmail],
        replyTo: activeTenant.contactEmail,
        subject: `[${activeTenant.name}] Cotización formal recibida: ${commission.kitTitle} (${commission.code})`,
        html: `<h2>Cotización formal para tu encargo de pintura</h2>
<p>Hola <strong>${escapeHtml(commission.clientName)}</strong>,</p>
<p>El modelista <strong>@${escapeHtml(commission.builderUsername)}</strong> ha evaluado tu solicitud para <strong>${escapeHtml(commission.kitTitle)}</strong> (${commission.code}):</p>
<div style="background:#1a2332;padding:16px;border-radius:8px;color:#e2e8f0;margin:16px 0;font-family:sans-serif;">
  <p><strong>Precio Cotizado:</strong> <span style="color:#4ade80;font-size:1.15rem;font-weight:bold;">${commission.currency} ${commission.quotePrice}</span></p>
  <p><strong>Plazo Estimado de Trabajo:</strong> ${commission.estimatedDays || 'A convenir'} días</p>
  ${commission.builderResponseNotes ? `<p><strong>Notas del Modelista:</strong></p><blockquote style="border-left:3px solid #38bdf8;padding-left:12px;color:#94a3b8;">${escapeHtml(commission.builderResponseNotes)}</blockquote>` : ''}
</div>
<p>Ingresa a tu taller en <em>Mi Taller &gt; Encargos</em> para aceptar la cotización o coordinar directamente por WhatsApp.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to dispatch commission quote email notification:', emailErr);
    }
  }

  // 2. Notify Builder when client accepts quotation
  if (body.status === 'accepted' && oldStatus !== 'accepted') {
    const builderUser = db.users.find(
      u => u.username.toLowerCase() === commission.builderUsername.toLowerCase()
    );
    const builderEmail = builderUser?.email || `${commission.builderUsername}@plamoscale.com`;

    try {
      await sendTenantEmailViaResend({
        tenant: activeTenant,
        to: [builderEmail],
        replyTo: commission.clientEmail,
        subject: `[${activeTenant.name}] ¡Cotización Aceptada! Encargo ${commission.kitTitle} (${commission.code})`,
        html: `<h2>¡El cliente ha aceptado tu cotización!</h2>
<p>Hola <strong>@${escapeHtml(commission.builderUsername)}</strong>,</p>
<p>El cliente <strong>${escapeHtml(commission.clientName)}</strong> ha aceptado formalmente tu cotización de <strong>${commission.currency} ${commission.quotePrice}</strong> para el kit <strong>${escapeHtml(commission.kitTitle)}</strong> (${commission.code}).</p>
<div style="background:#1a2332;padding:16px;border-radius:8px;color:#e2e8f0;margin:16px 0;font-family:sans-serif;">
  <p><strong>Contacto del Cliente:</strong> ${escapeHtml(commission.clientEmail)}</p>
  <p><strong>WhatsApp:</strong> <a href="https://wa.me/${commission.clientWhatsapp.replace(/[^0-9]/g, '')}" style="color:#22c55e;">${escapeHtml(commission.clientWhatsapp)}</a></p>
  ${commission.clientCity ? `<p><strong>Ciudad:</strong> ${escapeHtml(commission.clientCity)}</p>` : ''}
</div>
<p>Ya puedes coordinar la recepción de la maqueta e iniciar los trabajos en tu mesa de armado.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to dispatch commission accept email notification:', emailErr);
    }
  }

  return res.json({
    status: 'updated',
    request: commission
  });
});
