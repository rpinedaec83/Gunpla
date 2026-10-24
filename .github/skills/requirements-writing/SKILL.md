---
name: requirements-writing
description: 'Use when creating, reviewing, bootstrapping, or improving MRD and PRD artifacts, especially for market-aware MRDs, engineering-ready PRDs, competitive analysis, acceptance criteria, and MRD to PRD to ESD traceability.'
argument-hint: 'Describe the product, target market, source docs, or requirements artifact to improve'
---

# Requirements Writing

## When to Use

- Creating or improving MRD, PRD, or related requirements artifacts.
- Running CGR bootstrap or iteration where MRD and PRD quality affects gate readiness.
- Turning seed notes, marketing copy, product notes, sales material, discovery notes, or source files into requirements.
- Reviewing whether a PRD is detailed enough for engineering to start ESD design.
- Checking traceability from market evidence to MRD needs to PRD requirements to ESD design inputs.

## Core Roles

Use these roles to keep document intent clean.

- Product Owner for MRD: define market problem, target users, buyer and stakeholder context, business value, alternatives, competitive comparison, differentiation, market sizing or demand proxy, risks, adoption barriers, ownership, and success metrics.
- Engineering Product Manager for PRD: translate MRD intent into observable product behavior, requirement IDs, priorities, acceptance criteria, verification methods, non-functional requirements, dependencies, rollout constraints, supportability, and ESD handoff inputs.
- Engineering owner for ESD: design architecture, APIs, data model, environments, security controls, deployment, monitoring, rollback, pilot validation, and operational model.

## Evidence Standard

Classify important claims with one of these evidence grades:

- `Source Fact` -- directly supported by project files.
- `Project Inference` -- reasoned from project files, marked with `[DRAFT INFERENCE]` and a one-line basis note.
- `External Best Practice` -- supported by public references, with source and access date.
- `Owner Required` -- facts only the project owner can confirm.

Rules:

- Read project source material before using external sources.
- Use external market and competitor research when available for MRD and PRD context.
- Cite public sources by name or URL and access date.
- Record confidence as High, Medium, or Low for market sizing, competitor claims, pricing signals, and differentiation claims.
- Do not invent approvals, named owners, pricing decisions, contracts, customer commitments, vendor support terms, or production readiness claims.

## MRD Quality Checklist

An MRD is ready for PRD authoring when it includes:

- Document control with owner, status, version, and related PRD if available.
- Research evidence table with source, access date, claim used, confidence, and evidence grade.
- Market category, opportunity summary, and timing trigger.
- Target segments with priority and adoption context.
- Buyer, user, administrator, approver, and affected stakeholder personas as applicable.
- Problem statement with evidence, failure mode, measurable impact, and urgency.
- Current alternatives, including competitors, adjacent solutions, manual workarounds, status quo, and switching costs.
- Competitive analysis with strengths, weaknesses, pricing or monetization signals, integration posture, and source confidence.
- Differentiation and positioning, including what the product is not trying to differentiate on.
- Market sizing or lightweight demand proxy with assumptions and confidence.
- Business model or value hypothesis.
- Risks, adoption barriers, constraints, dependencies, and success metrics.
- Ownership and gate approval status, with owner-required gaps marked clearly.

## PRD Quality Checklist

A PRD is ready for ESD design when it includes:

- Related MRD, source market needs, target segments, differentiation thesis, and MRD success metrics.
- Clear scope, non-goals, release boundary, and future scope where useful.
- Goals mapped to MRD outcomes.
- Personas and use cases with actors, triggers, expected results, exception paths, and priority.
- Functional requirements with stable IDs, priority, source MRD item, rationale, acceptance criteria, verification method, and status.
- Non-functional requirements covering performance, reliability, security, privacy, accessibility, observability, scalability, supportability, and cost where applicable.
- UX and workflow requirements, including empty states, loading states, error states, permissions, and accessibility expectations.
- Data and API requirements, including entities, lifecycle, exposed or consumed APIs, auth expectations, limits, audit, retention, and reporting.
- Instrumentation and analytics needed to validate adoption, quality, reliability, revenue, risk, or usage outcomes.
- Capacity assumptions, dependencies, constraints, pilot, UAT, rollout phases, rollback trigger, and go-live criteria.
- Security, monitoring, SOP, supportability, vendor support, and customer-hosted responsibility dependencies where applicable.
- Engineering handoff for ESD with architecture questions, API inputs, data model inputs, environment needs, monitoring needs, rollback requirements, pilot validation, operational handoff, and unresolved design decisions.

## Traceability Checklist

Use `docs/cgr/MRD-PRD-ESD-TRACEABILITY.md` when enough evidence exists.

Each trace row should map:

- Market evidence and source confidence.
- MRD market problem, segment, pain point, or success metric.
- PRD goal, requirement ID, acceptance criteria, and verification method.
- ESD architecture, API, data model, monitoring, rollback, pilot, security, or operations section.
- Validation evidence from tests, pilot, UAT, logs, analytics, dashboards, or operational checks.

## Writing Rules

- MRD stays strategic and market-facing.
- PRD defines observable behavior and constraints.
- ESD owns implementation design.
- Use concise tables for comparisons, requirements, dependencies, and traceability.
- Use `MUST`, `SHOULD`, and `MAY` only when the requirement level is enforceable.
- Prefer measurable acceptance criteria over vague intent.
- Keep agile docs concise, but keep MRD, PRD, ESD, and traceability complete enough for governance and engineering handoff.
