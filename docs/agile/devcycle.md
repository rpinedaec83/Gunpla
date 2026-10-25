# Dev Cycle

Active tasks only. This is a burn-down list, not a history log.

## Current Phase

Name: Phase 3 (PVT) — Production Hardening, Relational PostgreSQL Persistence & Resilience
Goal: Transition persistence to PostgreSQL 16 (`gunpla-db`), ensuring ACID relational integrity, automated schema migration, and seed synchronization across all slices (DT1 through DT7).

## Active Tasks

### DT21 -- Pistas de Sonido / Soundscapes de Taller (Workshop Ambient Soundscapes & Generator)
- Description: In-browser procedural soundscape generator and ambient audio player embedded in "Mi Taller" to enhance focus and relaxation during scale model building, masking, and airbrushing sessions. Uses Web Audio API procedural synthesis with zero external audio download dependencies, supporting offline PWA playback, curated modeling presets (Lluvia en Taller, Compresor & Aerógrafo, Hangar Sci-Fi Mecha, Lo-Fi Chillhop), Pomodoro session timers (25m build / 5m cleanup), and customizable volume mixing.
- Acceptance Criteria:
  1. Data models and presets in `@gunpla/shared` (`SoundscapePreset`, `SoundscapeLayer`, `SoundscapeMode`, `SoundscapePresetConfig`).
  2. Pure procedural synthesis algorithms in `@gunpla/shared` using Web Audio API nodes (Brown noise for rain, resonant filtered pink noise for airbrush air-hiss/compressor, FM synth sub-bass drones for mecha hangar, pentatonic chord generator for lo-fi beats).
  3. API endpoints `GET /api/v1/workbench/soundscapes/presets` and `GET /api/v1/workbench/soundscapes/presets/:id`.
  4. OpenAPI 3.1 specification updated in `docs/reference/openapi-starter.yaml` and `apps/api/src/openapi/openapi-spec.ts`.
  5. Floating audio widget `#workshop-soundscape-widget` in Mi Taller with play/pause, master volume, individual layer mix sliders, preset pill selector, and Pomodoro timer.
  6. Header quick action `🎵 Soundscapes` in Mi Taller toolbar.
  7. Isolated unit test suite in `tests/unit/soundscapes.test.mjs`.
  8. Integration smoketest in `scripts/smoketest.mjs` verifying preset listing, retrieval, and UI widget presence.
  9. Deployment to Proxmox LXC 190 (`192.168.1.190`).
- Smoketest: `npm test`
- UAT: Open PlamoScale (`http://192.168.1.190:3000`), navigate to Mi Taller, click "🎵 Soundscapes", select "Hangar Sci-Fi Mecha" or "Lluvia en Taller", adjust volume, and verify procedural ambient playback and Pomodoro timer.

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
