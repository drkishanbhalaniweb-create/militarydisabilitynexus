# Programmatic SEO: Condition-Specific Landing Pages

## Goal
Build a scalable, database-driven engine for Condition-Specific Landing Pages (PTSD, Sleep Apnea, etc.) that can be fully managed from the Admin Panel, optimized for GEO (AI Search) and SEO.

## Phase 1: Database & API Foundation
- [x] Task 1: Create Supabase Table
  - **Action**: Run SQL to create `conditions` table with fields: `id`, `slug`, `page_title`, `meta_description`, `hero_heading`, `content_html`, `faqs` (jsonb), `related_service_ids` (uuid[]), `is_published`.
  - **Verify**: Table exists in Supabase dashboard with correct types.
- [x] Task 2: Configure RLS Policies
  - **Action**: Add Row Level Security allowing public read access for `is_published = true` and admin-only for inserts/updates.
  - **Verify**: `select * from conditions` works anonymously; insert requires admin auth.
- [x] Task 3: Update API Library
  - **Action**: Add `conditionApi` to `frontend/src/lib/api.js` (getAll, getBySlug, create, update, delete).
  - **Verify**: Can call `conditionApi.getAll()` and receive an empty array without errors.

## Phase 2: Dynamic Frontend Route (GEO/SEO Optimized)
- [x] Task 4: Create Dynamic Route
  - **Action**: Create `frontend/pages/conditions/[slug].js` using `getStaticPaths` and `getStaticProps` (with ISR `revalidate: 3600`).
  - **Verify**: Navigating to `/conditions/test-slug` renders a page shell or 404 correctly based on DB data.
- [x] Task 5: Implement GEO/SEO Schema & Layout
  - **Action**: Inject `SEO.js` with `FAQPage` and `Article` schema. Render the Hero, Content, and Radix Accordion FAQs.
  - **Verify**: Inspect DOM to verify JSON-LD schema is present and FAQ accordions forceMount.
- [x] Task 6: Link Related Services
  - **Action**: Fetch services matching `related_service_ids` and render them as clickable cards in the funnel section.
  - **Verify**: Related services (e.g., DBQ, Nexus) appear dynamically based on the database array.

## Phase 3: Admin Panel Integration
- [x] Task 7: Admin Conditions List
  - **Action**: Create `frontend/pages/admin/conditions/index.js` showing a data table of all conditions.
  - **Verify**: Navigating to `/admin/conditions` displays the table and "Create New" button.
- [x] Task 8: Admin Form (Create/Edit)
  - **Action**: Create `frontend/pages/admin/conditions/[id].js` with a form for SEO metadata, Rich Text content, dynamic FAQ builder, and Service selector.
  - **Verify**: Can successfully submit a new condition via the Admin UI and see it appear in the database.

## Phase 4: Hub Page & Navigation
- [x] Task 9: Conditions Hub Directory
  - **Action**: Create `frontend/pages/conditions/index.js` to list all published conditions (Internal Linking hub).
  - **Verify**: Navigating to `/conditions` displays a list/grid of active condition pages.
- [x] Task 10: Footer Integration
  - **Action**: Add "Conditions We Support" link pointing to `/conditions` in the global Footer.
  - **Verify**: Footer contains the link and routes correctly.

## Done When
- [x] Admin can create a new condition (e.g., Sleep Apnea) via `/admin/conditions` with FAQs and related services.
- [x] The new condition is instantly live at `/conditions/sleep-apnea`.
- [x] The page passes Core Web Vitals (ISR) and contains fully indexable FAQ schema for AI engines.
