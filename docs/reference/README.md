# Reference Docs

Use this folder for user-supplied project source material that helps atlas_ai set up planning, devcycles, and CGR.

Examples:
- old MRDs, PRDs, ESDs, specifications, or design notes
- marketing material, website copy, sales notes, or user research
- service integration notes, operating context, or external constraints
- local setup instructions or CI/CD notes from the user project
- incident follow-up material that should inform future scope

Use top-level `patterns/` for reusable stack and UX baseline definitions.
Use `patterns/stack-patterns/active-stack-pattern.md` for stack baseline posture, including API-first mode when a stack pattern is selected.

For comprehensive system architecture and user guides, refer to `docs/manuals/` (`technical-manual.md` and `user-manual.md`).

Included guides and request templates:
- `azure-resource-request-template.md` -- official corporate IT cloud resource provisioning request and live cost estimation form (FinOps) for Microsoft Azure.
- `secret-handover-ceremony.md` -- standardized secret handover, exchange ceremony, integrity checking, and rotation lifecycle protocol.
- `local-development-guide.md` -- zero-cost offline local development guide with SWA CLI, Entra ID mock auth, and Azurite.
- `operations-runbook.md` -- production resilience, monitoring, secret rotation, backups, and disaster recovery runbook.
- `openapi-starter.yaml` -- starter OpenAPI 3.1 contract specification conforming to API-First and RFC 7807 problem details.
- `nist-csf-2-guide.md` -- NIST Cybersecurity Framework 2.0 compliance guide mapped to ATLAS devcycle and CGR gates.
- `tokenusage.md` -- token budgeting and context management guide for LLM-assisted workflows.
- `codemanagement.md` -- source code branching, testing, and lifecycle standards.

Keep this folder user-reference oriented. Avoid storing reusable pattern baselines or atlas_ai baseline policy files here.