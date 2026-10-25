import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  NotificationItem,
  NotificationType,
  PushSubscriptionRecord,
  NotificationsListResponse
} from '@gunpla/shared';
import { getDb, saveDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import { requireAuth } from '../auth-sso/auth.slice';

export interface DispatchNotificationInput {
  recipientUserId: string;
  tenantSlug: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dispatches an in-app notification and Web Push alert to the target builder.
 */
export async function dispatchNotification(
  input: DispatchNotificationInput
): Promise<NotificationItem> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = `notif-${Date.now()}-${randomUUID().slice(0, 8)}`;

  const item: NotificationItem = {
    id,
    tenantSlug: input.tenantSlug,
    userId: input.recipientUserId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    read: false,
    createdAt: now,
    metadata: input.metadata
  };

  if (!db.notifications) {
    db.notifications = [];
  }
  db.notifications.unshift(item);

  // Check for Web Push subscriptions for this user
  const userSubs = (db.pushSubscriptions || []).filter(
    (sub) => sub.userId === input.recipientUserId
  );

  if (userSubs.length > 0) {
    // In production with VAPID configured, webpush.sendNotification would execute here.
    // In local and testing environments, we record the simulated push delivery.
    console.log(
      `[WebPush] Simulating push delivery to ${userSubs.length} active subscription(s) for user ${input.recipientUserId}: "${input.title}"`
    );
  }

  saveDb(db);
  return item;
}

export const notificationsRouter = Router();

// ---------------------------------------------------------------------------
// GET /api/v1/notifications
// List notifications for authenticated user
// ---------------------------------------------------------------------------
notificationsRouter.get('/', requireAuth, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const db = getDb();
  const unreadOnly = req.query.unreadOnly === 'true';

  const userNotifs = (db.notifications || []).filter((n) => n.userId === userId);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const filtered = unreadOnly ? userNotifs.filter((n) => !n.read) : userNotifs;

  const response: NotificationsListResponse = {
    items: filtered.slice(0, 50),
    unreadCount,
    totalCount: userNotifs.length
  };

  res.json(response);
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/notifications/:id/read
// Mark a single notification as read
// ---------------------------------------------------------------------------
notificationsRouter.patch('/:id/read', requireAuth, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;
  const db = getDb();

  const item = (db.notifications || []).find((n) => n.id === id);
  if (!item) {
    sendProblem(req, res, 404, 'Notification Not Found', `Notification with ID '${id}' does not exist.`);
    return;
  }

  if (item.userId !== userId) {
    sendProblem(req, res, 403, 'Forbidden', 'Cannot modify another user notification.');
    return;
  }

  item.read = true;
  saveDb(db);

  res.json(item);
});

// ---------------------------------------------------------------------------
// POST /api/v1/notifications/mark-all-read
// Mark all notifications for authenticated user as read
// ---------------------------------------------------------------------------
notificationsRouter.post('/mark-all-read', requireAuth, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const db = getDb();

  let count = 0;
  for (const n of db.notifications || []) {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  }

  saveDb(db);
  res.json({ success: true, markedCount: count });
});

// ---------------------------------------------------------------------------
// POST /api/v1/notifications/push-subscribe
// Register a Web Push subscription
// ---------------------------------------------------------------------------
notificationsRouter.post('/push-subscribe', requireAuth, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const tenantSlug = req.tenant?.slug || req.user!.tenantSlug || 'plamoscale';
  const { endpoint, keys, userAgent } = req.body || {};

  if (!endpoint || typeof endpoint !== 'string' || !keys?.p256dh || !keys?.auth) {
    sendProblem(
      req,
      res,
      400,
      'Validation Error',
      'Push subscription requires valid endpoint and keys (p256dh, auth).'
    );
    return;
  }

  const db = getDb();
  if (!db.pushSubscriptions) {
    db.pushSubscriptions = [];
  }

  const existingIndex = db.pushSubscriptions.findIndex(
    (sub) => sub.userId === userId && sub.endpoint === endpoint
  );

  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    db.pushSubscriptions[existingIndex].keys = keys;
    db.pushSubscriptions[existingIndex].userAgent = userAgent;
    saveDb(db);
    res.json({
      success: true,
      subscriptionId: db.pushSubscriptions[existingIndex].id,
      updated: true
    });
    return;
  }

  const newSub: PushSubscriptionRecord = {
    id: `sub-${Date.now()}-${randomUUID().slice(0, 6)}`,
    tenantSlug,
    userId,
    endpoint,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth
    },
    createdAt: now,
    userAgent
  };

  db.pushSubscriptions.push(newSub);
  saveDb(db);

  res.status(201).json({
    success: true,
    subscriptionId: newSub.id,
    created: true
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/notifications/push-subscribe
// Unregister a Web Push subscription
// ---------------------------------------------------------------------------
notificationsRouter.delete('/push-subscribe', requireAuth, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const { endpoint } = req.body || req.query || {};

  if (!endpoint || typeof endpoint !== 'string') {
    sendProblem(req, res, 400, 'Validation Error', 'Missing push endpoint to unsubscribe.');
    return;
  }

  const db = getDb();
  if (!db.pushSubscriptions) {
    db.pushSubscriptions = [];
  }

  const initialCount = db.pushSubscriptions.length;
  db.pushSubscriptions = db.pushSubscriptions.filter(
    (sub) => !(sub.userId === userId && sub.endpoint === endpoint)
  );

  saveDb(db);
  res.json({ success: true, removedCount: initialCount - db.pushSubscriptions.length });
});

// ---------------------------------------------------------------------------
// POST /api/v1/notifications/test
// Triggers a test notification for the active user
// ---------------------------------------------------------------------------
notificationsRouter.post('/test', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const tenantSlug = req.tenant?.slug || 'plamoscale';
  const { type = 'system', title = 'Prueba de Notificación', message = 'El sistema de alertas y Web Push está activo.' } = req.body || {};

  const notif = await dispatchNotification({
    recipientUserId: userId,
    tenantSlug,
    type: type as NotificationType,
    title,
    message,
    link: '#/workbench'
  });

  res.status(201).json(notif);
});
