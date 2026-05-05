# Agent Guide

This guide is for Codex and other general coding agents working in this repository. Follow explicit user instructions first; use this file for repo defaults.

## Working Rules

- Check `git status --short` before editing. This repo may have parallel work in progress, so do not revert, overwrite, or "clean up" changes you did not make.
- Keep changes scoped to the request. Do not edit `package.json`, `package-lock.json`, CI workflows, `.gitignore`, tests, or unrelated docs unless the user explicitly asks.
- Prefer `rg` and `rg --files` for repo inspection.
- Use `apply_patch` or normal editor operations for manual file edits. Avoid generated rewrites that churn formatting across unrelated files.
- Do not run destructive Git commands such as `git reset --hard`, `git checkout -- <file>`, or broad deletes unless the user explicitly requests them.
- Do not require vendor-specific bootstrap tools. If an optional tool is unavailable, continue with standard repo inspection and mention the fallback.

## Code Intelligence

This repository may be indexed by GitNexus. When GitNexus MCP or CLI tools are available, use them before code-symbol changes:

- Run impact analysis before modifying a function, class, method, or shared module export.
- Warn the user before proceeding if impact analysis reports high or critical risk.
- Run change detection before committing code changes.

Docs-only changes do not require symbol impact analysis. If GitNexus is not exposed in the current environment, fall back to `rg`, direct file reads, and targeted verification.

## Repository Layout

```text
frontend/                 Next.js frontend app
  pages/                  Pages Router routes and API routes
  src/components/         Shared React components
  src/hooks/              Custom React hooks
  src/lib/                Supabase, payment, validation, analytics, and utility modules
  public/                 Static assets served by Next.js
  next.config.js          Next.js configuration
  vercel.json             Vercel redirects, rewrites, headers, and CSP
supabase/                 SQL migrations, setup scripts, storage policies, and edge functions
docs/                     Project documentation
.github/workflows/        GitHub Actions CI definitions
```

There is no root npm workspace. Run npm commands from `frontend/`.

## npm Commands

Use Node.js 22 or newer.

```bash
cd frontend
npm ci
npm run dev
npm run lint
npm run test:run
npm run build
npm run test:e2e:smoke
npm run verify:ci
npm start
```

- `npm ci` is the clean install command used by CI.
- `npm run dev` starts the Next.js dev server.
- `npm run lint` runs ESLint.
- `npm run test:run` runs Vitest unit and API tests.
- `npm run build` runs the production Next.js build.
- `npm run test:e2e:smoke` runs Playwright smoke and accessibility tests.
- `npm run verify:ci` runs the CI-equivalent verification gate.
- `npm start` serves the production build after `npm run build`.

Treat `frontend/package.json` as the source of truth for runnable npm commands.

## Verification

Use the smallest verification set that proves the change:

- Docs-only changes: `git diff --check -- AGENTS.md docs/INFRASTRUCTURE.md docs/TESTING_DOCUMENTATION.md`
- Frontend code/config changes: from `frontend/`, run `npm run verify:ci` when feasible; otherwise run the smallest relevant subset and explain what did not run
- Dependency changes: only when requested, update lockfiles intentionally and rerun CI-equivalent commands
- Browser-facing changes: run the dev server and smoke test the affected routes

## Secrets And Environment

- Never commit real `.env` values, service keys, Stripe secrets, webhook secrets, access tokens, private keys, exported customer data, or production database dumps.
- `NEXT_PUBLIC_*` variables are bundled for browser use and must be treated as public.
- Server-only secrets, especially `SUPABASE_SERVICE_ROLE_KEY`, must only be used in API routes, scripts, Supabase functions, CI secrets, or hosting provider secret stores.
- Use `frontend/.env.example` for placeholders. Do not copy values from local `.env`, `.env.local`, `.env.production`, or dashboard screenshots into docs, tests, commits, or issue comments.
- If a secret is exposed, stop and tell the owner to rotate it before continuing.

## CI

GitHub Actions runs `.github/workflows/frontend-ci.yml` for frontend, Supabase, and workflow changes. The workflow:

- Uses Node.js 22
- Installs with `npm ci`
- Runs ESLint, Vitest unit/API tests, and the Next.js production build
- Runs Playwright smoke and accessibility tests with CI-safe placeholder environment variables
- Runs non-blocking npm audit plus PR dependency and secret scanning
- Inventories Supabase migrations and can run linked Supabase lint when repository secrets are present

Do not edit CI workflows unless the user specifically assigns that lane.

## Testing Standard

The current testing direction is:

- Unit and API tests: Vitest with jsdom, fast-check, and mocked external services
- Browser end-to-end tests: Playwright using `frontend/playwright.config.cjs`
- Framework assumptions: Next.js Pages Router, React 19, JavaScript files
- External services: mock Supabase, Stripe, Cal.com, analytics, and network calls unless a test is explicitly marked as an integration smoke test

Do not add new Create React App or Jest guidance.

## Owner Tasks To Track

- Keep `frontend/.env.example`, hosting secrets, and CI placeholder env values synchronized.
- Review hard-coded public analytics IDs and decide whether they should remain public constants or move to environment variables.
- Keep infrastructure docs current when Vercel, Supabase, Stripe, Cal.com, or CI ownership changes.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **militarydisabilitynexus** (3418 symbols, 4953 relationships, 81 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/militarydisabilitynexus/context` | Codebase overview, check index freshness |
| `gitnexus://repo/militarydisabilitynexus/clusters` | All functional areas |
| `gitnexus://repo/militarydisabilitynexus/processes` | All execution flows |
| `gitnexus://repo/militarydisabilitynexus/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
