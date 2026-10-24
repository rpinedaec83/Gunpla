# Stack Pattern Templates

This folder contains editable Azure architecture templates. Each template is a starting point, not a mandatory final design.

## What these templates are for
Use these templates to accelerate architecture selection and keep design reviews consistent. They help teams evaluate fit, risks, and tradeoffs before implementation.

## Azure Functions timeout boundaries
Use this quick reference when selecting or reviewing function-based patterns:
- Consumption plan: default timeout 5 minutes, maximum 10 minutes per execution.
- Premium and Dedicated plans: default timeout 30 minutes, configurable much longer, including unbounded.
- HTTP-triggered caveat: long synchronous requests can still fail at the front end after about 230 seconds. Use async patterns for long jobs.

## Template catalog
- [sp-01-functions-tables-swa-keyvault.md](sp-01-functions-tables-swa-keyvault.md)
	- Default serverless web pattern.
	- Uses Azure Functions, Azure Table Storage, Azure Static Web Apps, and Key Vault.
	- Emphasizes atomic function design and Single Responsibility Principle.

- [sp-02-functions-tables-sqlserverless-swa-keyvault.md](sp-02-functions-tables-sqlserverless-swa-keyvault.md)
	- Hybrid data pattern for teams that need both key-value and relational storage.
	- Adds Azure SQL Database serverless while retaining Table Storage.
	- Good step-up path from simple serverless data models.

- [sp-03-functions-servicebus-cosmos-swa-keyvault.md](sp-03-functions-servicebus-cosmos-swa-keyvault.md)
	- Event-driven serverless pattern for asynchronous processing and decoupled services.
	- Uses Service Bus and Cosmos DB for scale-out workflow handling.
	- Best when queue-based resiliency and independent scaling are needed.

- [sp-04-appservice-sql-redis-frontdoor-keyvault.md](sp-04-appservice-sql-redis-frontdoor-keyvault.md)
	- Managed PaaS web application pattern for predictable traffic and relational workloads.
	- Uses App Service, Azure SQL, Redis, and Front Door.
	- Best when stable latency and stronger relational modeling are priorities.

- [sp-05-functions-swa-keyvault-egressproxy.md](sp-05-functions-swa-keyvault-egressproxy.md)
	- Lean serverless API pattern for third-party provider aggregation with fixed egress IP.
	- Uses Azure Functions (Consumption), SWA, Key Vault, and a dedicated forward proxy VM.
	- Best when calling external partners requiring IP whitelisting without paying for Premium plans.

## Standard workflow
1. Pick the closest template.
2. Copy and adapt it for your project requirements.
3. Keep section structure intact so reviews stay comparable.
4. Capture assumptions, constraints, and tradeoffs in the template.
5. Record review outcomes in the template Review History section.
6. Promote approved outcomes into `patterns/stack-patterns/active-stack-pattern.md`.

## How to modify a template safely
- Keep architecture decisions explicit, avoid vague phrases like "standard setup".
- Call out why each service choice exists, not only what was chosen.
- Note fit boundaries, include when the pattern should not be used.
- Keep security, reliability, and cost sections updated when service choices change.
- Do not put environment-specific secrets, tenant identifiers, or credentials in templates.

## Minimum review checklist
- Confirm business fit and expected scale profile.
- Confirm data boundaries, retention, and access patterns.
- Confirm security controls, identity model, and secret handling.
- Confirm reliability targets, observability signals, and operational ownership.
- Confirm cost expectations and known cost risks.
- Confirm serverless timeout boundaries and whether long-running work is asynchronous.

## Definition of done for pattern adoption
A pattern is adoption-ready when:
- service selections and boundaries are explicit
- non-functional expectations are documented
- known risks and mitigations are documented
- review history includes reviewer, notes, and decision
- approved decisions are reflected in `patterns/stack-patterns/active-stack-pattern.md`
