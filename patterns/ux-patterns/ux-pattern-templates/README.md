# UX Pattern Templates

This folder contains editable UX pattern templates. Each template is a starting point, not a mandatory final design.

## What these templates are for
Use these templates to accelerate UX decisions and keep layout reviews consistent. They help teams evaluate fit, orientation quality, and action clarity before implementation.

## Template catalog
- [uxp-01-modern-app-shell-layout.md](uxp-01-modern-app-shell-layout.md)
  - Modern app shell with persistent left navigation and top utility bar.
  - Uses breadcrumb context plus a clear page header with status and primary action.
  - Best for enterprise portals, SaaS dashboards, and workflow-heavy admin tools.
- [uxp-02-b2b-marketing-website-journey.md](uxp-02-b2b-marketing-website-journey.md)
  - Narrative-first B2B website pattern for clear positioning, proof, and conversion.
  - Uses sticky top navigation, strong hero messaging, trust signals, and structured section flow.
  - Best for AI product sites, SaaS websites, venture studios, and platform marketing pages.
- [uxp-03-mobile-first-touch-app-flow.md](uxp-03-mobile-first-touch-app-flow.md)
  - Mobile-first app pattern for touch-friendly, readable, low-friction task flows.
  - Uses large labeled controls, no-dropdown interaction for common choices, and orientation-safe behavior.
  - Best for mobile apps built with web stacks (HTML/CSS/TS) or React Native.
- [uxp-04-monitoring-and-incident-response-console.md](uxp-04-monitoring-and-incident-response-console.md)
  - Operations console pattern for triage, diagnosis, and response.
  - Uses severity-first signal hierarchy, incident queue, context timeline, and explicit action controls.
  - Best for SRE, security, support escalation, and production monitoring workflows.
- [uxp-05-identity-auth-sso-journey.md](uxp-05-identity-auth-sso-journey.md)
  - Authentication and identity journey for login, enterprise SSO, MFA, and session lifecycle.
  - Uses domain discovery routing, passwordless/passkey alternatives, step-up MFA challenge, and graceful timeout warning.
  - Best for enterprise portals, SaaS products, and regulated web applications.

## Standard workflow
1. Pick the closest template.
2. Copy and adapt it for your project workflows.
3. Keep section structure intact so reviews stay comparable.
4. Capture assumptions, constraints, and tradeoffs in the template.
5. Record review outcomes in the template Review History section.
6. Promote approved outcomes into `patterns/ux-patterns/active-ux-pattern.md`.

## How to modify a template safely
- Keep orientation goals explicit, avoid vague statements.
- Call out why navigation and action placement choices exist.
- Note fit boundaries, including when the pattern should not be used.
- Keep responsive behavior and accessibility expectations current.
- Do not put project-specific secrets or environment details in templates.

## Minimum review checklist
- Confirm users can identify location and section quickly.
- Confirm current record or workflow context is visible.
- Confirm status visibility and primary action clarity.
- Confirm responsive behavior remains predictable on tablet and mobile.
- Confirm the pattern does not overload sidebar or top bar responsibilities.

## Definition of done for pattern adoption
A pattern is adoption-ready when:
- navigation, context, status, and action hierarchy are explicit
- responsive behavior and accessibility expectations are documented
- known risks and mitigations are documented
- review history includes reviewer, notes, and decision
- approved decisions are reflected in `patterns/ux-patterns/active-ux-pattern.md`
