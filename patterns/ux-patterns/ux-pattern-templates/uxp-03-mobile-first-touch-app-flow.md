# UX Pattern 03: Mobile-First Touch App Flow

Status: Draft template
Owner: Product, UX, and Engineering
Last Reviewed: TBD

## Intent
A simple, touch-first mobile app pattern for task completion with low friction, high readability, and predictable behavior in both portrait and landscape orientations.

This pattern is designed for applications built with web stacks (HTML/CSS/TS) or native-like stacks (React Native and similar frameworks).

## Preferred Description
Mobile-first app experience with large tappable controls, clear readable text, visible and simple navigation, no dropdown controls, and orientation-safe responsive layouts that preserve usability and context.

## Evidence-Informed Rules (Mobile UX)
Use these rules when this pattern is selected:
- Prioritize direct tap actions over hidden or complex interaction patterns.
- Keep core controls large and comfortably spaced.
- Meet WCAG minimum target size of 24 x 24 CSS pixels, and prefer larger primary touch targets (for example around 44 x 44 CSS pixels or approximately 1 cm physical size where practical).
- Avoid dense clusters of adjacent controls that increase accidental taps.
- Keep text legible with strong contrast and comfortable line length.
- Support reflow and readability at narrow widths (down to approximately 320 CSS pixels for web layouts) without two-dimensional scrolling for standard content.
- Keep navigation discoverable. Do not rely on gesture-only hidden navigation.
- Use clear labels on controls. Do not rely on icons alone for primary actions.
- Provide clear press, loading, success, and error feedback for every important action.
- Keep UI chrome minimal so content and primary actions stay dominant.

## Preferred Structure
1. Compact app header with title and optional back action
2. Primary task content in a single-column flow
3. Large action buttons with clear labels
4. Secondary options as inline choices, segmented controls, chips, or full-screen pickers
5. Optional persistent bottom action rail or bottom tabs when multiple top-level sections are needed
6. Lightweight confirmation and status feedback area

## Core Layout
~~~text
+------------------------------------------------+
| Header: Back | Screen Title | Context Status   |
+------------------------------------------------+
| Readable Intro / Current Task                 |
|                                               |
| Primary Content Block                         |
| - Inputs with clear labels                    |
| - Inline options (no dropdown menus)          |
| - Validation hints near fields                |
|                                               |
| Primary Action Button (large)                 |
| Secondary Action Button (large)               |
+------------------------------------------------+
| Optional Bottom Tabs or Action Rail           |
+------------------------------------------------+
~~~

## Navigation Model
Use simple, visible navigation patterns.

Guidance:
- Prefer one of these patterns:
  - Bottom tabs for 3 to 5 top-level destinations
  - Single primary flow with back navigation
  - Home hub with clear task cards
- Avoid nested menus for common actions.
- Avoid hidden gesture-only entry points for primary navigation.
- Keep active location obvious at all times.

## Controls And Buttons
Design controls for one-hand touch use and low error rates.

Guidance:
- Use prominent primary action buttons.
- Keep adequate spacing between nearby actionable elements.
- Keep destructive actions visually distinct and confirm when necessary.
- Prefer direct controls such as:
  - Segmented controls
  - Radio groups
  - Toggle groups
  - Chips
  - Step-based full-screen pickers
- Do not use small dropdown menus or tiny disclosure controls for primary choices.

## Text And Readability
Keep reading effort low.

Guidance:
- Use clear heading hierarchy and short paragraphs.
- Keep body text readable without zoom in normal device usage.
- Keep line length and spacing comfortable in portrait and landscape.
- Avoid long walls of text between action points.

## Orientation Behavior (Portrait And Landscape)
The app must remain fully usable in both orientations.

Recommended behavior:
- Portrait: single-column default for task flow and forms
- Landscape: preserve action visibility and avoid clipping primary controls
- Reposition panels when needed, but do not remove critical information or actions
- Keep fixed headers or footers from obscuring focused fields and critical content
- Preserve logical reading and interaction order when rotating

Guidance:
- Rotation must not reset user input unexpectedly.
- Keep validation messages and status feedback visible after orientation changes.

## State Feedback And Reactivity
The interface should feel responsive and informative.

Guidance:
- Show immediate visual feedback on tap/press.
- Show progress for async actions.
- Show success and error states close to the action source.
- Disable repeated submissions while an action is processing.
- Keep transitions quick and purposeful, avoid decorative motion that delays tasks.

## Accessibility Baseline
Treat accessibility as a core quality requirement.

Guidance:
- Ensure keyboard and assistive technology compatibility for web implementations.
- Ensure controls have programmatic labels and meaningful names.
- Maintain sufficient color contrast for text and controls.
- Keep focus indicators visible.
- Avoid interaction patterns that require fine motor precision.

## Best Fit
- Consumer mobile apps with clear task flows
- Internal field operations apps
- Simple service and booking apps
- Account management apps
- Mobile-first dashboards with lightweight controls

## Avoid
- Dropdown-heavy forms for common choices
- Desktop-style top navigation bars copied directly to mobile
- Tiny icon-only primary controls
- Gesture-only navigation for critical routes
- Dense action clusters with low spacing
- Landscape layouts that hide key actions or text
- Browser-like multipane chrome for simple task flows

## AI Implementation Guidance
When generating a mobile app UI, default to this pattern unless another mobile pattern is explicitly requested.

The AI should:
- Build a single-column mobile-first flow first, then adapt to landscape
- Use large labeled buttons for primary actions
- Replace dropdowns with segmented options, chips, radios, or full-screen selection steps
- Keep navigation visible and simple
- Preserve full usability in portrait and landscape
- Keep text readable and concise
- Apply immediate and clear reactive feedback for user actions

## Implementation Notes (Web And React Native)
Use this pattern across common stacks:
- Web (HTML/CSS/TS): use responsive layout, pointer-friendly sizing, and keyboard-accessible controls
- React Native: use platform-safe areas, touchable controls with comfortable hit slop, and orientation-aware layout adjustments
- In both stacks: keep interaction model consistent, avoid hidden complexity, and preserve state during orientation changes

## Strong Pattern Prompt (Use This)
Use this exact prompt when you want high-quality implementation:

Create a mobile-first app interface focused on simple, touch-friendly task completion. Use a single-column flow with large labeled buttons, readable text, and visible navigation. Do not use dropdown controls for common decisions. Replace dropdowns with segmented controls, radio groups, chips, toggles, or full-screen pickers. Keep primary actions prominent and well spaced to reduce mistaps. Ensure the app works cleanly in both portrait and landscape without hiding key actions, clipping text, or resetting user input. Add immediate press feedback, loading states, and clear success or error messages near the action source. Keep chrome minimal and avoid desktop-style browser UX patterns.

## Acceptance Checklist
Use this checklist to validate generated UI:
- Primary actions are large, labeled, and easy to tap.
- Core controls meet minimum target-size and spacing expectations.
- No dropdown controls are used for common primary choices.
- Navigation is visible, simple, and discoverable.
- Portrait and landscape both preserve full task usability.
- Text remains readable and action labels are clear in both orientations.
- Tap feedback, loading, success, and error states are present and understandable.
- Layout avoids browser-like desktop chrome and unnecessary complexity.

Short prompt variant:
Use a mobile-first, touch-friendly app pattern with large labeled buttons, readable text, no dropdowns, visible simple navigation, and full usability in both portrait and landscape.

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision