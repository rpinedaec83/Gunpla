# MRD Template

Use this template for market and business requirements. Keep implementation detail in PRD and ESD.

Field criticality markers:
- `[MANDATORY]` required for gate readiness.
- `[CONDITIONAL]` required only when applicable.
- `[OPTIONAL]` useful context that improves quality.

Evidence grades:
- `Source Fact` -- directly supported by project files.
- `Project Inference` -- reasoned from project files, marked with `[DRAFT INFERENCE]` and a basis note.
- `External Best Practice` -- supported by public references, with source and access date.
- `Owner Required` -- facts only the project owner can confirm.

## Document Control

Guidance: keep this section current on every revision.

- `[MANDATORY]` Project: TBD
- `[MANDATORY]` Version: v1
- `[MANDATORY]` Owner: TBD
- `[MANDATORY]` Status: Draft
- `[MANDATORY]` Last Updated: YYYY-MM-DD
- `[OPTIONAL]` Related PRD: PRD_<PROJECT>_vX.md
- `[OPTIONAL]` Related traceability map: MRD-PRD-ESD-TRACEABILITY.md

## Research Evidence

Guidance: summarize the evidence used to shape the MRD. Use project source materials first. Use external market and competitor research when available. Do not treat public research as confirmed project facts.

| Evidence ID | Evidence Grade | Source | Access Date | Claim Or Input Used | Confidence | Notes |
|---|---|---|---|---|---|---|
| EV1 | Source Fact / Project Inference / External Best Practice / Owner Required | TBD | YYYY-MM-DD | TBD | High / Medium / Low | TBD |

## Market Category And Opportunity

Guidance: define the market context before defining the solution.

- `[MANDATORY]` Market category:
- `[MANDATORY]` Target market summary:
- `[MANDATORY]` Opportunity summary:
- `[MANDATORY]` Market timing or trigger:
- `[OPTIONAL]` Category trends:

## Target Segments

Guidance: identify which customer or user segments matter first, and why.

| Segment | Buyer Or User | Problem Intensity | Ability To Adopt | Value Potential | Priority | Evidence ID |
|---|---|---|---|---|---|---|
| TBD | Buyer / User / Both | High / Medium / Low | High / Medium / Low | High / Medium / Low | P0 / P1 / P2 | EV1 |

## Personas And Stakeholders

Guidance: identify direct users, buyers, decision stakeholders, and affected operating roles. Use role names rather than person names when possible.

- `[MANDATORY]` Primary user personas:
- `[MANDATORY]` Buyer or decision personas:
- `[MANDATORY]` Internal stakeholders:
- `[CONDITIONAL]` External stakeholders:
- `[OPTIONAL]` Administrator or support personas:

## Problem Statement

Guidance: describe a clear market, business, or operational problem backed by evidence. Include who is affected, what fails today, and measurable impact.

- `[MANDATORY]` Problem summary:
- `[MANDATORY]` Evidence sources:
- `[MANDATORY]` Impact statement:
- `[MANDATORY]` Current failure mode:
- `[MANDATORY]` Urgency:

## Current Alternatives And Workarounds

Guidance: include direct competitors, adjacent products, internal tools, spreadsheets, manual process, outsourced process, or doing nothing.

| Alternative | Type | User Benefit | Gaps Or Pain | Switching Cost | Evidence ID |
|---|---|---|---|---|---|
| TBD | Competitor / Adjacent / Manual / Status Quo | TBD | TBD | High / Medium / Low | EV1 |

## Competitive Analysis

Guidance: compare current alternatives fairly. Record source notes and confidence. Do not overclaim differentiation.

| Competitor Or Alternative | Target Customer | Key Strengths | Key Weaknesses | Pricing Or Monetization Signal | Integration Or Platform Posture | Source Confidence | Evidence ID |
|---|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | Public / Unknown / TBD | TBD | High / Medium / Low | EV1 |

## Differentiation And Positioning

Guidance: explain why this solution should win and what it is not trying to win on.

- `[MANDATORY]` Positioning statement:
- `[MANDATORY]` Primary differentiation:
- `[MANDATORY]` Secondary differentiation:
- `[MANDATORY]` Non-differentiators:
- `[MANDATORY]` Proof points or assumptions:
- `[OPTIONAL]` Messaging risks:

## Market Sizing Or Demand Proxy

Guidance: use TAM, SAM, and SOM when credible. For early or internal projects, use a lightweight demand proxy such as affected users, transaction volume, support ticket volume, manual hours, incident count, revenue at risk, or customer requests.

| Measure | Estimate | Method Or Assumption | Evidence ID | Confidence |
|---|---|---|---|---|
| TAM or broad opportunity | TBD | TBD | EV1 | High / Medium / Low |
| SAM or reachable opportunity | TBD | TBD | EV1 | High / Medium / Low |
| SOM or near-term target | TBD | TBD | EV1 | High / Medium / Low |
| Demand proxy | TBD | TBD | EV1 | High / Medium / Low |

## Business Model Or Value Hypothesis

Guidance: connect the opportunity to business outcomes and strategic goals. Pricing decisions are owner-required unless already confirmed in source material.

- `[MANDATORY]` Business value hypothesis:
- `[MANDATORY]` Value driver:
- `[CONDITIONAL]` Pricing or monetization assumption:
- `[CONDITIONAL]` Cost reduction assumption:
- `[CONDITIONAL]` Risk reduction assumption:
- `[MANDATORY]` Outcome timeframe:
- `[OPTIONAL]` Strategic alignment reference:

## Current Pain Points

Guidance: each pain point should include current workaround and consequence.

| Pain Point | Affected Segment Or Persona | Current Workaround | Consequence | Evidence ID |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | EV1 |

## Success Criteria

Guidance: criteria must be measurable, testable, and tied to the problem statement.

| Success Measure | Metric | Target | Timeframe | Evidence ID | PRD Mapping |
|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | EV1 | PRD requirement TBD |

## Risks And Adoption Barriers

Guidance: list barriers that can prevent adoption or value capture.

| Risk Or Barrier | Type | Likelihood | Impact | Mitigation Direction | Evidence ID |
|---|---|---|---|---|---|
| TBD | Market / Workflow / Trust / Data / Security / Integration / Support / Regulatory / Procurement | High / Medium / Low | High / Medium / Low | TBD | EV1 |

## Constraints

Guidance: list constraints that shape PRD and ESD decisions.

- `[MANDATORY]` Platform or vendor constraints:
- `[MANDATORY]` Data or integration constraints:
- `[MANDATORY]` Security, compliance, or privacy constraints:
- `[MANDATORY]` Capacity or scale assumptions:
- `[CONDITIONAL]` Customer-hosted infrastructure constraints:

## Ownership

Guidance: ownership must be explicit before EVT. Do not invent names.

- `[MANDATORY]` Product Owner:
- `[MANDATORY]` Executive Sponsor:
- `[MANDATORY]` Business or Commercial Owner:

## Dependencies

Guidance: list dependencies that influence timeline, scope, or market readiness.

- `[MANDATORY]` Dependency 1:
- `[MANDATORY]` Dependency 2:
- `[OPTIONAL]` External dependency notes:

## Approval Notes

Guidance: capture EVT entry approvals and unresolved assumptions.

- `[CONDITIONAL]` EVT entry approval record:
- `[OPTIONAL]` Open assumptions:
- `[MANDATORY]` Owner-required facts:

## Pre-Review Checklist -- MRD

- [ ] Research evidence table includes project sources and external market or competitor research when available.
- [ ] Market category, target segments, and personas are explicit.
- [ ] Problem statement includes evidence and measurable impact.
- [ ] Current alternatives and competitive analysis are documented.
- [ ] Differentiation and positioning are clear and defensible.
- [ ] Market sizing or demand proxy includes assumptions and confidence.
- [ ] Success criteria are measurable, time-bound, and mapped to PRD needs.
- [ ] Risks, adoption barriers, and constraints are explicit.
- [ ] Ownership block is complete or owner-required gaps are clearly marked.
- [ ] MRD is ready to hand off for PRD authoring.
