# Testing Documentation

This repository is a Next.js frontend app in `frontend/`. The historical Create React App and Jest guidance is no longer the standard for new work. The intended test stack is Vitest for unit/component coverage and Playwright for browser end-to-end coverage.

## Current State

`frontend/package.json` provides scripts for development, testing, and CI verification:

```bash
npm run dev            # Start Next.js development server
npm run lint           # Run ESLint across frontend
npm run lint:fix       # Run ESLint with auto-fix
npm run test           # Vitest watch mode
npm run test:run       # Vitest run unit & API test suites
npm run test:e2e       # Playwright end-to-end tests
npm run test:e2e:smoke # Playwright smoke and accessibility tests
npm run build          # Production Next.js build
npm run verify:ci      # Full CI verification gate (lint + test + build + e2e)
npm start              # Serve production build
```

## Command Matrix

Run commands from `frontend/`.

| Purpose | Command | Status |
| --- | --- | --- |
| Install exactly from lockfile | `npm ci` | Active |
| Start local Next.js dev server | `npm run dev` | Active |
| Lint frontend files | `npm run lint` | Active |
| Unit & API tests (Vitest) | `npm run test:run` | Active |
| Watch unit/component tests | `npm run test` | Active |
| Playwright browser & a11y tests | `npm run test:e2e:smoke` | Active |
| Production build | `npm run build` | Active |
| CI verification gate | `npm run verify:ci` | Active |
| Serve production build | `npm start` | Active, after build |

## Target Tooling

Use this stack when the testing lane is implemented:

- Vitest as the unit and component test runner.
- React Testing Library for component rendering and user-level queries.
- `@testing-library/user-event` for realistic interactions.
- `@testing-library/jest-dom` matchers through Vitest setup.
- Playwright for browser flows, responsive checks, and route-level smoke tests.
- Optional `fast-check` only where property-based tests add clear value.

Avoid adding new Jest, Enzyme, Create React App, or React Scripts guidance.

## Suggested npm Scripts

These scripts are the expected shape once dependencies and config are intentionally added:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Adding these scripts requires a deliberate package and lockfile change. Do not make that change from a docs-only lane.

## Recommended File Layout

```text
frontend/
  vitest.config.{mjs,cjs}        Owner task
  playwright.config.{mjs,cjs}    Owner task or testing-lane output
  test/ or tests/
    setup.js                     Vitest DOM setup
    mocks/                       Supabase, Stripe, Cal.com, analytics mocks
    fixtures/                    Stable test data
    e2e/
      *.spec.js                  Playwright browser specs, if config points here
  e2e/
    *.spec.js                    Alternative Playwright location
  src/
    **/*.test.js                 Unit/component tests colocated with code
  pages/
    **/*.test.js                 API route or page-level tests when useful
```

Colocation is preferred for unit tests because it keeps ownership obvious. For Playwright, follow the committed `testDir` in `playwright.config.*`; do not move another lane's specs just to match this document.

## What To Test With Vitest

Prioritize deterministic logic and component behavior:

- `src/lib/diagnosticScoring.js` and `src/lib/diagnosticConfig.js`
- `src/lib/submissionValidation.js`, `formDataParser.js`, and file type detection helpers
- Pricing formatting and payment helper behavior that does not require live Stripe calls
- Supabase API wrapper behavior with mocked clients
- Diagnostic components such as `QuestionCard`, `ProgressBar`, `AssessmentBreakdown`, and `RecommendationCard`
- Shared layout, form, upload, and admin components where regressions are likely

Use user-facing assertions:

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import QuestionCard from './QuestionCard';

describe('QuestionCard', () => {
  it('calls the answer handler when an option is selected', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();

    render(<QuestionCard question={questionFixture} onAnswer={onAnswer} />);

    await user.click(screen.getByRole('button', { name: /yes/i }));

    expect(onAnswer).toHaveBeenCalledWith(expect.objectContaining({
      questionId: questionFixture.id,
    }));
  });
});
```

Prefer roles, labels, and visible text. Avoid testing private implementation details.

## What To Test With Playwright

Use Playwright for flows that need routing, hydration, browser APIs, or viewport behavior:

- Homepage and primary navigation smoke test
- Services, blog, case studies, conditions, and community route smoke tests
- Diagnostic start-to-results journey
- Contact and intake form validation states
- Payment success and canceled pages with mocked or fixture state
- Admin login guard and protected-route behavior
- Mobile viewport smoke tests for the highest-traffic pages

Browser tests must not call real payment, booking, analytics, or production database services. Mock network calls or point at disposable test infrastructure.

## Environment Rules For Tests

- Keep test env values in placeholders or test-only fixtures.
- Do not use production Supabase service role keys in local tests, CI tests, screenshots, or traces.
- Treat `NEXT_PUBLIC_*` variables as public. They can be placeholders in CI.
- Mock Supabase, Stripe, Cal.com, PostHog, Meta Pixel, Reddit Pixel, and Google Ads unless a test is explicitly scoped as an external integration smoke test.
- Do not commit Playwright traces, videos, screenshots, or reports unless they are intentional documentation artifacts.

## CI Guidance

The active CI pipeline in `.github/workflows/frontend-ci.yml` runs:

1. **Frontend quality**: `npm run lint` → `npm run test:run` → `npm run build` (with Next.js build cache)
2. **E2E smoke**: `npm run test:e2e:smoke` (with Playwright browser binary cache and axe-core accessibility checks)
3. **Supabase and Edge Functions**: Deno type-checking/linting for Edge Functions, SQL migration validation, and linked DB linting
4. **Security checks**: TruffleHog secret scanning, PR Dependency Review, and non-blocking high-severity npm audit
5. **CI Pipeline Gate**: Aggregates all job statuses into a GitHub Actions Step Summary table

Use CI placeholders for public env variables and CI secret stores for server-only secrets.

## Manual Verification Checklist

For manual verification during local development:

- `npm run lint`
- `npm run test:run`
- `npm run build`
- Start `npm run dev` and open the affected route
- Check desktop and mobile viewport behavior
- Submit forms with safe test data only
- Verify the diagnostic flow reaches results
- Confirm browser console has no new errors on touched pages
- Confirm no real analytics, payment, or booking side effects were triggered during testing

## Owner Tasks

- Keep `frontend/.env.example`, Vercel environment settings, GitHub Actions placeholders, and this document synchronized.
- Add coverage thresholds when the test suite expands to cover remaining dynamic admin routes.
- Periodically review `frontend/vercel.json` CSP entries when third-party scripts or embeds change.
