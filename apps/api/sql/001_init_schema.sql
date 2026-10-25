-- PostgreSQL Production Schema for PlamoScale & GunplaJunkies Multi-Tenant Platform (DT1)

CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    email_from VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    tagline TEXT NOT NULL,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL,
    allowed_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    community_links JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    auth_providers JSONB NOT NULL DEFAULT '["local"]'::jsonb,
    roles JSONB NOT NULL DEFAULT '["user"]'::jsonb,
    primary_tenant_slug VARCHAR(64) NOT NULL REFERENCES tenants(slug),
    bio TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_founder BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(64) PRIMARY KEY,
    builder_username VARCHAR(64) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    build_id VARCHAR(64),
    file_name VARCHAR(255) NOT NULL,
    thumb_url TEXT NOT NULL,
    full_url TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'gunpla-mecha',
    title VARCHAR(255) NOT NULL,
    alt_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_outbox (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(64) NOT NULL REFERENCES tenants(slug),
    sender VARCHAR(255) NOT NULL,
    recipients JSONB NOT NULL,
    reply_to VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    html TEXT NOT NULL,
    provider VARCHAR(32) NOT NULL,
    resend_message_id VARCHAR(128),
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kits (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(120) NOT NULL,
    scale VARCHAR(32) NOT NULL,
    grade VARCHAR(64),
    category VARCHAR(64) NOT NULL DEFAULT 'gunpla-mecha',
    kit_number VARCHAR(64),
    release_year INT,
    boxart_url TEXT,
    scalemates_url TEXT,
    manual_url TEXT,
    barcode VARCHAR(64),
    source VARCHAR(32) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paints (
    id VARCHAR(64) PRIMARY KEY,
    brand VARCHAR(64) NOT NULL,
    line VARCHAR(64) NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(32) NOT NULL,
    finish VARCHAR(32) NOT NULL,
    hex_color VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stash_items (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kit_id VARCHAR(64) NOT NULL REFERENCES kits(id),
    status VARCHAR(32) NOT NULL DEFAULT 'unbuilt',
    rating INT,
    notes TEXT,
    price_paid NUMERIC(10, 2),
    currency VARCHAR(8) DEFAULT 'USD',
    acquired_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paint_rack_items (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paint_id VARCHAR(64) NOT NULL REFERENCES paints(id),
    status VARCHAR(32) NOT NULL DEFAULT 'owned',
    quantity INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS build_projects (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kit_id VARCHAR(64) NOT NULL REFERENCES kits(id),
    category VARCHAR(64) NOT NULL DEFAULT 'gunpla-mecha',
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'wip',
    cover_image_url TEXT,
    like_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS build_steps (
    id VARCHAR(64) PRIMARY KEY,
    build_id VARCHAR(64) NOT NULL REFERENCES build_projects(id) ON DELETE CASCADE,
    stage VARCHAR(32) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    paint_usages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS build_likes (
    build_id VARCHAR(64) NOT NULL REFERENCES build_projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (build_id, user_id)
);

CREATE TABLE IF NOT EXISTS build_comments (
    id VARCHAR(64) PRIMARY KEY,
    build_id VARCHAR(64) NOT NULL REFERENCES build_projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contests (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tenant_slug VARCHAR(64) NOT NULL REFERENCES tenants(slug),
    category VARCHAR(64) NOT NULL,
    banner_url TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    prizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    participants_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contest_entries (
    id VARCHAR(64) PRIMARY KEY,
    contest_id VARCHAR(64) NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    build_id VARCHAR(64) NOT NULL REFERENCES build_projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    cover_image_url TEXT,
    vote_count INT NOT NULL DEFAULT 0,
    voted_by_user_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_contest_build UNIQUE (contest_id, build_id)
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
    id VARCHAR(64) PRIMARY KEY,
    stash_item_id VARCHAR(64) REFERENCES stash_items(id) ON DELETE SET NULL,
    kit_id VARCHAR(64) NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL,
    user_display_name VARCHAR(120) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'both',
    price NUMERIC(10, 2),
    currency VARCHAR(8) NOT NULL DEFAULT 'PEN',
    box_condition VARCHAR(32) NOT NULL DEFAULT 'mint_sealed',
    notes TEXT NOT NULL,
    contact_whatsapp TEXT,
    contact_location VARCHAR(255),
    category VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commission_builders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    bio TEXT NOT NULL,
    specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
    accepting_commissions BOOLEAN NOT NULL DEFAULT TRUE,
    starting_price_pen NUMERIC(10, 2),
    portfolio_sample_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    whatsapp_url TEXT,
    instagram_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    country VARCHAR(64) NOT NULL,
    city VARCHAR(64) NOT NULL,
    catalog_url TEXT,
    whatsapp_url TEXT,
    website_url TEXT,
    instagram_url TEXT,
    specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_stock (
    id VARCHAR(64) PRIMARY KEY,
    shop_id VARCHAR(64) REFERENCES shops(id) ON DELETE CASCADE,
    kit_id VARCHAR(64) REFERENCES kits(id) ON DELETE SET NULL,
    kit_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    scale VARCHAR(50),
    grade VARCHAR(50),
    category VARCHAR(50),
    price_pen NUMERIC(10, 2) NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    stock_count INTEGER DEFAULT 1,
    discount_percentage NUMERIC(5, 2),
    promo_label VARCHAR(100),
    shop_url TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_stock_shop ON shop_stock(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_stock_kit ON shop_stock(kit_id);

CREATE INDEX IF NOT EXISTS idx_media_assets_builder ON media_assets(builder_username);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_kits_category ON kits(category);
CREATE INDEX IF NOT EXISTS idx_kits_brand ON kits(brand);
CREATE INDEX IF NOT EXISTS idx_kits_scalemates_url ON kits(scalemates_url);
CREATE INDEX IF NOT EXISTS idx_paints_brand ON paints(brand);
CREATE INDEX IF NOT EXISTS idx_paints_code ON paints(code);
CREATE INDEX IF NOT EXISTS idx_stash_user_id ON stash_items(user_id);
CREATE INDEX IF NOT EXISTS idx_stash_kit_id ON stash_items(kit_id);
CREATE INDEX IF NOT EXISTS idx_stash_status ON stash_items(status);
CREATE INDEX IF NOT EXISTS idx_paint_rack_user_id ON paint_rack_items(user_id);
CREATE INDEX IF NOT EXISTS idx_paint_rack_paint_id ON paint_rack_items(paint_id);
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON build_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_kit_id ON build_projects(kit_id);
CREATE INDEX IF NOT EXISTS idx_builds_category ON build_projects(category);
CREATE INDEX IF NOT EXISTS idx_builds_slug ON build_projects(slug);
CREATE INDEX IF NOT EXISTS idx_build_steps_build_id ON build_steps(build_id);
CREATE INDEX IF NOT EXISTS idx_contests_tenant_slug ON contests(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_contests_slug ON contests(slug);
CREATE INDEX IF NOT EXISTS idx_contest_entries_contest ON contest_entries(contest_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_user ON marketplace_listings(user_id);
