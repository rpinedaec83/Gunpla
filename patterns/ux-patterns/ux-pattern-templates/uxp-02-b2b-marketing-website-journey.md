# UX Pattern 02: B2B Marketing Website Journey

Status: Draft template
Owner: Product, UX, and Growth
Last Reviewed: TBD

## Intent
A high-clarity B2B marketing website for AI, SaaS, platform, or services companies that need to explain value quickly, build trust, and convert visitors into qualified conversations.

This pattern emphasizes narrative clarity, evidence-backed credibility, and a clean progression from awareness to action.

## Preferred Description
Narrative-first website optimized for conversion: sticky top navigation, clear hero value proposition, trust signals early, proof-backed product or service sections, explicit engagement paths, and a focused contact conversion endpoint.

## Evidence-Informed Rules (Website Best Practice)
Use these rules when this pattern is selected:
- Make the value proposition understandable within the first viewport.
- Keep one primary call to action visible in hero and repeated in later sections.
- Keep navigation simple, predictable, and section-oriented.
- Use specific proof signals early, such as product count, years operating, customer scale, or measurable outcomes.
- Organize long pages into clear thematic sections with meaningful headings.
- Use scannable content blocks with short paragraphs and clear action labels.
- Separate global messaging from product detail pages; do not overload the home page with technical depth.
- Keep visual rhythm consistent: statement, evidence, explanation, action.
- Maintain strong contrast and typographic hierarchy for rapid scanning.
- Ensure mobile layout preserves reading order and clear CTA access.

## Preferred Structure
1. Top navigation with anchored sections and persistent primary CTA
2. Hero with positioning statement, supporting copy, and primary CTA
3. Trust bar with key metrics or market proof
4. Operating model section explaining how value is created
5. Product or service portfolio section with clear differentiation
6. Platform or capability section showing reusable advantage
7. Methodology section showing how engagement starts and de-risks delivery
8. Team or credibility section with concrete experience signals
9. Engagement section with distinct entry paths
10. Footer with contact, legal links, and supporting navigation

## Core Layout
~~~text
+-------------------------------------------------------------+
| Logo | Nav: Model Portfolio Platform Method Team Contact CTA |
+-------------------------------------------------------------+
| Hero: Value Proposition                                     |
| Subcopy + Primary CTA + Secondary CTA                      |
+-------------------------------------------------------------+
| Trust Signals: Metrics, Logos, Proof Points                |
+-------------------------------------------------------------+
| Model / How It Works                                        |
+-------------------------------------------------------------+
| Portfolio or Solutions Cards                                |
+-------------------------------------------------------------+
| Platform / Capability Advantage                             |
+-------------------------------------------------------------+
| Methodology / Engagement Steps                              |
+-------------------------------------------------------------+
| Team Credibility                                             |
+-------------------------------------------------------------+
| Engagement Paths + Contact CTA                               |
+-------------------------------------------------------------+
| Footer: Contact, Terms, Privacy, Social                      |
+-------------------------------------------------------------+
~~~

## Top Navigation
Use a compact top navigation for orientation and fast section jumps.

Include:
- Brand mark
- 5 to 7 section links
- Persistent primary CTA button

Guidance:
- Keep labels short and literal.
- Keep one sticky header state on desktop and mobile.
- Do not duplicate identical global navigation in multiple places.

## Hero Section
The hero should answer what the company does, for whom, and why it matters.

Include:
- Strong positioning headline
- One short supporting paragraph
- Primary CTA
- Optional secondary CTA

Guidance:
- Avoid abstract slogans without outcome context.
- Keep CTA text action-oriented, such as Start, Talk, Book, or Explore.

## Trust And Proof
Show concrete credibility early.

Examples:
- Years operating
- Products in market
- Users served
- Volume processed
- Partner logos or customer references

Guidance:
- Prefer verifiable and specific numbers.
- Avoid vague claims without evidence.

## Portfolio Or Solutions Section
Present offerings as clearly distinct options.

Include per card:
- Name
- One-line positioning
- Who it is for
- Link to learn more

Guidance:
- Keep card descriptions outcome-focused.
- Avoid feature dumps on overview pages.

## Methodology Section
Explain how work begins and how risk is reduced.

Guidance:
- Use step names with short definitions.
- Keep step count limited and easy to scan.
- End with a clear start CTA.

## Team Credibility Section
Use this section to reduce perceived delivery risk.

Include:
- Relevant experience signals
- Roles and capabilities
- Optional notable background highlights

Guidance:
- Highlight execution credibility, not only titles.
- Keep biographies short and scannable.

## Engagement Paths
Offer clear entry points for different audiences.

Examples:
- Build with us
- Use the platform
- Partner or invest

Guidance:
- Each path should state audience and expected next step.
- Keep conversion friction low with direct contact actions.

## Responsive Behavior
The website must preserve clarity on smaller screens.

Recommended behavior:
- Desktop: full navigation and section flow visible
- Tablet: compact navigation and tightened section spacing
- Mobile: menu button with clear label and preserved CTA visibility
- Cards stack vertically with consistent reading order
- Hero CTA remains visible without excessive scrolling

Guidance:
- Preserve heading hierarchy across breakpoints.
- Avoid hiding key proof and CTA content behind carousels.

## Best Fit
- B2B SaaS websites
- AI product websites
- Venture studio websites
- Platform and services websites
- Productized services landing hubs

## Avoid
- Multiple competing primary CTAs in the same section
- Vague hero messaging with no audience or outcome clarity
- Deep technical detail on top-level marketing pages
- Long unstructured text blocks without section anchors
- Weak proof claims without measurable evidence
- Navigation labels that reflect internal jargon only
- Auto-rotating carousels for critical message blocks

## AI Implementation Guidance
When generating a public-facing B2B website, default to this pattern unless another website pattern is explicitly requested.

The AI should:
- Build a sticky top navigation with section anchors and one persistent CTA
- Create a concise hero with clear positioning and action
- Insert a trust signal section near the top
- Organize content into model, portfolio, platform, methodology, team, and engagement blocks
- Keep every section scannable with clear headings and short supporting text
- Repeat CTA opportunities at logical decision points
- Keep mobile reading order and CTA access consistent

## Strong Pattern Prompt (Use This)
Use this exact prompt when you want high-quality implementation:

Create a high-performing B2B marketing website with a clear narrative journey from value proposition to proof to conversion. Use a sticky top navigation with section anchors and one persistent primary CTA. Build a hero that states what we do, for whom, and why it matters in plain language. Add early trust signals with concrete metrics. Structure the page into clear sections: operating model, portfolio or solutions, platform advantage, engagement methodology, team credibility, and engagement paths. Keep section copy concise and scannable, with explicit action labels and repeated CTA points at decision moments. Optimize for responsive behavior so hierarchy, proof, and CTA visibility are preserved on tablet and mobile.

## Acceptance Checklist
Use this checklist to validate generated UI:
- Hero clearly communicates audience, value, and action.
- Sticky navigation includes clear section labels and one persistent CTA.
- Proof signals appear early and are specific.
- Portfolio or solutions section differentiates offerings clearly.
- Methodology explains starting process and de-risking steps.
- Team section communicates delivery credibility.
- Engagement section offers clear audience-specific entry points.
- Mobile layout preserves message order and CTA discoverability.

Short prompt variant:
Use a narrative-first B2B website pattern with sticky top nav, clear hero value proposition, early proof metrics, structured sections for model and portfolio, explicit engagement paths, and repeated conversion CTAs with strong mobile readability.

## Review History
- YYYY-MM-DD | Reviewer | Notes | Decision