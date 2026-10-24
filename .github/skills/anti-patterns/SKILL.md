---
name: anti-patterns
description: 'Design, testing, security, and AI agent mistakes to avoid. Use when reviewing code, architecture, or test plans to identify silent errors, tight coupling, security leaks, or testing anti-patterns.'
---

# Anti-Patterns

## When to Use

- Conducting code reviews or design reviews during ATLAS devcycles
- Reviewing PRD and ESD documents for CGR governance compliance
- Diagnosing flaky test suites, slow CI pipelines, or production regressions
- Auditing AI-generated code for common hallucination and over-engineering patterns

## Anti-Pattern Catalog

### 1. Error Handling Anti-Patterns
- **The "Swallowed Error":** Catching an exception and doing nothing, or only logging a warning while returning a misleading success response.
  - *Correction:* Either handle the error completely, transform it into an RFC 7807 problem detail response, or let it propagate.
- **The "Exception as Control Flow":** Throwing exceptions for anticipated business conditions (e.g. throwing an error when an email is already registered).
  - *Correction:* Return explicit domain result types (e.g. `Result<T, E>` or `{ success: false, reason: 'AlreadyExists' }`).

### 2. Architecture & Cloud Anti-Patterns
- **The "Cloud-Only Trap":** Writing code that cannot run or execute tests without an active Azure connection.
  - *Correction:* Abstract cloud dependencies behind interfaces and provide local emulator bindings (Azurite, SWA CLI mock auth).
- **The "Unbounded Query":** Querying database collections or Table Storage without a pagination limit (`limit: 20` or `$top=50`).
  - *Correction:* Enforce maximum limits on all query endpoints to prevent memory exhaustion and DoS.
- **The "Sequential ID Exposure":** Exposing database primary keys (`/items/1`, `/items/2`) in public APIs, enabling enumeration attacks.
  - *Correction:* Use UUID v4 or ULID / KSUID for public identifiers.

### 3. Testing Anti-Patterns
- **The "Mocked Subject":** Mocking the very method or class under test, resulting in a test that tests the mock rather than real execution logic.
  - *Correction:* Only mock external boundaries (HTTP clients, file system, database drivers). Never mock internal domain logic.
- **The "Order-Dependent Test":** Tests that pass when run sequentially in a suite but fail when executed in isolation.
  - *Correction:* Each test must generate its own unique fixture data and tear it down independently.
- **The "Manual Smoketest":** Declaring a devcycle task complete based solely on a manual browser click without an automated verification script.
  - *Correction:* Always run an automated script (`scripts/smoketest.ps1`).

### 4. AI Agent Failure Modes
- **The "Over-Engineering Sprawl":** Generating 10 layers of abstraction (factories, adapters, strategy handlers) for a simple 20-line requirement.
  - *Correction:* Follow YAGNI (You Aren't Gonna Need It). Write the simplest clean implementation that satisfies the acceptance criteria.
- **The "Hallucinated Library":** Importing npm or pip packages that are not listed in `package.json` or `requirements.txt`.
  - *Correction:* Always verify package manifests before referencing third-party modules.
- **The "Secret in the Code":** Hardcoding connection strings, API tokens, or tenant secrets in code files or commits.
  - *Correction:* Strictly adhere to `secrets.md` for local notes and Azure Key Vault with Managed Identity for cloud environments.

## Rules

- NEVER commit empty catch blocks or catch blocks with only `// TODO: handle`.
- NEVER write public collection endpoints without pagination limits.
- NEVER permit tests that depend on state left by preceding tests.
- REJECT code that creates unnecessary architectural complexity beyond the current requirements.
