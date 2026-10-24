---
name: testing-patterns
description: 'Testing standards and smoketest patterns. Use when writing unit tests, integration tests, contract tests, smoketest scripts, mocking external dependencies, or validating devcycle test criteria.'
---

# Testing Patterns

## When to Use

- Implementing test suites for new features or bug fixes during ATLAS devcycles
- Creating or updating post-deployment and post-task smoketest scripts (`scripts/smoketest.ps1`)
- Mocking external cloud dependencies (Azure Tables, SQL, Key Vault, Entra ID)
- Validating API contract compliance against OpenAPI specifications
- Writing automated checks for CI/CD test gates

## Procedure

1. **The ATLAS Test Pyramid:**
   - **Unit Tests:** High coverage, execute in memory, zero network I/O, execute in < 10 seconds. Mock all cloud SDKs and external APIs.
   - **Integration Tests:** Test component boundaries using local emulators (Azurite for storage, Testcontainers for SQL, SWA CLI for auth).
   - **Contract Tests:** Validate API endpoints against the OpenAPI spec in `docs/reference/openapi-starter.yaml` to ensure request/response compliance.
   - **Smoketests:** Lightweight, non-destructive health checks executed post-task and post-deployment.
2. **Implementing Smoketest Scripts:**
   - Every ATLAS project should maintain a standard smoketest script at `scripts/smoketest.ps1`.
   - The script must:
     1. Accept target base URL parameter: `-BaseUrl <url>` (defaulting to local emulator or dev environment).
     2. Ping `/api/v1/health` and assert HTTP 200 with `{ "status": "healthy" }`.
     3. Verify authentication rejection: Request a protected endpoint without credentials and assert HTTP 401 Unauthorized.
     4. Verify a read-only collection endpoint (e.g. `GET /api/v1/items?limit=1`).
     5. Complete execution in under 15 seconds.
     6. Return exit code 0 on success, exit code 1 with error details on failure.
3. **PowerShell Smoketest Template:**
   ```powershell
   [CmdletBinding()]
   param(
       [string]$BaseUrl = 'http://localhost:4280'
   )
   $ErrorActionPreference = 'Stop'
   Write-Host "Running smoketests against: $BaseUrl"

   # Test 1: Health Probe
   $health = Invoke-RestMethod -Uri "$BaseUrl/api/v1/health" -Method Get
   if ($health.status -ne 'healthy') { throw "Health check failed: $($health.status)" }
   Write-Host " [PASS] Health probe OK"

   # Test 2: Auth Boundary
   try {
       $res = Invoke-WebRequest -Uri "$BaseUrl/api/v1/secure-data" -Method Get
       throw "Expected 401 Unauthorized but received $($res.StatusCode)"
   } catch {
       if ($_.Exception.Response.StatusCode -ne 401) { throw "Expected 401, got: $($_.Exception.Message)" }
       Write-Host " [PASS] Auth boundary verified (401 on unauthenticated request)"
   }
   Write-Host "All smoketests passed successfully."
   exit 0
   ```
4. **Mocking and Emulator Guidelines:**
   - For Azure Table Storage: Use Azurite emulator with connection string `UseDevelopmentStorage=true;`.
   - For Entra ID Authentication: In development, mock claims via SWA CLI headers (`x-ms-client-principal`) or mock bearer token validation middleware.
   - Do not connect to shared cloud databases during unit testing.

## Rules

- NEVER mark a devcycle task as complete without confirming smoketest execution passes.
- NEVER use destructive operations (e.g. `DELETE` without recreation, database wipes) in smoketests.
- ALWAYS make test suites independent of execution order; each test must manage its own data setup and teardown.
- ALWAYS test both positive (happy path) and negative (validation errors, unauthorized access, not found) test cases.
