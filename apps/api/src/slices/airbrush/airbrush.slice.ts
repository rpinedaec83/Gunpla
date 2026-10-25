import { Router, Request, Response } from 'express';
import {
  calculateAirbrushMix,
  AirbrushMixRequest,
  AIRBRUSH_MEDIUM_LABELS,
  AIRBRUSH_TECHNIQUE_LABELS,
  AirbrushMedium,
  AirbrushTechnique,
  AirbrushNeedleSize
} from '@gunpla/shared';
import { sendProblem } from '../../core/problem-details';

export const airbrushRouter = Router();

/**
 * GET /api/v1/workbench/airbrush/mediums
 * List supported mediums, techniques, and standard needle sizes
 */
airbrushRouter.get('/mediums', (_req: Request, res: Response) => {
  const mediums = Object.entries(AIRBRUSH_MEDIUM_LABELS).map(([id, label]) => ({
    id: id as AirbrushMedium,
    label
  }));

  const techniques = Object.entries(AIRBRUSH_TECHNIQUE_LABELS).map(([id, label]) => ({
    id: id as AirbrushTechnique,
    label
  }));

  const needleSizes: AirbrushNeedleSize[] = [0.15, 0.2, 0.3, 0.4, 0.5];

  return res.json({
    mediums,
    techniques,
    needleSizes
  });
});

/**
 * POST /api/v1/workbench/airbrush/calculate
 * Calculate exact thinner ratio, drops, PSI/Bar pressure, and diagnostics
 */
airbrushRouter.post('/calculate', (req: Request, res: Response) => {
  const body = req.body as AirbrushMixRequest;

  if (!body || typeof body !== 'object') {
    return sendProblem(
      req,
      res,
      400,
      'Cuerpo de Solicitud Inválido',
      'Se requiere un objeto JSON con los parámetros de aerografía.',
      'invalid-request'
    );
  }

  const validMediums: AirbrushMedium[] = [
    'lacquer',
    'acrylic-alcohol',
    'acrylic-water',
    'enamel',
    'polyurethane-primer'
  ];

  if (!body.medium || !validMediums.includes(body.medium)) {
    return sendProblem(
      req,
      res,
      400,
      'Química de Pintura Inválida',
      `El campo 'medium' es obligatorio y debe ser uno de: ${validMediums.join(', ')}.`,
      'invalid-medium'
    );
  }

  const result = calculateAirbrushMix(body);
  return res.json(result);
});
