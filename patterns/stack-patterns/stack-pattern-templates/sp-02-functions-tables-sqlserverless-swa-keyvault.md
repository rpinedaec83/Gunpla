# Stack Pattern 02: Azure Functions + Table Storage + Azure SQL Serverless + SWA + Key Vault

Status: Draft template
Owner: Architecture
Last Reviewed: TBD

## Intent
This pattern extends the serverless baseline by adding Azure SQL Database serverless for relational data needs while keeping Table Storage for high-scale key-value workloads.

## Core Services
- Azure Static Web Apps for frontend hosting
- Azure Functions for API and background processing
- Azure Table Storage for sparse entities and high-throughput key-value access
- Azure SQL Database serverless for relational data and reporting joins
- Azure Key Vault for secrets and certificates
- Application Insights and Log Analytics for telemetry

## Function Design Rules
Functions must be atomic and follow Single Responsibility Principle.
- One trigger, one responsibility
- Keep handlers thin, move business logic into testable services
- Isolate SQL and Table data access behind explicit repositories
- Keep transactions scoped and explicit

## Data Split Guidance
Use Table Storage for:
- High-volume lookups by partition and row key
- Simple entity state and event snapshots

Use Azure SQL serverless for:
- Relational integrity and complex query needs
- Reporting views and transactional business records

## Reference Flow
1. Client calls SWA frontend.
2. Frontend calls Azure Function endpoint.
3. Function executes one use case and routes persistence to Table Storage, SQL serverless, or both.
4. Function reads credentials from Key Vault using managed identity.
5. Metrics and traces go to Application Insights.

## Security Baseline
- Managed identity for all compute components
- Key Vault secret retrieval, no secrets in code or config files
- SQL firewall, private endpoints, and least privilege SQL roles
- Storage RBAC with scoped assignments

## Reliability and Operations
- Add idempotency keys for write endpoints
- Add retry and circuit breaker strategy for SQL and storage dependencies
- Consumption plan boundary: default 5 minutes, maximum 10 minutes per function execution
- Premium and Dedicated boundary: default 30 minutes, configurable much longer, including unbounded
- HTTP-triggered caveat: avoid synchronous long-running requests, front-end paths can time out after about 230 seconds
- Monitor SQL auto-pause and resume behavior for latency-sensitive paths
- Alert on DTU or vCore usage, function failures, and storage throttling

## Cost Profile
- Good for mixed workloads that need relational features without always-on SQL spend
- Watch cold-resume latency for SQL serverless in low-traffic periods

## Best Fit
- Apps with both operational key-value access and relational reporting
- Teams that need to evolve from simple storage to relational capabilities

## Weak Fit
- Strict sub-second latency requirements after idle periods
- Very high sustained relational throughput where provisioned SQL may be better

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision
