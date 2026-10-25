import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  KitRecord,
  PaintRecord,
  BrandSummary,
  ScalematesImportRequest,
  ScalematesImportResponse,
  ScaleCategory,
  PaintType,
  PaintFinish,
  BarcodeLookupResponse,
  normalizeBarcode,
  detectBarcodeFormat,
  getManufacturerHintFromBarcode
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { fetchAndParseScalematesKit } from './scalemates-parser';

export const catalogRouter = Router();

// ---------------------------------------------------------------------------
// Kits Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/catalog/kits
 * Query params:
 *   - category: ScaleCategory
 *   - brand: string
 *   - scale: string
 *   - search: string
 *   - limit: number (default 20, max 100)
 */
catalogRouter.get('/kits', (req: Request, res: Response) => {
  const db = getDb();
  const tenant = req.tenant;

  const categoryParam = req.query.category as ScaleCategory | undefined;
  const brandParam = req.query.brand as string | undefined;
  const scaleParam = req.query.scale as string | undefined;
  const searchParam = (req.query.search as string | undefined)?.toLowerCase().trim();
  const limitParam = Math.min(Math.max(parseInt((req.query.limit as string) || '20', 10), 1), 100);

  // Tenant scoping: Filter by tenant.allowedCategories unless category query param is explicitly requested and allowed
  let allowedCategories = tenant ? tenant.allowedCategories : [];
  if (allowedCategories.length === 0) {
    allowedCategories = ['gunpla-mecha', 'military', 'aviation', 'automotive', 'naval', 'figures', 'scifi', 'diorama'];
  }

  let filtered = db.kits.filter(kit => allowedCategories.includes(kit.category));

  if (categoryParam) {
    if (!allowedCategories.includes(categoryParam)) {
      // If tenant doesn't allow this category, return empty list
      return res.json({
        items: [],
        nextCursor: null,
        hasMore: false,
        totalCount: 0
      });
    }
    filtered = filtered.filter(k => k.category === categoryParam);
  }

  if (brandParam) {
    filtered = filtered.filter(k => k.brand.toLowerCase() === brandParam.toLowerCase());
  }

  if (scaleParam) {
    filtered = filtered.filter(k => k.scale === scaleParam);
  }

  if (searchParam) {
    filtered = filtered.filter(k =>
      k.name.toLowerCase().includes(searchParam) ||
      k.brand.toLowerCase().includes(searchParam) ||
      (k.kitNumber && k.kitNumber.toLowerCase().includes(searchParam)) ||
      (k.grade && k.grade.toLowerCase().includes(searchParam))
    );
  }

  const totalCount = filtered.length;
  const items = filtered.slice(0, limitParam);
  const hasMore = totalCount > limitParam;

  return res.json({
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    hasMore,
    totalCount
  });
});

/**
 * GET /api/v1/catalog/kits/:id
 */
catalogRouter.get('/kits/:id', (req: Request, res: Response) => {
  const db = getDb();
  const kit = db.kits.find(k => k.id === req.params.id);

  if (!kit) {
    return sendProblem(
      req,
      res,
      404,
      'Kit No Encontrado',
      `No se encontró ningún modelo a escala con id '${req.params.id}'.`,
      'not-found'
    );
  }

  return res.json(kit);
});

/**
 * GET /api/v1/catalog/barcode/:barcode
 * Lookup kit by JAN / EAN / UPC / Code-128 barcode with manufacturer prefix heuristics
 */
catalogRouter.get('/barcode/:barcode', (req: Request, res: Response) => {
  const rawBarcode = req.params.barcode || '';
  const normalized = normalizeBarcode(rawBarcode);

  if (!normalized || normalized.length < 4) {
    return sendProblem(
      req,
      res,
      400,
      'Código de Barras Inválido',
      'El código de barras proporcionado es demasiado corto o inválido.',
      'validation-error',
      [{ name: 'barcode', reason: 'Debe contener al menos 4 caracteres alfanuméricos' }]
    );
  }

  const format = detectBarcodeFormat(normalized);
  const manufacturerHint = getManufacturerHintFromBarcode(normalized);
  const db = getDb();

  // Find kit by exact normalized barcode or matching substring/number
  const kit = db.kits.find(k => {
    if (k.barcode && normalizeBarcode(k.barcode) === normalized) {
      return true;
    }
    // Fallback: match without leading zeros if 12/13 digits
    if (k.barcode && normalizeBarcode(k.barcode).replace(/^0+/, '') === normalized.replace(/^0+/, '')) {
      return true;
    }
    return false;
  });

  const response: BarcodeLookupResponse = {
    barcode: rawBarcode,
    normalizedBarcode: normalized,
    found: !!kit,
    kit: kit || undefined,
    manufacturerHint: kit?.brand || manufacturerHint,
    format
  };

  return res.json(response);
});

/**
 * POST /api/v1/catalog/kits
 * Manual kit creation
 */
catalogRouter.post('/kits', (req: Request, res: Response) => {
  const {
    name,
    brand,
    scale,
    grade,
    category,
    kitNumber,
    releaseYear,
    boxartUrl,
    scalematesUrl,
    manualUrl,
    barcode
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Nombre de Kit Requerido',
      'El campo "name" es obligatorio.',
      'validation-error',
      [{ name: 'name', reason: 'Debe ser una cadena de texto no vacía' }]
    );
  }

  if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Marca Requerida',
      'El campo "brand" es obligatorio.',
      'validation-error',
      [{ name: 'brand', reason: 'Debe ser una marca válida' }]
    );
  }

  if (!scale || typeof scale !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Escala Requerida',
      'El campo "scale" es obligatorio (ej: 1/144, 1/100, 1/35, etc.).',
      'validation-error',
      [{ name: 'scale', reason: 'Debe ser una escala válida' }]
    );
  }

  const db = getDb();

  // Deduplication check: if kitNumber and brand match
  if (kitNumber) {
    const existing = db.kits.find(
      k => k.brand.toLowerCase() === brand.toLowerCase() && k.kitNumber?.toLowerCase() === kitNumber.toLowerCase()
    );
    if (existing) {
      return res.status(200).json(existing);
    }
  }

  const newKit: KitRecord = {
    id: `kit-${randomUUID().slice(0, 8)}`,
    name: name.trim(),
    brand: brand.trim(),
    scale: scale.trim(),
    grade: grade?.trim() || undefined,
    category: (category as ScaleCategory) || 'gunpla-mecha',
    kitNumber: kitNumber?.trim() || undefined,
    releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
    boxartUrl: boxartUrl?.trim() || undefined,
    scalematesUrl: scalematesUrl?.trim() || undefined,
    manualUrl: manualUrl?.trim() || undefined,
    barcode: barcode?.trim() || undefined,
    source: 'manual',
    createdAt: new Date().toISOString()
  };

  db.kits.push(newKit);
  saveDb(db);

  return res.status(201).json(newKit);
});

/**
 * POST /api/v1/catalog/kits/import-scalemates
 * Imports kit metadata from Scalemates URL with deduplication and 4s graceful fallback
 */
catalogRouter.post('/kits/import-scalemates', async (req: Request, res: Response) => {
  const { scalematesUrl, categoryOverride } = req.body as ScalematesImportRequest;

  if (!scalematesUrl || typeof scalematesUrl !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'URL de Scalemates Requerida',
      'Debe proporcionar una URL válida de Scalemates (ej: https://www.scalemates.com/kits/...).',
      'validation-error',
      [{ name: 'scalematesUrl', reason: 'Cadena de texto requerida' }]
    );
  }

  const db = getDb();

  // Deduplication: check if kit already exists with this exact scalematesUrl
  const existing = db.kits.find(k => k.scalematesUrl?.trim().toLowerCase() === scalematesUrl.trim().toLowerCase());
  if (existing) {
    const responsePayload: ScalematesImportResponse = {
      kit: existing,
      imported: false,
      isExisting: true
    };
    return res.status(200).json(responsePayload);
  }

  try {
    const parsed = await fetchAndParseScalematesKit(scalematesUrl, categoryOverride);

    // Secondary deduplication: check if kitNumber matches and brand is compatible
    if (parsed.kitNumber) {
      const match = db.kits.find((k) => {
        const brandMatch =
          k.brand.toLowerCase() === parsed.brand.toLowerCase() ||
          k.brand.toLowerCase().includes(parsed.brand.toLowerCase()) ||
          parsed.brand.toLowerCase().includes(k.brand.toLowerCase());
        return brandMatch && k.kitNumber === parsed.kitNumber;
      });
      if (match) {
        // Update scalematesUrl if missing
        if (!match.scalematesUrl) {
          match.scalematesUrl = scalematesUrl;
          saveDb(db);
        }
        return res.status(200).json({
          kit: match,
          imported: false,
          isExisting: true,
          warnings: parsed.warnings
        });
      }
    }

    const newKit: KitRecord = {
      id: `kit-${randomUUID().slice(0, 8)}`,
      name: parsed.name,
      brand: parsed.brand,
      scale: parsed.scale,
      grade: parsed.grade,
      category: parsed.category,
      kitNumber: parsed.kitNumber,
      releaseYear: parsed.releaseYear,
      boxartUrl: parsed.boxartUrl,
      scalematesUrl: parsed.scalematesUrl,
      manualUrl: parsed.manualUrl,
      source: parsed.source,
      createdAt: new Date().toISOString()
    };

    db.kits.push(newKit);
    saveDb(db);

    const responsePayload: ScalematesImportResponse = {
      kit: newKit,
      imported: true,
      isExisting: false,
      warnings: parsed.warnings.length > 0 ? parsed.warnings : undefined
    };

    return res.status(201).json(responsePayload);
  } catch (err: unknown) {
    return sendProblem(
      req,
      res,
      400,
      'Error al Importar desde Scalemates',
      err instanceof Error ? err.message : 'No se pudo procesar la URL de Scalemates proporcionada.',
      'import-error'
    );
  }
});

// ---------------------------------------------------------------------------
// Paints Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/catalog/paints
 * Query params:
 *   - brand: string
 *   - line: string
 *   - type: PaintType
 *   - finish: PaintFinish
 *   - search: string
 */
catalogRouter.get('/paints', (req: Request, res: Response) => {
  const db = getDb();
  const brandParam = req.query.brand as string | undefined;
  const lineParam = req.query.line as string | undefined;
  const typeParam = req.query.type as PaintType | undefined;
  const finishParam = req.query.finish as PaintFinish | undefined;
  const searchParam = (req.query.search as string | undefined)?.toLowerCase().trim();

  let filtered = [...db.paints];

  if (brandParam) {
    filtered = filtered.filter(p => p.brand.toLowerCase() === brandParam.toLowerCase());
  }

  if (lineParam) {
    filtered = filtered.filter(p => p.line.toLowerCase() === lineParam.toLowerCase());
  }

  if (typeParam) {
    filtered = filtered.filter(p => p.type === typeParam);
  }

  if (finishParam) {
    filtered = filtered.filter(p => p.finish === finishParam);
  }

  if (searchParam) {
    filtered = filtered.filter(p =>
      p.code.toLowerCase().includes(searchParam) ||
      p.name.toLowerCase().includes(searchParam) ||
      p.brand.toLowerCase().includes(searchParam) ||
      p.line.toLowerCase().includes(searchParam)
    );
  }

  return res.json({
    items: filtered,
    totalCount: filtered.length
  });
});

/**
 * POST /api/v1/catalog/paints
 */
catalogRouter.post('/paints', (req: Request, res: Response) => {
  const { brand, line, code, name, type, finish, hexColor } = req.body;

  if (!brand || !line || !code || !name || !type || !finish || !hexColor) {
    return sendProblem(
      req,
      res,
      400,
      'Datos de Pintura Incompletos',
      'Los campos brand, line, code, name, type, finish y hexColor son obligatorios.',
      'validation-error'
    );
  }

  const db = getDb();

  // Deduplication check: brand + line + code
  const existing = db.paints.find(
    p => p.brand.toLowerCase() === brand.toLowerCase() && p.code.toLowerCase() === code.toLowerCase()
  );
  if (existing) {
    return res.status(200).json(existing);
  }

  const newPaint: PaintRecord = {
    id: `pnt-${randomUUID().slice(0, 8)}`,
    brand: brand.trim(),
    line: line.trim(),
    code: code.trim().toUpperCase(),
    name: name.trim(),
    type: type as PaintType,
    finish: finish as PaintFinish,
    hexColor: hexColor.trim(),
    createdAt: new Date().toISOString()
  };

  db.paints.push(newPaint);
  saveDb(db);

  return res.status(201).json(newPaint);
});

// ---------------------------------------------------------------------------
// Brands Summary
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/catalog/brands
 */
catalogRouter.get('/brands', (_req: Request, res: Response) => {
  const db = getDb();
  const brandMap = new Map<string, { kitCount: number; categories: Set<ScaleCategory> }>();

  for (const kit of db.kits) {
    const existing = brandMap.get(kit.brand) || { kitCount: 0, categories: new Set<ScaleCategory>() };
    existing.kitCount += 1;
    existing.categories.add(kit.category);
    brandMap.set(kit.brand, existing);
  }

  const items: BrandSummary[] = Array.from(brandMap.entries()).map(([brand, data]) => ({
    brand,
    kitCount: data.kitCount,
    categories: Array.from(data.categories)
  })).sort((a, b) => b.kitCount - a.kitCount);

  return res.json({
    items,
    totalCount: items.length
  });
});
