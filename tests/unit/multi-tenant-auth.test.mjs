import test from 'node:test';
import assert from 'node:assert/strict';
import {
  issueSsoToken,
  isSuperAdminUser,
  requireAuth,
  requireSuperAdmin,
  requireCommunityAdmin
} from '../../apps/api/dist/slices/auth-sso/auth.slice.js';

test('Multi-Tenant Auth Isolation & Super Admin (DT28) Unit Tests', async (t) => {
  function createMockRes() {
    return {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(name, val) {
        this.headers[name] = val;
        return this;
      },
      contentType() {
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      }
    };
  }

  const regularPlamoUser = {
    id: 'user-p1',
    username: 'plamo_builder',
    displayName: 'Plamo Builder',
    email: 'builder@plamoscale.com',
    passwordHash: 'hash',
    googleId: null,
    authProviders: ['local'],
    roles: ['user'],
    primaryTenantSlug: 'plamoscale',
    isFounder: false,
    createdAt: new Date().toISOString()
  };

  const platformSuperAdmin = {
    id: 'user-superadmin-rpineda',
    username: 'rpineda',
    displayName: 'Raul Pineda (Super Admin)',
    email: 'rpinedaec83@gmail.com',
    passwordHash: 'hash',
    googleId: null,
    authProviders: ['local', 'google'],
    roles: ['super_admin', 'admin', 'moderator', 'user'],
    primaryTenantSlug: 'plamoscale',
    isFounder: true,
    createdAt: new Date().toISOString()
  };

  await t.test('isSuperAdminUser correctly identifies Super Admin email and role', () => {
    assert.equal(isSuperAdminUser({ email: 'rpinedaec83@gmail.com' }), true);
    assert.equal(isSuperAdminUser({ email: 'RPINEDaec83@GMAIL.COM' }), true);
    assert.equal(isSuperAdminUser({ roles: ['super_admin'] }), true);
    assert.equal(isSuperAdminUser({ email: 'other@example.com', roles: ['admin'] }), false);
    assert.equal(isSuperAdminUser(regularPlamoUser), false);
    assert.equal(isSuperAdminUser(platformSuperAdmin), true);
  });

  await t.test('requireAuth rejects cross-tenant token with 403 tenant-access-forbidden', () => {
    const plamoToken = issueSsoToken(regularPlamoUser, 'plamoscale');
    const mockRes = createMockRes();
    const mockReq = {
      header: (name) => (name.toLowerCase() === 'authorization' ? `Bearer ${plamoToken}` : null),
      tenant: { slug: 'gunplajunkies', name: 'Gunpla Junkies' }
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    requireAuth(mockReq, mockRes, next);

    assert.equal(nextCalled, false);
    assert.equal(mockRes.statusCode, 403);
    assert.equal(mockRes.body.type, 'https://api.plamoscale.com/problems/tenant-access-forbidden');
  });

  await t.test('requireAuth allows same-tenant token through to next handler', () => {
    const plamoToken = issueSsoToken(regularPlamoUser, 'plamoscale');

    let nextCalled = false;
    const mockReq = {
      header: (name) => (name.toLowerCase() === 'authorization' ? `Bearer ${plamoToken}` : null),
      tenant: { slug: 'plamoscale', name: 'PlamoScale' }
    };
    const mockRes = createMockRes();

    requireAuth(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(mockReq.user.username, 'plamo_builder');
  });

  await t.test('requireAuth allows Super Admin token across any tenant (universal access)', () => {
    const superAdminToken = issueSsoToken(platformSuperAdmin, 'plamoscale');

    let nextCalled = false;
    const mockReq = {
      header: (name) => (name.toLowerCase() === 'authorization' ? `Bearer ${superAdminToken}` : null),
      tenant: { slug: 'gunplajunkies', name: 'Gunpla Junkies' }
    };
    const mockRes = createMockRes();

    requireAuth(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(mockReq.user.email, 'rpinedaec83@gmail.com');
  });

  await t.test('requireSuperAdmin blocks regular and community_admin users with 403', () => {
    const mockRes = createMockRes();
    let nextCalled = false;
    const mockReq = {
      user: {
        id: 'u1',
        email: 'admin@plamoscale.com',
        roles: ['community_admin']
      }
    };

    requireSuperAdmin(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(mockRes.statusCode, 403);
  });

  await t.test('requireSuperAdmin permits rpinedaec83@gmail.com', () => {
    let nextCalled = false;
    const mockReq = {
      user: {
        id: 'u-super',
        email: 'rpinedaec83@gmail.com',
        roles: ['super_admin', 'admin']
      }
    };
    const mockRes = createMockRes();

    requireSuperAdmin(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });

  await t.test('requireCommunityAdmin enforces tenant boundary for community administrators', () => {
    const mockResCross = createMockRes();

    // Admin from plamoscale trying to administer gunplajunkies
    const mockReqCross = {
      tenant: { slug: 'gunplajunkies' },
      user: {
        email: 'admin@plamoscale.com',
        tenantSlug: 'plamoscale',
        roles: ['community_admin']
      }
    };

    let crossCalled = false;
    requireCommunityAdmin(mockReqCross, mockResCross, () => {
      crossCalled = true;
    });
    assert.equal(crossCalled, false);
    assert.equal(mockResCross.statusCode, 403);

    // Admin in matching tenant
    const mockResMatch = createMockRes();
    const mockReqMatch = {
      tenant: { slug: 'plamoscale' },
      user: {
        email: 'admin@plamoscale.com',
        tenantSlug: 'plamoscale',
        roles: ['community_admin']
      }
    };
    let matchCalled = false;
    requireCommunityAdmin(mockReqMatch, mockResMatch, () => {
      matchCalled = true;
    });
    assert.equal(matchCalled, true);

    // Super Admin passes anywhere
    const mockResSuper = createMockRes();
    const mockReqSuper = {
      tenant: { slug: 'gunplajunkies' },
      user: {
        email: 'rpinedaec83@gmail.com',
        tenantSlug: 'plamoscale',
        roles: ['super_admin']
      }
    };
    let superCalled = false;
    requireCommunityAdmin(mockReqSuper, mockResSuper, () => {
      superCalled = true;
    });
    assert.equal(superCalled, true);
  });
});
