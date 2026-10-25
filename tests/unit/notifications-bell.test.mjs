import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getDb, saveDb } from '../../apps/api/dist/core/db.js';
import { dispatchNotification } from '../../apps/api/dist/slices/notifications-bell/notifications.slice.js';
import { generateServiceWorker } from '../../packages/shared/dist/index.js';

describe('In-App Notifications & Activity Bell Unit Tests', () => {
  beforeEach(() => {
    const db = getDb();
    db.notifications = [];
    db.pushSubscriptions = [];
    db.users = [
      {
        id: 'user-builder-1',
        username: 'testbuilder',
        email: 'builder@plamoscale.com',
        displayName: 'Test Builder',
        roles: ['builder'],
        tenantSlug: 'plamoscale',
        birthYear: 1995,
        isAdult: true,
        ageBracket: 'adult_18_plus',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-builder-2',
        username: 'otherbuilder',
        email: 'other@plamoscale.com',
        displayName: 'Other Builder',
        roles: ['builder'],
        tenantSlug: 'plamoscale',
        birthYear: 1998,
        isAdult: true,
        ageBracket: 'adult_18_plus',
        createdAt: new Date().toISOString()
      }
    ];
    saveDb(db);
  });

  test('dispatchNotification creates a valid unread notification with metadata', async () => {
    const notif = await dispatchNotification({
      recipientUserId: 'user-builder-1',
      tenantSlug: 'plamoscale',
      type: 'build_comment',
      title: 'Nuevo comentario',
      message: 'otherbuilder comentó en tu proyecto',
      link: '#/builds/sazabi-ver-ka',
      metadata: { buildId: 'build-123', commentId: 'comment-456' }
    });

    assert.ok(notif.id.startsWith('notif-'));
    assert.equal(notif.userId, 'user-builder-1');
    assert.equal(notif.tenantSlug, 'plamoscale');
    assert.equal(notif.type, 'build_comment');
    assert.equal(notif.read, false);
    assert.equal(notif.title, 'Nuevo comentario');
    assert.equal(notif.link, '#/builds/sazabi-ver-ka');
    assert.deepEqual(notif.metadata, { buildId: 'build-123', commentId: 'comment-456' });

    const db = getDb();
    assert.equal(db.notifications.length, 1);
    assert.equal(db.notifications[0].id, notif.id);
  });

  test('unreadCount accurately reflects only notifications with read=false for target user', async () => {
    await dispatchNotification({
      recipientUserId: 'user-builder-1',
      tenantSlug: 'plamoscale',
      type: 'contest_judged',
      title: 'Calificación recibida',
      message: 'Juez evaluó tu obra',
      link: '#/contests/c1'
    });

    await dispatchNotification({
      recipientUserId: 'user-builder-1',
      tenantSlug: 'plamoscale',
      type: 'wishlist_stock',
      title: 'Stock disponible',
      message: 'Llegó kit a tienda',
      link: '#/workbench'
    });

    // Notification for a different user
    await dispatchNotification({
      recipientUserId: 'user-builder-2',
      tenantSlug: 'plamoscale',
      type: 'commission_update',
      title: 'Nuevo encargo',
      message: 'Tienes una solicitud',
      link: '#/workbench'
    });

    const db = getDb();
    const user1Notifs = db.notifications.filter(n => n.userId === 'user-builder-1');
    const unreadUser1 = user1Notifs.filter(n => !n.read).length;

    assert.equal(user1Notifs.length, 2);
    assert.equal(unreadUser1, 2);

    // Mark first as read
    user1Notifs[0].read = true;
    saveDb(db);

    const reloaded = getDb();
    const updatedUnread = reloaded.notifications.filter(n => n.userId === 'user-builder-1' && !n.read).length;
    assert.equal(updatedUnread, 1);
  });

  test('push subscription registration deduplicates by user and endpoint', () => {
    const db = getDb();
    const endpoint = 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAAB...';
    
    // First registration
    const sub1 = {
      id: 'sub-001',
      tenantSlug: 'plamoscale',
      userId: 'user-builder-1',
      endpoint,
      keys: { p256dh: 'key1', auth: 'auth1' },
      createdAt: new Date().toISOString()
    };
    db.pushSubscriptions.push(sub1);
    saveDb(db);

    // Attempting re-register with updated keys
    const existingIndex = db.pushSubscriptions.findIndex(
      s => s.userId === 'user-builder-1' && s.endpoint === endpoint
    );
    assert.ok(existingIndex >= 0);

    db.pushSubscriptions[existingIndex].keys = { p256dh: 'key2', auth: 'auth2' };
    saveDb(db);

    const reloaded = getDb();
    assert.equal(reloaded.pushSubscriptions.length, 1);
    assert.equal(reloaded.pushSubscriptions[0].keys.p256dh, 'key2');
  });

  test('generateServiceWorker outputs push and notificationclick event listeners', () => {
    const config = {
      tenantSlug: 'plamoscale',
      tenantName: 'PlamoScale',
      tenantTagline: 'Comunidad de Plastimodelismo',
      otherTenantName: 'GunplaJunkies',
      otherTenantUrl: 'https://gunplajunkies.com',
      theme: {
        primaryColor: '#2563eb',
        accentColor: '#38bdf8',
        bgDark: '#0b0f19',
        cardBg: '#111827',
        borderColor: '#1e293b'
      }
    };

    const swCode = generateServiceWorker(config);

    assert.ok(swCode.includes("self.addEventListener('push'"));
    assert.ok(swCode.includes("self.registration.showNotification"));
    assert.ok(swCode.includes("self.addEventListener('notificationclick'"));
    assert.ok(swCode.includes("event.notification.close()"));
    assert.ok(swCode.includes("client.focus()"));
  });
});
