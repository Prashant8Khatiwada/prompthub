# PromptHub — Phasewise Build Plans Index

> **Project:** PromptHub — A branded prompt-delivery platform for AI content creators  
> **Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Supabase · TypeScript  
> **Status:** 🟡 In Progress — Boilerplate only, no feature code yet

---

## What Is PromptHub?

Creators post AI content on Instagram/TikTok. Viewers comment a keyword, get a DM with a branded link. That link lands on a beautiful, mobile-first prompt page on the creator's subdomain (e.g. `milan.prompthub.app/photo-enhance`).

---

## Phase Execution Order

Prompt each plan file serially in this exact order:

| # | Plan File | Focus Area | Status |
|---|-----------|-----------|--------|
| 1 | [PLAN_01_FOUNDATION.md](./PLAN_01_FOUNDATION.md) | Project setup, deps, env, DB schema, middleware | ⏳ Pending |
| 2 | [PLAN_02_PUBLIC_PAGE.md](./PLAN_02_PUBLIC_PAGE.md) | Public prompt page, creator bar, prompt gate, oEmbed | ⏳ Pending |
| 3 | [PLAN_03_ADMIN_AUTH.md](./PLAN_03_ADMIN_AUTH.md) | Supabase Auth, protected admin routes, login page | ⏳ Pending |
| 4 | [PLAN_04_PROMPT_CRUD.md](./PLAN_04_PROMPT_CRUD.md) | Admin prompt list, create/edit form, slug logic | ⏳ Pending |
| 5 | [PLAN_05_ANALYTICS.md](./PLAN_05_ANALYTICS.md) | Analytics dashboard, charts, event tracking | ⏳ Pending |
| 6 | [PLAN_06_SETTINGS.md](./PLAN_06_SETTINGS.md) | Creator settings page, avatar upload, branding | ⏳ Pending |
| 7 | [PLAN_07_POLISH.md](./PLAN_07_POLISH.md) | SEO, performance, error states, final polish | ⏳ Pending |

---

## Key Constraints to Remember

- **Next.js version is 16.2.4** (not 14 as stated in SRS — this is a newer breaking version)
- **React 19** is installed — use Server Components by default
- **Tailwind CSS v4** — config-free, CSS-first approach (no `tailwind.config.js` needed)
- **No component library** — pure Tailwind only
- **Single creator MVP** — no multi-tenant signup yet
- **No Stripe yet** — payment gate is UI stub only
- Read `node_modules/next/dist/docs/` before writing any Next.js-specific code

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
INSTAGRAM_ACCESS_TOKEN=
NEXT_PUBLIC_BASE_DOMAIN=prompthub.app
```
