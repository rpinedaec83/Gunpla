-- PostgreSQL Migration 002: Workbench Tools, Blade Wear, Subassemblies, Expenses & Commissions (DT25)

-- 1. Build Subassemblies (DT23 Parts Breakdown & Step Cards)
CREATE TABLE IF NOT EXISTS build_subassemblies (
    id VARCHAR(64) PRIMARY KEY,
    build_id VARCHAR(64) NOT NULL REFERENCES build_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL DEFAULT 'custom',
    icon VARCHAR(16) DEFAULT '🧩',
    runners JSONB NOT NULL DEFAULT '[]'::jsonb,
    part_count_estimated INT NOT NULL DEFAULT 1,
    stages JSONB NOT NULL DEFAULT '{}'::jsonb,
    custom_notes TEXT,
    color_palette_notes TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subassemblies_build_id ON build_subassemblies(build_id);
CREATE INDEX IF NOT EXISTS idx_subassemblies_type ON build_subassemblies(type);
CREATE INDEX IF NOT EXISTS idx_subassemblies_order ON build_subassemblies(build_id, order_index);

-- 2. Build Expenses & Cost Accounting (DT17 Project Cost Estimator)
CREATE TABLE IF NOT EXISTS build_expenses (
    id VARCHAR(64) PRIMARY KEY,
    build_id VARCHAR(64) NOT NULL REFERENCES build_projects(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL DEFAULT 'other',
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    paint_id VARCHAR(64),
    paint_bottle_fraction NUMERIC(6, 2),
    labor_hours NUMERIC(6, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_build_id ON build_expenses(build_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON build_expenses(category);

-- 3. Workbench Tools Asset Catalog (DT24 Tools & Blade Wear Tracker)
CREATE TABLE IF NOT EXISTS workbench_tools (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(120) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'general',
    model_number VARCHAR(120),
    purchase_price NUMERIC(10, 2),
    purchase_currency VARCHAR(8) DEFAULT 'USD',
    acquired_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    condition VARCHAR(32) NOT NULL DEFAULT 'new',
    wear JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wb_tools_user_id ON workbench_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_wb_tools_category ON workbench_tools(category);
CREATE INDEX IF NOT EXISTS idx_wb_tools_status ON workbench_tools(status);

-- 4. Tool Maintenance Logs (DT24 Blade Replacements & Sharpening History)
CREATE TABLE IF NOT EXISTS tool_maintenance_logs (
    id VARCHAR(64) PRIMARY KEY,
    tool_id VARCHAR(64) NOT NULL REFERENCES workbench_tools(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    notes TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_logs_tool_id ON tool_maintenance_logs(tool_id);
CREATE INDEX IF NOT EXISTS idx_maint_logs_performed_at ON tool_maintenance_logs(performed_at DESC);

-- 5. Commission Requests (B2 Custom Painting & Assembly Requests)
CREATE TABLE IF NOT EXISTS commission_requests (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    builder_username VARCHAR(64) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    builder_display_name VARCHAR(120),
    client_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    client_name VARCHAR(120) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_whatsapp VARCHAR(64),
    client_city VARCHAR(120),
    kit_title VARCHAR(255) NOT NULL,
    scale_category VARCHAR(64) NOT NULL,
    scope_level VARCHAR(64) NOT NULL,
    kit_supply VARCHAR(64) NOT NULL,
    target_budget NUMERIC(10, 2),
    currency VARCHAR(8) NOT NULL DEFAULT 'PEN',
    target_deadline TIMESTAMPTZ,
    reference_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    project_notes TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    quote_price NUMERIC(10, 2),
    estimated_days INT,
    builder_response_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comm_requests_builder ON commission_requests(builder_username);
CREATE INDEX IF NOT EXISTS idx_comm_requests_client ON commission_requests(client_user_id);
CREATE INDEX IF NOT EXISTS idx_comm_requests_code ON commission_requests(code);
