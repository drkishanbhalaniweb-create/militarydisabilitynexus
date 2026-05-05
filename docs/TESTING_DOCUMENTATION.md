# Testing Documentation

This repository is a Next.js frontend app in `frontend/`. The historical Create React App and Jest guidance is no longer the standard for new work. The intended test stack is Vitest for unit/component coverage and Playwright for browser end-to-end coverage.

## Current State

`frontend/package.json` currently exposes these scripts:

```bash
npm run dev
npm run lint
npm run build
npm start
npm run lint:fix
```

There are no committed Vitest or Playwright npm scripts yet, and CI currently verifies lint plus production build only. A parallel testing lane may add config files or specs before scripts are wired; treat `frontend/package.json` as the source of truth for runnable commands. Until the test tooling lane lands, use `npm run lint`, `npm run build`, and focused manual smoke tests as the required verification baseline.

## Command Matrix

Run commands from `frontend/`.

| Purpose | Command | Status |
| --- | --- | --- |
| Install exactly from lockfile | `npm ci` | Current |
| Start local Next.js dev server | `npm run dev` | Current |
| Lint frontend files | `npm run lint` | Current |
| Production build | `npm run build` | Current |
| Serve production build | `npm start` | Current, after build |
| Unit/component tests | `npm run test` | Owner task |
| Watch unit/component tests | `npm run test:watch` | Owner task |
| Coverage report | `npm run test:coverage` | Owner task |
| Playwright browser tests | `npm run test:e2e` | Owner task |
| Playwright UI mode | `npm run test:e2e:ui` | Owner task |

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

Current CI in `.github/workflows/frontend-ci.yml` runs:

```bash
npm ci
npm run lint
npm run build
```

When test tooling is added, extend CI in this order:

1. `npm run test`
2. `npm run build`
3. `npm run test:e2e` against a local production server or a preview deployment

Use CI placeholders for public env variables and CI secret stores for server-only secrets. Keep Playwright browser installation explicit in the test lane.

## Manual Verification Checklist

Until automated tests exist, use focused manual checks for changed areas:

- `npm run lint`
- `npm run build`
- Start `npm run dev` and open the affected route
- Check desktop and mobile viewport behavior
- Submit forms with safe test data only
- Verify the diagnostic flow reaches results
- Confirm browser console has no new errors on touched pages
- Confirm no real analytics, payment, or booking side effects were triggered during testing

## Owner Tasks

- Add or finalize Vitest dependencies, `vitest.config.*`, and DOM setup.
- Add or finalize Playwright dependencies, `playwright.config.*`, and smoke specs.
- Add npm scripts for `test`, `test:watch`, `test:coverage`, `test:e2e`, and `test:e2e:ui`.
- Add stable mocks for Supabase, Stripe, Cal.com, analytics pixels, and file uploads.
- Update CI to run tests after the scripts exist.
- Add coverage thresholds only after the initial suite is stable enough to avoid blocking unrelated work.
- Remove or archive remaining stale CRA/Jest references in docs outside this lane when those docs are assigned.
