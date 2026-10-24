# Stack Pattern 04: App Service + Azure SQL + Redis + Front Door + Key Vault

Status: Draft template
Owner: Architecture
Last Reviewed: TBD

## Intent
A managed PaaS web application pattern for predictable web workloads that need strong relational data support and low-latency caching.

## Core Services
- Azure Front Door for global routing, TLS termination, and edge caching
- Azure App Service for web API and backend hosting
- Azure SQL Database for relational persistence
- Azure Cache for Redis for low-latency read caching and session support
- Azure Key Vault for secrets and certificates
- Application Insights and Log Analytics for telemetry

## Reference Flow
1. Client connects through Azure Front Door.
2. Front Door routes traffic to App Service.
3. App Service reads and writes relational data in Azure SQL.
4. Hot reads and session data use Redis cache.
5. Secrets and certificates are sourced from Key Vault.

## Security Baseline
- Managed identity for App Service
- Key Vault for all secret and certificate material
- Private access to SQL and Redis where required
- Web Application Firewall policy in Front Door

## Reliability and Operations
- Multi-region Front Door origin strategy where required
- App Service autoscale with health checks
- SQL backup and point-in-time restore validation
- Cache failover and cache invalidation strategy documented

## Cost Profile
- Predictable for steady traffic profiles
- Higher baseline cost than pure serverless patterns

## Best Fit
- Customer-facing line-of-business portals
- API backends with strong relational data models

## Weak Fit
- Highly bursty workloads that benefit more from full serverless compute
- Teams that require deep infrastructure-level customization beyond PaaS limits

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision
