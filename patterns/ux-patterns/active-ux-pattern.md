# UX Pattern 01: Modern App Shell Layout
Atlas Pattern ID: uxp-01-modern-app-shell-layout

Status: Active Baseline
Owner: Roberto Pineda (x-codec)
Last Reviewed: 2026-10-23

## Intent
A modern app shell for multi-tenant scale modeling portals (`plamoscale.com`, `gunplajunkies.com`, and future white-label community/club clients), SaaS applications, dashboards, catalog explorers, stash trackers, and step-by-step build logs.

This pattern provides clear navigation, strong page context, visible status, and a focused work area for both desktop builders and mobile workbench photo uploads.

## Preferred Description
Desktop-first app shell optimized for findability and scale: visible left-side text-labeled navigation, top utility bar for global tools (search kits/paints, notifications, tenant badge, SSO account, quick "New Build / Upload WIP"), breadcrumb context above a clear page header, and responsive behavior that preserves orientation and action clarity on mobile devices.

## Evidence-Informed Rules (Vertical Navigation)
Use these rules when this pattern is selected:
- Keep primary navigation visible on desktop. Do not hide global navigation behind a hamburger menu on desktop.
- Place global navigation on the left for left-to-right languages.
- Use text labels for primary navigation items. Do not rely on icon-only global navigation.
- Front-load labels with meaningful keywords and keep labels specific, not overly generic.
- Keep labels left-aligned in the navigation list to improve scan speed.
- Do not duplicate the same global menu in both a horizontal bar and a vertical sidebar.
- Prioritize high-value sections near the top of long menus so key destinations remain above the fold more often.
- Keep strong visual contrast between navigation and content so the navigation is easy to notice.
- Accept that vertical navigation uses space, then control width and spacing to keep a healthy content area for high-resolution model photography.

## Preferred Structure
1. Left sidebar for primary navigation (Explore Showcase, Kit Catalog, Paint Rack, My Stash, My Build Logs, Group Builds & Contests, Trusted Shops & Marketplace, Community)
2. Top bar for global kit/paint search, SSO account, notifications, portal switcher (`PlamoScale` / `GunplaJunkies`), and primary "New Project" CTA
3. Breadcrumbs above the page title
4. Clear page header with title, build/kit status badge, and primary action
5. Responsive behavior where the sidebar collapses into a mobile drawer / touch navigation on smaller screens

## Core Layout
~~~text
+-------------------------------------------------------------------+
| Top Bar: Kit/Paint Search | Alerts | Portal | Account | + New WIP |
+---------------------+---------------------------------------------+
| Left Sidebar        | Breadcrumbs                                 |
| - Showcase Gallery  | Page Title                   Primary Action |
| - Kit Catalog       | Status / Scale / Brand Metadata             |
| - Paint & Tools     +---------------------------------------------+
| - My Stash & Rack   | Main Content Area                           |
| - Build Logs (WIP)  | High-res galleries, build step timelines,   |
| - Contests & Clubs  | paint recipes, kit genealogy, shop listings |
| - Trusted Shops     |                                             |
+---------------------+---------------------------------------------+
~~~

## Acceptance Checklist
Use this checklist to validate generated UI:
- Global navigation is visible on desktop and placed on the left.
- Primary navigation uses clear text labels, not icon-only categories.
- Navigation labels are specific and scannable, with active state clearly shown.
- Top bar contains only global utilities and does not duplicate global navigation.
- Breadcrumbs appear directly above the page title.
- Page header includes title, status context where relevant, and one primary action.
- Main content is visually separated from global chrome and focused on the task.
- Responsive behavior preserves navigation discoverability and action clarity.

## Review History
- 2026-10-23 | Roberto Pineda (x-codec) | Selected UXP-01 as active UX baseline for PlamoScale & GunplaJunkies multi-tenant platform | Approved
