const { expect, test } = require('@playwright/test');
const { stabilizeExternalRequests } = require('./support/network');

const publicPages = [
  {
    path: '/',
    heading: /Clinician-Led Expertise for Your VA Disability Claim/i,
  },
  {
    path: '/services',
    heading: /VA Disability Services/i,
  },
  {
    path: '/blog',
    heading: /Guides & Updates/i,
  },
  {
    path: '/diagnostic',
    heading: /Before You File a VA Disability Claim/i,
  },
  {
    path: '/contact',
    heading: /Contact Us/i,
  },
  {
    path: '/forms',
    heading: /Get Started with Your VA Claim/i,
  },
];

const diagnosticQuestionHeadings = [
  /Are you confident the VA can clearly see/i,
  /If you were denied before/i,
  /Are you certain you're filing/i,
  /Is your medical evidence detailed enough/i,
  /Have you identified all conditions/i,
];

test.beforeEach(async ({ page }) => {
  await stabilizeExternalRequests(page);
});

test.describe('public page smoke', () => {
  for (const publicPage of publicPages) {
    test(`${publicPage.path} renders the expected shell`, async ({ page }) => {
      await page.goto(publicPage.path, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('main')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: publicPage.heading }).first(),
      ).toBeVisible();
      await expect(page).toHaveTitle(/Military Disability Nexus/i);
    });
  }
});

test('diagnostic can progress to lead capture without backend writes', async ({ page }) => {
  await page.goto('/diagnostic', { waitUntil: 'networkidle' });

  const startButton = page.getByRole('button', { name: /Start Diagnostic/i });
  await expect(startButton).toBeEnabled();
  await page.waitForTimeout(500);
  await startButton.click();

  for (const heading of diagnosticQuestionHeadings) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await page.getByRole('button', { name: /^No/i }).first().click();
    await page.waitForTimeout(800);
  }

  await expect(
    page.getByRole('heading', { name: /Your Results Are Ready/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/Email Address/i)).toBeVisible();
});
