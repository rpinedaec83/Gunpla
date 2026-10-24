# Stack Pattern 03: Azure Functions + Service Bus + Cosmos DB + SWA + Key Vault

Status: Draft template
Owner: Architecture
Last Reviewed: TBD

## Intent
An event-driven serverless pattern for high-scale, decoupled systems where asynchronous processing and independent scaling are top priorities.

## Core Services
- Azure Static Web Apps for frontend hosting
- Azure Functions for command handlers and background workers
- Azure Service Bus for durable messaging and workload buffering
- Azure Cosmos DB for globally distributed, low-latency document storage
- Azure Key Vault for secrets
- Application Insights and Log Analytics for telemetry

## Function Design Rules
Functions remain atomic and single-purpose.
- HTTP functions publish validated commands only
- Service Bus trigger functions process one command type per function
- Keep each consumer focused on one bounded context action

## Reference Flow
1. Client sends request through SWA frontend to an HTTP function.
2. HTTP function validates request and writes command message to Service Bus.
3. Worker function consumes one message type and updates Cosmos DB.
4. Optional projection function writes read models for fast queries.
5. Key Vault and managed identity are used for all secret access.

## Security Baseline
- Managed identity for Functions and service connections
- Service Bus RBAC with least privilege per queue or topic
- Cosmos DB role-based access and network restrictions
- Key Vault references for all sensitive configuration

## Reliability and Operations
- Dead-letter queues and replay procedures
- Idempotent message handling and duplicate detection
- Consumption plan boundary: default 5 minutes, maximum 10 minutes per function execution
- Premium and Dedicated boundary: default 30 minutes, configurable much longer, including unbounded
- HTTP-triggered caveat: avoid synchronous long-running requests, front-end paths can time out after about 230 seconds
- Alerting on queue depth, dead-letter growth, and consumer lag
- Partition key strategy validated against hot partition risk

## Cost Profile
- Strong for spiky, asynchronous workloads
- Cost can grow with high RU consumption and cross-partition queries

## Best Fit
- Workflow automation and integration-heavy systems
- Systems requiring decoupled producers and consumers

## Weak Fit
- Simple CRUD systems without async requirements
- Teams without operational readiness for distributed messaging patterns

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision
