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
  UpdatePaintRackItemRequest,
  PaintMedium,
  PaintType,
  KitRecord,
  PaintRecord,
  ScaleCategory,
  BulkStashImportItem,
  BulkPaintImportItem,
  BulkImportRequest,
  BulkStashImportResponse,
  BulkPaintImportResponse,
  ScanStashRequest,
  ScanStashResponse,
  normalizeBarcode,
  detectBarcodeFormat,
  getManufacturerHintFromBarcode
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';
import {
  getShopStockFromDb,
  getShopsFromDb,
  matchWishlistWithShopStock
} from '../community/community.slice';
import { findPaintEquivalences } from '../paints-ai/paints-ai.slice';

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
 * POST /api/v1/workbench/stash/scan
 * Instant stash registration via scanned barcode (JAN / EAN / UPC / Code-128).
 * Finds existing kit or creates a new catalog kit record on the fly with source 'user-import'.
 */
workbenchRouter.post('/stash/scan', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    barcode,
    status,
    notes,
    pricePaid,
    currency,
    kitName,
    brand,
    scale,
    grade,
    category
  } = req.body as ScanStashRequest;

  if (!barcode || typeof barcode !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Código de Barras Requerido',
      'El campo "barcode" es obligatorio para registrar por escaneo.',
      'validation-error',
      [{ name: 'barcode', reason: 'Debe ser un código de barras válido' }]
    );
  }

  const normalized = normalizeBarcode(barcode);
  if (!normalized || normalized.length < 4) {
    return sendProblem(
      req,
      res,
      400,
      'Código de Barras Inválido',
      'El código de barras normalizado es demasiado corto.',
      'validation-error',
      [{ name: 'barcode', reason: 'Debe contener al menos 4 caracteres alfanuméricos' }]
    );
  }

  const db = getDb();
  let createdKit = false;

  // Search existing kit
  let kit = db.kits.find(k => {
    if (k.barcode && normalizeBarcode(k.barcode) === normalized) {
      return true;
    }
    if (k.barcode && normalizeBarcode(k.barcode).replace(/^0+/, '') === normalized.replace(/^0+/, '')) {
      return true;
    }
    return false;
  });

  if (!kit) {
    // If not found in catalog, auto-create kit with provided or heuristic details
    const manufacturerHint = getManufacturerHintFromBarcode(normalized);
    const resolvedBrand = (brand && brand.trim()) || manufacturerHint || 'Desconocida';
    const resolvedName = (kitName && kitName.trim()) || `${resolvedBrand} Model Kit [${normalized}]`;
    const resolvedScale = (scale && scale.trim()) || '1/144';
    const resolvedCategory: ScaleCategory = category || (
      resolvedBrand.toLowerCase().includes('bandai') || resolvedBrand.toLowerCase().includes('kotobukiya')
        ? 'gunpla-mecha'
        : 'military'
    );

    kit = {
      id: `kit-scan-${randomUUID().slice(0, 8)}`,
      name: resolvedName,
      brand: resolvedBrand,
      scale: resolvedScale,
      grade: grade?.trim() || undefined,
      category: resolvedCategory,
      barcode: normalized,
      source: 'user-import',
      createdAt: new Date().toISOString()
    };

    db.kits.push(kit);
    createdKit = true;
  }

  const now = new Date().toISOString();
  const newStashItem: StashItemRecord = {
    id: `stash-${randomUUID().slice(0, 8)}`,
    userId,
    kitId: kit.id,
    status: status || 'unbuilt',
    notes: notes?.trim() || undefined,
    pricePaid: pricePaid !== undefined && pricePaid !== null ? Number(pricePaid) : undefined,
    currency: currency || 'USD',
    acquiredAt: now,
    completedAt: status === 'built' ? now : undefined,
    createdAt: now,
    updatedAt: now
  };

  db.stashItems.push(newStashItem);
  saveDb(db);

  const response: ScanStashResponse = {
    stashItem: {
      ...newStashItem,
      kit
    },
    kit,
    createdKit,
    message: createdKit
      ? `Maqueta registrada en catálogo y agregada a tu Stash (${kit.name}).`
      : `Maqueta agregada a tu Stash con éxito (${kit.name}).`
  };

  return res.status(201).json(response);
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

/**
 * GET /api/v1/workbench/paints/:id/equivalences
 * Get AI-powered cross-brand equivalences for a specific paint in the user's rack
 */
workbenchRouter.get('/paints/:id/equivalences', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const itemId = req.params.id;
  const targetMedium = req.query.targetMedium as PaintMedium | undefined;

  const db = getDb();
  let rackItem = db.paintRackItems.find(p => p.id === itemId && p.userId === userId);
  let paint = rackItem ? db.paints.find(p => p.id === rackItem!.paintId) : undefined;

  // Fallback: check if :id is directly a paintId
  if (!paint) {
    paint = db.paints.find(p => p.id === itemId);
    if (paint) {
      rackItem = db.paintRackItems.find(p => p.paintId === itemId && p.userId === userId);
    }
  }

  if (!paint) {
    return sendProblem(
      req,
      res,
      404,
      'Pintura No Encontrada',
      `No se encontró ninguna pintura en tu rack con el identificador '${itemId}'.`,
      'not-found'
    );
  }

  const userRack = db.paintRackItems.filter(p => p.userId === userId);
  const result = findPaintEquivalences(paint.code, paint.brand, targetMedium, userRack, db.paints);

  if (!result) {
    return sendProblem(
      req,
      res,
      404,
      'Equivalencias No Disponibles',
      `No se encontraron fórmulas de equivalencia directa para la pintura '${paint.brand} ${paint.code}'.`,
      'not-found'
    );
  }

  return res.json({
    ...result,
    rackItemId: rackItem?.id,
    currentRackQuantity: rackItem?.quantity || 0
  });
});

// ---------------------------------------------------------------------------
// Bulk Import Tools (CSV / TSV / Delimited Table for Stash & Paint Rack)
// ---------------------------------------------------------------------------

export function parseDelimitedText(
  text: string,
  customDelimiter?: string
): Array<Record<string, string>> {
  if (!text || typeof text !== 'string') return [];

  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) return [];

  let delim = customDelimiter;
  if (!delim) {
    const firstLine = rawLines[0];
    const commas = (firstLine.match(/,/g) || []).length;
    const semicolons = (firstLine.match(/;/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    if (tabs >= commas && tabs >= semicolons && tabs > 0) delim = '\t';
    else if (semicolons > commas && semicolons > 0) delim = ';';
    else delim = ',';
  }

  function splitLine(line: string, d: string): string[] {
    const tokens: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === d && !inQuotes) {
        tokens.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    tokens.push(cur.trim());
    return tokens;
  }

  const tokenizedLines = rawLines.map((l) => splitLine(l, delim));
  const firstTokens = tokenizedLines[0].map((t) => t.toLowerCase());

  const headerKeywords = [
    'name', 'nombre', 'kit', 'title', 'modelo', 'maqueta',
    'brand', 'marca', 'scale', 'escala', 'grade', 'grado',
    'code', 'codigo', 'cod', 'color', 'paint', 'pintura',
    'status', 'estado', 'notes', 'notas', 'quantity', 'cantidad'
  ];
  const isHeader = firstTokens.some((t) => headerKeywords.includes(t));

  let headers: string[] = [];
  let dataRows: string[][] = [];

  if (isHeader) {
    headers = firstTokens;
    dataRows = tokenizedLines.slice(1);
  } else {
    dataRows = tokenizedLines;
    headers = [];
  }

  const results: Array<Record<string, string>> = [];
  for (const row of dataRows) {
    if (row.length === 0 || row.every((c) => c === '')) continue;
    const record: Record<string, string> = {};

    if (headers.length > 0) {
      for (let j = 0; j < headers.length; j++) {
        if (j < row.length) {
          record[headers[j]] = row[j];
        }
      }
    } else {
      for (let j = 0; j < row.length; j++) {
        record[`col_${j}`] = row[j];
      }
    }
    results.push(record);
  }

  return results;
}

export function inferScaleCategory(
  name: string,
  brand?: string,
  scale?: string
): ScaleCategory {
  const lower = `${name} ${brand || ''} ${scale || ''}`.toLowerCase();
  if (
    lower.includes('gundam') ||
    lower.includes('gunpla') ||
    lower.includes('zaku') ||
    lower.includes('mecha') ||
    lower.includes('eva') ||
    lower.includes('bandai') ||
    lower.includes('hg') ||
    lower.includes('rg') ||
    lower.includes('mg') ||
    lower.includes('pg')
  ) {
    return 'gunpla-mecha';
  }
  if (
    lower.includes('tank') ||
    lower.includes('panzer') ||
    lower.includes('tiger') ||
    lower.includes('sherman') ||
    lower.includes('militar') ||
    lower.includes('armored')
  ) {
    return 'military';
  }
  if (
    lower.includes('spitfire') ||
    lower.includes('zero') ||
    lower.includes('bf 109') ||
    lower.includes('f-16') ||
    lower.includes('f-14') ||
    lower.includes('f-35') ||
    lower.includes('aviation') ||
    lower.includes('aircraft')
  ) {
    return 'aviation';
  }
  if (
    lower.includes('auto') ||
    lower.includes('ferrari') ||
    lower.includes('porsche') ||
    lower.includes('car') ||
    lower.includes('moto') ||
    lower.includes('nissan') ||
    lower.includes('skyline') ||
    lower.includes('toyota') ||
    lower.includes('honda') ||
    lower.includes('1/24')
  ) {
    return 'automotive';
  }
  if (lower.includes('ship') || lower.includes('yamato') || lower.includes('bismarck') || lower.includes('titanic')) {
    return 'naval';
  }
  return 'gunpla-mecha';
}

export function normalizeStashStatus(val?: string): StashStatus {
  if (!val) return 'unbuilt';
  const v = val.toLowerCase().trim();
  if (['sin armar', 'en caja', 'backlog', 'unbuilt', 'in_stash', 'nuevo'].includes(v)) return 'unbuilt';
  if (['en progreso', 'wip', 'en proceso', 'in_progress', 'armando'].includes(v)) return 'in_progress';
  if (['armado', 'terminado', 'construido', 'built', 'completed', 'finalizado'].includes(v)) return 'built';
  if (['deseado', 'wishlist', 'lista de deseos', 'deseo'].includes(v)) return 'wishlist';
  if (['intercambio', 'venta', 'for_trade', 'trade', 'cambio'].includes(v)) return 'for_trade';
  return 'unbuilt';
}

export function normalizePaintStatus(val?: string): PaintRackStatus {
  if (!val) return 'owned';
  const v = val.toLowerCase().trim();
  if (['en rack', 'owned', 'poseido', 'disponible', 'tengo'].includes(v)) return 'owned';
  if (['poco stock', 'low_stock', 'por agotar', 'bajo'].includes(v)) return 'low_stock';
  if (['deseado', 'wishlist', 'por comprar', 'falta'].includes(v)) return 'wishlist';
  return 'owned';
}

export function extractStashRow(record: Record<string, string>): BulkStashImportItem {
  const name =
    record.name ||
    record.nombre ||
    record.kit ||
    record.kitname ||
    record.title ||
    record.titulo ||
    record.modelo ||
    record.maqueta ||
    record.col_0 ||
    '';

  const brand =
    record.brand ||
    record.marca ||
    record.fabricante ||
    record.maker ||
    record.col_1 ||
    '';

  const scale =
    record.scale ||
    record.escala ||
    record.col_2 ||
    '';

  const grade =
    record.grade ||
    record.grado ||
    record.linea ||
    record.col_3 ||
    '';

  const statusRaw =
    record.status ||
    record.estado ||
    record.col_4 ||
    '';

  const notes =
    record.notes ||
    record.notas ||
    record.comentarios ||
    record.observaciones ||
    record.col_5 ||
    '';

  const priceRaw =
    record.price ||
    record.precio ||
    record.cost ||
    record.costo ||
    record.col_6 ||
    '';

  return {
    name: name.trim(),
    brand: brand.trim() || undefined,
    scale: scale.trim() || undefined,
    grade: grade.trim() || undefined,
    status: normalizeStashStatus(statusRaw),
    notes: notes.trim() || undefined,
    pricePaid: priceRaw && !isNaN(Number(priceRaw)) ? Number(priceRaw) : undefined
  };
}

export function extractPaintRow(record: Record<string, string>): BulkPaintImportItem {
  const code =
    record.code ||
    record.codigo ||
    record.cod ||
    record.ref ||
    record.referencia ||
    record.col_1 ||
    record.col_0 ||
    '';

  const brand =
    record.brand ||
    record.marca ||
    record.fabricante ||
    (record.col_0 !== code ? record.col_0 : undefined) ||
    '';

  const name =
    record.name ||
    record.nombre ||
    record.color ||
    record.tono ||
    record.col_2 ||
    '';

  const qtyRaw =
    record.quantity ||
    record.cantidad ||
    record.cant ||
    record.qty ||
    record.frascos ||
    record.col_3 ||
    '1';

  const statusRaw =
    record.status ||
    record.estado ||
    record.col_4 ||
    'owned';

  const notes =
    record.notes ||
    record.notas ||
    record.col_5 ||
    '';

  return {
    code: code.trim().toUpperCase(),
    brand: brand.trim() || undefined,
    name: name.trim() || undefined,
    quantity: Math.max(1, parseInt(qtyRaw, 10) || 1),
    status: normalizePaintStatus(statusRaw),
    notes: notes.trim() || undefined
  };
}

/**
 * POST /api/v1/workbench/import/stash
 * Bulk import model kits to personal stash from CSV/TSV or JSON items
 */
workbenchRouter.post('/import/stash', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { csvContent, delimiter, dryRun = false, items: manualItems } = req.body as BulkImportRequest;

  let parsedItems: BulkStashImportItem[] = [];

  if (Array.isArray(manualItems) && manualItems.length > 0) {
    parsedItems = manualItems.map((m) => ({
      name: String(m.name || '').trim(),
      brand: m.brand ? String(m.brand).trim() : undefined,
      scale: m.scale ? String(m.scale).trim() : undefined,
      grade: m.grade ? String(m.grade).trim() : undefined,
      status: normalizeStashStatus(m.status),
      notes: m.notes ? String(m.notes).trim() : undefined,
      pricePaid: m.pricePaid !== undefined ? Number(m.pricePaid) : undefined,
      currency: m.currency || 'USD'
    }));
  } else if (csvContent && typeof csvContent === 'string') {
    const rawRecords = parseDelimitedText(csvContent, delimiter);
    parsedItems = rawRecords.map(extractStashRow);
  } else {
    return sendProblem(
      req,
      res,
      400,
      'Contenido Requerido',
      'Debes proporcionar "csvContent" o un arreglo de "items" para importar.'
    );
  }

  // Filter out completely empty kit names
  parsedItems = parsedItems.filter((i) => i.name.length > 0);

  if (parsedItems.length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Sin Filas Válidas',
      'No se encontraron filas con nombre de maqueta válido para importar.'
    );
  }

  const db = getDb();
  const now = new Date().toISOString();

  let matchedCatalogCount = 0;
  let createdCustomCount = 0;
  const createdStashItems: StashItemRecord[] = [];
  const previewRows: BulkStashImportResponse['previewRows'] = [];

  for (const row of parsedItems) {
    const cleanName = row.name.toLowerCase();

    // Try exact or fuzzy catalog match in db.kits
    let matchedKit = db.kits.find(
      (k) =>
        k.name.toLowerCase() === cleanName ||
        (k.id && k.id.toLowerCase() === cleanName) ||
        (k.kitNumber && cleanName.includes(k.kitNumber.toLowerCase()))
    );

    // Secondary token overlap match
    if (!matchedKit) {
      const rowTokens = cleanName.split(/\s+/).filter((t) => t.length > 2);
      matchedKit = db.kits.find((k) => {
        const kLower = k.name.toLowerCase();
        const matches = rowTokens.filter((t) => kLower.includes(t));
        return matches.length >= 2;
      });
    }

    let kitId = '';
    let isCatalogMatch = false;
    let customKit: KitRecord | undefined;

    if (matchedKit) {
      kitId = matchedKit.id;
      isCatalogMatch = true;
      matchedCatalogCount++;
    } else {
      // Create user custom kit
      customKit = {
        id: `kit-custom-${randomUUID().slice(0, 8)}`,
        name: row.name,
        brand: row.brand || 'Bandai Spirits',
        scale: row.scale || '1/144',
        grade: row.grade || 'Custom Kit',
        category: inferScaleCategory(row.name, row.brand, row.scale),
        source: 'user-import',
        createdAt: now
      };
      kitId = customKit.id;
      createdCustomCount++;
      if (!dryRun) {
        db.kits.push(customKit);
      }
    }

    const stashItem: StashItemRecord = {
      id: `stash-${randomUUID().slice(0, 8)}`,
      userId,
      kitId,
      status: row.status || 'unbuilt',
      notes: row.notes,
      pricePaid: row.pricePaid,
      currency: row.currency || 'USD',
      acquiredAt: now,
      completedAt: row.status === 'built' ? now : undefined,
      createdAt: now,
      updatedAt: now
    };

    if (!dryRun) {
      db.stashItems.push(stashItem);
    }
    createdStashItems.push({
      ...stashItem,
      kit: matchedKit || customKit || db.kits.find((k) => k.id === kitId),
      isCustom: !isCatalogMatch
    } as any);

    previewRows.push({
      name: row.name,
      brand: row.brand || (matchedKit ? matchedKit.brand : 'Bandai Spirits'),
      matchedKitName: matchedKit ? matchedKit.name : undefined,
      isCatalogMatch,
      status: row.status || 'unbuilt'
    });
  }

  if (!dryRun) {
    saveDb(db);
  }

  const response: BulkStashImportResponse = {
    dryRun,
    totalParsed: parsedItems.length,
    importedCount: createdStashItems.length,
    matchedCatalogCount,
    createdCustomCount,
    items: createdStashItems,
    previewRows
  };

  return res.status(dryRun ? 200 : 201).json(response);
});

/**
 * POST /api/v1/workbench/import/paints
 * Bulk import paint bottles into personal Paint Rack from CSV/TSV or JSON items
 */
workbenchRouter.post('/import/paints', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { csvContent, delimiter, dryRun = false, items: manualItems } = req.body as BulkImportRequest;

  let parsedItems: BulkPaintImportItem[] = [];

  if (Array.isArray(manualItems) && manualItems.length > 0) {
    parsedItems = manualItems.map((m) => ({
      code: String(m.code || '').trim().toUpperCase(),
      brand: m.brand ? String(m.brand).trim() : undefined,
      name: m.name ? String(m.name).trim() : undefined,
      quantity: Math.max(1, parseInt(String(m.quantity || '1'), 10) || 1),
      status: normalizePaintStatus(m.status),
      notes: m.notes ? String(m.notes).trim() : undefined
    }));
  } else if (csvContent && typeof csvContent === 'string') {
    const rawRecords = parseDelimitedText(csvContent, delimiter);
    parsedItems = rawRecords.map(extractPaintRow);
  } else {
    return sendProblem(
      req,
      res,
      400,
      'Contenido Requerido',
      'Debes proporcionar "csvContent" o un arreglo de "items" para importar.'
    );
  }

  parsedItems = parsedItems.filter((i) => i.code.length > 0);

  if (parsedItems.length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Sin Filas Válidas',
      'No se encontraron filas con código de pintura válido para importar.'
    );
  }

  const db = getDb();
  const now = new Date().toISOString();

  let matchedCatalogCount = 0;
  let createdCustomCount = 0;
  const createdRackItems: PaintRackItemRecord[] = [];
  const previewRows: BulkPaintImportResponse['previewRows'] = [];

  for (const row of parsedItems) {
    const cleanCode = row.code.toLowerCase();
    const cleanBrand = (row.brand || '').toLowerCase();

    // Match in db.paints
    let matchedPaint = db.paints.find(
      (p) =>
        p.code.toLowerCase() === cleanCode &&
        (!cleanBrand || p.brand.toLowerCase().includes(cleanBrand) || cleanBrand.includes(p.brand.toLowerCase()))
    );

    // Fallback match code alone if brand didn't match
    if (!matchedPaint) {
      matchedPaint = db.paints.find((p) => p.code.toLowerCase() === cleanCode);
    }

    let paintId = '';
    let isCatalogMatch = false;
    let customPaint: PaintRecord | undefined;

    if (matchedPaint) {
      paintId = matchedPaint.id;
      isCatalogMatch = true;
      matchedCatalogCount++;
    } else {
      customPaint = {
        id: `paint-custom-${randomUUID().slice(0, 8)}`,
        brand: row.brand || 'Mr. Hobby',
        line: 'Custom / Imported',
        code: row.code,
        name: row.name || row.code,
        type: (row.type && ['lacquer', 'acrylic', 'polyurethane', 'spray_graffiti', 'enamel', 'oil', 'primer'].includes(row.type.toLowerCase()))
          ? row.type.toLowerCase() as PaintType
          : 'acrylic',
        finish: 'satin',
        hexColor: row.color && /^#[0-9a-fA-F]{6}$/.test(row.color) ? row.color : '#888888',
        createdAt: now
      };
      paintId = customPaint.id;
      createdCustomCount++;
      if (!dryRun) {
        db.paints.push(customPaint);
      }
    }

    let rackItem: PaintRackItemRecord;

    if (!dryRun) {
      // Check if already in user's rack
      const existing = db.paintRackItems.find((p) => p.userId === userId && p.paintId === paintId);
      if (existing) {
        existing.quantity += row.quantity || 1;
        existing.status = row.status || existing.status;
        if (row.notes) existing.notes = row.notes;
        existing.updatedAt = now;
        rackItem = existing;
      } else {
        const newItem: PaintRackItemRecord = {
          id: `rack-${randomUUID().slice(0, 8)}`,
          userId,
          paintId,
          status: row.status || 'owned',
          quantity: row.quantity || 1,
          notes: row.notes,
          createdAt: now,
          updatedAt: now
        };
        db.paintRackItems.push(newItem);
        rackItem = newItem;
      }
    } else {
      rackItem = {
        id: `rack-preview-${randomUUID().slice(0, 8)}`,
        userId,
        paintId,
        status: row.status || 'owned',
        quantity: row.quantity || 1,
        notes: row.notes,
        createdAt: now,
        updatedAt: now
      };
    }

    createdRackItems.push({
      ...rackItem,
      paint: matchedPaint || customPaint || db.paints.find((p) => p.id === paintId),
      isCustom: !isCatalogMatch
    } as any);

    previewRows.push({
      code: row.code,
      brand: row.brand || (matchedPaint ? matchedPaint.brand : 'Mr. Hobby'),
      name: row.name || (matchedPaint ? matchedPaint.name : row.code),
      matchedPaintName: matchedPaint ? `${matchedPaint.brand} ${matchedPaint.name}` : undefined,
      isCatalogMatch,
      quantity: row.quantity || 1
    });
  }

  if (!dryRun) {
    saveDb(db);
  }

  const response: BulkPaintImportResponse = {
    dryRun,
    totalParsed: parsedItems.length,
    importedCount: createdRackItems.length,
    matchedCatalogCount,
    createdCustomCount,
    items: createdRackItems,
    previewRows
  };

  return res.status(dryRun ? 200 : 201).json(response);
});
