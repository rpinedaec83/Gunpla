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

CREATE INDEX IF NOT EXISTS idx_media_assets_builder ON media_assets(builder_username);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
