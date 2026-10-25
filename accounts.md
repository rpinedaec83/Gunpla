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
- Domain ownership verification: Completed in Google Search Console for `gunplajunkies.com` and `plamoscale.com`.
- Deployment environment notes: Authorized JavaScript origins and redirect URIs configured for `https://plamoscale.com`, `https://gunplajunkies.com`, `https://api.plamoscale.com`, and `http://localhost:*`.

## Cloudflare

- Account ID: TBD (x-codec Cloudflare account)
- Account name: x-codec
- Zone ID or zone name:
  - `plamoscale.com`: Delegated Nameservers `cruz.ns.cloudflare.com`, `dylan.ns.cloudflare.com` (Zone active in Cloudflare)
  - `gunplajunkies.com`: Delegated Nameservers `cruz.ns.cloudflare.com`, `dylan.ns.cloudflare.com` (Zone active in Cloudflare)
- Nameservers assigned:
  1. `cruz.ns.cloudflare.com`
  2. `dylan.ns.cloudflare.com`
- Routing & Tunnel (`xcodec-lab-tunnel` / `87cb64ac-1164-4153-890f-b6fee81e0327`):
  - `plamoscale.com` (apex) & `www.plamoscale.com` -> LXC 190 (`10.20.30.190:3000`)
  - `gunplajunkies.com` (apex) & `www.gunplajunkies.com` -> LXC 190 (`10.20.30.190:3001`)
  - `api.plamoscale.com` & `api.gunplajunkies.com` -> LXC 190 (`10.20.30.190:8080`)
- Pages project: Optional edge static caching / DNS proxy
- Workers service: Optional image resizing / CDN edge caching
- Deployment environment notes: Both `plamoscale.com` and `gunplajunkies.com` apex and www domains are bound to Cloudflare DNS/Proxy with assigned nameservers `cruz.ns.cloudflare.com` and `dylan.ns.cloudflare.com`. Cloudflare Tunnel ingress rules route all traffic to homelab LXC 190 with Full Strict SSL. Resend DKIM/SPF domain verification is 100% completed and verified (2026-10-23). Both zones will link to Cloudflare R2 bucket (`plamoscale-media-prod` / `plamoscale-media-dev`) for zero-egress high-resolution image delivery.

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

- Provider name: x-codec VPS / Hosting Infrastructure (Docker / cPanel / Phusion Passenger + PostgreSQL) & Resend.com (Transactional & Community Email)
- Account, project, or tenant reference: `x-codec.net` (`d19423` legacy node app reference) | Resend.com (`x-codec`)
- Region or location: Americas (`us-east-1` Resend default)
- Deployment target names:
  - Central API: `api.plamoscale.com` / `api.gunplajunkies.com`
  - Tenant Front 1 (General Scale Modeling): `plamoscale.com` (Resend verified domain: `plamoscale.com`, sender: `noreply@plamoscale.com` / `contacto@plamoscale.com`)
  - Tenant Front 2 (Gunpla, Mecha & Sci-Fi): `gunplajunkies.com` (Resend verified domain: `gunplajunkies.com`, sender: `noreply@gunplajunkies.com` / `hello@gunplajunkies.com`)
  - Future White-Label Tenants: `*.plamoscale.com` or custom CNAME/Resend verified domains
- Notes: Both `plamoscale.com` and `gunplajunkies.com` must be created and verified in Resend.com using Cloudflare DNS records (`DKIM` TXT, `SPF` MX/TXT, and `DMARC` TXT). Legacy Mailchimp audience list (`plamoscale.us14.list-manage.com`, u=`b693c008a9b1b7e4da36d681e`, id=`830f22cd5a`) is also preserved in reference docs.

## Validation Rules

- Cloud, hosting, infrastructure, deployment, and provider CLI work must check this file before selecting a subscription, account, resource group, project, zone, or deployment target.
- If this file conflicts with live CLI state, stop and ask for confirmation before making changes.
