import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isSuperAdminUser } from '../../apps/api/dist/slices/auth-sso/auth.slice.js';
import sharedPkg from '../../packages/shared/dist/index.js';

const { renderAppShell, renderViews, renderModals, renderInstitutionalSuspensionPage } = sharedPkg;

describe('DT31: Super Admin Community Governance, Onboarding & Institutional Suspension Unit Tests', () => {
  const mockConfig = {
    tenantSlug: 'gunplajunkies',
    tenantName: 'Gunpla Junkies Peru',
    domain: 'gunplajunkies.com',
    emailFrom: 'noreply@gunplajunkies.com',
    contactEmail: 'contact@gunplajunkies.com',
    theme: {
      primaryColor: '#ef4444',
      accentColor: '#06b6d4',
      surfaceColor: '#0f172a',
      backgroundColor: '#0f172a',
      fontFamily: 'Inter',
      brandTagline: 'Comunidad Gunpla & Mecha',
      logoText: 'Gunpla Junkies',
      uxPatternId: 'pattern-gunpla'
    }
  };

  const mockData = {
    builders: [],
    kits: [],
    paints: [],
    builds: [],
    shops: [],
    listings: [],
    contests: [],
    commissionBuilders: [],
    mediaAssets: []
  };

  const mockHelpers = {
    escapeHtml: (s) => s || '',
    categoryPills: [{ id: 'all', label: 'Todos' }],
    birthYearOptions: '<option value="1990">1990</option>',
    kitOptions: '<option value="kit-1">MG Barbatos</option>',
    paintOptions: '<option value="paint-1">Mr. Color Red</option>',
    founders: [],
    isGunpla: true
  };

  describe('1. Super Admin Identity Verification (isSuperAdminUser)', () => {
    it('authorizes rpinedaec83@gmail.com regardless of roles or tenant', () => {
      const userByEmail = {
        email: 'rpinedaec83@gmail.com',
        roles: ['builder'],
        tenantSlug: 'plamoscale'
      };
      assert.strictEqual(isSuperAdminUser(userByEmail), true);

      const mixedCaseEmail = {
        email: 'RPINEDAEC83@GMAIL.COM',
        roles: []
      };
      assert.strictEqual(isSuperAdminUser(mixedCaseEmail), true);
    });

    it('authorizes any account with role super_admin', () => {
      const userWithRole = {
        email: 'ops@x-codec.com',
        roles: ['super_admin']
      };
      assert.strictEqual(isSuperAdminUser(userWithRole), true);
    });

    it('rejects regular community admins or builders without super_admin privileges', () => {
      const communityAdmin = {
        email: 'admin@gunplajunkies.com',
        roles: ['community_admin', 'admin'],
        tenantSlug: 'gunplajunkies'
      };
      assert.strictEqual(isSuperAdminUser(communityAdmin), false);

      const standardUser = {
        email: 'builder@gmail.com',
        roles: ['builder']
      };
      assert.strictEqual(isSuperAdminUser(standardUser), false);
      assert.strictEqual(isSuperAdminUser(null), false);
      assert.strictEqual(isSuperAdminUser(undefined), false);
    });
  });

  describe('2. Institutional Suspension Page Rendering', () => {
    it('generates friendly maintenance page for suspended status with guarantee and alternative portal', () => {
      const html = renderInstitutionalSuspensionPage(
        'PlamoScale Peru',
        'plamoscale.com',
        'suspended',
        'Actualización de servidores programada hasta las 06:00 UTC.',
        'soporte@plamoscale.com',
        'https://gunplajunkies.com',
        'GunplaJunkies'
      );

      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes('PlamoScale Peru'));
      assert.ok(html.includes('Portal en Pausa Administrativa'));
      assert.ok(html.includes('EN MANTENIMIENTO'));
      assert.ok(html.includes('Actualización de servidores programada hasta las 06:00 UTC.'));
      assert.ok(html.includes('Resguardo de Información de Taller'));
      assert.ok(html.includes('soporte@plamoscale.com'));
      assert.ok(html.includes('https://gunplajunkies.com'));
      assert.ok(html.includes('GunplaJunkies'));
      assert.ok(html.includes('id="admin-login-box"'));
      assert.ok(html.includes('id="sa-email"'));
      assert.ok(html.includes('id="sa-pass"'));
    });

    it('generates archive badge and warning when status is archived', () => {
      const html = renderInstitutionalSuspensionPage(
        'Club Gunpla Antiguo',
        'antiguo.gunpla.pe',
        'archived',
        'Club disuelto por mutuo acuerdo.',
        'contacto@antiguo.gunpla.pe'
      );

      assert.ok(html.includes('Comunidad Archivada'));
      assert.ok(html.includes('ARCHIVADO'));
      assert.ok(html.includes('Club disuelto por mutuo acuerdo.'));
      assert.ok(html.includes('contacto@antiguo.gunpla.pe'));
    });
  });

  describe('3. Super Admin UI Subtabs & Governance Panels in Views', () => {
    const viewsHtml = renderViews(mockConfig, mockData, mockHelpers);

    it('includes navigation buttons for tenants and mastershops subtabs in admin view', () => {
      assert.ok(viewsHtml.includes('id="admin-subtab-btn-tenants"'));
      assert.ok(viewsHtml.includes('id="admin-subtab-btn-mastershops"'));
    });

    it('includes containers for tenants list and master shops list in admin view', () => {
      assert.ok(viewsHtml.includes('id="admin-subtab-tenants"'));
      assert.ok(viewsHtml.includes('id="admin-tenants-list"'));
      assert.ok(viewsHtml.includes('id="admin-tenants-count"'));
      assert.ok(viewsHtml.includes('id="admin-subtab-mastershops"'));
      assert.ok(viewsHtml.includes('id="admin-master-shops-list"'));
      assert.ok(viewsHtml.includes('id="admin-master-shops-count"'));
    });
  });

  describe('4. Super Admin Modals Verification', () => {
    const modalsHtml = renderModals(mockConfig, mockData, mockHelpers);

    it('renders community onboarding modal with Resend API key and color palette inputs', () => {
      assert.ok(modalsHtml.includes('id="modal-admin-create-tenant"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-name"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-slug"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-domain"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-contact-email"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-resend-key"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-color-primary"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-color-accent"'));
      assert.ok(modalsHtml.includes('id="admin-tenant-color-surface"'));
      assert.ok(modalsHtml.includes('name="admin-cat"'));
    });

    it('renders community status transition modal with reason textarea', () => {
      assert.ok(modalsHtml.includes('id="modal-admin-tenant-status"'));
      assert.ok(modalsHtml.includes('id="admin-status-slug"'));
      assert.ok(modalsHtml.includes('id="admin-status-select"'));
      assert.ok(modalsHtml.includes('id="admin-status-reason"'));
    });

    it('renders master shops catalog modal with full store fields', () => {
      assert.ok(modalsHtml.includes('id="modal-admin-master-shop"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-name"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-city"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-country"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-website"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-catalog"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-rating"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-brands"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-desc"'));
      assert.ok(modalsHtml.includes('id="admin-mshop-ships"'));
    });
  });
});
