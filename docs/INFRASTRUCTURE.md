# Infrastructure

This document describes the current operating shape for the Military Disability Nexus repository. It is intended for agents and maintainers who need accurate setup, verification, secret handling, and ownership guidance.

## Application Shape

- Frontend: Next.js Pages Router app in `frontend/`
- React: React 19 with JavaScript files
- Styling: Tailwind CSS plus existing global CSS files
- UI libraries: Radix UI primitives, lucide-react, sonner, TipTap for rich text editing
- Hosting target: Vercel, configured by `frontend/vercel.json`
- Data and storage: Supabase SQL, storage policies, and functions under `supabase/`
- Payments: Stripe checkout flow invoked through Supabase functions and frontend helpers
- Booking: Cal.com links and embed usage
- Analytics: PostHog, Meta Pixel, Reddit Pixel, and Google Ads conversion hooks

## Repository Layout

```text
frontend/
  pages/                    Next.js routes, API routes, and route groups
  pages/admin/              Admin screens and protected admin workflows
  pages/api/                Next.js API handlers for form/contact submissions
  src/components/           Shared site, diagnostic, payment, and admin components
  src/hooks/                React hooks, including calendar and utility hooks
  src/lib/                  Supabase clients, API wrappers, validation, payment, analytics
  public/                   Static assets
  scripts/                  One-off maintenance and migration scripts
  next.config.js            Next config, redirects, image policy
  vercel.json               Vercel routing, cache headers, security headers, CSP
supabase/
  migrations/               Database migrations
  functions/                Supabase edge functions
  *.sql                     Setup, permissions, storage, and seed scripts
docs/                       Project documentation
.github/workflows/          CI workflows
```

There is no root `package.json`; npm commands belong in `frontend/`.

## Runtime And npm

Use Node.js 20 or newer. CI uses npm and `frontend/package-lock.json`, so agents should use npm unless a user explicitly assigns a package-manager migration.

```bash
cd frontend
npm ci
npm run dev
```

Common commands:

| Purpose | Command |
| --- | --- |
| Clean install from lockfile | `npm ci` |
| Local dev server | `npm run dev` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Serve built app | `npm start` |
| Auto-fix lint issues | `npm run lint:fix` |

Do not edit `package.json` or `package-lock.json` from docs-only or infra-rules work.

## Verification Commands

Use the smallest command set that matches the change:

```bash
# Docs-only checks from repo root
git diff --check -- AGENTS.md docs/INFRASTRUCTURE.md docs/TESTING_DOCUMENTATION.md

# CI-equivalent frontend checks from frontend/
npm run lint
npm run build
```

For browser-facing work, also start the dev server:

```bash
cd frontend
npm run dev
```

Then smoke test the touched route at `http://localhost:3000`.

## Environment Variables

Use `frontend/.env.example` as the placeholder reference. Do not copy values from local `.env` files into documentation, commits, tests, or chat.

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Public anon key; still environment-specific |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Required by API routes and admin scripts; never expose to browser code |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser | Publishable Stripe key |
| `NEXT_PUBLIC_CAL_URL_DISCOVERY` | Browser | Discovery booking URL |
| `NEXT_PUBLIC_CAL_URL_CONSULTATION` | Browser | Consultation booking URL |
| `NEXT_PUBLIC_META_PIXEL_ID` | Browser | Optional Meta Pixel ID |
| `NEXT_PUBLIC_POSTHOG_HOST` | Browser | Optional PostHog host override |
| `NEXT_PUBLIC_GOOGLE_ADS_CP_SUCCESS_LABEL` | Browser | Optional conversion label used on C&P coaching success |
| `NEXT_PUBLIC_ENABLE_VISUAL_EDITS` | Browser | Development feature flag |
| `NEXT_PUBLIC_ENABLE_HEALTH_CHECK` | Browser | Development/diagnostic feature flag |

The codebase still contains a few legacy `REACT_APP_*` fallbacks and stale docs in other files. New work should prefer `NEXT_PUBLIC_*` for browser-exposed values and unprefixed names for server-only secrets.

## Secret Rules

- Never commit real `.env`, `.env.local`, `.env.production`, `.env.railway`, or `.env.render` values.
- Never paste service role keys, Stripe secret keys, webhook secrets, OAuth tokens, private keys, database URLs, customer files, or production exports into docs or PR comments.
- `NEXT_PUBLIC_*` means browser-visible, not secret. Do not put server credentials behind that prefix.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must stay server-side.
- CI, Vercel, Supabase, Stripe, and Cal.com credentials belong in their respective secret stores.
- If a secret appears in a tracked file or review artifact, stop and ask the owner to rotate it.

## CI

`.github/workflows/frontend-ci.yml` is the active GitHub Actions workflow for frontend verification. It runs on pull requests that touch `frontend/**` or the workflow file, and on pushes to `main` for the same paths.

The job:

1. Checks out the repo.
2. Sets up Node.js 20 with npm cache keyed to `frontend/package-lock.json`.
3. Runs `npm ci` in `frontend/`.
4. Runs `npm run lint`.
5. Runs `npm run build`.

CI currently supplies placeholder public environment variables for Supabase, Stripe, and Cal.com so build-time checks can run without production secrets.

Do not edit CI workflows from this lane. When test tooling is added, the testing lane should add Vitest and Playwright steps intentionally.

## Testing

Current automated verification is lint plus build. The testing standard is documented in `docs/TESTING_DOCUMENTATION.md`:

- Vitest for unit and component tests
- React Testing Library for component behavior
- Playwright for browser end-to-end smoke tests
- External services mocked by default

No test npm scripts are currently committed. A testing lane may add Playwright or Vitest config/spec files before scripts are wired; verify `frontend/package.json` before documenting or running test commands.

## Deployment Notes

- Vercel should use the Next.js framework preset with `frontend/` as the project root.
- The production build command is `npm run build` from `frontend/`.
- The production start command is `npm start` after a build, though Vercel normally manages serving.
- `frontend/vercel.json` owns redirects, rewrites, cache headers, security headers, CSP, and the canonical host redirect.
- Supabase migrations and permissions live under `supabase/`; database changes should be reviewed separately from docs and frontend-only lanes.

## Owner Tasks

- Add or wire Vitest and Playwright dependencies, configuration, npm scripts, and CI steps when the testing lane is assigned.
- Decide whether hard-coded public analytics IDs should remain in source or move to environment variables.
- Keep `frontend/.env.example`, Vercel environment settings, GitHub Actions placeholders, and this document synchronized.
- Review stale docs outside this lane that still mention Create React App, React Router, `npm start` as a dev command, or Jest-only testing.
- Periodically review `frontend/vercel.json` CSP entries when third-party scripts or embeds change.
- Confirm Supabase service-role usage remains limited to API routes, server scripts, and trusted backend functions.
