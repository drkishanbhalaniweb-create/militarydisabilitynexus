const { expect, test } = require('@playwright/test');
const {
  findCriticalAxeViolations,
  formatAxeViolations,
} = require('./support/axe');
const { stabilizeExternalRequests } = require('./support/network');

const accessibilityPages = ['/', '/services', '/blog', '/diagnostic', '/contact'];

test.beforeEach(async ({ page }) => {
  await stabilizeExternalRequests(page);
});

test.describe('axe accessibility smoke', () => {
  for (const path of accessibilityPages) {
    test(`${path} has no critical axe violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main')).toBeVisible();

      const violations = await findCriticalAxeViolations(page);

      expect(formatAxeViolations(violations)).toBe('');
    });
  }
});
