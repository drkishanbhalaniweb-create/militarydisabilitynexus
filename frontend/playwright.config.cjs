/* global __dirname, process */

const { defineConfig, devices } = require('@playwright/test');

const port = Number(process.env.PLAYWRIGHT_PORT || process.env.PORT || 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;

const webServerEnv = {
  NEXT_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'playwright-anon-key',
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'playwright-service-role-key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_playwright',
  NEXT_PUBLIC_CAL_URL_DISCOVERY:
    process.env.NEXT_PUBLIC_CAL_URL_DISCOVERY ||
    'https://cal.com/militarydisabilitynexus/discovery-call-military-disability-nexus',
  NEXT_PUBLIC_CAL_URL_CONSULTATION:
    process.env.NEXT_PUBLIC_CAL_URL_CONSULTATION ||
    'https://cal.com/militarydisabilitynexus/claim-readiness-review',
  NEXT_PUBLIC_ENABLE_HEALTH_CHECK:
    process.env.NEXT_PUBLIC_ENABLE_HEALTH_CHECK || 'false',
};

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
      ]
    : 'list',
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${port}`,
    cwd: __dirname,
    env: webServerEnv,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: baseURL,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
