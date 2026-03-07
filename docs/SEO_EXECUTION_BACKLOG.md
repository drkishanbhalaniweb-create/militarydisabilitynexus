# SEO Execution Backlog

This backlog is prioritized for a new YMYL website. It focuses on quality control,
expert trust signals, page experience, and topical authority before aggressive
content expansion.

## P0: Indexation and metadata safety

- [x] Remove hard meta description truncation from the shared SEO component.
- [x] Normalize page title handling in the shared SEO component.
- [x] Move the homepage onto the shared SEO layer with stronger entity markup.
- [x] Noindex community pages until a stronger review workflow exists.
- [x] Remove community question URLs from the sitemap.
- [x] Stop indexing the duplicate `/intake-form` route.
- [x] Improve sitemap caching and avoid fake `lastmod` values on static routes.
- [x] Fix homepage read-time snippet formatting.
- [x] Format blog publish dates for cleaner SERP presentation.

## P1: YMYL trust signals

- [ ] Create clinician profile pages with credentials, specialties, and review roles.
- [ ] Add author and reviewer attribution blocks to blog and case-study templates.
- [ ] Add `ProfilePage` or stronger person/entity schema for named experts.
- [ ] Publish editorial policy and medical review policy pages.
- [ ] Expand the About page with real clinician identity and process details.
- [ ] Add organization-level `sameAs` and entity consistency across all templates.

## P1: Content architecture cleanup

- [ ] Reduce duplicate content on the case studies index and keep detailed narratives on the detail pages only.
- [ ] Decide the primary intake route and consolidate intent between `/forms` and `/intake-form`.
- [ ] Add stronger internal links between services, case studies, testimonials, and blog posts.
- [ ] Add testimonial proof blocks to more high-intent service pages.

## P2: Structured data and template depth

- [ ] Add `QAPage` schema only for reviewed community threads worth indexing later.
- [ ] Improve blog schema with reviewer information once expert pages exist.
- [ ] Add richer service-page schema with clearer provider/entity context.
- [ ] Add page-specific OG images for key service and proof pages.

## P2: Page experience and CWV

- [ ] Replace fixed blurred decorative backgrounds on high-traffic templates.
- [ ] Convert major content images to `next/image` with explicit dimensions.
- [ ] Reduce third-party marketing and analytics payload on top landing pages.
- [ ] Measure CWV by route group after each template change.

## P3: Topical authority expansion

- [ ] Build condition clusters around the highest-value claim categories.
- [ ] Publish evidence-standard pages explaining what strengthens a claim.
- [ ] Publish denial-recovery content for common rejection scenarios.
- [ ] Turn case-study learnings into supporting informational content.
- [ ] Create comparison pages for related services and common user confusion points.

## Off-page and measurement

- [ ] Track non-brand impressions and CTR by page type in Search Console.
- [ ] Track leads by landing page and template group.
- [ ] Build citations and mentions from relevant veteran, medical, and legal-adjacent sources.
- [ ] Maintain a monthly review of indexed pages, excluded pages, and CWV.
