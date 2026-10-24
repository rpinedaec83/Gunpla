# ESD Template

Use this template to define how requirements are implemented, operated, secured, and validated.

Field criticality markers:
- `[MANDATORY]` required for DVT readiness.
- `[CONDITIONAL]` required only when applicable.
- `[OPTIONAL]` useful context that improves quality.

## Document Control

Guidance: keep version, owners, and linked requirements current.

- `[MANDATORY]` Project: TBD
- `[MANDATORY]` Version: v1
- `[MANDATORY]` Owner: TBD
- `[MANDATORY]` Status: Draft
- `[MANDATORY]` Last Updated: YYYY-MM-DD
- `[MANDATORY]` Related PRD: PRD_<PROJECT>_vX.md

## Architecture Overview

Guidance: include architecture context, boundaries, and data flow. Add a diagram link or text model.

- `[MANDATORY]` System context and boundaries:
- `[MANDATORY]` Component topology:
- `[MANDATORY]` Data flow narrative:
- `[CONDITIONAL]` Architecture diagram reference:

## Data Model

Guidance: define key entities and storage locations with ownership and retention assumptions.

- `[MANDATORY]` Key entities:
- `[MANDATORY]` Relationships and lifecycle:
- `[MANDATORY]` Storage locations:

## API Contracts

Guidance: define consumed and exposed APIs, authentication, failure handling, and limits.

- `[CONDITIONAL]` External APIs used:
- `[MANDATORY]` Auth and authorization model:
- `[MANDATORY]` Error handling approach:
- `[CONDITIONAL]` Rate limits and throttling behavior:

## Infrastructure And Environments

Guidance: define where each environment runs and how it differs.

- `[MANDATORY]` Development:
- `[MANDATORY]` Test:
- `[MANDATORY]` Production:
- `[OPTIONAL]` Environment parity notes:

## Vendor Selection Rationale

Guidance: include chosen option, alternatives, and decision reason.

- `[CONDITIONAL]` Selected vendor or platform:
- `[CONDITIONAL]` Alternatives considered:
- `[CONDITIONAL]` Approval status:

## Monitoring And Alerting

Guidance: define key signals, alert routing, and response expectations.

- `[MANDATORY]` Monitoring tools and dashboards:
- `[MANDATORY]` Alert thresholds and ownership:
- `[CONDITIONAL]` Approved exception details:

## Deployment And Configuration

Guidance: describe CI/CD path and configuration strategy. Avoid manual one-off production steps.

- `[MANDATORY]` Deployment pipeline path:
- `[MANDATORY]` Configuration source of truth:
- `[MANDATORY]` Manual step exceptions and retirement plan:

## Security And Credential Handling

Guidance: include security controls and review status with explicit ownership.

- `[MANDATORY]` Access control model:
- `[MANDATORY]` MFA and privileged access controls:
- `[MANDATORY]` Secrets handling and rotation:
- `[MANDATORY]` Security review status:

## Capacity Planning

Guidance: state assumptions and expected limits, then define how they are validated.

- `[MANDATORY]` Expected user volume:
- `[MANDATORY]` Throughput assumptions:
- `[MANDATORY]` Capacity limits and bottlenecks:
- `[MANDATORY]` Validation method:

## Rollback Plan

Guidance: include trigger conditions, exact steps, and approver roles.

- `[MANDATORY]` Go-back conditions:
- `[MANDATORY]` Rollback steps:
- `[MANDATORY]` Data impact and mitigation:
- `[MANDATORY]` Authorization owner:

## Pilot Plan

Guidance: pilot criteria must validate PRD acceptance criteria.

- `[MANDATORY]` Pilot audience and scope:
- `[MANDATORY]` Pilot duration:
- `[MANDATORY]` Acceptance criteria mapping:

## Operational Handoff

Guidance: operations team must be able to run the system without tribal knowledge.

- `[MANDATORY]` Support owner:
- `[MANDATORY]` Runbook and dashboard references:
- `[MANDATORY]` Escalation path and support hours:

## Vendor Support Agreement

Guidance: complete when a vendor is operationally critical.

- `[CONDITIONAL]` Support tier:
- `[CONDITIONAL]` SLA and response expectations:
- `[CONDITIONAL]` Engineering escalation path:

## Ownership And Gate Approvals

Guidance: ownership must match stage requirements in `docs/cgr/PS.md`.

- `[MANDATORY]` Product Owner:
- `[MANDATORY]` Business or Commercial Owner:
- `[MANDATORY]` IT or Platform Owner:
- `[MANDATORY]` Security or Compliance:

## Post Go-Live Review

Guidance: define the 7-day review and clear measurement criteria.

- `[MANDATORY]` Review date window:
- `[MANDATORY]` Metrics to evaluate:
- `[MANDATORY]` Review owner:

## Customer Responsibility Matrix

Guidance: required only for customer-hosted responsibility splits.

- `[CONDITIONAL]` Customer-hosted applicability:
- `[CONDITIONAL]` Responsibility split and acceptance record:

## Supportability And SOP

Guidance: describe how to operate, troubleshoot, and recover.

- `[MANDATORY]` SOP and runbook references:
- `[MANDATORY]` On-call and incident model:

## Platform Constraints

Guidance: disclose technical constraints and show how the design avoids masking underlying capacity issues.

- `[MANDATORY]` Known constraints:
- `[MANDATORY]` Constraint mitigation strategy:

## Pre-Review Checklist -- ESD

- [ ] Architecture model is complete and linked.
- [ ] PRD requirements map to architecture and API contracts.
- [ ] Security controls and review status are explicit.
- [ ] Monitoring, alerting, and handoff ownership are defined.
- [ ] Capacity and rollback sections have executable validation details.
- [ ] Pilot criteria can verify PRD acceptance criteria.
- [ ] No mandatory field remains unresolved.
- [ ] ESD is ready for DVT gate review.