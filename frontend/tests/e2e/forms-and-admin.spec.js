const { expect, test } = require('@playwright/test');
const { stabilizeExternalRequests } = require('./support/network');

test.beforeEach(async ({ page }) => {
  await stabilizeExternalRequests(page);
});

test('contact form submits through the API contract', async ({ page }) => {
  await page.route('**/api/submit-contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        contact: { id: 'contact-e2e', status: 'new' },
      }),
    });
  });

  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3_100);

  await page.getByTestId('contact-name-input').fill('Pat Veteran');
  await page.getByTestId('contact-email-input').fill('pat@example.com');
  await page.getByTestId('contact-phone-input').fill('+1 888 215 9785');
  await page.getByLabel(/Nexus Letter/i).check();
  await page
    .getByTestId('contact-message-input')
    .fill('I would like help understanding what documentation my VA claim needs.');

  await page.getByTestId('contact-submit-button').click();

  await expect(page.getByRole('heading', { name: /Message Sent/i })).toBeVisible();
});

test('forms intake submits through the API contract', async ({ page }) => {
  await page.route('**/api/submit-form', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        submission: { id: 'form-submission-e2e', status: 'new' },
      }),
    });
  });

  await page.goto('/forms', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3_100);

  await page.getByLabel(/What service do you need/i).selectOption('nexus_letter');
  await page.getByLabel(/Full Name/i).fill('Pat Veteran');
  await page.getByLabel(/Phone Number/i).fill('+1 888 215 9785');
  await page.getByLabel(/Email Address/i).fill('pat@example.com');
  await page
    .getByLabel(/Additional Details/i)
    .fill('Please review my medical documentation for possible claim gaps.');

  await page.locator('form').getByRole('button', { name: /^Submit Form$/i }).click();

  await expect(
    page.getByRole('heading', { name: /Form Submitted Successfully/i }),
  ).toBeVisible();
});

test('schedule view exposes the discovery call embed', async ({ page }) => {
  await page.goto('/forms?view=schedule', { waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('heading', { name: /Schedule Your Free Discovery Call/i }),
  ).toBeVisible();
  await expect(page.locator('iframe[title="Schedule Discovery Call"]')).toBeVisible();
});

test('admin dashboard does not render protected content for unauthenticated visitors', async ({ page }) => {
  await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /^Dashboard$/i })).toBeHidden();
});
