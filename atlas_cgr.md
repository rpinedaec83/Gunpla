---
name: "Atlas Guided CGR"
description: "Use when running a Compliance and Governance Review on a target project, including bootstrapping MRD, PRD, and ESD from source files. Trigger phrases: CGR, run CGR, atlas cgr."
argument-hint: "Optional project scope, stage gate target, or specific source file"
agent: "agent"
---

# Atlas CGR

Use this standalone prompt to run a Compliance and Governance Review on a target project.

Copy this file into the target project root, paste it into the agent, or say `CGR`, `run CGR`, `atlas cgr`, or `do CGR from github picostar/Atlas_AI on folder "<localpath>"` while VS Code is open.

This file must stand alone in the target project. Do not assume the target project already has Atlas_AI prompts, skills, or kit files installed.

Access model: this prompt does not itself grant repository or network access. The agent must establish access to the current Atlas_AI source kit by using an open local checkout, fetching the relevant files from `github.com/picostar/Atlas_AI`, or asking the user for a local path. Treat the source kit as read-only template input.

Remote-source phrasing: if the user says `do CGR from github picostar/Atlas_AI on folder "<localpath>"` or similar, treat the named GitHub repo as the source kit and the quoted path as the CGR target root. Write all output under `<localpath>/docs/cgr/` and never modify the source kit folder during the run.

## Prompt

You are running a Compliance and Governance Review on this repository.

1. Read local repository instructions first if present, especially `.github/copilot-instructions.md`, `ATLAS.md`, and any root pointer files.

2. Establish access to the current Atlas_AI source kit. Use the full CGR workflow defined in `.github/prompts/cgr.prompt.md` from the source kit as the operational source of truth for this run. If you cannot reach the source kit, ask the user for a local path or proceed with this standalone prompt only.

3. Select the target project root.
   - If the current folder has `docs/cgr/` or contains source artifacts to evaluate, treat it as the project root.
   - If runnable code lives in a child directory but governance docs live at the parent root, keep CGR output at the parent root.

4. Discover source materials in this target project:
   - `seed.md` if present
   - `docs/reference/` if present
   - any MRD-like, PRD-like, ESD-like artifacts (.md, .docx, .pdf, .txt) already in the project root or subfolders
   - marketing copy, product notes, sales material, specifications, discovery notes, customer notes
   - `accounts.md` if present, for non-secret cloud or vendor binding only
   - Skip secrets, credentials, dependency folders, build output, and `.git`.

5. Determine workflow mode:
   - Bootstrap mode: no live MRD, PRD, or ESD exists in `docs/cgr/`.
   - Improve mode: one or more live MRD, PRD, or ESD artifacts already exist in `docs/cgr/`.

6. Build discovery and evidence before authoring or improving:
   - Read project source materials first.
   - If network access is available, perform external market and competitor research for the target product category.
   - Capture market category, target segments, personas, market size assumptions or demand proxies, competitor and alternative-solution matrix, differentiation, adoption barriers, pricing or monetization signals when public, and source confidence.
   - Classify evidence as `Source Fact`, `Project Inference`, `External Best Practice`, or `Owner Required`.
   - Mark reasoned project inferences with `[DRAFT INFERENCE]` and a one-line basis note.
   - Do not invent approvals, owners, pricing decisions, contracts, customer commitments, vendor support terms, or production readiness claims.

7. In Bootstrap mode, actively author substantive draft MRD, PRD, and ESD artifacts in `docs/cgr/`:
   - Answer every section using source evidence, domain reasoning, and approved external references.
   - MRD must include market research, target segments, personas, competitive alternatives, differentiation, market sizing or demand proxy, business value, risks, adoption barriers, and success metrics.
   - PRD must include requirement IDs, priorities, MRD links, acceptance criteria, verification methods, non-functional requirements, UX states, instrumentation, data and API needs, dependencies, rollout constraints, supportability, and engineering handoff details needed for ESD.
   - Mark inferred content with `[DRAFT INFERENCE]` and a one-line basis note.
   - Reserve `TBD` only for facts that can only come from the project owner, such as named owners, signed approvals, contract terms, or confirmed scope decisions.
   - The goal is a usable v0 draft a reviewer can correct, not a placeholder skeleton.
   - Default filenames when project naming is unknown:
     - `MRD_<PROJECT>_v0-draft.md`
     - `PRD_<PROJECT>_v0-draft.md`
     - `ESD_<PROJECT>_v0-draft.md`
   - Update `docs/cgr/seed-to-docs-mapping.md`. This mapping is required during Bootstrap mode.
   - Create or update `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md` when enough evidence exists to map market evidence to MRD needs, PRD requirement IDs, ESD sections, and validation evidence.

8. In Improve mode, treat existing artifacts as the base and upgrade them with new source material, current user instructions, and approved external references.

9. Approved external references for this prompt:
   - IETF RFC 2119 and RFC 8174 for requirement language clarity.
   - NIST Cybersecurity Framework 2.0 (CSF 2.0) functions (Govern, Identify, Protect, Detect, Respond, Recover) for security risk governance, identity protection, and incident defense.
   - NIST SP 800-160 concepts for engineering rigor and trustworthiness.
   - Cloud well-architected frameworks (Azure, AWS, Google Cloud) for non-functional architecture, operations, reliability, security, and cost tradeoffs.
   - ProductPlan, ProdPad, Aha, Atlassian, and Jama Software references for MRD and PRD structure, market analysis, competitive awareness, requirement quality, acceptance criteria, and traceability.
   - Public competitor websites, pricing pages, docs, changelogs, marketplaces, review sites, analyst summaries, and standards pages that are directly relevant to the target market.
   - Record source names or URLs in the External Source Notes section of the results file.

10. Evaluate each live document against the CGR base rules:
   - Rule 1 MRD and PRD required, Rule 2 vendor selection, Rule 3 supportability, Rule 4 monitoring and deployment standards, Rule 5 no masking platform constraints, Rule 6 named ownership, Rule 7 rollback plan, Rule 8 gate approvals, Rule 9 security review, Rule 10 pilot before rollout, Rule 11 operational handoff, Rule 12 capacity planning, Rule 13 vendor support agreement, Rule 14 no manual one-offs, Rule 15 post go-live review, Rule 16 customer-hosted infrastructure, Rule 17 cross-document consistency.
   - Do not mark a rule `Compliant` if mandatory fields for that rule remain unresolved.
   - Run cross-document consistency checks across MRD, PRD, and ESD.
   - Evaluate market research quality, competitive awareness, differentiation clarity, PRD engineering readiness, and traceability completeness.

11. Produce a single results file at `docs/cgr/CGR-results.md` with this structure:
    - Executive Summary
    - one Document section per artifact with classification, compliance table (Rule, Status, Field Completeness, Gap, Suggested Location), top required additions, and proposed insert text
    - Quality Findings
    - Cross-Document Gaps
    - Completeness Findings
    - Traceability Findings
    - Research Findings
    - Assumptions and Open Questions
    - External Source Notes

12. If scoring is enabled by the team, also write `docs/cgr/score.md` per the scoring extension in the full CGR prompt.

13. Post-review template cleanup:
    - On the first CGR run, remove `MRD_TEMPLATE.md` and `PRD_TEMPLATE.md` from `docs/cgr/` if still present.
    - When a live ESD exists, remove `ESD_TEMPLATE.md` from `docs/cgr/`.

## Default Decisions

- Bootstrap drafts must answer every section substantively. Do not leave answerable sections as TBD.
- Keep governance artifacts under `docs/cgr/`.
- Keep user-supplied project source material under `docs/reference/`.
- Keep `seed-to-docs-mapping.md` current during bootstrap and when new sources are used.
- Use `MRD-PRD-ESD-TRACEABILITY.md` when enough evidence exists to map market evidence to MRD needs, PRD requirement IDs, ESD sections, and validation evidence.
- Keep `secrets.md` ignored and local-only.
- Commit `accounts.md` for non-secret vendor or cloud binding.
- Do not invent confirmed facts. Use `[DRAFT INFERENCE]` for reasoned proposals and `TBD` only for owner-supplied facts.
