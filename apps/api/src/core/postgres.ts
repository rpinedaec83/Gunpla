import fs from 'fs';
import path from 'path';
import { Pool, PoolConfig } from 'pg';
import {
  Tenant,
  UserRecord,
  MediaAsset,
  KitRecord,
  PaintRecord,
  StashItemRecord,
  PaintRackItemRecord,
  BuildProjectRecord,
  ContestRecord,
  ContestEntryRecord,
  MarketplaceListingRecord,
  CommissionBuilderRecord,
  CommissionRequestRecord,
  ShopRecord,
  ShopStockItem,
  NotificationItem,
  GroupBuildRecord,
  WorkbenchToolItem,
  SubassemblyCard,
  BuildExpenseItem
} from '@gunpla/shared';
import { PlatformDatabaseState } from './db';
import { INITIAL_CONTESTS, INITIAL_SHOPS } from '../slices/community/community.slice';
import { INITIAL_COMMISSION_BUILDERS } from '../slices/marketplace/marketplace.slice';

let poolInstance: Pool | null = null;
let isInitialized = false;

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function isPostgresInitialized(): boolean {
  return isInitialized;
}

export function getPgPool(): Pool | null {
  if (!isPostgresConfigured()) {
    return null;
  }
  if (!poolInstance) {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    };
    poolInstance = new Pool(config);
    poolInstance.on('error', (err) => {
      console.error('[Postgres Pool Error]:', err.message);
    });
  }
  return poolInstance;
}

/**
 * Resolves the directory containing SQL migration files
 */
function resolveSqlMigrationsDir(): string | null {
  const candidates = [
    path.resolve(__dirname, '../../sql'),
    path.resolve(__dirname, '../sql'),
    path.resolve(process.cwd(), 'apps/api/sql'),
    path.resolve(process.cwd(), 'sql')
  ];
  return candidates.find((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory()) || null;
}

/**
 * Executes all SQL migrations in order (001_..., 002_...) to create all tables and indexes
 */
export async function initPostgres(stateToSeed?: PlatformDatabaseState): Promise<boolean> {
  const pool = getPgPool();
  if (!pool) {
    return false;
  }

  try {
    const client = await pool.connect();
    try {
      // Ensure migration tracking table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const appliedRes = await client.query('SELECT version FROM schema_migrations');
      const appliedSet = new Set(appliedRes.rows.map((r: any) => r.version));

      const sqlDir = resolveSqlMigrationsDir();
      if (sqlDir) {
        const files = fs
          .readdirSync(sqlDir)
          .filter((f) => f.endsWith('.sql'))
          .sort();

        for (const file of files) {
          if (appliedSet.has(file)) {
            continue;
          }
          const filePath = path.join(sqlDir, file);
          const sql = fs.readFileSync(filePath, 'utf-8');
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
          console.log(`[Postgres] Migration applied successfully: ${file}`);
        }
      } else {
        console.warn('[Postgres] SQL migrations directory not found; skipping direct file execution.');
      }

      // Check if tenants table is populated
      const res = await client.query('SELECT COUNT(*) FROM tenants');
      const count = parseInt(res.rows[0].count, 10);
      if (count === 0 && stateToSeed) {
        console.log('[Postgres] Database is empty. Synchronizing initial seeded state to PostgreSQL...');
        await syncStateToPostgresInternal(client, stateToSeed);
        console.log('[Postgres] Initial state synchronized successfully.');
      }

      isInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Postgres] Failed to initialize PostgreSQL:', err.message);
    return false;
  }
}

/**
 * Synchronizes full PlatformDatabaseState into PostgreSQL within an ACID transaction
 */
export async function syncStateToPostgres(state: PlatformDatabaseState): Promise<void> {
  const pool = getPgPool();
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await syncStateToPostgresInternal(client, state);
    await client.query('COMMIT');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Postgres] syncStateToPostgres error:', err.message);
  } finally {
    client.release();
  }
}

async function syncStateToPostgresInternal(client: any, state: PlatformDatabaseState): Promise<void> {
  // 1. Tenants
  for (const t of state.tenants) {
    await client.query(
      `INSERT INTO tenants (id, slug, name, domain, email_from, contact_email, tagline, mission, vision, allowed_categories, theme_config, community_links, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         domain = EXCLUDED.domain,
         email_from = EXCLUDED.email_from,
         contact_email = EXCLUDED.contact_email,
         allowed_categories = EXCLUDED.allowed_categories,
         theme_config = EXCLUDED.theme_config,
         community_links = EXCLUDED.community_links`,
      [
        t.id,
        t.slug,
        t.name,
        t.domain,
        t.emailFrom,
        t.contactEmail,
        t.tagline,
        t.mission,
        t.vision,
        JSON.stringify(t.allowedCategories),
        JSON.stringify(t.themeConfig),
        JSON.stringify(t.communityLinks),
        t.createdAt
      ]
    );
  }

  // 2. Users
  for (const u of state.users) {
    await client.query(
      `INSERT INTO users (id, username, display_name, email, password_hash, google_id, auth_providers, roles, primary_tenant_slug, bio, avatar_url, social_links, is_founder, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         email = EXCLUDED.email,
         password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
         google_id = COALESCE(EXCLUDED.google_id, users.google_id),
         auth_providers = EXCLUDED.auth_providers,
         roles = EXCLUDED.roles,
         bio = EXCLUDED.bio,
         avatar_url = EXCLUDED.avatar_url,
         social_links = EXCLUDED.social_links`,
      [
        u.id,
        u.username,
        u.displayName,
        u.email,
        u.passwordHash ?? null,
        u.googleId ?? null,
        JSON.stringify(u.authProviders),
        JSON.stringify(u.roles),
        u.primaryTenantSlug,
        u.bio,
        u.avatarUrl ?? null,
        JSON.stringify(u.socialLinks),
        u.isFounder,
        u.createdAt
      ]
    );
  }

  // 3. Media Assets
  for (const m of state.mediaAssets) {
    await client.query(
      `INSERT INTO media_assets (id, builder_username, build_id, file_name, thumb_url, full_url, category, title, alt_text, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         thumb_url = EXCLUDED.thumb_url,
         full_url = EXCLUDED.full_url,
         title = EXCLUDED.title,
         alt_text = EXCLUDED.alt_text`,
      [
        m.id,
        m.builderUsername,
        m.buildId ?? null,
        m.fileName,
        m.thumbUrl,
        m.fullUrl,
        m.category,
        m.title,
        m.altText,
        m.createdAt
      ]
    );
  }

  // 4. Kits
  for (const k of state.kits) {
    await client.query(
      `INSERT INTO kits (id, name, brand, scale, grade, category, kit_number, release_year, boxart_url, scalemates_url, manual_url, barcode, source, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         brand = EXCLUDED.brand,
         scale = EXCLUDED.scale,
         grade = EXCLUDED.grade,
         category = EXCLUDED.category,
         boxart_url = EXCLUDED.boxart_url,
         scalemates_url = EXCLUDED.scalemates_url`,
      [
        k.id,
        k.name,
        k.brand,
        k.scale,
        k.grade ?? null,
        k.category,
        k.kitNumber ?? null,
        k.releaseYear ?? null,
        k.boxartUrl ?? null,
        k.scalematesUrl ?? null,
        k.manualUrl ?? null,
        k.barcode ?? null,
        k.source,
        k.createdAt
      ]
    );
  }

  // 5. Paints
  for (const p of state.paints) {
    await client.query(
      `INSERT INTO paints (id, brand, line, code, name, type, finish, hex_color, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         finish = EXCLUDED.finish,
         hex_color = EXCLUDED.hex_color`,
      [p.id, p.brand, p.line, p.code, p.name, p.type, p.finish, p.hexColor, p.createdAt]
    );
  }

  // 6. Stash Items
  for (const s of state.stashItems) {
    await client.query(
      `INSERT INTO stash_items (id, user_id, kit_id, status, rating, notes, price_paid, currency, acquired_at, completed_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         rating = EXCLUDED.rating,
         notes = EXCLUDED.notes,
         completed_at = EXCLUDED.completed_at,
         updated_at = EXCLUDED.updated_at`,
      [
        s.id,
        s.userId,
        s.kitId,
        s.status,
        s.rating ?? null,
        s.notes ?? null,
        s.pricePaid ?? null,
        s.currency ?? 'USD',
        s.acquiredAt ?? null,
        s.completedAt ?? null,
        s.createdAt,
        s.updatedAt
      ]
    );
  }

  // 7. Paint Rack Items
  for (const pr of state.paintRackItems) {
    await client.query(
      `INSERT INTO paint_rack_items (id, user_id, paint_id, status, quantity, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         quantity = EXCLUDED.quantity,
         notes = EXCLUDED.notes,
         updated_at = EXCLUDED.updated_at`,
      [pr.id, pr.userId, pr.paintId, pr.status, pr.quantity, pr.notes ?? null, pr.createdAt, pr.updatedAt]
    );
  }

  // 8. Build Projects, Steps, Subassemblies & Expenses
  for (const b of state.builds) {
    await client.query(
      `INSERT INTO build_projects (id, slug, user_id, kit_id, category, title, subtitle, status, cover_image_url, like_count, view_count, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         status = EXCLUDED.status,
         like_count = EXCLUDED.like_count,
         updated_at = EXCLUDED.updated_at`,
      [
        b.id,
        b.slug,
        b.userId,
        b.kitId ?? null,
        b.category,
        b.title,
        b.subtitle ?? null,
        b.status,
        b.coverImageUrl ?? null,
        b.likeCount,
        b.viewCount,
        JSON.stringify(b.tags),
        b.createdAt,
        b.updatedAt
      ]
    );

    if (Array.isArray(b.steps)) {
      for (const step of b.steps) {
        await client.query(
          `INSERT INTO build_steps (id, build_id, stage, order_index, title, description, photo_urls, paint_usages, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             paint_usages = EXCLUDED.paint_usages`,
          [
            step.id,
            b.id,
            step.stage,
            step.orderIndex,
            step.title,
            step.description,
            JSON.stringify(step.photoUrls),
            JSON.stringify(step.paintUsages),
            step.createdAt
          ]
        );
      }
    }

    // Sync subassemblies (DT23)
    if (Array.isArray(b.subassemblies)) {
      for (const sub of b.subassemblies) {
        await client.query(
          `INSERT INTO build_subassemblies (id, build_id, name, type, icon, runners, part_count_estimated, stages, custom_notes, color_palette_notes, order_index, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             type = EXCLUDED.type,
             icon = EXCLUDED.icon,
             runners = EXCLUDED.runners,
             part_count_estimated = EXCLUDED.part_count_estimated,
             stages = EXCLUDED.stages,
             custom_notes = EXCLUDED.custom_notes,
             color_palette_notes = EXCLUDED.color_palette_notes,
             order_index = EXCLUDED.order_index,
             updated_at = EXCLUDED.updated_at`,
          [
            sub.id,
            b.id,
            sub.name,
            sub.type || 'custom',
            sub.icon || '🧩',
            JSON.stringify(sub.runners || []),
            sub.partCountEstimated || 1,
            JSON.stringify(sub.stages || {}),
            sub.customNotes ?? null,
            sub.colorPaletteNotes ?? null,
            sub.orderIndex || 0,
            sub.createdAt || new Date().toISOString(),
            sub.updatedAt || new Date().toISOString()
          ]
        );
      }
    }

    // Sync expenses (DT17)
    if (Array.isArray(b.expenses)) {
      for (const exp of b.expenses) {
        await client.query(
          `INSERT INTO build_expenses (id, build_id, category, name, amount, currency, paint_id, paint_bottle_fraction, labor_hours, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             category = EXCLUDED.category,
             name = EXCLUDED.name,
             amount = EXCLUDED.amount,
             currency = EXCLUDED.currency,
             paint_id = EXCLUDED.paint_id,
             paint_bottle_fraction = EXCLUDED.paint_bottle_fraction,
             labor_hours = EXCLUDED.labor_hours,
             notes = EXCLUDED.notes`,
          [
            exp.id,
            b.id,
            exp.category || 'other',
            exp.name,
            exp.amount,
            exp.currency || 'USD',
            exp.paintId ?? null,
            exp.paintBottleFraction ?? null,
            exp.laborHours ?? 0,
            exp.notes ?? null,
            exp.createdAt || new Date().toISOString()
          ]
        );
      }
    }
  }

  // 9. Contests & Contest Entries
  const contestsToSync = state.contests && state.contests.length > 0 ? state.contests : INITIAL_CONTESTS;
  for (const c of contestsToSync) {
    await client.query(
      `INSERT INTO contests (id, slug, title, description, tenant_slug, category, banner_url, start_date, end_date, status, rules, prizes, participants_count, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         rules = EXCLUDED.rules,
         prizes = EXCLUDED.prizes,
         participants_count = EXCLUDED.participants_count`,
      [
        c.id,
        c.slug,
        c.title,
        c.description,
        c.tenantSlug,
        c.category,
        c.bannerUrl ?? null,
        c.startDate,
        c.endDate,
        c.status,
        JSON.stringify(c.rules),
        JSON.stringify(c.prizes),
        c.participantsCount
      ]
    );
  }

  for (const ce of state.contestEntries) {
    await client.query(
      `INSERT INTO contest_entries (id, contest_id, build_id, user_id, username, title, cover_image_url, vote_count, voted_by_user_ids, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         vote_count = EXCLUDED.vote_count,
         voted_by_user_ids = EXCLUDED.voted_by_user_ids,
         status = EXCLUDED.status`,
      [
        ce.id,
        ce.contestId,
        ce.buildId,
        ce.userId,
        ce.username,
        ce.title,
        ce.coverImageUrl ?? null,
        ce.voteCount,
        JSON.stringify(ce.votedByUserIds),
        ce.status,
        ce.createdAt
      ]
    );
  }

  // 10. Marketplace Listings
  for (const l of state.marketplaceListings) {
    await client.query(
      `INSERT INTO marketplace_listings (id, stash_item_id, kit_id, user_id, username, user_display_name, type, price, currency, box_condition, notes, contact_whatsapp, contact_location, category, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         price = EXCLUDED.price,
         box_condition = EXCLUDED.box_condition,
         notes = EXCLUDED.notes,
         status = EXCLUDED.status,
         updated_at = EXCLUDED.updated_at`,
      [
        l.id,
        l.stashItemId ?? null,
        l.kitId,
        l.userId,
        l.username,
        l.userDisplayName,
        l.type,
        l.price ?? null,
        l.currency,
        l.boxCondition,
        l.notes,
        l.contactWhatsapp ?? null,
        l.contactLocation ?? null,
        l.category,
        l.status,
        l.createdAt,
        l.updatedAt
      ]
    );
  }

  // 11. Commission Builders & Commission Requests
  const buildersToSync = state.commissionBuilders && state.commissionBuilders.length > 0 ? state.commissionBuilders : INITIAL_COMMISSION_BUILDERS;
  for (const cb of buildersToSync) {
    await client.query(
      `INSERT INTO commission_builders (id, user_id, username, display_name, bio, specialties, accepting_commissions, starting_price_pen, portfolio_sample_urls, whatsapp_url, instagram_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (id) DO UPDATE SET
         bio = EXCLUDED.bio,
         specialties = EXCLUDED.specialties,
         accepting_commissions = EXCLUDED.accepting_commissions,
         starting_price_pen = EXCLUDED.starting_price_pen,
         whatsapp_url = EXCLUDED.whatsapp_url,
         instagram_url = EXCLUDED.instagram_url`,
      [
        cb.id,
        cb.userId,
        cb.username,
        cb.displayName,
        cb.bio,
        JSON.stringify(cb.specialties),
        cb.acceptingCommissions,
        cb.startingPricePEN ?? null,
        JSON.stringify(cb.portfolioSampleUrls),
        cb.whatsappUrl ?? null,
        cb.instagramUrl ?? null
      ]
    );
  }

  if (Array.isArray(state.commissionRequests)) {
    for (const cr of state.commissionRequests) {
      await client.query(
        `INSERT INTO commission_requests (id, code, tenant_id, builder_username, builder_display_name, client_user_id, client_name, client_email, client_whatsapp, client_city, kit_title, scale_category, scope_level, kit_supply, target_budget, currency, target_deadline, reference_links, project_notes, status, quote_price, estimated_days, builder_response_notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
         ON CONFLICT (id) DO UPDATE SET
           quote_price = EXCLUDED.quote_price,
           estimated_days = EXCLUDED.estimated_days,
           status = EXCLUDED.status,
           builder_response_notes = EXCLUDED.builder_response_notes,
           updated_at = EXCLUDED.updated_at`,
        [
          cr.id,
          cr.code,
          cr.tenantId,
          cr.builderUsername,
          cr.builderDisplayName ?? null,
          cr.clientUserId ?? null,
          cr.clientName,
          cr.clientEmail,
          cr.clientWhatsapp ?? null,
          cr.clientCity ?? null,
          cr.kitTitle,
          cr.scaleCategory,
          cr.scopeLevel,
          cr.kitSupply,
          cr.targetBudget ?? null,
          cr.currency || 'PEN',
          cr.targetDeadline ?? null,
          JSON.stringify(cr.referenceLinks || []),
          cr.projectNotes,
          cr.status,
          cr.quotePrice ?? null,
          cr.estimatedDays ?? null,
          cr.builderResponseNotes ?? null,
          cr.createdAt,
          cr.updatedAt
        ]
      );
    }
  }

  // 12. Shops & Shop Stock
  const shopsToSync = state.shops && state.shops.length > 0 ? state.shops : INITIAL_SHOPS;
  for (const s of shopsToSync) {
    await client.query(
      `INSERT INTO shops (id, name, description, country, city, catalog_url, whatsapp_url, website_url, instagram_url, specialties, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         catalog_url = EXCLUDED.catalog_url,
         whatsapp_url = EXCLUDED.whatsapp_url,
         specialties = EXCLUDED.specialties,
         is_verified = EXCLUDED.is_verified`,
      [
        s.id,
        s.name,
        s.description,
        s.country,
        s.city,
        s.catalogUrl ?? null,
        s.whatsappUrl ?? null,
        s.websiteUrl ?? null,
        s.instagramUrl ?? null,
        JSON.stringify(s.specialties),
        s.isVerified
      ]
    );
  }

  const stockToSync = state.shopStock && state.shopStock.length > 0 ? state.shopStock : [];
  for (const st of stockToSync) {
    await client.query(
      `INSERT INTO shop_stock (id, shop_id, kit_id, kit_name, brand, scale, grade, category, price_pen, in_stock, stock_count, discount_percentage, promo_label, shop_url, last_updated, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
       ON CONFLICT (id) DO UPDATE SET
         price_pen = EXCLUDED.price_pen,
         in_stock = EXCLUDED.in_stock,
         stock_count = EXCLUDED.stock_count,
         discount_percentage = EXCLUDED.discount_percentage,
         promo_label = EXCLUDED.promo_label,
         shop_url = EXCLUDED.shop_url,
         last_updated = EXCLUDED.last_updated`,
      [
        st.id,
        st.shopId,
        st.kitId ?? null,
        st.kitName,
        st.brand,
        st.scale ?? null,
        st.grade ?? null,
        st.category ?? null,
        st.pricePEN,
        st.inStock,
        st.stockCount ?? 1,
        st.discountPercentage ?? null,
        st.promoLabel ?? null,
        st.shopUrl ?? null,
        st.lastUpdated || new Date().toISOString()
      ]
    );
  }

  // 13. Workbench Tools & Maintenance Logs (DT24)
  if (Array.isArray(state.tools)) {
    for (const tool of state.tools) {
      await client.query(
        `INSERT INTO workbench_tools (id, user_id, name, brand, category, model_number, purchase_price, purchase_currency, acquired_at, status, condition, wear, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           brand = EXCLUDED.brand,
           category = EXCLUDED.category,
           model_number = EXCLUDED.model_number,
           purchase_price = EXCLUDED.purchase_price,
           purchase_currency = EXCLUDED.purchase_currency,
           status = EXCLUDED.status,
           condition = EXCLUDED.condition,
           wear = EXCLUDED.wear,
           notes = EXCLUDED.notes,
           updated_at = EXCLUDED.updated_at`,
        [
          tool.id,
          tool.userId,
          tool.name,
          tool.brand,
          tool.category,
          tool.modelNumber ?? null,
          tool.purchasePrice ?? null,
          tool.purchaseCurrency ?? 'USD',
          tool.acquiredAt ?? null,
          tool.status,
          tool.condition,
          JSON.stringify(tool.wear || {}),
          tool.notes ?? null,
          tool.createdAt,
          tool.updatedAt
        ]
      );

      if (Array.isArray(tool.maintenanceLog)) {
        for (const log of tool.maintenanceLog) {
          await client.query(
            `INSERT INTO tool_maintenance_logs (id, tool_id, type, notes, performed_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET
               type = EXCLUDED.type,
               notes = EXCLUDED.notes,
               performed_at = EXCLUDED.performed_at`,
            [log.id, tool.id, log.type, log.notes, log.performedAt]
          );
        }
      }
    }
  }

  // 14. Notifications
  if (Array.isArray(state.notifications)) {
    for (const notif of state.notifications) {
      await client.query(
        `INSERT INTO notifications (id, tenant_slug, user_id, type, title, message, link, is_read, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           is_read = EXCLUDED.is_read`,
        [
          notif.id,
          notif.tenantSlug,
          notif.userId,
          notif.type,
          notif.title,
          notif.message,
          notif.link,
          notif.read,
          JSON.stringify(notif.metadata || {}),
          notif.createdAt
        ]
      );
    }
  }

  // 15. Group Builds & Group Build Entries
  if (Array.isArray(state.groupBuilds)) {
    for (const gb of state.groupBuilds) {
      await client.query(
        `INSERT INTO group_builds (id, tenant_slug, title, slug, description, rules, banner_image_url, start_date, end_date, status, creator_user_id, creator_username, creator_display_name, category, participants_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           rules = EXCLUDED.rules,
           banner_image_url = EXCLUDED.banner_image_url,
           status = EXCLUDED.status,
           participants_count = EXCLUDED.participants_count,
           updated_at = EXCLUDED.updated_at`,
        [
          gb.id,
          gb.tenantSlug,
          gb.title,
          gb.slug,
          gb.description,
          JSON.stringify(gb.rules || []),
          gb.bannerImageUrl ?? null,
          gb.startDate,
          gb.endDate,
          gb.status,
          gb.creatorUserId ?? null,
          gb.creatorUsername,
          gb.creatorDisplayName ?? null,
          gb.category ?? null,
          gb.participantsCount || (gb.entries ? gb.entries.length : 0),
          gb.createdAt,
          gb.updatedAt ?? null
        ]
      );

      if (Array.isArray(gb.entries)) {
        for (const entry of gb.entries) {
          await client.query(
            `INSERT INTO group_build_entries (id, group_build_id, build_id, user_id, username, user_display_name, build_title, build_slug, cover_image_url, stage, steps_count, joined_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO UPDATE SET
               build_title = EXCLUDED.build_title,
               stage = EXCLUDED.stage,
               steps_count = EXCLUDED.steps_count`,
            [
              entry.id,
              gb.id,
              entry.buildId,
              entry.userId,
              entry.username,
              entry.userDisplayName ?? null,
              entry.buildTitle,
              entry.buildSlug ?? null,
              entry.coverImageUrl ?? null,
              entry.stage ?? null,
              entry.stepsCount ?? 0,
              entry.joinedAt || new Date().toISOString()
            ]
          );
        }
      }
    }
  }
}

/**
 * Loads entire platform state from PostgreSQL when connected
 */
export async function loadStateFromPostgres(): Promise<PlatformDatabaseState | null> {
  const pool = getPgPool();
  if (!pool) return null;

  try {
    const client = await pool.connect();
    try {
      // 1. Tenants
      const tenantsRes = await client.query('SELECT * FROM tenants ORDER BY created_at ASC');
      if (tenantsRes.rows.length === 0) return null;

      const tenants: Tenant[] = tenantsRes.rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        domain: r.domain,
        emailFrom: r.email_from,
        contactEmail: r.contact_email,
        tagline: r.tagline,
        mission: r.mission,
        vision: r.vision,
        allowedCategories: typeof r.allowed_categories === 'string' ? JSON.parse(r.allowed_categories) : r.allowed_categories,
        themeConfig: typeof r.theme_config === 'string' ? JSON.parse(r.theme_config) : r.theme_config,
        communityLinks: typeof r.community_links === 'string' ? JSON.parse(r.community_links) : r.community_links,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      // 2. Users
      const usersRes = await client.query('SELECT * FROM users ORDER BY created_at ASC');
      const users: UserRecord[] = usersRes.rows.map((r) => ({
        id: r.id,
        username: r.username,
        displayName: r.display_name,
        email: r.email,
        passwordHash: r.password_hash,
        googleId: r.google_id,
        authProviders: typeof r.auth_providers === 'string' ? JSON.parse(r.auth_providers) : r.auth_providers,
        roles: typeof r.roles === 'string' ? JSON.parse(r.roles) : r.roles,
        primaryTenantSlug: r.primary_tenant_slug,
        bio: r.bio,
        avatarUrl: r.avatar_url,
        socialLinks: typeof r.social_links === 'string' ? JSON.parse(r.social_links) : r.social_links,
        isFounder: r.is_founder,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      // 3. Media Assets
      const mediaRes = await client.query('SELECT * FROM media_assets');
      const mediaAssets: MediaAsset[] = mediaRes.rows.map((r) => ({
        id: r.id,
        builderUsername: r.builder_username,
        buildId: r.build_id,
        fileName: r.file_name,
        thumbUrl: r.thumb_url,
        fullUrl: r.full_url,
        category: r.category,
        title: r.title,
        altText: r.alt_text,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      // 4. Kits
      const kitsRes = await client.query('SELECT * FROM kits');
      const kits: KitRecord[] = kitsRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        brand: r.brand,
        scale: r.scale,
        grade: r.grade,
        category: r.category,
        kitNumber: r.kit_number,
        releaseYear: r.release_year,
        boxartUrl: r.boxart_url,
        scalematesUrl: r.scalemates_url,
        manualUrl: r.manual_url,
        barcode: r.barcode,
        source: r.source,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      // 5. Paints
      const paintsRes = await client.query('SELECT * FROM paints');
      const paints: PaintRecord[] = paintsRes.rows.map((r) => ({
        id: r.id,
        brand: r.brand,
        line: r.line,
        code: r.code,
        name: r.name,
        type: r.type,
        finish: r.finish,
        hexColor: r.hex_color,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      // 6. Stash Items
      const stashRes = await client.query('SELECT * FROM stash_items');
      const stashItems: StashItemRecord[] = stashRes.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        kitId: r.kit_id,
        status: r.status,
        rating: r.rating,
        notes: r.notes,
        pricePaid: r.price_paid ? Number(r.price_paid) : undefined,
        currency: r.currency,
        acquiredAt: r.acquired_at ? new Date(r.acquired_at).toISOString() : undefined,
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
      }));

      // 7. Paint Rack Items
      const rackRes = await client.query('SELECT * FROM paint_rack_items');
      const paintRackItems: PaintRackItemRecord[] = rackRes.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        paintId: r.paint_id,
        status: r.status,
        quantity: r.quantity,
        notes: r.notes,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
      }));

      // 8. Builds, Steps, Subassemblies & Expenses
      const buildsRes = await client.query('SELECT * FROM build_projects');
      const stepsRes = await client.query('SELECT * FROM build_steps ORDER BY order_index ASC');
      let subsRes = { rows: [] };
      try {
        subsRes = await client.query('SELECT * FROM build_subassemblies ORDER BY order_index ASC');
      } catch {}
      let expRes = { rows: [] };
      try {
        expRes = await client.query('SELECT * FROM build_expenses ORDER BY created_at DESC');
      } catch {}

      const builds: BuildProjectRecord[] = buildsRes.rows.map((r) => {
        const buildSteps = stepsRes.rows
          .filter((s) => s.build_id === r.id)
          .map((s) => ({
            id: s.id,
            buildId: s.build_id,
            stage: s.stage,
            orderIndex: s.order_index,
            title: s.title,
            description: s.description,
            photoUrls: typeof s.photo_urls === 'string' ? JSON.parse(s.photo_urls) : s.photo_urls,
            paintUsages: typeof s.paint_usages === 'string' ? JSON.parse(s.paint_usages) : s.paint_usages,
            createdAt: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString()
          }));

        const subassemblies: SubassemblyCard[] = subsRes.rows
          .filter((sub: any) => sub.build_id === r.id)
          .map((sub: any) => ({
            id: sub.id,
            buildId: sub.build_id,
            name: sub.name,
            type: sub.type,
            icon: sub.icon || '🧩',
            runners: typeof sub.runners === 'string' ? JSON.parse(sub.runners) : sub.runners,
            partCountEstimated: sub.part_count_estimated,
            stages: typeof sub.stages === 'string' ? JSON.parse(sub.stages) : sub.stages,
            customNotes: sub.custom_notes || '',
            colorPaletteNotes: sub.color_palette_notes,
            orderIndex: sub.order_index,
            createdAt: sub.created_at ? new Date(sub.created_at).toISOString() : new Date().toISOString(),
            updatedAt: sub.updated_at ? new Date(sub.updated_at).toISOString() : new Date().toISOString()
          }));

        const expenses: BuildExpenseItem[] = expRes.rows
          .filter((exp: any) => exp.build_id === r.id)
          .map((exp: any) => ({
            id: exp.id,
            buildId: exp.build_id,
            category: exp.category,
            name: exp.name,
            amount: Number(exp.amount),
            currency: exp.currency,
            paintId: exp.paint_id || undefined,
            paintBottleFraction: exp.paint_bottle_fraction ? Number(exp.paint_bottle_fraction) : undefined,
            laborHours: exp.labor_hours ? Number(exp.labor_hours) : 0,
            notes: exp.notes || undefined,
            createdAt: exp.created_at ? new Date(exp.created_at).toISOString() : new Date().toISOString()
          }));

        const author = users.find((u) => u.id === r.user_id);

        return {
          id: r.id,
          slug: r.slug,
          userId: r.user_id,
          username: author ? author.username : 'builder',
          userDisplayName: author ? author.displayName : 'Gunpla Builder',
          kitId: r.kit_id,
          category: r.category,
          title: r.title,
          subtitle: r.subtitle,
          status: r.status,
          coverImageUrl: r.cover_image_url,
          likeCount: r.like_count,
          likedByUserIds: [],
          viewCount: r.view_count,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
          steps: buildSteps,
          comments: [],
          subassemblies: subassemblies.length > 0 ? subassemblies : undefined,
          expenses: expenses.length > 0 ? expenses : undefined,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        };
      });

      // 9. Tools & Maintenance Logs
      let tools: WorkbenchToolItem[] = [];
      try {
        const toolsRes = await client.query('SELECT * FROM workbench_tools');
        const maintRes = await client.query('SELECT * FROM tool_maintenance_logs ORDER BY performed_at DESC');
        tools = toolsRes.rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          name: r.name,
          brand: r.brand,
          category: r.category,
          modelNumber: r.model_number,
          purchasePrice: r.purchase_price ? Number(r.purchase_price) : undefined,
          purchaseCurrency: r.purchase_currency,
          acquiredAt: r.acquired_at ? new Date(r.acquired_at).toISOString() : undefined,
          status: r.status,
          condition: r.condition,
          wear: typeof r.wear === 'string' ? JSON.parse(r.wear) : r.wear,
          maintenanceLog: maintRes.rows
            .filter((m: any) => m.tool_id === r.id)
            .map((m: any) => ({
              id: m.id,
              type: m.type,
              notes: m.notes,
              performedAt: m.performed_at ? new Date(m.performed_at).toISOString() : new Date().toISOString()
            })),
          notes: r.notes,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        }));
      } catch {}

      // 10. Contests & Contest Entries
      const contestsRes = await client.query('SELECT * FROM contests');
      const entriesRes = await client.query('SELECT * FROM contest_entries');
      const contests: ContestRecord[] = contestsRes.rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        tenantSlug: r.tenant_slug,
        category: r.category,
        bannerUrl: r.banner_url,
        startDate: r.start_date ? new Date(r.start_date).toISOString() : new Date().toISOString(),
        endDate: r.end_date ? new Date(r.end_date).toISOString() : new Date().toISOString(),
        status: r.status,
        rules: typeof r.rules === 'string' ? JSON.parse(r.rules) : r.rules,
        prizes: typeof r.prizes === 'string' ? JSON.parse(r.prizes) : r.prizes,
        participantsCount: r.participants_count,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      const contestEntries: ContestEntryRecord[] = entriesRes.rows.map((r) => {
        const author = users.find((u) => u.id === r.user_id);
        const build = builds.find((b) => b.id === r.build_id);
        return {
          id: r.id,
          contestId: r.contest_id,
          buildId: r.build_id,
          userId: r.user_id,
          username: r.username,
          userDisplayName: author ? author.displayName : r.username,
          title: r.title,
          category: (build ? build.category : 'gunpla-mecha') as any,
          coverImageUrl: r.cover_image_url,
          voteCount: r.vote_count,
          votedByUserIds: typeof r.voted_by_user_ids === 'string' ? JSON.parse(r.voted_by_user_ids) : r.voted_by_user_ids,
          status: r.status,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
        };
      });

      // 11. Marketplace Listings
      const marketRes = await client.query('SELECT * FROM marketplace_listings');
      const marketplaceListings: MarketplaceListingRecord[] = marketRes.rows.map((r) => ({
        id: r.id,
        stashItemId: r.stash_item_id,
        kitId: r.kit_id,
        userId: r.user_id,
        username: r.username,
        userDisplayName: r.user_display_name,
        type: r.type,
        price: r.price ? Number(r.price) : undefined,
        currency: r.currency,
        boxCondition: r.box_condition,
        notes: r.notes,
        contactWhatsapp: r.contact_whatsapp,
        contactLocation: r.contact_location,
        category: r.category,
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
      }));

      // 12. Commission Builders & Requests
      const commBuildersRes = await client.query('SELECT * FROM commission_builders');
      const commissionBuilders: CommissionBuilderRecord[] = commBuildersRes.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        username: r.username,
        displayName: r.display_name,
        bio: r.bio,
        specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties) : r.specialties,
        acceptingCommissions: r.accepting_commissions,
        startingPricePEN: r.starting_price_pen ? Number(r.starting_price_pen) : undefined,
        portfolioSampleUrls: typeof r.portfolio_sample_urls === 'string' ? JSON.parse(r.portfolio_sample_urls) : r.portfolio_sample_urls,
        whatsappUrl: r.whatsapp_url,
        instagramUrl: r.instagram_url,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      let commissionRequests: CommissionRequestRecord[] = [];
      try {
        const commReqRes = await client.query('SELECT * FROM commission_requests');
        commissionRequests = commReqRes.rows.map((r: any) => ({
          id: r.id,
          code: r.code,
          tenantId: r.tenant_id,
          builderUsername: r.builder_username,
          builderDisplayName: r.builder_display_name || undefined,
          clientUserId: r.client_user_id || undefined,
          clientName: r.client_name,
          clientEmail: r.client_email,
          clientWhatsapp: r.client_whatsapp,
          clientCity: r.client_city || undefined,
          kitTitle: r.kit_title,
          scaleCategory: r.scale_category,
          scopeLevel: r.scope_level,
          kitSupply: r.kit_supply,
          targetBudget: r.target_budget ? Number(r.target_budget) : undefined,
          currency: r.currency || 'PEN',
          targetDeadline: r.target_deadline ? new Date(r.target_deadline).toISOString() : undefined,
          referenceLinks: typeof r.reference_links === 'string' ? JSON.parse(r.reference_links) : (r.reference_links || []),
          projectNotes: r.project_notes,
          status: r.status,
          quotePrice: r.quote_price ? Number(r.quote_price) : undefined,
          estimatedDays: r.estimated_days ? Number(r.estimated_days) : undefined,
          builderResponseNotes: r.builder_response_notes || undefined,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        }));
      } catch {}

      // 13. Shops & Shop Stock
      const shopsRes = await client.query('SELECT * FROM shops');
      const shops: ShopRecord[] = shopsRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        country: r.country,
        city: r.city,
        catalogUrl: r.catalog_url,
        whatsappUrl: r.whatsapp_url,
        websiteUrl: r.website_url,
        instagramUrl: r.instagram_url,
        specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties) : r.specialties,
        isVerified: r.is_verified,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      let shopStock: ShopStockItem[] = [];
      try {
        const stockRes = await client.query('SELECT * FROM shop_stock');
        shopStock = stockRes.rows.map((r) => ({
          id: r.id,
          shopId: r.shop_id,
          kitId: r.kit_id,
          kitName: r.kit_name,
          brand: r.brand,
          scale: r.scale,
          grade: r.grade,
          category: r.category,
          pricePEN: Number(r.price_pen),
          inStock: r.in_stock,
          stockCount: r.stock_count,
          discountPercentage: r.discount_percentage ? Number(r.discount_percentage) : undefined,
          promoLabel: r.promo_label,
          shopUrl: r.shop_url,
          lastUpdated: r.last_updated ? new Date(r.last_updated).toISOString() : new Date().toISOString()
        }));
      } catch {}

      // 14. Notifications & Group Builds
      let notifications: NotificationItem[] = [];
      try {
        const notifRes = await client.query('SELECT * FROM notifications ORDER BY created_at DESC');
        notifications = notifRes.rows.map((r: any) => ({
          id: r.id,
          tenantSlug: r.tenant_slug,
          userId: r.user_id,
          type: r.type,
          title: r.title,
          message: r.message,
          link: r.link,
          read: r.is_read ?? false,
          metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
        }));
      } catch {}

      let groupBuilds: GroupBuildRecord[] = [];
      try {
        const gbRes = await client.query('SELECT * FROM group_builds');
        const gbeRes = await client.query('SELECT * FROM group_build_entries');
        groupBuilds = gbRes.rows.map((r) => ({
          id: r.id,
          tenantSlug: r.tenant_slug,
          title: r.title,
          slug: r.slug,
          description: r.description,
          rules: typeof r.rules === 'string' ? JSON.parse(r.rules) : r.rules,
          bannerImageUrl: r.banner_image_url,
          startDate: r.start_date ? new Date(r.start_date).toISOString() : new Date().toISOString(),
          endDate: r.end_date ? new Date(r.end_date).toISOString() : new Date().toISOString(),
          status: r.status,
          creatorUserId: r.creator_user_id,
          creatorUsername: r.creator_username,
          creatorDisplayName: r.creator_display_name,
          category: r.category,
          participantsCount: r.participants_count,
          entries: gbeRes.rows
            .filter((e: any) => e.group_build_id === r.id)
            .map((e: any) => ({
              id: e.id,
              groupBuildId: e.group_build_id,
              buildId: e.build_id,
              userId: e.user_id,
              username: e.username,
              userDisplayName: e.user_display_name,
              buildTitle: e.build_title,
              buildSlug: e.build_slug,
              coverImageUrl: e.cover_image_url,
              stage: e.stage,
              stepsCount: e.steps_count,
              joinedAt: e.joined_at ? new Date(e.joined_at).toISOString() : new Date().toISOString()
            })),
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined
        }));
      } catch {}

      return {
        tenants,
        users,
        mediaAssets,
        emailOutbox: [],
        kits,
        paints,
        stashItems,
        paintRackItems,
        builds,
        contests,
        contestEntries,
        marketplaceListings,
        commissionBuilders,
        commissionRequests,
        shops,
        shopStock,
        notifications,
        pushSubscriptions: [],
        groupBuilds,
        tools,
        lastSeededAt: new Date().toISOString()
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Postgres] Failed to load state from PostgreSQL:', err.message);
    return null;
  }
}

export const MONITORED_PG_TABLES = [
  'tenants',
  'users',
  'media_assets',
  'kits',
  'paints',
  'stash_items',
  'paint_rack_items',
  'build_projects',
  'build_steps',
  'build_subassemblies',
  'build_expenses',
  'workbench_tools',
  'tool_maintenance_logs',
  'contests',
  'contest_entries',
  'marketplace_listings',
  'commission_builders',
  'commission_requests',
  'shops',
  'shop_stock',
  'notifications',
  'group_builds'
];

/**
 * Returns PostgreSQL diagnostic statistics (table counts, connection latency)
 */
export async function getPostgresStats(): Promise<{
  connected: boolean;
  latencyMs: number;
  tables: Record<string, number>;
}> {
  const pool = getPgPool();
  if (!pool) {
    const emptyTables: Record<string, number> = {};
    for (const t of MONITORED_PG_TABLES) {
      emptyTables[t] = 0;
    }
    return { connected: false, latencyMs: 0, tables: emptyTables };
  }

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const tableQueries = MONITORED_PG_TABLES;

      const tables: Record<string, number> = {};
      for (const t of tableQueries) {
        try {
          const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
          tables[t] = parseInt(res.rows[0].count, 10);
        } catch {
          tables[t] = 0;
        }
      }

      const latencyMs = Date.now() - start;
      return { connected: true, latencyMs, tables };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { connected: false, latencyMs: Date.now() - start, tables: {} };
  }
}
