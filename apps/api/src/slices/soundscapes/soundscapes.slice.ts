import { Router, Request, Response } from 'express';
import {
  getAllSoundscapePresets,
  getSoundscapePreset,
  calculateTimerSeconds,
  SoundscapeTimerMode
} from '@gunpla/shared';
import { sendProblem } from '../../core/problem-details';

export const soundscapesRouter = Router();

/**
 * GET /api/v1/workbench/soundscapes/presets
 * Query params: category (nature, workshop, scifi, music)
 */
soundscapesRouter.get('/presets', (req: Request, res: Response) => {
  const { category } = req.query;
  let items = getAllSoundscapePresets();

  if (category && typeof category === 'string') {
    items = items.filter(p => p.category === category);
  }

  return res.json({
    items,
    totalCount: items.length
  });
});

/**
 * GET /api/v1/workbench/soundscapes/presets/:id
 * Retrieve individual soundscape preset by id
 */
soundscapesRouter.get('/presets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const preset = getSoundscapePreset(id);

  if (!preset) {
    return sendProblem(
      req,
      res,
      404,
      'Pista de Sonido No Encontrada',
      `No se encontró el ambiente o pista de sonido con identificador '${id}'.`,
      'not-found'
    );
  }

  return res.json(preset);
});

/**
 * GET /api/v1/workbench/soundscapes/timer-modes
 * List supported session focus timers
 */
soundscapesRouter.get('/timer-modes', (req: Request, res: Response) => {
  const modes: Array<{ id: SoundscapeTimerMode; label: string; durationMinutes: number; description: string }> = [
    { id: 'none', label: 'Sin Temporizador', durationMinutes: 0, description: 'Reproducción continua sin corte' },
    { id: 'pomodoro-25', label: 'Pomodoro Taller (25 min)', durationMinutes: 25, description: '25 min de enfoque de montaje / 5 min de descanso o limpieza' },
    { id: 'deep-work-45', label: 'Foco Profundo (45 min)', durationMinutes: 45, description: '45 min de pintura y aerografía ininterrumpida' },
    { id: 'session-60', label: 'Sesión Maestra (60 min)', durationMinutes: 60, description: 'Bloque de 1 hora de trabajo continuo' }
  ];

  return res.json({
    modes: modes.map(m => ({
      ...m,
      durationSeconds: calculateTimerSeconds(m.id)
    }))
  });
});
