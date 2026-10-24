# PRD Template

Use this template to translate MRD intent into testable product requirements for a release.

The PRD defines observable product behavior, constraints, acceptance criteria, validation expectations, and engineering handoff inputs. The PRD should give engineering and QA enough detail to start ESD design. It should not prescribe final architecture unless the architecture is already a confirmed constraint.

Field criticality markers:
- `[MANDATORY]` required for gate readiness.
- `[CONDITIONAL]` required only when applicable.
- `[OPTIONAL]` useful context that improves quality.

Evidence grades:
- `Source Fact` -- directly supported by project files.
- `Project Inference` -- reasoned from project files, marked with `[DRAFT INFERENCE]` and a basis note.
- `External Best Practice` -- supported by public references, with source and access date.
- `Owner Required` -- facts only the project owner can confirm.

Requirement levels:
- Use `MUST` only for enforceable release requirements.
- Use `SHOULD` for expected behavior with justified exceptions.
- Use `MAY` for optional behavior.

## Document Control

Guidance: keep ownership, version, and related artifacts current.

- `[MANDATORY]` Project: TBD
- `[MANDATORY]` Version: v1
- `[MANDATORY]` Owner: TBD
- `[MANDATORY]` Status: Draft
- `[MANDATORY]` Last Updated: YYYY-MM-DD
- `[MANDATORY]` Related MRD: MRD_<PROJECT>_vX.md
- `[OPTIONAL]` Related ESD: ESD_<PROJECT>_vX.md
- `[OPTIONAL]` Related traceability map: MRD-PRD-ESD-TRACEABILITY.md

## MRD Linkage

Guidance: show how market intent drives this release.

- `[MANDATORY]` Source MRD needs:
- `[MANDATORY]` Target segments:
- `[MANDATORY]` Differentiation thesis:
- `[MANDATORY]` MRD success metrics:
- `[MANDATORY]` PRD release objective:

## Scope Summary

Guidance: define what this release includes and excludes.

- `[MANDATORY]` In-scope summary:
- `[MANDATORY]` Out-of-scope summary:
- `[MANDATORY]` Release boundary:
- `[OPTIONAL]` Future scope:

## Goals

Guidance: goals should map directly to MRD outcomes.

| Goal ID | Goal | MRD Mapping | Success Metric | Priority |
|---|---|---|---|---|
| G1 | TBD | TBD | TBD | P0 / P1 / P2 |

## Non-Goals

Guidance: explicit non-goals prevent scope drift.

- `[MANDATORY]` Non-goal 1:
- `[MANDATORY]` Non-goal 2:

## Personas And Use Cases

Guidance: each use case needs an actor, trigger, expected result, and exception path when relevant.

| Use Case ID | Actor | Trigger | Expected Result | Exception Or Error Path | Priority | MRD Mapping |
|---|---|---|---|---|---|---|
| U1 | TBD | TBD | TBD | TBD | P0 / P1 / P2 | TBD |

## Functional Requirements

Guidance: each requirement must be testable and traceable. Use stable IDs so ESD, QA, UAT, and CGR can reference the same item.

| Requirement ID | Priority | Requirement Statement | Source MRD Item | Rationale | Acceptance Criteria | Verification Method | Status |
|---|---|---|---|---|---|---|---|
| FR1 | P0 / P1 / P2 | The product MUST TBD | TBD | TBD | TBD | Test / UAT / Pilot / Analytics / Log / Operational Check | Draft |

## Non-Functional Requirements

Guidance: define quality attributes engineering must design for. If a category is not applicable, state why.

| Requirement ID | Category | Requirement Statement | Target Or Limit | Verification Method | ESD Input |
|---|---|---|---|---|---|
| NFR1 | Performance / Reliability / Security / Privacy / Accessibility / Observability / Scalability / Supportability / Cost | TBD | TBD | TBD | TBD |

## UX And Workflow Requirements

Guidance: define user-visible behavior without overdesigning the UI.

- `[MANDATORY]` Primary workflows:
- `[MANDATORY]` Permissions and role behavior:
- `[MANDATORY]` Empty states:
- `[MANDATORY]` Loading states:
- `[MANDATORY]` Error states:
- `[CONDITIONAL]` Accessibility expectations:
- `[OPTIONAL]` User-visible copy constraints:

## Data And API Requirements

Guidance: describe data and integration needs so ESD can define contracts and architecture.

- `[MANDATORY]` Key entities:
- `[MANDATORY]` Data lifecycle:
- `[CONDITIONAL]` APIs exposed:
- `[CONDITIONAL]` APIs consumed:
- `[MANDATORY]` Auth and authorization expectations:
- `[CONDITIONAL]` Rate limits, quotas, or throttling needs:
- `[CONDITIONAL]` Audit, retention, or reporting needs:
- `[OPTIONAL]` Data migration or import needs:

## Instrumentation And Analytics

Guidance: define how success criteria and product behavior will be measured.

| Metric Or Event | Purpose | Trigger | Dimensions | Target Or Alert | Maps To |
|---|---|---|---|---|---|
| TBD | Adoption / Quality / Reliability / Revenue / Risk / Usage | TBD | TBD | TBD | MRD success metric or PRD requirement |

## Capacity Assumptions

Guidance: include expected usage volumes and known limits.

- `[MANDATORY]` User volume:
- `[MANDATORY]` Throughput or request volume:
- `[MANDATORY]` Data volume:
- `[MANDATORY]` Peak usage assumption:
- `[OPTIONAL]` Constraint notes:

## Dependencies And Constraints

Guidance: list technical, organizational, vendor, security, legal, data, and rollout dependencies.

| Dependency ID | Dependency Or Constraint | Type | Owner | Impact If Unresolved | Due Date |
|---|---|---|---|---|---|
| DEP1 | TBD | Technical / Organizational / Vendor / Security / Legal / Data / Rollout | TBD | TBD | TBD |

## Security, Compliance, And Operations Dependencies

Guidance: PRD should identify required reviews and handoffs. ESD provides the full implementation plan.

- `[MANDATORY]` Security review dependency:
- `[MANDATORY]` Credential or privileged access expectation:
- `[MANDATORY]` Logging or retention expectation:
- `[MANDATORY]` SOP or support playbook dependency:
- `[MANDATORY]` Monitoring dependency:
- `[CONDITIONAL]` Vendor support agreement dependency:
- `[CONDITIONAL]` Customer-hosted responsibility dependency:

## Pilot, UAT, And Rollout Plan

Guidance: define pilot boundary, measurable pass signals, rollout posture, and UAT ownership.

- `[MANDATORY]` Pilot scope:
- `[MANDATORY]` Pilot audience:
- `[MANDATORY]` Acceptance measures:
- `[MANDATORY]` UAT owner:
- `[MANDATORY]` Rollout phases:
- `[MANDATORY]` Go-live criteria:
- `[MANDATORY]` Rollback trigger:
- `[CONDITIONAL]` Not UAT-eligible rationale:

## Engineering Handoff For ESD

Guidance: capture what engineering needs to design the ESD. Leave architecture decisions open unless already constrained.

- `[MANDATORY]` Architecture questions:
- `[MANDATORY]` API contract inputs:
- `[MANDATORY]` Data model inputs:
- `[MANDATORY]` Environment needs:
- `[MANDATORY]` Monitoring and alerting needs:
- `[MANDATORY]` Rollback and recovery requirements:
- `[MANDATORY]` Pilot validation requirements:
- `[MANDATORY]` Operational handoff requirements:
- `[MANDATORY]` Unresolved design decisions:

## Ownership And Approvals

Guidance: EVT gate ownership must be explicit. Do not invent names.

- `[MANDATORY]` Product Owner:
- `[MANDATORY]` Business or Commercial Owner:
- `[MANDATORY]` Executive Sponsor:
- `[CONDITIONAL]` IT or Platform Owner:
- `[CONDITIONAL]` Security or Compliance Owner:

## Open Questions

Guidance: unresolved owner-required questions should have owner, due date, and impact.

| Question ID | Question | Evidence Grade | Owner | Due Date | Impact If Unresolved |
|---|---|---|---|---|---|
| Q1 | TBD | Owner Required | TBD | TBD | TBD |

## Pre-Review Checklist -- PRD

- [ ] Scope and non-goals are explicit.
- [ ] Goals map to MRD outcomes and success metrics.
- [ ] Use cases include actors, triggers, expected results, and exception paths.
- [ ] Each functional requirement has an ID, priority, MRD source, acceptance criteria, and verification method.
- [ ] Non-functional requirements cover performance, reliability, security, privacy, accessibility, observability, scalability, supportability, and cost where applicable.
- [ ] UX states, data needs, API needs, instrumentation, dependencies, and constraints are explicit.
- [ ] Acceptance criteria are testable in pilot, UAT, tests, logs, analytics, or operational checks.
- [ ] Pilot, UAT, rollout, rollback trigger, and go-live criteria are defined.
- [ ] Security, supportability, monitoring, SOP, and vendor dependencies are acknowledged.
- [ ] Engineering handoff gives ESD enough input to design architecture, APIs, data model, environments, monitoring, rollback, pilot validation, and operations.
- [ ] Open questions have owners and due dates, or are resolved.
- [ ] PRD is ready for ESD design authoring.
