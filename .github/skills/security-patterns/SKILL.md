---
name: security-patterns
description: 'Security standards and governance practices. Use when implementing authentication, secret handling, input sanitization, threat modeling, NIST CSF 2.0 compliance, or reviewing code for OWASP vulnerabilities.'
---

# Security Patterns

## When to Use

- Implementing or reviewing authentication and authorization flows (Entra ID, OIDC, SSO, RBAC)
- Handling sensitive data, credentials, connection strings, or encryption
- Conducting security reviews for CGR Rule 9 (Security and Threat Modeling)
- Applying NIST CSF 2.0 principles to architecture and code
- Mitigating OWASP Top 10 web vulnerabilities and OWASP Top 10 for LLM applications

## Procedure

1. **NIST CSF 2.0 Alignment:**
   - **Govern (GV):** Enforce zero-trust architecture. Ensure `accounts.md` defines deployment targets without credentials.
   - **Identify (ID):** Classify data sensitivity (Public, Internal, Confidential, Restricted). Maintain software bill of materials (SBOM) and audit dependencies.
   - **Protect (PR):**
     - Identity & Access (PR.AC): Use Managed Identities for service-to-service communication. Never use shared API keys between Azure components.
     - Data Security (PR.DS): Enforce TLS 1.2+ in transit. Use Transparent Data Encryption (TDE) for databases.
     - Secret Management: Use Azure Key Vault in cloud environments. For local secret notes, use `secrets.md` at repo root only.
   - **Detect (DE):** Configure Application Insights telemetry and Log Analytics alerts for anomalous spikes in 401/403 errors or high data egress.
   - **Respond (RS) & Recover (RC):** Follow the emergency revocation process in `docs/reference/secret-handover-ceremony.md` if any secret is compromised.
2. **Defensive Coding Checkpoints:**
   - **SQL Injection Prevention:** ALWAYS use parameterized queries or ORM abstractions. Never concatenate user strings into SQL or Table queries.
   - **Cross-Site Scripting (XSS):** Sanitize user inputs and rely on modern UI frameworks (React, Vue, Angular) that escape outputs by default. Set Content-Security-Policy (CSP) headers in `staticwebapp.config.json`.
   - **Cross-Origin Resource Sharing (CORS):** Explicitly whitelist allowed origins. Never use `Access-Control-Allow-Origin: *` with credentials enabled.
3. **OWASP for LLM and Agentic Systems:**
   - **Prompt Injection:** Treat all user inputs as untrusted data. Delimit system instructions and user inputs clearly.
   - **Excessive Agency:** Restrict AI tools to the minimum necessary actions. Always require explicit human authorization before executing irreversible or destructive operations.
   - **Sensitive Information Disclosure:** Filter LLM prompts and responses to prevent leaking PII, system prompts, or internal infrastructure details.

## Rules

- NEVER commit credentials, private keys, connection strings, or tokens to git.
- NEVER put secrets in `accounts.md` or CI/CD configuration files; use provider secret stores or GitHub Secrets.
- ALWAYS use `secrets.md` at repository root for local secret notes only, and ensure it remains untracked in `.gitignore`.
- ALWAYS validate and sanitize all external inputs on the server side; client-side validation is for UX only.
- ALWAYS assign the least privilege role required (e.g. `Key Vault Secrets User` instead of `Key Vault Administrator`).
- ALWAYS follow the secret handover ceremony in `docs/reference/secret-handover-ceremony.md` for credential exchanges.
