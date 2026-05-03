# SEO Audit Implementation Plan

## Goal
Implement the verified SEO and AEO recommendations from the comprehensive audit to improve site navigation, increase AI indexability, and expand organic traffic through new service and condition-specific pages.

## Tasks

- [x] Task 1: Fix Navigation Orphan
  - **Action**: Add "C&P Exam Coaching" to the `serviceLinks` array in `frontend/src/components/Header.js`.
  - **Verify**: Open `http://localhost:3000/`, hover over the "Services" dropdown in the header, and verify "C&P Exam Coaching" is visible and correctly links to `/cp-exam-coaching`.

- [x] Task 2: Optimize FAQ Accordion for AEO
  - **Action**: Update `frontend/src/components/ui/accordion.jsx` to force mount the content (`forceMount={true}`) and use CSS to hide it when closed (e.g., `hidden` or `h-0` classes) so crawlers without JS can index the text.
  - **Verify**: Inspect a service page FAQ in the browser DevTools (e.g., `/services/independent-medical-opinion-nexus-letter`) and verify the closed accordion text exists in the raw HTML DOM.

- [ ] Task 3: Add Outbound Trust Links (E-E-A-T)
  - **Action**: Update the Supabase `seed.sql` (or live DB) service descriptions for Nexus, DBQ, 1151, and A&A pages to include contextual outbound links to `VA.gov` or `38 CFR` statutes.
  - **Verify**: Navigate to a service page and click the newly added `.gov` link to verify it opens the correct authoritative source.


- [ ] Task 6: Build Condition-Specific Landing Page Templates
  - **Action**: Set up a new dynamic route `frontend/pages/conditions/[slug].js` (or similar) to capture condition-specific searches (e.g., PTSD, Sleep Apnea) and link them to the relevant service pages.
  - **Verify**: Navigate to a mock condition page (e.g., `/conditions/ptsd`) and verify it renders correctly with schema markup.

## Done When
- [x] C&P Exam Coaching is accessible from the main header.
- [x] All FAQ text is rendered in the HTML DOM even when accordions are closed.
- [ ] At least 3 service pages contain outbound `.gov` authority links.

- [ ] Condition-specific routing is established.
