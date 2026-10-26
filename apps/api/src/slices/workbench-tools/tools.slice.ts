import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  WorkbenchToolItem,
  ToolCategory,
  ToolCondition,
  ToolStatus,
  ToolMaintenanceLogEntry,
  CreateWorkbenchToolDto,
  UpdateWorkbenchToolDto,
  calculateToolWear,
  calculateWorkbenchToolsSummary,
  getStarterToolsForUser,
  TOOL_CATEGORIES
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';

export const toolsRouter = Router();

// All tool inventory endpoints require authentication
toolsRouter.use(requireAuth);

/**
 * GET /api/v1/workbench/tools
 * List tools for current user with wear calculations and category breakdown summary
 */
toolsRouter.get('/', (req: Request, res: Response) => {
  const user = req.user!;
  const db = getDb();

  if (!db.tools) {
    db.tools = [];
  }

  let userTools = db.tools.filter(t => t.userId === user.id);

  // If new user has no tools yet, automatically populate starter tools
  if (userTools.length === 0) {
    const starterTools = getStarterToolsForUser(user.id);
    db.tools.push(...starterTools);
    saveDb(db);
    userTools = starterTools;
  }

  // Filtering by query
  const categoryFilter = req.query.category as ToolCategory | undefined;
  const statusFilter = req.query.status as ToolStatus | undefined;
  const conditionFilter = req.query.condition as ToolCondition | undefined;

  let filtered = userTools;
  if (categoryFilter) {
    filtered = filtered.filter(t => t.category === categoryFilter);
  }
  if (statusFilter) {
    filtered = filtered.filter(t => t.status === statusFilter);
  }
  if (conditionFilter) {
    filtered = filtered.filter(t => t.condition === conditionFilter);
  }

  const items = filtered.map(tool => ({
    ...tool,
    wearResult: calculateToolWear(tool)
  }));

  const summary = calculateWorkbenchToolsSummary(userTools);

  return res.json({
    items,
    summary,
    total: items.length
  });
});

/**
 * POST /api/v1/workbench/tools
 * Register a new tool with optional wear & tear tracking
 */
toolsRouter.post('/', (req: Request, res: Response) => {
  const user = req.user!;
  const body = req.body as CreateWorkbenchToolDto;

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    return sendProblem(
      req,
      res,
      400,
      'Nombre Requerido',
      'El campo name es obligatorio para registrar una herramienta.',
      'invalid-name'
    );
  }

  if (!body.brand || typeof body.brand !== 'string' || body.brand.trim() === '') {
    return sendProblem(
      req,
      res,
      400,
      'Marca Requerida',
      'El campo brand es obligatorio para registrar una herramienta.',
      'invalid-brand'
    );
  }

  const category = (body.category && TOOL_CATEGORIES.includes(body.category))
    ? body.category
    : 'general';

  const isWearEnabled = body.wearEnabled !== undefined
    ? !!body.wearEnabled
    : (category === 'knives' || category === 'nippers' || category === 'chisels');

  const now = new Date().toISOString();
  const defaultMax = category === 'knives' ? 200 : category === 'nippers' ? 400 : 250;

  const newTool: WorkbenchToolItem = {
    id: `tool-${randomUUID().slice(0, 8)}`,
    userId: user.id,
    name: body.name.trim(),
    brand: body.brand.trim(),
    category,
    modelNumber: body.modelNumber ? body.modelNumber.trim() : undefined,
    purchasePrice: Number(body.purchasePrice) >= 0 ? Number(body.purchasePrice) : undefined,
    purchaseCurrency: body.purchaseCurrency || 'USD',
    acquiredAt: body.acquiredAt || now.slice(0, 10),
    status: body.status || 'active',
    condition: body.condition || 'new',
    wear: {
      enabled: isWearEnabled,
      bladeType: body.bladeType ? body.bladeType.trim() : undefined,
      currentCutsCount: 0,
      maxRecommendedCuts: Number(body.maxRecommendedCuts) > 0 ? Number(body.maxRecommendedCuts) : defaultMax,
      sessionsCount: 0,
      lastBladeReplacedAt: now,
      totalBladesConsumed: 0
    },
    maintenanceLog: [],
    notes: body.notes ? body.notes.trim() : undefined,
    createdAt: now,
    updatedAt: now
  };

  const db = getDb();
  if (!db.tools) {
    db.tools = [];
  }
  db.tools.push(newTool);
  saveDb(db);

  return res.status(201).json({
    item: {
      ...newTool,
      wearResult: calculateToolWear(newTool)
    }
  });
});

/**
 * GET /api/v1/workbench/tools/:id
 * Retrieve a single tool by id with wear analysis and maintenance history
 */
toolsRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();

  const tool = (db.tools || []).find(t => t.id === id);
  if (!tool) {
    return sendProblem(
      req,
      res,
      404,
      'Herramienta No Encontrada',
      `No se encontro ninguna herramienta con id '${id}'.`
    );
  }

  if (tool.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'No tienes permisos para ver esta herramienta.'
    );
  }

  return res.json({
    item: {
      ...tool,
      wearResult: calculateToolWear(tool)
    }
  });
});

/**
 * PATCH /api/v1/workbench/tools/:id
 * Update tool details or log cuts/sessions incremental usage
 */
toolsRouter.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();

  const tool = (db.tools || []).find(t => t.id === id);
  if (!tool) {
    return sendProblem(
      req,
      res,
      404,
      'Herramienta No Encontrada',
      `No se encontro ninguna herramienta con id '${id}'.`
    );
  }

  if (tool.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'No tienes permisos para modificar esta herramienta.'
    );
  }

  const body = req.body as UpdateWorkbenchToolDto;

  if (body.name !== undefined) tool.name = String(body.name).trim();
  if (body.brand !== undefined) tool.brand = String(body.brand).trim();
  if (body.category !== undefined && TOOL_CATEGORIES.includes(body.category)) {
    tool.category = body.category;
  }
  if (body.modelNumber !== undefined) tool.modelNumber = String(body.modelNumber).trim();
  if (body.purchasePrice !== undefined) tool.purchasePrice = Number(body.purchasePrice);
  if (body.purchaseCurrency !== undefined) tool.purchaseCurrency = String(body.purchaseCurrency);
  if (body.status !== undefined) tool.status = body.status;
  if (body.notes !== undefined) tool.notes = String(body.notes).trim();

  // Incremental wear usage logging
  if (body.cutsIncrement && Number(body.cutsIncrement) > 0) {
    if (!tool.wear) {
      tool.wear = {
        enabled: true,
        currentCutsCount: 0,
        maxRecommendedCuts: 300,
        sessionsCount: 0,
        totalBladesConsumed: 0
      };
    }
    tool.wear.currentCutsCount = (tool.wear.currentCutsCount || 0) + Number(body.cutsIncrement);
  }

  if (body.sessionsIncrement && Number(body.sessionsIncrement) > 0) {
    if (!tool.wear) {
      tool.wear = {
        enabled: true,
        currentCutsCount: 0,
        maxRecommendedCuts: 300,
        sessionsCount: 0,
        totalBladesConsumed: 0
      };
    }
    tool.wear.sessionsCount = (tool.wear.sessionsCount || 0) + Number(body.sessionsIncrement);
  }

  // Update condition suggestion unless explicit
  if (body.condition !== undefined) {
    tool.condition = body.condition;
  } else if (tool.wear && tool.wear.enabled) {
    const calc = calculateToolWear(tool);
    tool.condition = calc.conditionSuggestion;
  }

  tool.updatedAt = new Date().toISOString();
  saveDb(db);

  return res.json({
    item: {
      ...tool,
      wearResult: calculateToolWear(tool)
    }
  });
});

/**
 * POST /api/v1/workbench/tools/:id/replace-blade
 * Log blade replacement, reset wear cuts counter, and append to maintenance history
 */
toolsRouter.post('/:id/replace-blade', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();

  const tool = (db.tools || []).find(t => t.id === id);
  if (!tool) {
    return sendProblem(
      req,
      res,
      404,
      'Herramienta No Encontrada',
      `No se encontro ninguna herramienta con id '${id}'.`
    );
  }

  if (tool.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'No tienes permisos para realizar mantenimiento en esta herramienta.'
    );
  }

  if (!tool.wear || !tool.wear.enabled) {
    return sendProblem(
      req,
      res,
      400,
      'Herramienta No Compatible',
      'Esta herramienta no tiene activado el seguimiento de vida útil de cuchilla.'
    );
  }

  const now = new Date().toISOString();
  const previousCuts = tool.wear.currentCutsCount;

  tool.wear.currentCutsCount = 0;
  tool.wear.lastBladeReplacedAt = now;
  tool.wear.totalBladesConsumed = (tool.wear.totalBladesConsumed || 0) + 1;
  tool.condition = 'new';

  const logEntry: ToolMaintenanceLogEntry = {
    id: `maint-${randomUUID().slice(0, 8)}`,
    type: 'blade_replacement',
    notes: req.body?.notes || `Reemplazo de hoja tras ${previousCuts} cortes realizados.`,
    performedAt: now
  };

  if (!tool.maintenanceLog) {
    tool.maintenanceLog = [];
  }
  tool.maintenanceLog.unshift(logEntry);

  tool.updatedAt = now;
  saveDb(db);

  return res.json({
    message: 'Cuchilla reemplazada y vida útil restablecida al 100%',
    item: {
      ...tool,
      wearResult: calculateToolWear(tool)
    }
  });
});

/**
 * DELETE /api/v1/workbench/tools/:id
 * Remove a tool record from personal inventory
 */
toolsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();

  if (!db.tools || db.tools.length === 0) {
    return sendProblem(
      req,
      res,
      404,
      'Herramienta No Encontrada',
      `No existen herramientas registradas.`
    );
  }

  const idx = db.tools.findIndex(t => t.id === id);
  if (idx === -1) {
    return sendProblem(
      req,
      res,
      404,
      'Herramienta No Encontrada',
      `No se encontro ninguna herramienta con id '${id}'.`
    );
  }

  const tool = db.tools[idx];
  if (tool.userId !== user.id && !user.roles.includes('admin')) {
    return sendProblem(
      req,
      res,
      403,
      'Acceso No Autorizado',
      'No tienes permisos para eliminar esta herramienta.'
    );
  }

  db.tools.splice(idx, 1);
  saveDb(db);

  return res.json({
    removedId: id
  });
});
