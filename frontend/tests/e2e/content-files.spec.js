const { expect, test } = require('@playwright/test');

test('robots.txt exposes crawl hardening directives', async ({ request }) => {
  const response = await request.get('/robots.txt');
  const body = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type'] || '').toContain('text/plain');
  expect(body).toContain('User-agent: *');
  expect(body).toContain('Disallow: /admin/');
  expect(body).toContain('Sitemap: https://www.militarydisabilitynexus.com/sitemap.xml');
});

test('sitemap.xml exposes canonical public URLs', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  const body = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type'] || '').toContain('text/xml');
  expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  expect(body).toContain('<loc>https://www.militarydisabilitynexus.com</loc>');
  expect(body).toContain('<loc>https://www.militarydisabilitynexus.com/services</loc>');
  expect(body).toContain('<loc>https://www.militarydisabilitynexus.com/blog</loc>');
});

test('llms.txt exposes AI-readable site guidance', async ({ request }) => {
  const response = await request.get('/llms.txt');
  const body = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type'] || '').toMatch(/text\/plain|text\/markdown/);
  expect(body).toContain('# Military Disability Nexus');
  expect(body).toContain('## Core Pages');
  expect(body).toContain('/services');
  expect(body).toContain('/contact');
});
