---
name: api-design
description: 'Contract-first REST API design. Use when defining, reviewing, or implementing HTTP endpoints, OpenAPI specifications, RFC 7807 problem details, status codes, pagination, and API versioning.'
---

# API Design

## When to Use

- Designing new REST endpoints or modifying existing API routes
- Creating or updating OpenAPI / Swagger 3.x contract specifications
- Defining error response schemas and status codes
- Implementing pagination, filtering, sorting, or idempotency keys
- Reviewing API changes for breaking change prevention and backward compatibility
- Working in projects with ATLAS `API-First: Enabled` mode

## Procedure

1. **Contract Before Code (Contract-First):**
   - Define or update the OpenAPI contract in `docs/reference/openapi-starter.yaml` or project API specification before writing backend handlers.
   - Align query parameters, request bodies, and response schemas with domain entities.
2. **Resource Naming and URI Hierarchy:**
   - Use plural nouns for resource collections: `/api/v1/workspaces`, `/api/v1/projects`.
   - Use lowercase kebab-case for multi-word paths: `/api/v1/service-accounts`.
   - Nest resources only when representing true hierarchical ownership: `/api/v1/workspaces/{workspaceId}/projects`.
   - Do not exceed 2 levels of nesting; use query filters for flat lookups: `/api/v1/tasks?projectId={projectId}`.
3. **HTTP Methods and Status Codes:**
   - `GET`: Retrieve resource or collection (200 OK). Safe and idempotent.
   - `POST`: Create resource or execute non-idempotent operation (201 Created with `Location` header, or 200/202).
   - `PUT`: Full replace of resource (200 OK or 204 No Content). Idempotent.
   - `PATCH`: Partial update (200 OK or 204 No Content).
   - `DELETE`: Remove resource (204 No Content or 200 OK). Idempotent.
4. **Standard Error Format (RFC 7807 Problem Details):**
   - All 4xx and 5xx responses must return `Content-Type: application/problem+json`.
   - Include: `type` (URI), `title` (short summary), `status` (HTTP status code), `detail` (human-readable explanation), `instance` (request URI), and optional `invalidParams` list for validation errors.
5. **Pagination and Collection Filtering:**
   - Standard query parameters:
     - `limit`: Maximum items per page (default: 20, max: 100).
     - `cursor`: Opaque token for cursor-based pagination (recommended for real-time or large datasets).
     - `offset`: Zero-based item offset (acceptable for small administrative tables).
   - Return envelope:
     ```json
     {
       "items": [...],
       "nextCursor": "eyJpZCI6MTA0fQ==",
       "hasMore": true,
       "totalCount": 150
     }
     ```
6. **Idempotency for Mutations:**
   - Support `Idempotency-Key: <uuid-v4>` on critical `POST` operations (payments, provisioning, state transitions).
   - Cache results for 24 hours to return the identical response on duplicate submissions.

## Rules

- NEVER use verbs in resource paths (e.g. use `POST /api/v1/orders` not `POST /api/v1/createOrder`).
- ALWAYS prefix API routes with an explicit version: `/api/v1/`.
- NEVER introduce breaking changes (removing fields, changing types, adding mandatory query params) on an existing version; bump version to `/v2/` if breaking change is unavoidable.
- ALWAYS return RFC 7807 `application/problem+json` for error responses.
- ALWAYS validate incoming request payloads against the OpenAPI schema before business logic executes.
- Ensure all datetime fields use ISO 8601 UTC format: `YYYY-MM-DDTHH:MM:SSZ`.
