# Stack Pattern 01: Azure Functions + Table Storage + SWA + Key Vault

Status: Draft template
Owner: Architecture
Last Reviewed: TBD

## Intent
A lean Azure serverless web pattern for small to medium workloads. This is a strong default when you want fast delivery, low operations overhead, and pay-for-use compute.

## Core Services
- Azure Static Web Apps for frontend hosting and edge delivery
- Azure Functions for API and backend workflows
- Azure Table Storage for key-value and sparse entity storage
- Azure Key Vault for secrets and connection material
- Application Insights and Log Analytics for telemetry

## Function Design Rules
Functions must be atomic and follow Single Responsibility Principle.
- One trigger per function
- One business responsibility per function
- One outward side effect per function when possible
- Shared logic moved to libraries, keep function entry points thin

## Reference Flow
1. Client calls frontend on Azure Static Web Apps.
2. Frontend calls one Azure Function endpoint per use case.
3. Function performs validation, executes one business action, writes or reads from Table Storage.
4. Function reads secrets only from Key Vault via managed identity.
5. Telemetry is written to Application Insights.

## Security Baseline
- Managed identity for Functions and SWA linked resources
- Key Vault references for all secrets and keys
- Private endpoints where required by compliance
- Least privilege RBAC for storage and observability resources

## Reliability and Operations
- Use retry policies for transient storage errors
- Set clear timeout and poison message behavior for async functions
- Consumption plan boundary: default 5 minutes, maximum 10 minutes per function execution
- Premium and Dedicated boundary: default 30 minutes, configurable much longer, including unbounded
- HTTP-triggered caveat: avoid synchronous long-running requests, front-end paths can time out after about 230 seconds
- Track p95 latency, error rate, and failed dependency calls
- Configure alerts for function failures and storage throttling

## Cost Profile
- Strong for bursty traffic and variable demand
- Storage costs generally low for simple entity workloads
- Watch costs for high transaction volume or chatty query patterns

## Best Fit
- CRUD APIs with moderate complexity
- Event processing with simple projections
- Internal tools and line-of-business web apps

## Weak Fit
- Heavy relational workloads with complex joins
- Long-running workflows that exceed serverless execution windows or require long synchronous HTTP waits

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision
