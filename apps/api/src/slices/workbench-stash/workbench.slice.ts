import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  StashItemRecord,
  StashStatus,
  PaintRackItemRecord,
  PaintRackStatus,
  WorkbenchSummary,
  CreateStashItemRequest,
  UpdateStashItemRequest,
  CreatePaintRackItemRequest,
  UpdatePaintRackItemRequest
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';
import {
  getShopStockFromDb,
  getShopsFromDb,
  matchWishlistWithShopStock
} from '../community/community.slice';

export const workbenchRouter = Router();

// All workbench endpoints require user authentication
workbenchRouter.use(requireAuth);

// ---------------------------------------------------------------------------
// Workbench Summary
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/workbench/summary
 * Aggregated stash and paint rack statistics for the authenticated builder
 */
workbenchRouter.get('/summary', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const db = getDb();

  const userStash = db.stashItems.filter(item => item.userId === userId);
  const userPaints = db.paintRackItems.filter(item => item.userId === userId);

  const summary: WorkbenchSummary = {
    totalStash: userStash.length,
    unbuiltCount: userStash.filter(s => s.status === 'unbuilt').length,
    inProgressCount: userStash.filter(s => s.status === 'in_progress').length,
    builtCount: userStash.filter(s => s.status === 'built').length,
    wishlistCount: userStash.filter(s => s.status === 'wishlist').length,
    forTradeCount: userStash.filter(s => s.status === 'for_trade').length,
    totalPaints: userPaints.length,
    ownedPaintsCount: userPaints.filter(p => p.status === 'owned').length,
    lowStockPaintsCount: userPaints.filter(p => p.status === 'low_stock').length,
    wishlistPaintsCount: userPaints.filter(p => p.status === 'wishlist').length
  };

  return res.json(summary);
});

/**
 * GET /api/v1/workbench/wishlist-alerts
 * Live matches between user's stash wishlist and Trusted Shops stock
 */
workbenchRouter.get('/wishlist-alerts', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const db = getDb();

  const userStash = db.stashItems.filter(item => item.userId === userId);
  const populatedStash = userStash.map(item => ({
    ...item,
    kit: db.kits.find(k => k.id === item.kitId)
  }));

  const shopStock = getShopStockFromDb();
  const shops = getShopsFromDb();
  const alerts = matchWishlistWithShopStock(populatedStash, shopStock, shops);

  return res.json({
    alerts,
    items: alerts,
    totalAlerts: alerts.length,
    totalCount: alerts.length
  });
});

// ---------------------------------------------------------------------------
// Personal Stash Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/workbench/stash
 * Query params: status (StashStatus)
 */
workbenchRouter.get('/stash', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const statusParam = req.query.status as StashStatus | undefined;
  const db = getDb();

  let userStash = db.stashItems.filter(item => item.userId === userId);

  if (statusParam) {
    userStash = userStash.filter(s => s.status === statusParam);
  }

  // Populate kit metadata
  const populated = userStash.map(item => ({
    ...item,
    kit: db.kits.find(k => k.id === item.kitId)
  }));

  return res.json({
    items: populated,
    totalCount: populated.length
  });
});

/**
 * POST /api/v1/workbench/stash
 * Add kit to personal stash
 */
workbenchRouter.post('/stash', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { kitId, status, rating, notes, pricePaid, currency, acquiredAt } = req.body as CreateStashItemRequest;

  if (!kitId || typeof kitId !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Kit Requerido',
      'El campo "kitId" es obligatorio para agregar un kit a tu Stash.',
      'validation-error',
      [{ name: 'kitId', reason: 'Debe ser un ID de kit válido' }]
    );
  }

  const db = getDb();
  const kit = db.kits.find(k => k.id === kitId);
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

  const now = new Date().toISOString();
  const newItem: StashItemRecord = {
    id: `stash-${randomUUID().slice(0, 8)}`,
    userId,
    kitId,
    status: status || 'unbuilt',
    rating: rating ? Number(rating) : undefined,
    notes: notes?.trim() || undefined,
    pricePaid: pricePaid !== undefined ? Number(pricePaid) : undefined,
    currency: currency || 'USD',
    acquiredAt: acquiredAt || now,
    completedAt: status === 'built' ? now : undefined,
    createdAt: now,
    updatedAt: now
  };

  db.stashItems.push(newItem);
  saveDb(db);

  return res.status(201).json({
    ...newItem,
    kit
  });
});

/**
 * PATCH /api/v1/workbench/stash/:id
 * Update kit in personal stash (status, rating, notes, price)
 */
workbenchRouter.patch('/stash/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const itemId = req.params.id;
  const { status, rating, notes, pricePaid, currency, acquiredAt, completedAt } = req.body as UpdateStashItemRequest;

  const db = getDb();
  const item = db.stashItems.find(s => s.id === itemId);

  if (!item) {
    return sendProblem(
      req,
      res,
      404,
      'Item No Encontrado',
      `No se encontró el elemento de Stash con id '${itemId}'.`,
      'not-found'
    );
  }

  // Ownership authorization check
  if (item.userId !== userId) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso Prohibido',
      'No tienes autorización para modificar el Stash de otro modelista.',
      'forbidden'
    );
  }

  const now = new Date().toISOString();

  if (status) {
    item.status = status;
    if (status === 'built' && !item.completedAt && !completedAt) {
      item.completedAt = now;
    }
  }

  if (rating !== undefined) item.rating = Number(rating);
  if (notes !== undefined) item.notes = notes.trim();
  if (pricePaid !== undefined) item.pricePaid = Number(pricePaid);
  if (currency !== undefined) item.currency = currency;
  if (acquiredAt !== undefined) item.acquiredAt = acquiredAt;
  if (completedAt !== undefined) item.completedAt = completedAt;
  item.updatedAt = now;

  saveDb(db);

  const kit = db.kits.find(k => k.id === item.kitId);
  return res.json({
    ...item,
    kit
  });
});

/**
 * DELETE /api/v1/workbench/stash/:id
 * Remove kit from personal stash
 */
workbenchRouter.delete('/stash/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const itemId = req.params.id;

  const db = getDb();
  const itemIndex = db.stashItems.findIndex(s => s.id === itemId);

  if (itemIndex === -1) {
    return sendProblem(
      req,
      res,
      404,
      'Item No Encontrado',
      `No se encontró el elemento de Stash con id '${itemId}'.`,
      'not-found'
    );
  }

  const item = db.stashItems[itemIndex];
  if (item.userId !== userId) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso Prohibido',
      'No tienes autorización para eliminar el elemento de Stash de otro modelista.',
      'forbidden'
    );
  }

  db.stashItems.splice(itemIndex, 1);
  saveDb(db);

  return res.json({
    deleted: true,
    id: itemId
  });
});

// ---------------------------------------------------------------------------
// Personal Paint Rack Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/workbench/paints
 * Query params: status (PaintRackStatus)
 */
workbenchRouter.get('/paints', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const statusParam = req.query.status as PaintRackStatus | undefined;
  const db = getDb();

  let userPaints = db.paintRackItems.filter(item => item.userId === userId);

  if (statusParam) {
    userPaints = userPaints.filter(p => p.status === statusParam);
  }

  // Populate paint details with hex colors
  const populated = userPaints.map(item => ({
    ...item,
    paint: db.paints.find(p => p.id === item.paintId)
  }));

  return res.json({
    items: populated,
    totalCount: populated.length
  });
});

/**
 * POST /api/v1/workbench/paints
 * Add paint to personal paint rack
 */
workbenchRouter.post('/paints', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paintId, status, quantity, notes } = req.body as CreatePaintRackItemRequest;

  if (!paintId || typeof paintId !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Pintura Requerida',
      'El campo "paintId" es obligatorio para agregar pintura a tu Paint Rack.',
      'validation-error',
      [{ name: 'paintId', reason: 'Debe ser un ID de pintura válido' }]
    );
  }

  const db = getDb();
  const paint = db.paints.find(p => p.id === paintId);
  if (!paint) {
    return sendProblem(
      req,
      res,
      404,
      'Pintura No Encontrada',
      `La pintura con id '${paintId}' no existe en el catálogo maestro.`,
      'not-found'
    );
  }

  const now = new Date().toISOString();

  // Deduplication / increment existing rack item
  const existing = db.paintRackItems.find(p => p.userId === userId && p.paintId === paintId);
  if (existing) {
    existing.quantity += quantity ? Number(quantity) : 1;
    if (status) existing.status = status;
    if (notes) existing.notes = notes.trim();
    existing.updatedAt = now;
    saveDb(db);

    return res.status(200).json({
      ...existing,
      paint
    });
  }

  const newItem: PaintRackItemRecord = {
    id: `rack-${randomUUID().slice(0, 8)}`,
    userId,
    paintId,
    status: status || 'owned',
    quantity: quantity ? Math.max(Number(quantity), 1) : 1,
    notes: notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now
  };

  db.paintRackItems.push(newItem);
  saveDb(db);

  return res.status(201).json({
    ...newItem,
    paint
  });
});

/**
 * PATCH /api/v1/workbench/paints/:id
 * Update paint quantity, status or notes
 */
workbenchRouter.patch('/paints/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const itemId = req.params.id;
  const { status, quantity, notes } = req.body as UpdatePaintRackItemRequest;

  const db = getDb();
  const item = db.paintRackItems.find(p => p.id === itemId);

  if (!item) {
    return sendProblem(
      req,
      res,
      404,
      'Pintura en Rack No Encontrada',
      `No se encontró el elemento del Paint Rack con id '${itemId}'.`,
      'not-found'
    );
  }

  if (item.userId !== userId) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso Prohibido',
      'No tienes autorización para modificar el Paint Rack de otro modelista.',
      'forbidden'
    );
  }

  const now = new Date().toISOString();
  if (status) item.status = status;
  if (quantity !== undefined) item.quantity = Math.max(Number(quantity), 0);
  if (notes !== undefined) item.notes = notes.trim();
  item.updatedAt = now;

  saveDb(db);

  const paint = db.paints.find(p => p.id === item.paintId);
  return res.json({
    ...item,
    paint
  });
});

/**
 * DELETE /api/v1/workbench/paints/:id
 * Remove paint from rack
 */
workbenchRouter.delete('/paints/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const itemId = req.params.id;

  const db = getDb();
  const itemIndex = db.paintRackItems.findIndex(p => p.id === itemId);

  if (itemIndex === -1) {
    return sendProblem(
      req,
      res,
      404,
      'Pintura en Rack No Encontrada',
      `No se encontró el elemento del Paint Rack con id '${itemId}'.`,
      'not-found'
    );
  }

  const item = db.paintRackItems[itemIndex];
  if (item.userId !== userId) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso Prohibido',
      'No tienes autorización para eliminar la pintura del Paint Rack de otro modelista.',
      'forbidden'
    );
  }

  db.paintRackItems.splice(itemIndex, 1);
  saveDb(db);

  return res.json({
    deleted: true,
    id: itemId
  });
});
