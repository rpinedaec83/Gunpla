# Skill Catalog

This folder stores reusable agent skills for atlas_ai workflows.

## Included Skills
- `anti-patterns` -- Common architectural, testing, security, and AI agent failure modes to avoid.
- `api-design` -- Contract-first REST API design, OpenAPI 3.1, and RFC 7807 Problem Details.
- `azure-deploy` -- Azure CLI deployment for Functions, Static Web Apps, and resources.
- `code-style` -- Multi-language standards for TypeScript, JavaScript, Python, C#, and PowerShell.
- `devcycle-management` -- CU budgeting, devcycle execution, and stage tracking.
- `git-workflow` -- Git conventions, task-level commits, and branching patterns.
- `model-tier-advisor` -- Token-aware model routing and context management.
- `powershell-style` -- Idiomatic, cross-platform PowerShell 5.1/7 standards.
- `project-setup` -- Project bootstrapping and setup procedures.
- `requirements-writing` -- Domain-expert MRD, PRD, and ESD authoring with CGR traceability.
- `security-patterns` -- NIST CSF 2.0 implementation, secret hygiene, and OWASP defenses.
- `testing-patterns` -- Smoketest patterns, unit/integration testing, and mock verification.
- `example-skill` -- Reference template for authoring new skills.

## Skill Authoring
- Follow `.github/FRONTMATTER-SCHEMA.md`.
- Keep `name` aligned with folder naming conventions.
- Keep `description` keyword-rich for better discovery.
- Keep detailed references in subfolders when SKILL.md grows large.

## Invocation Guidance
- Use skills for repeatable, domain-specific procedures.
- Use direct edits for one-off changes where no specialized workflow is needed.
