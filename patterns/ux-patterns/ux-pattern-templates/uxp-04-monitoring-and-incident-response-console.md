# UX Pattern 04: Monitoring And Incident Response Console

Status: Draft template
Owner: Product, UX, and Operations
Last Reviewed: TBD

## Intent
An operations-focused console pattern for monitoring system health, triaging incidents, and executing response actions with speed and confidence.

This pattern is for dashboards where signal clarity, prioritization, and rapid action are more important than visual density alone.

## Preferred Description
Action-oriented monitoring console with severity-first signal hierarchy, filterable incident queue, timeline context, and rapid response controls.

## Evidence-Informed Rules (Operational UX)
Use these rules when this pattern is selected:
- Prioritize critical alerts and actionable anomalies above informational metrics.
- Keep global status, incident queue, and detail context visible without confusion.
- Use consistent severity taxonomy and color semantics.
- Separate detection, diagnosis, and action controls clearly.
- Keep noisy signals suppressible without hiding critical issues.
- Preserve auditability of actions taken during incident handling.
- Keep time context explicit with timezone clarity.
- Support fast keyboard and pointer workflows for frequent operators.

## Preferred Structure
1. Global status header with environment and uptime state
2. Severity summary cards with trend context
3. Filterable incident queue with ownership and SLA indicators
4. Incident detail panel with timeline, related entities, and impact scope
5. Action panel for acknowledge, assign, escalate, resolve
6. Post-incident notes and handoff summary

## Core Layout
~~~text
+--------------------------------------------------------------+
| Env Status | Open Incidents | Critical | SLA Breach Risk      |
+----------------------+------------------------+-------------------+
| Incident Queue       | Incident Detail        | Response Actions  |
| - Severity           | - Timeline             | Acknowledge       |
| - Service            | - Impact               | Assign            |
| - Owner              | - Related alerts       | Escalate          |
| - SLA                | - Recent changes       | Resolve           |
+----------------------+------------------------+-------------------+
~~~

## Signal And Alert Design
Guidance:
- Use clear severity levels and stable thresholds.
- Keep alert titles specific and scannable.
- Group duplicate alerts intelligently.
- Show confidence and freshness for automated signals.

## Queue And Triage Design
Guidance:
- Keep default queue sorted by highest operational risk.
- Support filtering by severity, service, owner, environment, and status.
- Keep ownership and handoff state explicit.
- Show SLA or time-to-breach context in queue rows.

## Incident Detail Design
Guidance:
- Show timeline in chronological order with clear timestamps.
- Keep impact scope explicit, such as users, services, regions.
- Link related logs, traces, dashboards, and deployment changes.
- Keep diagnosis notes and decisions visible for handoff.

## Response Action Design
Guidance:
- Keep highest-frequency actions one click or tap away.
- Confirm destructive or irreversible actions.
- Record actor, time, and reason for every state-changing action.
- Provide clear resolve criteria before closure.

## Responsive Behavior
- Desktop: queue, detail, and action panes visible together when possible
- Tablet: queue and detail prioritized, action panel collapsible
- Mobile: incident queue and detail in stacked flow with sticky key actions
- Orientation changes must preserve selected incident context

## Best Fit
- SRE and DevOps incident consoles
- Security operations monitoring
- Customer support escalation dashboards
- IoT and device fleet monitoring
- Production service health operations

## Avoid
- Equal visual weight for critical and informational signals
- Hidden action history during active incidents
- Ambiguous severity labels
- Overloaded charts with no action path
- Incident closure without documented resolution summary

## AI Implementation Guidance
When generating operations dashboards, default to this pattern unless another monitoring pattern is explicitly requested.

The AI should:
- Build severity-first summaries and queue-first triage
- Keep incident detail and response actions tightly coupled
- Preserve audit trail visibility for all state changes
- Keep operator actions fast and unambiguous

## Strong Pattern Prompt (Use This)
Use this exact prompt when you want high-quality implementation:

Create a monitoring and incident response console optimized for fast triage and action. Prioritize critical signals first, provide a filterable incident queue, and show incident detail with timeline, impact scope, ownership, and related diagnostics. Keep response actions explicit and close to context, including acknowledge, assign, escalate, and resolve. Maintain clear severity semantics, visible SLA risk, and an auditable action history. Ensure responsive behavior preserves queue visibility and incident context on tablet and mobile.

## Acceptance Checklist
Use this checklist to validate generated UI:
- Critical incidents are immediately distinguishable from informational events.
- Queue supports practical triage filters and ownership visibility.
- Incident detail includes timeline, impact, and related diagnostics.
- Response actions are explicit, fast, and audit-logged.
- Severity and status semantics are consistent across the UI.
- Responsive behavior preserves triage and context continuity.

Short prompt variant:
Use a severity-first monitoring console with incident queue, detailed timeline context, and explicit response actions with audit visibility.

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision