import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isSuperAdminUser, isCommunityAdminUser } from '../../apps/api/dist/slices/auth-sso/auth.slice.js';
import sharedPkg from '../../packages/shared/dist/index.js';

const { renderAppShell, renderViews, renderModals } = sharedPkg;

describe('DT30: Community Admin Panel & Marketplace Moderation Unit Tests', () => {
  describe('1. Role & Permissions Verification (isCommunityAdminUser)', () => {
    it('authorizes super admin universally across any tenant', () => {
      const superAdminByEmail = {
        email: 'rpinedaec83@gmail.com',
        roles: ['builder'],
        tenantSlug: 'gunplajunkies'
      };
      assert.strictEqual(isCommunityAdminUser(superAdminByEmail, 'plamoscale'), true);
      assert.strictEqual(isCommunityAdminUser(superAdminByEmail, 'future-club'), true);

      const superAdminByRole = {
        email: 'other@domain.com',
        roles: ['super_admin'],
        tenantSlug: 'system'
      };
      assert.strictEqual(isCommunityAdminUser(superAdminByRole, 'gunplajunkies'), true);
      assert.strictEqual(isCommunityAdminUser(superAdminByRole, 'plamoscale'), true);
    });

    it('authorizes community admin only within their matching tenant', () => {
      const gunplaAdmin = {
        email: 'admin@gunpla.pe',
        roles: ['community_admin'],
        tenantSlug: 'gunplajunkies'
      };
      assert.strictEqual(isCommunityAdminUser(gunplaAdmin, 'gunplajunkies'), true);
      assert.strictEqual(isCommunityAdminUser(gunplaAdmin, 'plamoscale'), false);

      const plamoAdmin = {
        email: 'admin@plamo.pe',
        roles: ['admin'],
        tenantSlug: 'plamoscale'
      };
      assert.strictEqual(isCommunityAdminUser(plamoAdmin, 'plamoscale'), true);
      assert.strictEqual(isCommunityAdminUser(plamoAdmin, 'gunplajunkies'), false);
    });

    it('rejects regular builders without admin roles', () => {
      const builder = {
        email: 'builder@hobby.pe',
        roles: ['builder'],
        tenantSlug: 'gunplajunkies'
      };
      assert.strictEqual(isCommunityAdminUser(builder, 'gunplajunkies'), false);
      assert.strictEqual(isCommunityAdminUser(null, 'gunplajunkies'), false);
      assert.strictEqual(isCommunityAdminUser(undefined, 'gunplajunkies'), false);
    });
  });

  describe('2. UI Shell & Administration Views Verification', () => {
    const mockConfig = {
      tenantSlug: 'gunplajunkies',
      tenantName: 'Gunpla Junkies Peru',
      domain: 'gunplajunkies.com',
      emailFrom: 'noreply@gunplajunkies.com',
      contactEmail: 'contact@gunplajunkies.com',
      theme: {
        primaryColor: '#e11d48',
        accentColor: '#06b6d4',
        surfaceColor: '#0f172a',
        backgroundColor: '#0f172a',
        fontFamily: 'Chakra Petch',
        brandTagline: 'Comunidad Gunpla & Mecha',
        logoText: 'Gunpla Junkies',
        uxPatternId: 'pattern-gunpla'
      }
    };

    const mockData = {
      builders: [
        { id: 'u1', username: 'aperich', displayName: 'Alonso Perich', isFounder: true }
      ],
      mediaAssets: [],
      builds: [],
      kits: [],
      paints: [],
      shops: [
        {
          id: 'shop-hobby-store',
          name: 'Hobby Store Peru',
          city: 'Lima',
          country: 'Peru',
          rating: 4.9,
          tenantLink: {
            discountCode: 'GUNPLA10',
            partnerBadge: '⭐ Tienda Oficial de Confianza',
            agreementNotes: '10% de descuento en kits MG',
            active: true
          }
        }
      ],
      listings: [
        {
          id: 'listing-1',
          kitId: 'kit-1',
          userId: 'user-seller',
          username: 'seller1',
          type: 'sale',
          price: 250,
          currency: 'PEN',
          boxCondition: 'mint_sealed',
          notes: 'Kit sellado',
          status: 'active'
        }
      ],
      contests: [],
      commissionBuilders: []
    };

    const mockHelpers = {
      escapeHtml: (s) => s,
      categoryPills: [{ id: 'all', label: 'Todos' }, { id: 'rg', label: 'RG' }],
      birthYearOptions: '<option value="1990">1990</option>',
      kitOptions: '<option value="kit-1">MG Barbatos</option>',
      paintOptions: '<option value="paint-1">Mr. Color Red</option>',
      founders: mockData.builders,
      isGunpla: true
    };

    it('renders the #view-admin view section with all 4 management subtabs', () => {
      const html = renderViews(mockConfig, mockData, mockHelpers);
      assert.ok(html.includes('id="view-admin"'), 'Should render #view-admin view section');
      assert.ok(html.includes('id="admin-subtab-shops"'), 'Should contain trusted shops subtab');
      assert.ok(html.includes('id="admin-subtab-news"'), 'Should contain community news subtab');
      assert.ok(html.includes('id="admin-subtab-photos"'), 'Should contain featured photos subtab');
      assert.ok(html.includes('id="admin-subtab-bazar"'), 'Should contain marketplace moderation subtab');
      assert.ok(html.includes('GUNPLA10'), 'Should render community discount coupon in admin list');
    });

    it('renders the community admin modals in renderModals()', () => {
      const html = renderModals(mockConfig, mockData, mockHelpers);
      assert.ok(html.includes('id="modal-admin-link-shop"'), 'Should render shop linking modal');
      assert.ok(html.includes('id="modal-admin-news"'), 'Should render news authoring modal');
      assert.ok(html.includes('id="modal-admin-featured-photo"'), 'Should render featured photo modal');
      assert.ok(html.includes('admin-shop-discount-code'), 'Should contain discount code input');
    });

    it('includes navigation item #nav-community-admin in app shell sidebar', () => {
      const shellHtml = renderAppShell(mockConfig, mockData);
      assert.ok(shellHtml.includes('id="nav-community-admin"'), 'Should render #nav-community-admin sidebar item');
      assert.ok(shellHtml.includes('switchTab(\'admin\')') || shellHtml.includes('switchTab("admin")'), 'Should trigger switchTab for admin');
      assert.ok(shellHtml.includes('switchAdminSubtab'), 'Should contain switchAdminSubtab client script');
      assert.ok(shellHtml.includes('loadAdminBazarListings'), 'Should contain bazar moderation script');
    });
  });
});
