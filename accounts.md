# Project Accounts

This file records non-secret cloud destination and provider account bindings for this repository.

Do not store credentials, keys, tokens, passwords, connection strings, or deployment secrets here. Put local-only secret notes in `secrets.md`, and store operational secrets in the provider or CI/CD secret store.

## Status

- Account binding status: Active
- Last reviewed: 2026-10-23
- Owner: Roberto Pineda (`x-codec` / `rpineda@x-codec.net`)
- Notes: Multi-tenant scale modeling ecosystem (`plamoscale.com`, `gunplajunkies.com`, and white-label B2B tenants) hosted on x-codec VPS/Hosting infrastructure with Cloudflare R2/S3 object storage for high-resolution photography.

## Azure

- Tenant ID or name: Not used

## AWS

- Account ID: Optional S3-compatible alternative (Primary object storage is Cloudflare R2)

## Google Cloud

- Organization ID or name: x-codec (Google Identity / OAuth 2.0 SSO Provider)
- Billing account reference: Free tier (Google Identity Services / OAuth 2.0)
- Project ID: TBD (`gunpla-plamoscale-sso`)
- Project name: PlamoScale & GunplaJunkies SSO
- Region: Global
- Service account name: OAuth 2.0 Web Client (`GOOGLE_CLIENT_ID`)
- Deployment environment notes: Authorized JavaScript origins and redirect URIs configured for `https://plamoscale.com`, `https://gunplajunkies.com`, `https://api.plamoscale.com`, and `http://localhost:*`.

## Cloudflare

- Account ID: TBD (x-codec Cloudflare account)
- Account name: x-codec
- Zone ID or zone name: `plamoscale.com` (Pending Nameserver migration to Cloudflare), `gunplajunkies.com` (Pending Nameserver migration to Cloudflare)
- Pages project: Optional edge static caching / DNS proxy
- Workers service: Optional image resizing / CDN edge caching
- Deployment environment notes: Both `plamoscale.com` and `gunplajunkies.com` domains will be migrated to Cloudflare DNS/Proxy (Full Strict SSL/TLS) and linked to Cloudflare R2 bucket (`plamoscale-media-prod` / `plamoscale-media-dev`) for zero-egress high-resolution image delivery.

## GitHub

- Owner or organization: `rpinedaec83`
- Repository: `https://github.com/rpinedaec83/Gunpla`
- Legacy Reference Repositories:
  - `https://github.com/rpinedaec83/gunplajunkies.com.git` (preserved under `docs/reference/preexisting-root/gunplajunkies.com`)
  - `https://github.com/rpinedaec83/plamoscale.com.git` (preserved under `docs/reference/preexisting-root/plamoscale.com`)
- Environment names: `development`, `staging`, `production`
- Deployment branch policy: `main` (protected via PR + smoketest validation)
- Actions environment notes: GitHub Actions CI/CD runs linting, unit/integration tests, OpenAPI contract validation, and deploys to x-codec VPS/Hosting.

## Other Providers

- Provider name: x-codec VPS / Hosting Infrastructure (Docker / cPanel / Phusion Passenger + PostgreSQL) & Mailchimp
- Account, project, or tenant reference: `x-codec.net` (`d19423` legacy node app reference)
- Region or location: Americas
- Deployment target names:
  - Central API: `api.plamoscale.com` / `api.gunplajunkies.com`
  - Tenant Front 1 (General Scale Modeling): `plamoscale.com`
  - Tenant Front 2 (Gunpla, Mecha & Sci-Fi): `gunplajunkies.com`
  - Future White-Label Tenants: `*.plamoscale.com` or custom CNAME domains
- Notes: Mailchimp audience list (`plamoscale.us14.list-manage.com`, u=`b693c008a9b1b7e4da36d681e`, id=`830f22cd5a`) preserved from `plamoscale.com`.

## Validation Rules

- Cloud, hosting, infrastructure, deployment, and provider CLI work must check this file before selecting a subscription, account, resource group, project, zone, or deployment target.
- If this file conflicts with live CLI state, stop and ask for confirmation before making changes.
