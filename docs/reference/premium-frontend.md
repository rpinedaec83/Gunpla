# Premium Public Frontend

`apps/premium-web` is the public, Apple-inspired frontend for `plamoscale.com` and `gunplajunkies.com`.

## Stack

- Next.js 16 with the App Router
- Tailwind CSS 4 through `@tailwindcss/postcss`
- Framer Motion 14
- `next/image` with local WebP assets and blur placeholders
- System San Francisco typography through the native font stack

## Commands

```bash
npm --workspace=@gunpla/premium-web run dev
npm --workspace=@gunpla/premium-web run build
npm --workspace=@gunpla/premium-web run start
```

Local URLs:

- `http://localhost:3002/` serves PlamoScale.
- `http://localhost:3002/?tenant=gunplajunkies` previews GunplaJunkies.

## Tenant Resolution

`app/page.tsx` reads the `host` header. Hosts containing `gunplajunkies` render the GunplaJunkies tenant; every other host renders PlamoScale. The `?tenant=` query parameter is a local preview override and does not affect production routing.

`app/robots.ts` and `app/sitemap.ts` use the same host rule, so each domain receives its own canonical host and sitemap.

## Design System

- Surfaces: graphite `#08080a`, bone `#f4f2ee`, ink `#1d1d1f`.
- Accents: enamel blue `#2a63f0` for PlamoScale, deep red `#d23b40` for GunplaJunkies.
- One radius token: `--radius-panel: 22px`.
- Motion: 160ms, 280ms, and 520ms with two easing curves, transforms and opacity only.
- Reduced motion renders the static sequence layout and disables scroll-linked transforms.
- Contrast: white on blue 5.07:1, white on red 4.73:1, bone on graphite 17.9:1.

## Section Map

| Section | Anchor | Purpose |
|---|---|---|
| Hero | `#producto` | Large headline, device composition, primary CTA |
| Manifesto | `#manifiesto` | Light editorial statement with word reveal |
| Precision | `#precision` | Scroll-drawn runner signature |
| Sequence | `#secuencia` | Sticky three-step product sequence |
| Vitrine | `#vitrina` | Large founding-builder photography |
| Tools | `#herramientas` | Editorial feature rows |
| Immersive | `#inmersivo` | Outlined wordmark and layered depth |
| Specs | `#especificaciones` | Product facts |
| Access | `#acceso` | Closing CTA |

## Verification

- `npm --workspace=@gunpla/premium-web run build` passes.
- Lighthouse on both tenants: Performance 98, Accessibility 100, Best Practices 100, SEO 100.
- LCP 2.3s, CLS 0, TBT 0ms on the local production build.
- Desktop and mobile screenshots reviewed at 1440px and 390px for both tenants.
- No external font or stock image requests. Public assets total about 400 KB.

## Deployment Status

The app is not connected to the domains yet. The existing Express web apps still own every route on `plamoscale.com` and `gunplajunkies.com`.

Before cutover:

1. Add a production Dockerfile for `apps/premium-web` and a compose service on port 3002.
2. Choose one of these integration paths:
   - Catch-all proxy: route `/` to the Next app and proxy authenticated routes to the existing `plamoscale-web` and `gunplajunkies-web` services.
   - Staged split: serve the Next app on a preview host first, then move the apex domains after UAT.
3. Verify that `/workbench`, `/stash`, `/admin`, `/profile`, and the API remain reachable after the tunnel change.
4. Confirm the host-based tenant resolution behind Cloudflare Tunnel, since the tunnel must preserve the original `Host` header.
5. Re-run the SEO checks for `/robots.txt`, `/sitemap.xml`, canonical tags, and Open Graph images after cutover.
