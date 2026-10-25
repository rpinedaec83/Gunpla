import { Router, Request, Response } from 'express';
import {
  DECAL_SHEET_PRESETS,
  DecalSheetConfig,
  DecalSheetSize,
  generateDecalSheetSvg,
  PAPER_DIMENSIONS_MM
} from '@gunpla/shared';
import { sendProblem } from '../../core/problem-details';

export const decalsRouter = Router();

// GET /api/v1/decals/presets
decalsRouter.get('/presets', (req: Request, res: Response) => {
  const { category, scale } = req.query;
  let items = DECAL_SHEET_PRESETS;

  if (category && typeof category === 'string') {
    items = items.filter(p => p.category === category);
  }

  if (scale && typeof scale === 'string') {
    items = items.filter(p => p.scale === scale);
  }

  return res.json({
    items,
    total: items.length,
    totalCount: items.length
  });
});

// GET /api/v1/decals/presets/:id
decalsRouter.get('/presets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const preset = DECAL_SHEET_PRESETS.find(p => p.id === id);

  if (!preset) {
    return sendProblem(
      req,
      res,
      404,
      'Plantilla de Calcas No Encontrada',
      `No se encontro ninguna plantilla de calcas con el id '${id}'.`
    );
  }

  return res.json(preset);
});

// POST /api/v1/decals/render-svg
decalsRouter.post('/render-svg', (req: Request, res: Response) => {
  const { config, previewMode } = req.body;

  if (!config || typeof config !== 'object') {
    return sendProblem(
      req,
      res,
      400,
      'Configuracion Requerida',
      'Debe proporcionar un objeto config valido con la configuracion de la hoja de calcas.',
      'validation-error'
    );
  }

  const paperSize = (config.paperSize as DecalSheetSize) || 'A5';
  const paper = PAPER_DIMENSIONS_MM[paperSize] || PAPER_DIMENSIONS_MM.A5;
  const isPreview = Boolean(previewMode);

  const fullConfig: DecalSheetConfig = {
    title: config.title || 'Custom Decals',
    scale: config.scale || '1/144',
    paperSize,
    paperType: config.paperType || 'transparent',
    marginMm: typeof config.marginMm === 'number' ? config.marginMm : 5,
    includeCutLines: config.includeCutLines !== false,
    includeRegistrationMarks: config.includeRegistrationMarks !== false,
    elements: Array.isArray(config.elements) ? config.elements : []
  };

  const svg = generateDecalSheetSvg(fullConfig, isPreview);

  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('image/svg+xml')) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="decal-sheet-${paperSize.toLowerCase()}.svg"`);
    return res.send(svg);
  }

  return res.json({
    svg,
    widthMm: paper.width,
    heightMm: paper.height,
    scale: fullConfig.scale,
    elementCount: fullConfig.elements.length
  });
});
