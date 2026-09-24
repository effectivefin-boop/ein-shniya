# עין שנייה — marketing site

Hebrew RTL marketing homepage for **עין שנייה**: simple calculators that show where you stand and where there’s a gap worth checking.

> **Slogan:** גם לכסף מגיע עין שנייה.
>
> **Legal:** Privacy and Terms pages are **drafts for lawyer review** (`טיוטה לאישור עו״ד`). They are not legal advice and must be replaced with approved copy before collecting real user data or going to production with lead flows.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- `next/font` — Heebo (Hebrew + Latin)
- Server Components by default; client only for mobile nav

## Setup

```bash
cd /workspace/checkup-site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # serve production build
```

## Brand tokens (CSS variables in `src/app/globals.css`)

| Token | Hex | Role |
|-------|-----|------|
| `--color-primary` | `#0d5c63` | Deep teal — CTAs, links, “today/possible” bars |
| `--color-primary-hover` | `#0a4a50` | Primary hover |
| `--color-accent` / `--color-gap` | `#e07a5f` | Coral — **gaps only** (never for primary CTAs) |
| `--color-bg` | `#f7f9f8` | Off-white page background |
| `--color-surface` | `#ffffff` | Cards / header |
| `--color-text` | `#1a2b2c` | Body text |

## Project layout

```
src/app/           # routes: /, /calculators, /blog, /about, /privacy, /terms (+ slug stubs)
src/components/    # Header, Footer, Hero, … + analytics/ (GTM, consent banner)
src/lib/analytics/ # config, consent, trackEvent → dataLayer
next.config.ts     # security headers (CSP, XFO, nosniff, Referrer-Policy, Permissions-Policy, HSTS)
```

Folder path remains `checkup-site` (legacy path only).

## Compliance notes (product)

- Site provides **check / illustration tools**, not advice.
- Operator is **not** a licensed pension marketer; leads go to a licensed professional (`איש מקצוע בעל רישיון`).
- Do not use **משווק** in user-facing CTAs for lead recipients.
- Trust short copy lives in the mid/lower **אמון** block — not under the Hero CTA.

## Analytics (ready for common tools)

**Hub:** Google Tag Manager (`NEXT_PUBLIC_GTM_ID`). Put GA4, Meta Pixel, Clarity, Hotjar, LinkedIn Insight Tag, etc. as tags *inside* the GTM container. One ID in env is enough for most setups.

**Optional direct env fallbacks** (only if not already in GTM):

| Variable | Tool |
|----------|------|
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta (Facebook) Pixel |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity |

**Consent:** By default (`NEXT_PUBLIC_ANALYTICS_CONSENT_REQUIRED=true`) tags load only after the user taps **לאשר מדידה**. Choice is stored in `localStorage` under `ein-shniya-analytics-consent`. Google Consent Mode v2 defaults start as denied until grant.

**Custom events:** from client code, `import { trackEvent } from "@/lib/analytics/track"` then `trackEvent("lead_form_submit", { calculator: "pension-gap" })` — pushes to `dataLayer` for GTM.

**Setup:**

1. Copy `.env.example` → `.env.local` (or set the same keys in Vercel).
2. Create a GTM container → paste `GTM-…` into `NEXT_PUBLIC_GTM_ID`.
3. In GTM, add tags for GA4 / Meta / Clarity / … and publish.
4. Redeploy. Confirm the consent banner, then check GTM Preview / Tag Assistant.

CSP in `next.config.ts` already allows the usual analytics hosts (GTM, GA, Meta, Clarity, Hotjar, LinkedIn). If you add a niche vendor, extend `script-src` / `connect-src` / `img-src` there.

Privacy draft (`/privacy`) mentions measurement cookies — still **טיוטה לאישור עו״ד** before real data collection.

## Security

`next.config.ts` sets for all routes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera/mic/geo/payment/usb off)
- `Content-Security-Policy` (self + analytics vendor hosts listed above)
- `Strict-Transport-Security` (for HTTPS deployments)
- `poweredByHeader: false`

No analytics keys or secrets are hard-coded; IDs come from env only.
