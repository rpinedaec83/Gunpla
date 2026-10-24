# Dev Cycle

Active tasks only. This is a burn-down list, not a history log.

## Current Phase

Name: Phase 2 (DVT) — Pilot Community Engagement, Interactive Contests & Stash Marketplace
Goal: Deliver interactive group builds & contest submissions with community voting (Slice 6), and the personal Stash Marketplace & Custom Commissions directory (Slice 7).

## Active Tasks

### DT7 -- Slice 7: Stash Marketplace & Custom Commissions Directory | eMOE: 4 CU
- Goal: Enable builders to list kits from their personal Stash for trade or sale (`for_trade`), browse available kits from other builders with direct WhatsApp contact links, and request or list custom airbrush/assembly painting commissions.
- API Result: `GET /api/v1/marketplace/listings`, `POST /api/v1/marketplace/listings`, `GET /api/v1/commissions/builders`.
- Smoketest: Run `npm run smoketest` verifying marketplace listing creation from a stash item, search by scale/brand, and commission inquiries.
- UAT: Mark a stash item as for-trade with price and notes, verify it appears in the public marketplace, and click contact.

## Reset

Use this section only for unplanned blocker work that interrupts the active phase.

## Notes

- Remove completed tasks from this file.
- Do not add DONE labels, checkboxes, or strikethroughs.
- Record completed work in `retro.md`.
- Use `DT` for planned devtasks in the active cycle.
- Use `RDT` for reset devtasks that interrupt the current cycle.
- Create one git commit per completed `DT` or `RDT` when the repo uses git.
- If the repo has a GitHub remote, push the branch and update or create the related pull request after each completed `DT` or `RDT`.
