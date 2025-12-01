# Case Studies Feature Design Document

## Overview

The Case Studies feature will add a new content type to the application that showcases client success stories and project outcomes. This feature will follow the same architectural patterns as the existing blog system, ensuring consistency in implementation and user experience. The feature includes public-facing pages for viewing case studies and admin panel interfaces for content management.

## Architecture

### System Components

The Case Studies feature will consist of four main layers:

1. **Database Layer**: PostgreSQL tables with Row Level Security policies
2. **Storage Layer**: Supabase Storage bucket for case study images
3. **API Layer**: Supabase client queries for CRUD operations
4. **Presentation Layer**: React components for public and admin interfaces

### Technology Stack

- **Frontend**: React with React Router for navigation
- **Styling**: Tailwind CSS with custom utility classes
- **State Management**: React hooks (useState, useEffect)
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth (existing admin system)
- **UI Components**: Lucide React icons, custom components

## Components and Interfaces

### Database Schema

#### case_studies Table

```sql
CREATE TABLE case_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    client_name TEXT,
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    featured_image TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Field Descriptions**:
- `id`: Unique identifier for the case study
- `slug`: URL-friendly identifier derived from title
- `title`: Case study title
- `client_name`: Optional client/project name
- `excerpt`: Short summary for listing pages
- `content_html`: Full HTML content of the case study
- `challenge`: Description of the problem/challenge faced
- `solution`: Description of the solution provided
- `results`: Outcomes and measurable results
- `featured_image`: URL to the featured image in storage
- `published_at`: Publication timestamp
- `is_published`: Boolean flag for draft/published status
- `views`: View counter for analytics
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp

### Storage Bucket

**Bucket Name**: `case-study-images`

**Configuration**:
- Public read access for published images
- Authenticated write access for admins
- File size limit: 5MB per image
- Allowed MIME types: image/jpeg, image/png, image/webp

### API Interface

The application will use the existing Supabase client pattern. A new API module will be created:

```javascript
// lib/api.js additions
export const caseStudyApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (error) throw error;
    return data;
  },
  
  incrementViews: async (slug) => {
    const { error } = await supabase.rpc('increment_case_study_views', { 
      study_slug: slug 
    });
    if (error) throw error;
  }
};
```

### Frontend Components

#### Public Pages

**1. CaseStudies.js** (`frontend/src/pages/CaseStudies.js`)
- Lists all published case studies in a grid layout
- **UI Design**: Match the exact styling and layout of the Blog.js page including:
  - Fixed blurred background image with overlay
  - Header section with badge, title, and description
  - Search bar with icon (optional for MVP)
  - Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
  - Card styling with glassmorphism effect (white/80 backdrop-blur)
  - Hover effects with transform and shadow transitions
  - Same color scheme (navy gradients, slate text)
- Displays featured image, title, client name, excerpt, and publication date
- Responsive design matching blog page exactly

**2. CaseStudyDetail.js** (`frontend/src/pages/CaseStudyDetail.js`)
- **UI Design**: Match the exact styling and layout of the BlogPost.js page including:
  - Fixed blurred background with overlay
  - Content container with glassmorphism card effect
  - Typography hierarchy matching blog posts
  - Same spacing, padding, and responsive breakpoints
- Displays full case study content with featured image
- Shows structured sections: Challenge, Solution, Results (if present)
- Includes metadata (client name, publication date)
- Provides navigation back to case studies list

#### Admin Pages

**3. AdminCaseStudies.js** (`frontend/src/pages/admin/CaseStudies.js`)
- Lists all case studies (published and drafts)
- Provides create, edit, delete, and publish/unpublish actions
- Shows status badges and metadata
- Includes "New Case Study" button

**4. CaseStudyForm.js** (`frontend/src/pages/admin/CaseStudyForm.js`)
- Form for creating and editing case studies
- Fields: title, client_name, excerpt, content, challenge, solution, results
- Image upload component for featured image
- Slug auto-generation from title
- Publish/draft toggle
- Save and cancel actions

### Navigation Integration

The Header component will be updated to include the Case Studies link:

```javascript
// Current navigation structure
const navigation = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Case Studies', path: '/case-studies' }, // NEW
  { name: 'Blog', path: '/blog' },
  { name: 'Community', path: '/community' },
  { name: 'Forms', path: '/forms' },
  { name: 'Contact', path: '/contact' }
];
```

The "About Us" link will be removed or repositioned as specified.

## Data Models

### CaseStudy Model

```typescript
interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client_name?: string;
  excerpt: string;
  content_html: string;
  challenge?: string;
  solution?: string;
  results?: string;
  featured_image?: string;
  published_at: string;
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}
```

### Form Data Model

```typescript
interface CaseStudyFormData {
  title: string;
  client_name: string;
  excerpt: string;
  content_html: string;
  challenge: string;
  solution: string;
  results: string;
  featured_image: File | null;
  is_published: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework analysis, several opportunities for consolidation emerge:

- Properties 3.4 and 4.3 both test round-trip data persistence (create and update) - these can be combined into a single comprehensive persistence property
- Properties 3.5, 4.4, and 7.2 all relate to image handling - these can be consolidated into one image management property
- Properties 8.2 and 8.3 both test RLS policies - these can be combined into a single access control property
- Properties 8.4 and 8.5 both test storage policies - these can be combined into a single storage security property

The consolidated properties below eliminate redundancy while maintaining comprehensive coverage.

### Correctness Properties

Property 1: Case study list rendering completeness
*For any* case study object in the published list, the rendered card should contain the title, featured image (or placeholder), excerpt, and publication date
**Validates: Requirements 1.2**

Property 2: Case study sorting by date
*For any* collection of case studies with different publication dates, the listing function should return them sorted in descending order by published_at
**Validates: Requirements 1.5**

Property 3: Detail page rendering completeness
*For any* case study, the detail page should display the title, featured image, full content, and all metadata fields
**Validates: Requirements 2.1**

Property 4: Optional field rendering
*For any* case study with non-null values for client_name, challenge, solution, or results fields, the rendered output should include those fields
**Validates: Requirements 2.3, 2.4**

Property 5: Form validation rejects incomplete data
*For any* form submission with missing required fields (title, excerpt, or content), the validation function should reject it and prevent database insertion
**Validates: Requirements 3.3**

Property 6: Data persistence round-trip
*For any* valid case study data, after creating or updating it in the database, querying by ID should return data that matches the input
**Validates: Requirements 3.4, 4.3**

Property 7: Image management consistency
*For any* image upload operation (featured image or content image), the system should store the file in the correct bucket and return a valid accessible URL
**Validates: Requirements 3.5, 4.4, 7.2**

Property 8: Form population accuracy
*For any* existing case study loaded into the edit form, all form field values should match the stored database values
**Validates: Requirements 4.1**

Property 9: Publication status visibility control
*For any* case study, when is_published is false, it should not appear in public queries; when is_published is true, it should appear in public queries
**Validates: Requirements 4.5, 8.2**

Property 10: Deletion completeness
*For any* case study, after successful deletion, querying the database for that ID should return no results
**Validates: Requirements 5.2**

Property 11: Image cleanup on deletion
*For any* case study with a featured_image, after deletion, the associated image file should be removed from storage
**Validates: Requirements 5.3**

Property 12: Deletion failure state preservation
*For any* deletion operation that fails, the case study should remain unchanged in the database with all original field values
**Validates: Requirements 5.5**

Property 13: HTML content preservation
*For any* HTML content string saved to a case study, retrieving and displaying it should preserve the HTML structure and formatting
**Validates: Requirements 7.3**

Property 14: XSS prevention
*For any* content input containing script tags or JavaScript event handlers, the validation or sanitization function should remove or escape them before storage
**Validates: Requirements 7.5**

Property 15: Access control enforcement
*For any* unauthenticated request attempting create, update, or delete operations on case studies, the system should reject the request with an authorization error
**Validates: Requirements 8.3**

Property 16: Storage security enforcement
*For any* unauthenticated request attempting to upload or delete images in the case-study-images bucket, the system should reject the request
**Validates: Requirements 8.5**

## Error Handling

### Database Errors

**Connection Failures**:
- Display user-friendly error messages
- Log detailed errors for debugging
- Implement retry logic for transient failures

**Query Failures**:
- Catch and handle Supabase errors
- Provide fallback UI states
- Show appropriate error messages to users

**Constraint Violations**:
- Validate slug uniqueness before insertion
- Handle duplicate slug errors gracefully
- Suggest alternative slugs to admins

### Storage Errors

**Upload Failures**:
- Validate file size before upload (max 5MB)
- Check file type against allowed MIME types
- Display progress indicators during upload
- Show clear error messages on failure

**Access Errors**:
- Handle missing images gracefully with placeholders
- Log 404 errors for missing images
- Implement image fallback mechanisms

### Form Validation Errors

**Client-Side Validation**:
- Required field validation
- Maximum length validation for text fields
- Slug format validation (lowercase, hyphens only)
- Real-time validation feedback

**Server-Side Validation**:
- Duplicate validation for database constraints
- Content sanitization for XSS prevention
- Image file validation

### Network Errors

**Timeout Handling**:
- Set reasonable timeout limits for API calls
- Display loading states during operations
- Provide retry options for failed requests

**Offline Handling**:
- Detect offline state
- Queue operations when possible
- Notify users of connectivity issues

## Testing Strategy

### Unit Testing

The Case Studies feature will include unit tests for critical functions:

**Validation Functions**:
- Test required field validation with various input combinations
- Test slug generation from titles
- Test content sanitization functions
- Test file type and size validation

**Data Transformation Functions**:
- Test date formatting functions
- Test excerpt truncation
- Test HTML sanitization

**API Helper Functions**:
- Test query construction
- Test error handling paths
- Test response parsing

**Example Unit Tests**:
```javascript
describe('Case Study Validation', () => {
  test('rejects case study without title', () => {
    const invalidData = { excerpt: 'test', content: 'test' };
    expect(validateCaseStudy(invalidData)).toBe(false);
  });
  
  test('generates valid slug from title', () => {
    expect(generateSlug('My Case Study!')).toBe('my-case-study');
  });
});
```

### Property-Based Testing

Property-based tests will verify universal properties across many randomly generated inputs. The testing framework will be **fast-check** for JavaScript/TypeScript.

**Configuration**:
- Minimum 100 iterations per property test
- Use appropriate generators for each data type
- Tag each test with the property number from this design document

**Property Test Implementation**:

Each correctness property listed above will be implemented as a property-based test. Tests will be tagged using this format:
```javascript
// Feature: case-studies-feature, Property 1: Case study list rendering completeness
```

**Key Property Tests**:

1. **Rendering Completeness** (Properties 1, 3, 4):
   - Generate random case study objects
   - Render them and verify all required fields are present in output
   - Test with various combinations of optional fields

2. **Sorting Correctness** (Property 2):
   - Generate random collections of case studies with different dates
   - Verify sorting function returns them in correct order
   - Test with edge cases (same dates, null dates)

3. **Data Persistence** (Property 6):
   - Generate random valid case study data
   - Save to database and retrieve
   - Verify retrieved data matches input

4. **Validation** (Property 5):
   - Generate random incomplete form data
   - Verify validation rejects all invalid combinations
   - Ensure valid data passes validation

5. **Access Control** (Properties 9, 15, 16):
   - Generate random case studies with different publication states
   - Verify public queries only return published items
   - Test unauthorized access attempts are rejected

6. **XSS Prevention** (Property 14):
   - Generate strings with various XSS patterns
   - Verify sanitization removes or escapes malicious content
   - Test common XSS attack vectors

**Generator Examples**:
```javascript
// Generator for case study data
const caseStudyArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  client_name: fc.option(fc.string({ maxLength: 100 })),
  excerpt: fc.string({ minLength: 1, maxLength: 500 }),
  content_html: fc.string({ minLength: 1 }),
  challenge: fc.option(fc.string()),
  solution: fc.option(fc.string()),
  results: fc.option(fc.string()),
  is_published: fc.boolean()
});

// Generator for XSS attack strings
const xssArbitrary = fc.oneof(
  fc.constant('<script>alert("xss")</script>'),
  fc.constant('<img src=x onerror="alert(1)">'),
  fc.constant('<svg onload="alert(1)">'),
  // ... more XSS patterns
);
```

### Integration Testing

Integration tests will verify the interaction between components:

**Database Integration**:
- Test full CRUD operations against test database
- Verify RLS policies work correctly
- Test transaction rollback on errors

**Storage Integration**:
- Test image upload and retrieval flow
- Verify storage policies
- Test cleanup on deletion

**UI Integration**:
- Test form submission flow end-to-end
- Verify navigation between pages
- Test admin authentication requirements

### Manual Testing Checklist

**Public Pages**:
- [ ] Case studies list displays correctly
- [ ] Search/filter functionality works
- [ ] Detail pages render properly
- [ ] Images load correctly
- [ ] Mobile responsive design works
- [ ] Navigation links function properly

**Admin Pages**:
- [ ] Admin can create new case studies
- [ ] Admin can edit existing case studies
- [ ] Admin can delete case studies
- [ ] Admin can toggle publication status
- [ ] Image upload works correctly
- [ ] Form validation provides clear feedback
- [ ] Success/error messages display appropriately

**Security**:
- [ ] Unauthenticated users cannot access admin pages
- [ ] Unpublished case studies not visible to public
- [ ] XSS attempts are blocked
- [ ] File upload restrictions enforced

## Implementation Notes

### Slug Generation

Slugs will be automatically generated from titles using the following algorithm:
1. Convert to lowercase
2. Replace spaces with hyphens
3. Remove special characters except hyphens
4. Remove consecutive hyphens
5. Trim hyphens from start and end

If a slug already exists, append a number (e.g., `my-case-study-2`).

### Image Optimization

- Images should be optimized before upload when possible
- Use the existing `OptimizedImage` component for display
- Implement lazy loading for case study images
- Consider WebP format for better compression

### SEO Considerations

- Each case study detail page should have unique meta tags
- Include Open Graph tags for social sharing
- Generate sitemap entries for case studies
- Use semantic HTML structure

### Performance Optimization

- Implement pagination for case study lists if count exceeds 20
- Use database indexes on slug and published_at fields
- Cache frequently accessed case studies
- Optimize image loading with lazy loading and responsive images

### Accessibility

- Ensure proper heading hierarchy
- Provide alt text for all images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Use ARIA labels where appropriate

## Migration Strategy

### Database Migration

Create a new migration file: `011_case_studies.sql`

This migration will:
1. Create the `case_studies` table
2. Add indexes for performance
3. Create RLS policies
4. Create the `increment_case_study_views` function
5. Create update trigger for `updated_at`

### Storage Setup

1. Create `case-study-images` bucket in Supabase
2. Configure public read access
3. Configure authenticated write access
4. Set file size limits and allowed MIME types

### Route Configuration

Add new routes to `App.js`:
```javascript
// Public routes
<Route path="/case-studies" element={<CaseStudies />} />
<Route path="/case-studies/:slug" element={<CaseStudyDetail />} />

// Admin routes
<Route path="/admin/case-studies" element={<AdminCaseStudies />} />
<Route path="/admin/case-studies/new" element={<CaseStudyForm />} />
<Route path="/admin/case-studies/edit/:id" element={<CaseStudyForm />} />
```

### Navigation Update

Update `Header.js` to include Case Studies link and adjust navigation order.

## Dependencies

### Existing Dependencies (No New Installations Required)

- React and React Router (already installed)
- Tailwind CSS (already configured)
- Supabase client (already configured)
- Lucide React icons (already installed)
- Sonner for toast notifications (already installed)

### Reusable Components

The following existing components will be reused:
- `OptimizedImage` for image display
- `SEO` component for meta tags
- `AdminLayout` for admin page structure
- `ImageUpload` component for image uploads

## Rollout Plan

### Phase 1: Database and Storage Setup
1. Run database migration
2. Create storage bucket
3. Configure policies

### Phase 2: API Layer
1. Add case study API functions to `lib/api.js`
2. Test CRUD operations
3. Verify RLS policies

### Phase 3: Public Pages
1. Create `CaseStudies.js` listing page
2. Create `CaseStudyDetail.js` detail page
3. Add routes to `App.js`
4. Update navigation in `Header.js`

### Phase 4: Admin Pages
1. Create `AdminCaseStudies.js` list page
2. Create `CaseStudyForm.js` form component
3. Add admin routes
4. Test full admin workflow

### Phase 5: Testing and Polish
1. Write and run unit tests
2. Write and run property-based tests
3. Perform manual testing
4. Fix bugs and polish UI
5. Update documentation

## Future Enhancements

Potential future improvements (not in current scope):

- Rich text editor for content (currently plain HTML)
- Category/tag system for case studies
- Related case studies suggestions
- Case study analytics dashboard
- PDF export functionality
- Client testimonials integration
- Before/after image comparisons
- Video embed support
