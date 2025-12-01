# Implementation Plan

- [x] 1. Set up database schema and storage infrastructure


  - Create migration file `supabase/migrations/011_case_studies.sql`
  - Define `case_studies` table with all required fields (id, slug, title, client_name, excerpt, content_html, challenge, solution, results, featured_image, published_at, is_published, views, created_at, updated_at)
  - Add indexes on slug, is_published, and published_at for query performance
  - Create RLS policies for public read access (published only) and admin write access
  - Create `increment_case_study_views` database function
  - Create trigger for auto-updating `updated_at` timestamp
  - Create `case-study-images` storage bucket in Supabase with public read and authenticated write policies
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 1.1 Write property test for RLS policies
  - **Property 9: Publication status visibility control**
  - **Validates: Requirements 4.5, 8.2**

- [ ] 1.2 Write property test for access control
  - **Property 15: Access control enforcement**
  - **Validates: Requirements 8.3**

- [ ] 1.3 Write property test for storage security
  - **Property 16: Storage security enforcement**
  - **Validates: Requirements 8.5**

- [-] 2. Create API layer for case studies

  - Add `caseStudyApi` object to `frontend/src/lib/api.js` with methods: getAll(), getBySlug(slug), create(data), update(id, data), delete(id), togglePublished(id, status), incrementViews(slug)
  - Implement error handling for all API methods
  - Add slug generation utility function (lowercase, replace spaces with hyphens, remove special chars)
  - Add slug uniqueness check with auto-increment for duplicates
  - _Requirements: 3.1, 3.3, 3.4, 4.1, 4.3, 5.2_

- [ ] 2.1 Write property test for data persistence
  - **Property 6: Data persistence round-trip**
  - **Validates: Requirements 3.4, 4.3**

- [ ] 2.2 Write property test for form validation
  - **Property 5: Form validation rejects incomplete data**
  - **Validates: Requirements 3.3**

- [ ] 2.3 Write unit tests for slug generation
  - Test slug generation from various title formats
  - Test handling of special characters and spaces
  - Test duplicate slug handling with auto-increment
  - _Requirements: 3.3_

- [-] 3. Create public case studies listing page

  - Create `frontend/src/pages/CaseStudies.js` component
  - Implement exact UI styling from Blog.js: fixed blurred background, glassmorphism cards, navy gradient badges
  - Add header section with "CASE STUDIES" badge, title, and description
  - Fetch and display all published case studies using caseStudyApi.getAll()
  - Display case study cards in responsive grid (3 cols desktop, 2 tablet, 1 mobile)
  - Show featured image (or gradient placeholder), title, client name, excerpt, and publication date on each card
  - Implement hover effects matching blog cards (transform, shadow, color transitions)
  - Add loading state with spinner
  - Add empty state message when no case studies exist
  - Link each card to detail page using slug
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3.1 Write property test for list rendering
  - **Property 1: Case study list rendering completeness**
  - **Validates: Requirements 1.2**

- [ ] 3.2 Write property test for sorting
  - **Property 2: Case study sorting by date**
  - **Validates: Requirements 1.5**

- [-] 4. Create case study detail page

  - Create `frontend/src/pages/CaseStudyDetail.js` component
  - Implement exact UI styling from BlogPost.js: fixed blurred background, glassmorphism content card
  - Fetch case study by slug from URL parameter using caseStudyApi.getBySlug()
  - Display featured image, title, client name, publication date, and full content
  - Render Challenge, Solution, and Results sections in structured format (only if fields are populated)
  - Increment view count on page load using caseStudyApi.incrementViews()
  - Add back navigation link to case studies list
  - Handle loading and error states
  - Use OptimizedImage component for images
  - Add SEO component with case study metadata
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.1 Write property test for detail rendering
  - **Property 3: Detail page rendering completeness**
  - **Validates: Requirements 2.1**

- [ ] 4.2 Write property test for optional fields
  - **Property 4: Optional field rendering**
  - **Validates: Requirements 2.3, 2.4**

- [ ] 4.3 Write property test for HTML preservation
  - **Property 13: HTML content preservation**
  - **Validates: Requirements 7.3**

- [-] 5. Update navigation to include Case Studies link

  - Update `frontend/src/components/Header.js` navigation array
  - Add Case Studies link with path `/case-studies`
  - Position it in the header where About Us currently appears (or as specified)
  - Ensure active state highlighting works for Case Studies pages
  - Verify mobile menu includes the new link
  - Test navigation on both desktop and mobile viewports
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [-] 6. Add case studies routes to application

  - Update `frontend/src/App.js` to import CaseStudies and CaseStudyDetail components
  - Add public route: `/case-studies` → CaseStudies component
  - Add public route: `/case-studies/:slug` → CaseStudyDetail component
  - Add admin route: `/admin/case-studies` → AdminCaseStudies component (to be created)
  - Add admin route: `/admin/case-studies/new` → CaseStudyForm component (to be created)
  - Add admin route: `/admin/case-studies/edit/:id` → CaseStudyForm component (to be created)
  - Verify all routes work correctly with React Router
  - _Requirements: 1.1, 2.1, 3.1_

- [-] 7. Create admin case studies list page

  - Create `frontend/src/pages/admin/CaseStudies.js` component
  - Use AdminLayout wrapper for consistent admin UI
  - Fetch all case studies (published and drafts) using caseStudyApi.getAll() without published filter
  - Display case studies in table format with columns: title, client name, status, published date, actions
  - Add "New Case Study" button linking to create form
  - Implement toggle published/unpublished action for each case study
  - Implement delete action with confirmation dialog
  - Add edit button linking to edit form with case study ID
  - Show status badges (Published/Draft) with color coding
  - Format dates consistently
  - Add loading state and error handling
  - _Requirements: 3.1, 5.1_

- [ ] 7.1 Write property test for deletion
  - **Property 10: Deletion completeness**
  - **Validates: Requirements 5.2**

- [ ] 7.2 Write property test for deletion failure
  - **Property 12: Deletion failure state preservation**
  - **Validates: Requirements 5.5**

- [x] 8. Create case study form component for create and edit


  - Create `frontend/src/pages/admin/CaseStudyForm.js` component
  - Use AdminLayout wrapper
  - Detect create vs edit mode based on URL parameter (id present = edit mode)
  - For edit mode: fetch existing case study data and populate form fields
  - Add form fields: title (required), client_name (optional), excerpt (required), content_html (required textarea), challenge (optional textarea), solution (optional textarea), results (optional textarea)
  - Add featured image upload using existing ImageUpload component
  - Add is_published toggle switch
  - Auto-generate slug from title on blur (editable)
  - Implement client-side validation for required fields
  - On submit: validate, then call caseStudyApi.create() or caseStudyApi.update()
  - Handle image upload to case-study-images bucket
  - Show success toast and redirect to admin list on successful save
  - Show error toast on failure
  - Add cancel button to return to list without saving
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [ ] 8.1 Write property test for form population
  - **Property 8: Form population accuracy**
  - **Validates: Requirements 4.1**

- [ ] 8.2 Write property test for image management
  - **Property 7: Image management consistency**
  - **Validates: Requirements 3.5, 4.4, 7.2**

- [ ] 8.3 Write property test for XSS prevention
  - **Property 14: XSS prevention**
  - **Validates: Requirements 7.5**

- [ ] 8.4 Write unit tests for form validation
  - Test required field validation
  - Test slug format validation
  - Test maximum length constraints
  - Test file type and size validation for images
  - _Requirements: 3.3, 7.5_

- [ ] 9. Implement image cleanup on case study deletion
  - Update delete functionality in admin case studies list
  - Before deleting case study record, check if featured_image exists
  - If featured_image exists, delete the file from case-study-images storage bucket
  - Then delete the case study database record
  - Handle errors gracefully (log but don't block deletion if image delete fails)
  - Show appropriate success/error messages
  - _Requirements: 5.3_

- [ ] 9.1 Write property test for image cleanup
  - **Property 11: Image cleanup on deletion**
  - **Validates: Requirements 5.3**

- [ ] 10. Add SEO and metadata for case studies pages
  - Add SEO component to CaseStudies.js with appropriate title, description, and keywords
  - Add SEO component to CaseStudyDetail.js with case study-specific metadata
  - Include Open Graph tags for social sharing
  - Use case study title and excerpt for meta descriptions
  - Add structured data markup for case studies (optional)
  - _Requirements: 2.1_

- [ ] 11. Final testing and polish
  - Verify all case study CRUD operations work correctly
  - Test public pages display published case studies only
  - Test unpublished case studies are hidden from public
  - Verify admin authentication is required for admin pages
  - Test image upload and display on both public and admin pages
  - Verify responsive design on mobile, tablet, and desktop
  - Test navigation between all case study pages
  - Verify error handling and loading states
  - Check accessibility (keyboard navigation, alt text, ARIA labels)
  - Ensure UI matches blog page styling exactly
  - Test with various content lengths and edge cases
  - _Requirements: All_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
