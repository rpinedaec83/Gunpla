# UX Pattern 01: Modern App Shell Layout

Status: Draft template
Owner: Product and UX
Last Reviewed: TBD

## Intent
A modern app shell for enterprise portals, SaaS applications, dashboards, admin tools, and workflow-heavy web applications.

This pattern provides clear navigation, strong page context, visible status, and a focused work area.

## Preferred Description
Desktop-first app shell optimized for findability and scale: visible left-side text-labeled navigation, top utility bar for global tools, breadcrumb context above a clear page header, and responsive behavior that preserves orientation and action clarity.

## Evidence-Informed Rules (Vertical Navigation)
Use these rules when this pattern is selected:
- Keep primary navigation visible on desktop. Do not hide global navigation behind a hamburger menu on desktop.
- Place global navigation on the left for left-to-right languages. For right-to-left languages, mirror this placement.
- Use text labels for primary navigation items. Do not rely on icon-only global navigation.
- Front-load labels with meaningful keywords and keep labels specific, not overly generic.
- Keep labels left-aligned in the navigation list to improve scan speed.
- Do not duplicate the same global menu in both a horizontal bar and a vertical sidebar.
- Prioritize high-value sections near the top of long menus so key destinations remain above the fold more often.
- Keep strong visual contrast between navigation and content so the navigation is easy to notice.
- Accept that vertical navigation uses space, then control width and spacing to keep a healthy content area.

## Preferred Structure
1. Left sidebar for primary navigation
2. Top bar for account, search, alerts, or global actions
3. Breadcrumbs above the page title
4. Clear page header with title, status, and primary action
5. Responsive behavior where the sidebar collapses on smaller screens

## Core Layout
~~~text
+-------------------------------------------------------------+
| Top Bar: Search | Alerts | Help | Account | Global Actions  |
+-------------------+-----------------------------------------+
| Left Sidebar      | Breadcrumbs                             |
| Navigation        | Page Title                Primary Action |
|                   | Status / Description                     |
|                   +-----------------------------------------+
|                   | Main Content Area                        |
|                   | Tables, cards, forms, workflows, charts |
+-------------------+-----------------------------------------+
~~~

## Left Sidebar Navigation
Use a persistent left sidebar for major application sections.

Example primary navigation items:
- Dashboard
- Customers
- Products
- Quotes
- Orders
- Monitoring
- Reports
- Admin
- Settings

Guidance:
- Keep the sidebar focused on major areas.
- Avoid giant nested navigation trees.
- Keep record-specific pages, deep workflow steps, and detailed settings in page content, tabs, breadcrumbs, or contextual menus.
- Use clear text labels with high information scent.
- Keep one active location clearly highlighted at all times.
- Keep the default desktop state expanded enough to read labels without hover.

## Top Bar
Use the top bar for global tools and utilities.

Examples:
- Search
- Account menu
- Notifications or alerts
- Help
- Organization selector
- Customer selector
- Environment selector
- Global create action
- Global support or docs access

Guidance:
- Do not overload the top bar with page-specific actions.
- Place page-specific actions in the page header or nearby content region.
- Do not duplicate primary navigation in the top bar.

## Breadcrumbs
Place breadcrumbs above the page title.

Purpose:
- Show current location in application hierarchy.
- Preserve context for nested records and workflows.

Example:
Home > Customers > Acme Corp > Services > Starlink Monitoring

Guidance:
- Use breadcrumbs for nested accounts, products, services, configs, workflows, and admin areas.
- Breadcrumbs provide context, they do not replace primary navigation.
- Keep breadcrumbs directly above the page title, not separated in a distant region.

## Page Header
Every major page should include a clear page header.

Include:
- Page title
- Short description when useful
- Status badge when relevant
- Primary page action
- Secondary actions when needed

Example:
- Title: Starlink Monitoring
- Description: Active service for Acme Corp
- Status: Healthy
- Primary action: Create Alert Rule
- Secondary actions: Edit Service, View Logs

Guidance:
- Make location and task obvious from the title.
- Keep the primary action visible, do not hide it behind overflow menus.

## Main Content Area
Keep the main content focused on the current task.

Use the right pattern for the job:
- Cards for summaries and status
- Tables for operational lists and data
- Forms for configuration
- Tabs for related views within a record
- Charts for trends and monitoring
- Workflow panels for multi-step tasks
- Detail panels for record-specific information

Guidance:
- Keep global navigation, page actions, filters, and task content clearly separated.
- Avoid mixed layouts that hide user intent and next actions.

## User Orientation Goals
The layout should help users answer these questions quickly:
1. Where am I?
2. What section am I in?
3. What record, customer, service, or workflow am I viewing?
4. What is the current status?
5. What is the next action I can take?

## Responsive Behavior
The layout must remain usable on smaller screens.

Recommended behavior:
- Desktop: sidebar visible
- Tablet: sidebar may collapse to a narrower rail, but navigation labels remain easy to reveal and scan
- Mobile: sidebar becomes a drawer or menu button
- Breadcrumbs may shorten or collapse on mobile
- Page title remains visible
- Primary action remains easy to access
- Tables and dense data adapt to smaller viewports

Guidance:
- Do not remove navigation on small screens.
- Keep navigation compact, accessible, and predictable.
- On desktop, do not replace visible navigation with a hidden hamburger-only global nav.

## Best Fit
- Enterprise portals
- Customer admin portals
- SaaS dashboards
- Product catalogs
- Quote flows
- Service monitoring dashboards
- Developer portals
- Internal operations tools
- Configuration workflows
- Multi-customer or multi-tenant applications

## Avoid
- Giant nested sidebar trees
- Breadcrumbs separated from page title
- Primary actions hidden only in overflow menus
- Top bars overloaded with unrelated controls
- Sidebars that do not collapse on smaller screens
- Pages without clear titles
- Mixing global navigation with page-specific actions
- Using breadcrumbs as a replacement for primary navigation
- Using sidebar nav for every minor subpage or workflow step
- Hiding critical status in secondary tabs or screens
- Forcing users to guess the next action

## AI Implementation Guidance
When generating a web app, portal, dashboard, or admin UI, default to this layout unless another layout is explicitly requested.

The AI should:
- Create a persistent left sidebar for primary navigation
- Create a top utility bar for global tools
- Place breadcrumbs above the page title
- Include a clear page header
- Show status where status matters
- Keep the primary action visible
- Keep the main content focused on the current task
- Use responsive behavior for tablet and mobile
- Avoid excessive sidebar nesting
- Avoid hiding important context or actions
- Keep desktop global navigation visible and text-labeled
- Avoid duplicate global navigation patterns

## Strong Pattern Prompt (Use This)
Use this exact prompt when you want high-quality implementation:

Use a desktop-first modern app shell optimized for findability and scale. Implement a visible left sidebar for global navigation with text-labeled, keyword-frontloaded, left-aligned items. Do not use icon-only primary navigation. Do not duplicate global navigation in both a horizontal bar and a vertical sidebar. Keep the top bar for global utilities only (search, alerts, help, account, global actions). Place breadcrumbs directly above a clear page header with title, status, and one visible primary action. Keep page-specific actions in the header or content area, not in global chrome. Ensure responsive behavior: desktop keeps visible sidebar, tablet can reduce sidebar width while preserving label discoverability, and mobile can use a drawer with clear access. Preserve orientation so users can quickly identify where they are, what they are viewing, current status, and next action.

## Acceptance Checklist
Use this checklist to validate generated UI:
- Global navigation is visible on desktop and placed on the left for left-to-right languages.
- Primary navigation uses clear text labels, not icon-only categories.
- Navigation labels are specific and scannable, with active state clearly shown.
- Top bar contains only global utilities and does not duplicate global navigation.
- Breadcrumbs appear directly above the page title.
- Page header includes title, status context where relevant, and one primary action.
- Main content is visually separated from global chrome and focused on the task.
- Responsive behavior preserves navigation discoverability and action clarity.

Example prompt instruction:
Use a modern app shell layout with persistent left navigation, a top utility bar, breadcrumb context above the page title, and a clear page header with status and primary action. Keep the sidebar focused on primary navigation. Do not create a giant nested menu. Make the layout responsive so the sidebar collapses on smaller screens.

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision
