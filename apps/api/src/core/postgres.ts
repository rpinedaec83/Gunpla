import fs from 'fs';
import path from 'path';
import { Pool, PoolConfig } from 'pg';
import { PlatformDatabaseState } from './db';
import { INITIAL_CONTESTS, INITIAL_SHOPS } from '../slices/community/community.slice';
import { INITIAL_COMMISSION_BUILDERS } from '../slices/marketplace/marketplace.slice';

let poolInstance: Pool | null = null;
let isInitialized = false;

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
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
 * Executes 001_init_schema.sql to create all tables and indexes if they do not exist
 */
export async function initPostgres(stateToSeed?: PlatformDatabaseState): Promise<boolean> {
  const pool = getPgPool();
  if (!pool) {
    return false;
  }

  try {
    const client = await pool.connect();
    try {
      // Locate schema file
      const candidates = [
        path.resolve(__dirname, '../../sql/001_init_schema.sql'),
        path.resolve(__dirname, '../sql/001_init_schema.sql'),
        path.resolve(process.cwd(), 'apps/api/sql/001_init_schema.sql'),
        path.resolve(process.cwd(), 'sql/001_init_schema.sql')
      ];
      const schemaPath = candidates.find((p) => fs.existsSync(p));
      if (schemaPath) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schemaSql);
        console.log(`[Postgres] Schema initialized successfully from ${schemaPath}`);
      } else {
        console.warn('[Postgres] 001_init_schema.sql file not found; skipping direct file execution.');
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
 * Synchronizes full PlatformDatabaseState into PostgreSQL
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

  // 8. Build Projects & Steps
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

  // 9. Contests & Contest Entries
  for (const c of INITIAL_CONTESTS) {
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

  // 11. Commission Builders
  for (const cb of INITIAL_COMMISSION_BUILDERS) {
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

  // 12. Shops
  for (const s of INITIAL_SHOPS) {
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
}

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
    return { connected: false, latencyMs: 0, tables: {} };
  }

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const tableQueries = [
        'tenants',
        'users',
        'media_assets',
        'kits',
        'paints',
        'stash_items',
        'paint_rack_items',
        'build_projects',
        'build_steps',
        'contests',
        'contest_entries',
        'marketplace_listings',
        'commission_builders',
        'shops'
      ];

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
