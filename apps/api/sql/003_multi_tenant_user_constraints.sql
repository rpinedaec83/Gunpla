-- 003_multi_tenant_user_constraints.sql
-- Allow isolated user accounts per tenant by dropping global unique constraints on username and email
-- and replacing them with tenant-scoped composite unique constraints.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_tenant ON users (username, primary_tenant_slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_tenant ON users (email, primary_tenant_slug);
