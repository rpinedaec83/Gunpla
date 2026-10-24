---
name: "Compliance And Governance Review"
description: "Use when running CGR against live MRD, PRD, and ESD artifacts under docs/cgr, or bootstrapping those artifacts from project source files."
argument-hint: "Optional project name, stage gate, scope, or review constraints"
agent: "agent"
---

# Prompt: Compliance And Governance Review

## Contents

- [How to Use](#how-to-use)
- [External Source Policy](#external-source-policy)
- [Discovery And Evidence Standard](#discovery-and-evidence-standard)
- [Product Release Stages](#product-release-stages)
- [Instructions](#instructions)
- [Base Rules (Evaluation Criteria)](#base-rules-evaluation-criteria)
- [MRD Evaluation](#mrd-evaluation-applies-to-mrd_md-files)
- [PRD Evaluation](#prd-evaluation-applies-to-prd_md-files)
- [ESD Evaluation](#esd-evaluation-applies-to-esd_md-files)
- [Required Output Format](#required-output-format)

---

## How to Use

Run this prompt and ask the agent to review the live project documents in `docs/cgr/` and save the governance review to `docs/cgr/CGR-results.md`.

Chat shortcut: in AI chat, type `CGR` or say `run CGR` to run this workflow.

The LLM will scan live MRD, PRD, and ESD artifacts in `docs/cgr/`, ignore starter templates and housekeeping files during evaluation, perform post-review template cleanup, and produce a single results file.

If `docs/cgr/` or live MRD, PRD, and ESD artifacts do not exist yet, the workflow creates `docs/cgr/`, bootstraps draft governance docs from `seed.md`, `docs/reference/`, and relevant source files already in the project, then runs CGR. Source files may include marketing copy, website text, product notes, sales material, specifications, discovery notes, or other user-provided project context. `seed.md` may be minimal freeform input, including a single sentence.

If live MRD, PRD, or ESD artifacts already exist, the workflow uses them as the base and improves them using current user instructions plus any new material found in `seed.md`, `docs/reference/`, or relevant project source files.

This prompt can be run from the Atlas_AI source kit against a new project folder that has not installed Atlas yet. In that case, treat the currently open project folder as the target project root, use the Atlas_AI source kit only as the prompt and template source, and write new governance artifacts into the target project's `docs/cgr/` directory.

---

## External Source Policy

Use external sources to improve structure and quality where project files are incomplete, and to add market and competitive awareness when generating or improving MRD and PRD artifacts.

Priority order:
1. Project source materials in the target repository.
2. Atlas process and CGR rules in this repository.
3. Public market, competitor, and product references discovered during the CGR run.
4. Approved external references listed below.

Approved external references for this prompt:
- IETF RFC 2119 and RFC 8174 for clear requirement language and explicit requirement levels.
- NIST Cybersecurity Framework 2.0 (CSF 2.0) functions (Govern, Identify, Protect, Detect, Respond, Recover) for security risk governance, identity protection, and incident defense.
- NIST SP 800-160 concepts for engineering rigor, trustworthiness, and lifecycle-driven requirements.
- Cloud well-architected frameworks (Azure, AWS, Google Cloud) for non-functional architecture, operations, reliability, security, and cost tradeoffs.
- ProductPlan, ProdPad, Aha, Atlassian, and Jama Software references for MRD and PRD structure, market analysis, competitive awareness, requirement quality, acceptance criteria, and traceability.
- Public competitor websites, pricing pages, docs, changelogs, marketplaces, review sites, analyst summaries, and standards pages that are directly relevant to the target market.

When external material is used:
- Record source names or URLs, access date, and what claim or structure was used.
- Assign source confidence as High, Medium, or Low.
- Mark public market claims as external evidence, not confirmed project facts.
- Prefer normative language (`MUST`, `SHOULD`, `MAY`) only when the requirement is truly enforceable in the target project context.
- Mark externally derived assumptions clearly.
- Do not replace project facts with generic external guidance.
- Record source names or URLs in `External Source Notes`.

---

## Discovery And Evidence Standard

Before authoring, improving, or evaluating MRD and PRD artifacts, build an evidence set.

1. Read project source materials first.
2. If network access is available, perform external market and competitor research for the target product category.
3. If network access is unavailable or blocked, continue with repo-only evidence and record that limitation in `External Source Notes`.
4. Separate every important claim into one of these evidence grades:
   - `Source Fact` -- directly supported by project files.
   - `Project Inference` -- reasoned from project files, marked with `[DRAFT INFERENCE]` and a basis note.
   - `External Best Practice` -- supported by public references, marked with source and access date.
   - `Owner Required` -- cannot be determined by the agent, such as named owners, signed approvals, contract terms, pricing decisions, vendor commitments, customer commitments, or confirmed scope decisions.
5. Record research inputs in `docs/cgr/seed-to-docs-mapping.md` during Bootstrap mode.
6. Prefer concise, decision-useful research over long copied excerpts. Summarize sources in original words.
7. Never invent approvals, owners, pricing, contracts, vendor support terms, customer commitments, revenue claims, or production readiness claims.

---

## Product Release Stages

If the project uses `docs/cgr/PS.md`, see that file for full stage definitions, gate criteria, exit criteria, and ownership model. CGR does not require PS -- it can run standalone against any set of MRD, PRD, and ESD documents.

When used with PS, the CGR is designed to run at two points in the product lifecycle:

| Stage | When CGR Runs | Purpose |
|---|---|---|
| **EVT -> DVT gate** | After core build, before pilot | Identify governance gaps. ESD should exist by now. |
| **DVT -> PVT gate** | After pilot, before go-live | Confirm all gaps are closed. Final gate to production. |

For quick reference:
- **EVT** -- Build and prove the concept. MRD + PRD required to enter. ESD drafted during EVT.
- **DVT** -- Pilot with real users, security review, close governance gaps. ESD + CGR required to enter.
- **PVT** -- Operational handoff, rollback test, go-live approval. Clean CGR required to enter.

When used without PS, the CGR simply evaluates whatever live MRD, PRD, and ESD artifacts exist in `docs/cgr/` against the governance rules below.

---

## Instructions

You are reviewing the live solution documents for this repository for governance completeness.

1. Select the target project root.
   - If the current repository contains `.github/copilot-instructions.md`, `ATLAS.md`, and `docs/`, treat that directory as the repository control root.
   - If this prompt is being used from the Atlas_AI source kit against a separate new project, treat the currently open target project folder as the project root even if it has no Atlas files yet.
   - If neither is clear and exactly one child directory contains `docs/cgr/`, use that child as the effective project root for this review. If multiple child directories qualify, stop and ask the user which one to use.
2. Use `docs/cgr/` under the selected project root as the authoritative location for MRD, PRD, ESD, and CGR artifacts. If it does not exist in Bootstrap mode, create it.
3. If the runnable application lives in a child directory one level down, keep the review output in the selected `docs/cgr/` directory instead of placing it inside the nested application folder.
4. In a new project that has no Atlas files yet, do not require a full Atlas install before CGR. Create only the governance output folders and files needed for this workflow unless the user also asks for `newproject`.
5. Read source materials used for authoring and improvement:
   - `seed.md` at repo root, if present. Treat it as freeform input, not a required template.
   - relevant markdown files under `docs/reference/`, if present.
   - relevant source files already in the project root or obvious source-material folders, including marketing copy, website content, product notes, sales notes, pitch decks converted to text or markdown, specifications, discovery notes, customer notes, README files, and other text-readable project context.
   - any raw MRD, PRD, or ESD-like artifacts found in `docs/reference/` that can be refactored into `docs/cgr/`.
   - `accounts.md` at repo root, if present, for non-secret cloud account and deployment destination context.
   - for local secrets, check `secrets.md` at repo root if needed, and do not place secrets in governance artifacts.
   - `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md`, if present, for cross-document mapping.
   - Skip `.git`, dependency folders, build output, binaries that cannot be read usefully, secrets, credentials, keys, tokens, and local environment files.
6. Determine workflow mode:
   - Bootstrap mode: no live MRD, PRD, or ESD exists in `docs/cgr/`.
   - Improve mode: one or more live MRD, PRD, or ESD artifacts already exist in `docs/cgr/`.
7. Build the discovery and evidence set before authoring or improving artifacts:
   - Create a concise market research summary for MRD use, including product category, target segments, buyer and user personas, market size assumptions, adoption barriers, and business value signals.
   - Create a concise competitive analysis summary for MRD and PRD use, including direct competitors, adjacent alternatives, current workarounds, key differentiators, switching costs, pricing or monetization signals when public, and known gaps.
   - Create a PRD engineering-readiness summary, including feature behavior, requirement IDs, acceptance criteria, non-functional requirements, data or API needs, instrumentation, dependencies, rollout constraints, supportability, and open ESD inputs.
   - Use public research when network access is available. If not available, record the limitation and continue with repo-only evidence.
   - Do not use external research to claim confirmed customer demand, approved pricing, signed approvals, vendor commitments, or contracted support terms.
8. In Bootstrap mode, generate best-practice draft artifacts in `docs/cgr/` before running evaluation:
   - Prefer existing naming conventions if obvious.
   - If naming is unknown, create draft files as:
     - `MRD_<PROJECT>_v0-draft.md`
     - `PRD_<PROJECT>_v0-draft.md`
     - `ESD_<PROJECT>_v0-draft.md`
   - Use `seed.md`, `docs/reference/`, relevant project source files, and template structure when present.
   - Prefer source evidence from the user's project files over external assumptions. If core marketing or product structure is missing from repository sources, augment with approved external references from `External Source Policy` and clearly mark externally-derived assumptions.
   - Actively answer every section. Do not leave a section as `TBD` if a substantive draft answer can be reasoned from:
     - the source documents,
     - the domain implied by the project name, vendor, or industry,
     - approved external references in `External Source Policy`.
   - When you infer content, mark the proposed answer with `[DRAFT INFERENCE]` and a one-line basis note.
   - Reserve `TBD` only for facts that can only come from the project owner, such as named owners, signed approvals, contract terms, or confirmed scope decisions.
   - The bootstrap goal is a usable v0 draft that a reviewer can correct, not a placeholder skeleton.
   - Update `docs/cgr/seed-to-docs-mapping.md` with source-to-section coverage for MRD, PRD, and ESD. This mapping is required in Bootstrap mode.
   - Create or update `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md` when enough source evidence exists to map market needs to PRD requirement IDs and ESD design inputs.
9. In Improve mode, treat existing MRD, PRD, and ESD artifacts as the base and improve them using:
   - current user instructions in chat,
   - new or changed materials in `docs/reference/`,
   - relevant new or changed project source files,
   - updates from `seed.md` when relevant,
   - external market and competitor research when available.
10. Read every live project `.md` file in the selected `docs/cgr/` directory, except `README.md`, any results file, and any `*_TEMPLATE.md` file unless the user explicitly asks to review templates.
11. Ignore `README.md` and any `*_TEMPLATE.md` file unless the user explicitly asks to review the template itself.
12. Classify each live artifact by type based on its filename prefix: MRD, PRD, or ESD.
13. Determine the current stage based on which live documents exist:
   - MRD + PRD only (no ESD) = project is in EVT
   - MRD + PRD + ESD = project is at DVT gate or beyond
14. Evaluate each live document against the applicable rules for its type (see sections below).
15. Enforce completeness before assigning status:
   - Do not assign `Compliant` for a rule if any required field for that rule remains `TBD` or unresolved.
   - If a required field is unresolved but has partial evidence, assign `Partially`.
   - If required evidence is absent, assign `Missing`.
16. Run cross-document consistency checks:
   - MRD problem statements and success criteria must align with PRD goals and acceptance criteria.
   - MRD market evidence, customer needs, competitive gaps, and differentiation must map to PRD goals, requirement IDs, and acceptance criteria.
   - PRD functional requirements, non-functional requirements, constraints, instrumentation, and acceptance criteria must map to ESD architecture, APIs, data model, pilot, validation plan, monitoring, rollback, and operational controls.
   - ESD pilot and operational plan must be capable of validating PRD acceptance criteria.
17. In the Executive Summary, state which stage the project appears to be in and what's needed to advance.
18. Before writing results, detect whether this is the first CGR run by checking whether `docs/cgr/CGR-results.md` already exists under the selected project root.
19. Produce a single results file: `docs/cgr/CGR-results.md` under the selected project root.
20. After the review:
   - If this is the first CGR run, remove `docs/cgr/MRD_TEMPLATE.md` and `docs/cgr/PRD_TEMPLATE.md` if they are still present.
   - If a live ESD artifact exists and `docs/cgr/ESD_TEMPLATE.md` is still present, remove it as post-review cleanup.
   - If operating read-only, call out each stale template explicitly instead of deleting it.

---

## Base Rules (Evaluation Criteria)

### Rule 1 -- MRD and PRD Required
Every solution must have an MRD and a PRD. The MRD and PRD may include or reference the artifacts produced by this process.

### Rule 2 -- Vendor Selection
Any new vendor must have a written selection process that includes rationale, comparable alternatives, impact on existing products, and approval by the required business and finance owners. Executive approval and escalation expectations must be defined.

### Rule 3 -- Supportability
The organization must be able to support the solution without tribal knowledge. Every solution must have an SOP, with monitoring and deployment standards that the delivery and operations teams can execute.

### Rule 4 -- Monitoring and Deployment Standards
Use the organization's standard monitoring and deployment tooling. If standard tooling is not used, document the exception and the approved alternate approach.

### Rule 5 -- No Masking Platform Constraints
Do not deploy solutions that hide platform constraints. If buffering, tunneling, caching, or stabilizers are used, confirm they are not masking overload, capacity gaps, or weak infrastructure.

### Rule 6 -- Named Ownership (Progressive)
Ownership grows with the project stage. At minimum: Product Owner before EVT. Product Owner plus Business or Commercial Owner for EVT. IT or Platform Owner added at DVT. All required roles filled by PVT. If ownership for the current stage is unclear, the project does not advance to the next gate.

### Rule 7 -- Rollback Plan
Any solution that touches production must have a rollback plan and a defined go-back condition. If rollback is not possible, document why and get explicit approval.

### Rule 8 -- Gate Approvals and Escalation
Each stage gate requires approval from designated signers. EVT start: Executive Sponsor, Product Owner, Business or Commercial Owner. DVT gate: EVT signers plus IT or Platform Owner and Security or Compliance. PVT gate: all required delivery and control functions. If the organization cannot block a risky go-live or enforce remediation, document the gap before proceeding.

### Rule 9 -- Security Review
Every solution must be reviewed by the appropriate security or compliance function before production. The review must confirm basic security controls are in place, including admin access, MFA where applicable, credential handling, logging and retention, and vendor security posture. If no security review has occurred, the solution does not proceed.

### Rule 10 -- Pilot Before Rollout
Any solution must be tested in a small pilot with objective acceptance criteria before broad rollout. If a pilot is skipped, document why and obtain approval.

### Rule 11 -- Operational Handoff
Any solution must have an operational handoff to the responsible operations or support team before go-live, including a support playbook. If the designated support function cannot support it, it cannot be put into production.

### Rule 12 -- Capacity Planning
Any solution must have a simple capacity assumption written down and verified against reality. If the expected load is unknown, the solution is not ready for production.

### Rule 13 -- Vendor Support Agreement
Any vendor-dependent solution must have a support and escalation agreement defined, including response expectations and how the organization reaches engineering when needed.

### Rule 14 -- No Manual One-Offs
Any solution must avoid one-off manual configuration in production. If manual steps are required, document them in the SOP and convert them to automation as soon as possible.

### Rule 15 -- Post Go-Live Review
Any solution must have a post go-live review within 7 days to confirm stability, ticket volume, and monitoring effectiveness, and to identify platform remediation if needed.

### Rule 16 -- Customer-Hosted Infrastructure
Any solution that requires customer-hosted infrastructure must have a written responsibility matrix accepted by the customer. If the customer will not accept operational responsibility, the provider must offer an approved alternative or the solution does not proceed.

### Rule 17 -- Cross-Document Consistency
MRD, PRD, and ESD must remain internally consistent. Market problems and success criteria in MRD must be reflected in PRD goals and acceptance criteria. PRD requirements must be implementable and testable through ESD architecture, API contracts, pilot criteria, and operational controls.

---

## MRD Evaluation (applies to MRD_*.md files)

An MRD defines the market problem, users, and business justification. It is not an implementation document, so operational rules are evaluated for awareness, not full compliance.

An MRD that passes quality review should be market-aware, evidence-backed, and useful to a Product Owner deciding whether the opportunity is worth pursuing. It must explain the market, customer need, competitive context, differentiation, and measurable business value before the PRD translates that intent into product behavior.

### Expected MRD Sections

If any section is missing or only contains placeholders, flag it in the compliance table or quality findings.

| Section | What it must contain |
|---|---|
| Market Research And Evidence | Source facts, external research, access dates, source confidence, and project inferences |
| Market Category And Opportunity | Product category, target market, market timing, and opportunity summary |
| Target Segments | Buyer segments, user segments, adoption context, and segment priority |
| Personas And Stakeholders | Buyer, user, administrator, approver, and affected internal roles |
| Problem Statement | Clear problem, affected audience, current failure mode, and measurable impact |
| Current Alternatives | Existing tools, manual workarounds, competitor products, and adjacent substitutes |
| Competitive Analysis | Competitor matrix with strengths, weaknesses, pricing signals, integration posture, and source notes |
| Differentiation And Positioning | Why this solution should win, how it compares, and what is intentionally not differentiated |
| Market Sizing Or Demand Proxy | TAM/SAM/SOM or lightweight demand proxy with assumptions and confidence |
| Business Model Or Value Hypothesis | Pricing, monetization, cost reduction, risk reduction, or strategic value assumptions |
| Success Metrics | Market, adoption, revenue, efficiency, quality, risk, or customer outcome metrics |
| Risks And Adoption Barriers | Switching costs, procurement, trust, data, workflow, regulatory, integration, or support risks |
| Dependencies And Constraints | Vendor, platform, customer, operational, data, security, and capacity constraints |
| Ownership And Approvals | Product Owner, Executive Sponsor, Business or Commercial Owner, and gate status |

**Primary rules (must be addressed in the MRD):**

| Rule | What to look for in an MRD |
|---|---|
| 1 -- MRD and PRD Required | Does this MRD exist? Does it reference or link to a PRD? |
| 2 -- Vendor Selection | If a vendor/platform is identified, is the selection rationale documented? Alternatives considered? |
| 6 -- Named Ownership | Is a Product Owner identified? (MRD stage only requires Product Owner) |
| 8 -- Gate Approvals | Are EVT gate signers identified? (Executive Sponsor, Product Owner, Business or Commercial Owner) |

**Awareness rules (should be acknowledged, detailed in PRD/ESD):**

| Rule | What to look for in an MRD |
|---|---|
| 5 -- No Masking Constraints | Does the MRD acknowledge platform constraints or risks? |
| 12 -- Capacity Planning | Are high-level capacity assumptions stated (user count, volume)? |
| 13 -- Vendor Support | If vendor-dependent, is vendor relationship mentioned? |
| 16 -- Customer Infrastructure | If customer-hosted, is it flagged as a dependency? |

**Not applicable to MRD (addressed in PRD or ESD):**
Rules 3, 4, 7, 9, 10, 11, 14, 15

**MRD quality findings must call out:**
- Missing or weak market research.
- Missing competitor or alternative-solution analysis.
- Missing differentiation or positioning.
- Market size, demand, or adoption claims without evidence or confidence notes.
- Success metrics that do not connect to the stated market problem.

---

## PRD Evaluation (applies to PRD_*.md files)

A PRD defines what the product does, acceptance criteria, personas, and dependencies. It bridges market requirements to engineering. Operational rules should at minimum be acknowledged with a plan to address them in the ESD.

A PRD that passes quality review should be engineering-ready. It must define observable product behavior, requirement IDs, priorities, acceptance criteria, verification methods, non-functional expectations, dependencies, instrumentation, rollout constraints, and ESD inputs. It should not prescribe final architecture unless the architecture is already a confirmed constraint.

### Expected PRD Sections

If any section is missing or only contains placeholders, flag it in the compliance table or quality findings.

| Section | What it must contain |
|---|---|
| MRD Linkage | Related MRD, source market needs, target segments, differentiation thesis, and success metrics |
| Scope And Non-Goals | In scope, out of scope, release boundary, and explicit non-goals |
| Personas And Use Cases | Actors, triggers, expected results, exception paths, and priority |
| Functional Requirements | Requirement ID, priority, source MRD item, statement, rationale, acceptance criteria, and verification method |
| Non-Functional Requirements | Performance, reliability, security, privacy, accessibility, observability, scalability, supportability, and cost expectations |
| UX And Workflow Requirements | Key screens or flows, empty states, loading states, error states, permissions, and user-visible copy constraints |
| Data And API Requirements | Entities, data lifecycle, API needs, integrations, auth expectations, rate limits, audit needs, and reporting needs |
| Instrumentation And Analytics | Product metrics, event names or measurement needs, dashboards, and success metric mapping |
| Capacity And Constraints | User volume, throughput, data volume, platform limits, compliance constraints, and known dependencies |
| Pilot, UAT, And Rollout | Pilot audience, acceptance measures, UAT owner, rollout phases, rollback trigger, and go-live criteria |
| Security And Operations Dependencies | Security review, support handoff, SOP, monitoring, vendor support, and operational ownership |
| Engineering Handoff For ESD | Architecture questions, API and data model inputs, environment needs, monitoring needs, rollback requirements, pilot validation, and unresolved design decisions |
| Open Questions | Owner-required decisions with owner, due date, and impact |

**Primary rules (must be addressed in the PRD):**

| Rule | What to look for in a PRD |
|---|---|
| 1 -- MRD and PRD Required | Does the PRD exist? Does it reference the MRD? |
| 2 -- Vendor Selection | Is the platform/vendor choice documented with rationale? |
| 6 -- Named Ownership | Product Owner and Business or Commercial Owner identified? (PRD stage requires both for EVT gate) |
| 8 -- Gate Approvals | EVT gate signers identified and approval table present? (Executive Sponsor, Product Owner, Business or Commercial Owner) |
| 10 -- Pilot Before Rollout | Is a pilot plan defined with acceptance criteria? |
| 12 -- Capacity Planning | Are capacity assumptions stated (users, volume, limits)? |

**Should be referenced (detailed plan in ESD):**

| Rule | What to look for in a PRD |
|---|---|
| 3 -- Supportability | Is SOP mentioned as a deliverable? |
| 7 -- Rollback Plan | Is rollback acknowledged as a requirement? |
| 9 -- Security Review | Is a security review listed as a dependency or gate? |
| 11 -- Operational Handoff | Is an operations or support handoff mentioned as a milestone? |
| 13 -- Vendor Support | Is vendor support agreement referenced? |
| 15 -- Post Go-Live Review | Is a post go-live review on the timeline? |

**Not typically in PRD (addressed in ESD or SOP):**
Rules 4, 5, 14

**PRD quality findings must call out:**
- Requirements without IDs, priorities, acceptance criteria, or verification methods.
- Acceptance criteria that cannot be validated in pilot, UAT, automated tests, logs, analytics, or operational checks.
- Missing non-functional requirements.
- Missing data, API, integration, instrumentation, security, rollout, or supportability inputs needed for ESD.
- Architecture decisions stated as requirements without a documented constraint or source.

---

## ESD Evaluation (applies to ESD_*.md files)

An ESD defines how the product is built -- architecture, APIs, data models, deployment, and operational governance. The ESD is drafted during EVT and must be complete before entering DVT (pilot). **All operational rules must be fully addressed here. The ESD is the last gate before pilot and go-live, not before development.**

**All 16 rules apply to the ESD.** Evaluate each rule for full compliance.

### Expected ESD Sections

An ESD that passes governance should contain at minimum these sections. If a section is missing, flag it in the compliance table.

| Section | Maps to Rule | What it must contain |
|---|---|---|
| **Architecture Overview** | -- | System diagram, components, data flow, integration points |
| **Data Model** | -- | Entities, relationships, storage locations (database, object store, CRM, knowledge base) |
| **API Contracts** | -- | External APIs consumed, auth flows, rate limits, error handling |
| **Infrastructure and Environment** | 4 | Hosting platform, deployment targets (dev/test/prod), environment URLs |
| **Vendor Selection Rationale** | 2 | Why this platform, alternatives considered, exec approval status |
| **Monitoring and Alerting** | 4 | Standard monitoring approach or documented exception with approved alternate approach |
| **Deployment and Configuration** | 4, 14 | Automated deployment or documented exception; CI/CD pipeline; no manual one-offs in production |
| **Security and Credential Handling** | 9 | Security review status, admin access controls, MFA, service principal management, secret rotation, logging and retention |
| **Capacity Planning** | 12 | Expected users, query volume, platform limits, load assumptions verified against reality |
| **Rollback Plan** | 7 | Go-back condition, rollback steps, data impact, who authorizes rollback |
| **Pilot Plan** | 10 | Pilot users, duration, scope, measurable acceptance criteria |
| **Operational Handoff** | 11 | Operations or support playbook, escalation contacts, monitoring dashboards, support hours |
| **Vendor Support Agreement** | 13 | Vendor support tier, escalation path, response SLA, how to reach engineering |
| **Ownership and Gate Approvals** | 6, 8 | All stage owners identified (Product Owner, Business or Commercial Owner, IT or Platform Owner). DVT and PVT gate signers listed. IT or Platform role for infrastructure readiness and security compliance is defined. Escalation paths defined. |
| **Post Go-Live Review** | 15 | 7-day review plan -- stability, ticket volume, monitoring effectiveness, remediation items |
| **Customer Responsibility Matrix** | 16 | If customer-hosted: written responsibility matrix. If not applicable: state "internal tool, not applicable" |
| **Supportability / SOP** | 3 | Standard operating procedures for ongoing operation, maintenance, and support |
| **Platform Constraints** | 5 | Known limitations of the platform; confirm no buffering/tunneling/caching is masking capacity gaps |

---

## Required Output Format

Save the output as `docs/cgr/CGR-results.md` under the selected project root using this structure:

```
# Governance Review Results

**Review date:** YYYY-MM-DD
**Documents reviewed:** [list filenames]
**Reviewer:** [LLM model name]

---

## Executive Summary

[10 lines max. Overall governance posture. Biggest risks across all documents.]

---

## Document: [filename]

### Classification: MRD / PRD / ESD

### Compliance Table

| Rule | Status | Field Completeness | Gap | Suggested Location |
|---|---|---|---|---|
| ... | Compliant / Partially / Missing / N/A | Complete / Partial / Incomplete | ... | ... |

### Top Required Additions (ordered by priority)

1. ...
2. ...

### Quality Findings

- Market Research Quality: Strong / Partial / Weak / N/A
- Competitive Awareness: Strong / Partial / Weak / N/A
- Differentiation Clarity: Strong / Partial / Weak / N/A
- PRD Engineering Readiness: Strong / Partial / Weak / N/A
- Traceability Completeness: Strong / Partial / Weak / N/A

### Proposed Insert Text

[Copy-ready text blocks for each gap]

---

## Document: [next filename]

[Repeat structure]

---

## Cross-Document Gaps

[Issues that span multiple documents -- e.g., ownership missing from both MRD and PRD,
vendor selection not covered anywhere, no document addresses rollback]

## Completeness Findings

[List mandatory fields that remain unresolved, grouped by document and rule]

## Traceability Findings

[State whether `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md` exists and whether mappings are complete from market evidence to MRD needs to PRD requirement IDs to ESD sections and validation evidence]

## Research Findings

[Summarize market research coverage, competitor coverage, differentiation evidence, source confidence, and research limitations]

## Assumptions and Open Questions

[Only if documents truly lack needed info]

## External Source Notes

[Only if external public sources were used for bootstrap or improvement. List source names or URLs and what was used.]
```

---

## Optional Scoring Extension

This extension is optional and does not replace the baseline output.

Keep the required output exactly as defined above in `docs/cgr/CGR-results.md`.
If a numeric governance score is desired, derive it from the compliance table and save it as `docs/cgr/score.md`.

### Scoring Inputs

- Use rule status from the compliance table in `CGR-results.md`.
- Exclude rules marked `N/A` from scoring denominator.
- Use rule criticality weighting for risk-sensitive gates.

### Status Points

| Status | Points |
|---|---|
| Compliant | 1.0 |
| Partially | 0.5 |
| Missing | 0.0 |

### Recommended Rule Criticality Weights

| Criticality | Weight |
|---|---|
| Critical | 3 |
| High | 2 |
| Standard | 1 |

Recommended default mapping:
- Critical: Rules 2, 7, 8, 9, 10, 11, 12, 13, 16
- High: Rules 3, 4, 5, 6, 14, 15
- Standard: Rule 1

### Score Formula

- Rule weighted points = status points * rule weight
- Maximum weighted points = sum of applicable rule weights
- Overall score (0 to 100) = (sum rule weighted points / maximum weighted points) * 100

### Gate Interpretation Example

- DVT recommendation target: score >= 70 and no unresolved Critical rule in Missing status.
- PVT recommendation target: score >= 85 and no unresolved Critical or High rule in Missing status.

Treat these thresholds as defaults. The organization may set stricter thresholds by policy.

### Optional Score Artifact

Save the derived score output as `docs/cgr/score.md` using a concise scorecard format with:
- Review date, reviewer, source results file
- Overall score and gate recommendation
- Rule-level weighted scoring table
- Top remediation priorities with owner and target date
- Exception log with expiry dates

---

## Optional Seed, Reference, And Source Bootstrap Extension

This extension is optional and does not replace baseline CGR requirements.

Use this when live MRD, PRD, and ESD artifacts are missing and draft governance docs must be created first.

Bootstrap flow:
1. Read `seed.md` if present.
2. Read relevant source material in `docs/reference/` and relevant source files already in the project root or obvious source-material folders.
3. Build the discovery and evidence set, including external market and competitor research when network access is available.
4. Generate drafts in `docs/cgr/` using template structure:
   - `MRD_<PROJECT>_v0-draft.md`
   - `PRD_<PROJECT>_v0-draft.md`
   - `ESD_<PROJECT>_v0-draft.md`
5. Record source traceability in `docs/cgr/seed-to-docs-mapping.md`. This file is required during Bootstrap mode.
6. Create or update `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md` when enough evidence exists to map market evidence to MRD needs, PRD requirement IDs, ESD sections, and validation evidence.
7. Run baseline CGR review and produce `docs/cgr/CGR-results.md`.
8. If scoring is enabled, derive `docs/cgr/score.md` from the latest results.

When source evidence is missing, mark it explicitly as `TBD` only for owner-required facts and list open questions. Use `[DRAFT INFERENCE]` for reasoned project inferences and record the basis. Do not invent approvals, owners, pricing, contracts, customer commitments, vendor support terms, or operational claims.

---

## Optional Iteration Loop Using Results And Score

This extension is optional and does not replace baseline CGR requirements.

Use this for repeated governance improvement cycles after initial outputs exist.

Iteration loop:
1. Read current MRD, PRD, ESD artifacts plus `docs/cgr/CGR-results.md`.
2. If present, read `docs/cgr/score.md` and identify score-impacting gaps.
3. Prioritize unresolved Critical and High gaps first.
4. Refresh the discovery and evidence set, including external market and competitor research when available.
5. Apply targeted document improvements.
6. Re-run baseline CGR review and refresh `docs/cgr/CGR-results.md`.
7. Refresh `docs/cgr/score.md` and compare score delta.
8. Update `docs/cgr/remediation-tracking.md` with owner, status, and target dates.
9. Repeat until target stage gate conditions are satisfied.

Recommended rerun triggers:
- Before DVT gate decision.
- Before PVT gate decision.
- After significant architecture, ownership, security, or rollout-plan changes.
- After exception expiry dates.

---

## Constraints

- Be direct and practical.
- Do not invent approvals or processes that are not present in the documents. If missing, mark as missing.
- If external sources are used, do not treat them as project-specific facts. Mark them as best-practice guidance and call out assumptions.
- Use each document's terminology where possible.
- Plain language, no filler.
- Mark rules as N/A when they genuinely do not apply to the document type.
- The cross-document gaps section is the most important output -- it shows what falls through the cracks between documents.
