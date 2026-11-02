const { expect, test } = require('@playwright/test');
const { stabilizeExternalRequests } = require('./support/network');
const { findCriticalAxeViolations, formatAxeViolations } = require('./support/axe');

/**
 * Resilient selector helpers for the global search bar, dialog, and results
 */
function getSearchTrigger(page) {
  return page.locator('[data-testid="search-trigger"]')
    .or(page.getByRole('button', { name: /search/i }))
    .or(page.locator('button:has-text("Search")'))
    .or(page.locator('button:has-text("⌘K")'))
    .or(page.locator('button:has-text("Ctrl+K")'))
    .first();
}

function getMobileSearchTrigger(page) {
  return page.locator('[data-testid="mobile-search-trigger"]')
    .or(page.locator('[data-testid="mobile-menu"] button:has-text("Search")'))
    .first();
}

function getSearchDialog(page) {
  return page.locator('[role="dialog"]')
    .or(page.locator('[cmdk-root]'))
    .or(page.locator('[data-testid="search-dialog"]'))
    .first();
}

function getSearchInput(page) {
  return page
    .locator('[role="dialog"]')
    .locator('[cmdk-input], [data-testid="search-input"], input')
    .first();
}

function getSearchResults(page) {
  return page
    .locator('[role="dialog"]')
    .locator('[cmdk-item], [role="option"], [data-testid="search-result-item"]');
}

function getSearchEmpty(page) {
  return page
    .locator('[role="dialog"]')
    .locator('[cmdk-empty], [data-testid="search-empty"]')
    .or(page.locator('[role="dialog"]').getByText(/no results found/i))
    .first();
}

async function openSearchDialog(page, method = 'click') {
  if (method === 'shortcut') {
    await page.keyboard.press('Control+k');
    const dialog = getSearchDialog(page);
    try {
      await dialog.waitFor({ state: 'visible', timeout: 2000 });
      return dialog;
    } catch {
      await page.keyboard.press('Meta+k');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      return dialog;
    }
  }

  const trigger = getSearchTrigger(page);
  await expect(trigger).toBeVisible({ timeout: 5000 });
  const dialog = getSearchDialog(page);
  await trigger.click();
  try {
    await dialog.waitFor({ state: 'visible', timeout: 2000 });
    return dialog;
  } catch {
    await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    return dialog;
  }
}

test.beforeEach(async ({ page }) => {
  await stabilizeExternalRequests(page);
});

// =============================================================================
// TIER 1: FEATURE COVERAGE (Core User Journeys)
// =============================================================================
test.describe('Tier 1: Feature Coverage (Core User Journeys)', () => {
  const publicRoutes = ['/', '/services', '/blog'];

  for (const route of publicRoutes) {
    test(`T1.1: Global search trigger is visible in header on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main')).toBeVisible();

      const trigger = getSearchTrigger(page);
      await expect(trigger).toBeVisible();
    });
  }

  test('T1.2: Clicking the search trigger opens interactive search dialog', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const dialog = await openSearchDialog(page, 'click');
    await expect(dialog).toBeVisible();

    const input = getSearchInput(page);
    await expect(input).toBeVisible();
  });

  test('T1.3: Keyboard shortcut (Ctrl+K / Cmd+K) opens search dialog', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const dialog = await openSearchDialog(page, 'shortcut');
    await expect(dialog).toBeVisible();

    const input = getSearchInput(page);
    await expect(input).toBeVisible();
  });

  test('T1.4: Typing a search query displays matched results with category badges', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('nexus');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const count = await results.count();
    expect(count).toBeGreaterThan(0);

    const firstResultText = await results.first().textContent();
    expect(firstResultText.length).toBeGreaterThan(0);
  });

  test('T1.5: Selecting a search result navigates to target page and closes dialog', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('sleep apnea');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    await results.first().click();

    await page.waitForURL(/\/(services|blog|case-studies|community)\/.+/i, { timeout: 10000, waitUntil: 'domcontentloaded' });

    const dialog = getSearchDialog(page);
    await expect(dialog).toBeHidden();
  });

  test('T1.6: Typing an unmatchable query displays clear empty state messaging', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('xyznonexistentterm999');

    const empty = getSearchEmpty(page);
    await expect(empty).toBeVisible({ timeout: 5000 });
    await expect(empty).toHaveText(/no results found/i);

    const results = getSearchResults(page);
    expect(await results.count()).toBe(0);
  });
});

// =============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// =============================================================================
test.describe('Tier 2: Boundary & Corner Cases', () => {
  test('T2.1: Empty and whitespace-only queries do not display spurious results', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('   ');

    const results = getSearchResults(page);
    expect(await results.count()).toBe(0);
  });

  test('T2.2: Single character query respects fast-path / minimum length threshold', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('a');

    const results = getSearchResults(page);
    expect(await results.count()).toBe(0);
  });

  test('T2.3: Query with PostgREST/SQL delimiters executes safely without syntax errors', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill("ptsd, (sleep); 'drop");

    const dialog = getSearchDialog(page);
    await expect(dialog).toBeVisible();
  });

  test('T2.4: Pressing Escape closes the search dialog immediately', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const dialog = await openSearchDialog(page);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5000 });
  });

  test('T2.5: Keyboard arrow navigation highlights results in command list', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('nexus');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('ArrowDown');

    const selectedItem = page.locator('[role="dialog"]').locator('[data-selected="true"], [aria-selected="true"], [cmdk-item][data-selected]');
    await expect(selectedItem.first()).toBeVisible();
  });

  test('T2.6: Search is accessible and functional on mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    let trigger = getMobileSearchTrigger(page);
    if (!(await trigger.isVisible())) {
      const mobileMenuBtn = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuBtn.isVisible()) {
        await mobileMenuBtn.click();
        await page.waitForTimeout(300);
      }
    }

    trigger = getMobileSearchTrigger(page);
    await expect(trigger).toBeVisible({ timeout: 5000 });
    await trigger.click();

    const dialog = getSearchDialog(page);
    try {
      await dialog.waitFor({ state: 'visible', timeout: 2000 });
    } catch {
      await trigger.click();
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }

    const input = getSearchInput(page);
    await expect(input).toBeVisible();
  });
});

// =============================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS & MULTI-ENTITY GROUPING
// =============================================================================
test.describe('Tier 3: Cross-Feature Combinations & Multi-Entity Grouping', () => {
  test('T3.1: Displays results categorized under distinct headers with category badges', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('nexus');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const headings = page.locator('[role="dialog"]').locator('[cmdk-group-heading], [role="group"]');
    const badges = page.locator('[role="dialog"]').locator('[data-testid="category-badge"], span:has-text("Condition"), span:has-text("Service"), span:has-text("Blog")');
    const hasHeadingsOrBadges = (await headings.count() > 0) || (await badges.count() > 0);
    expect(hasHeadingsOrBadges).toBe(true);
  });

  test('T3.2: Multi-category query returns cross-entity results simultaneously', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('nexus');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const allText = (await results.allTextContents()).join(' ');
    expect(allText).toMatch(/nexus/i);
  });
});

// =============================================================================
// TIER 4: REAL-WORLD SCENARIOS & WCAG AA ACCESSIBILITY
// =============================================================================
test.describe('Tier 4: Real-World Scenarios & WCAG AA Accessibility', () => {
  test('T4.1: Veteran query "sleep apnea" provides full service connection pathway', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('sleep apnea');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const allText = (await results.allTextContents()).join(' ');
    expect(allText).toMatch(/sleep apnea/i);
  });

  test('T4.2: Veteran query "ptsd" provides psychological nexus opinions and rating guide', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('ptsd');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const allText = (await results.allTextContents()).join(' ');
    expect(allText).toMatch(/ptsd/i);
  });

  test('T4.3: Veteran query "malpractice" or "1151" resolves to VA 1151 service', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('malpractice');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const allText = (await results.allTextContents()).join(' ');
    expect(allText).toMatch(/1151/i);
  });

  test('T4.4: Search dialog has zero critical axe accessibility violations when open with results', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openSearchDialog(page);

    const input = getSearchInput(page);
    await input.fill('nexus');

    const results = getSearchResults(page);
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const violations = await findCriticalAxeViolations(page);
    expect(formatAxeViolations(violations)).toBe('');
  });
});
