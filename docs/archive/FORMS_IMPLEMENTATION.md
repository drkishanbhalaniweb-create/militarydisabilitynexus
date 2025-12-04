# Forms Implementation Guide

## Overview

The application now features a flexible form submission system that supports multiple form types with conditional file upload functionality.

## Form Types

1. **Quick Intake** - Basic information gathering, no uploads required
2. **Aid & Attendance** - Comprehensive form requiring medical document uploads
3. **I'm not sure what I need** - Simple intake for users who need guidance

## Architecture

### Database Schema

**Table: `form_submissions`**
- Stores all form submissions with flexible JSONB data storage
- Tracks form type, status, and upload requirements
- Links to file uploads via `form_submission_id`

**Migration:** `supabase/migrations/002_form_submissions.sql`

### Components

**QuickIntakeForm** (`frontend/src/components/forms/QuickIntakeForm.js`)
- Embedded form component for homepage
- Compact design with dropdown form type selector
- Conditional file upload based on form type
- Two CTAs: "Start Free Discovery" and "Upload Records"

**IntakeForm** (`frontend/src/pages/IntakeForm.js`)
- Full-page form with expanded layout
- Same functionality as QuickIntakeForm but with more space
- Better for dedicated form submissions

### API Integration

**formSubmissionsApi** (`frontend/src/lib/api.js`)
- `submit()` - Submit form data
- `getById()` - Retrieve submission by ID

**fileUploadApi** (updated)
- Now supports both contact-based and form-submission-based uploads
- `upload(file, id, category, isFormSubmission)` - Upload files to Supabase Storage

### Routes

- `/` - Homepage with embedded QuickIntakeForm
- `/intake` - Full-page IntakeForm
- `/aid-attendance-form` - Legacy dedicated Aid & Attendance form (kept for compatibility)

## Form Behavior

### Form Type Selection

Users select from dropdown:
- Quick Intake
- Aid & Attendance
- I'm not sure what I need

### Conditional Upload Button

The "Upload Records" button:
- **Disabled** (grayed out) when form type doesn't require uploads
- **Enabled** (active styling) when form type requires uploads AND files are selected
- Only Aid & Attendance currently requires uploads

### Button Actions

**"Start Free Discovery"**
- Always active
- Submits form data
- Redirects to email: `contact@militarydisabilitynexus.com`

**"Upload Records"**
- Only active for forms requiring uploads (Aid & Attendance)
- Uploads selected files to `medical-documentation` bucket
- Links files to form submission

## File Upload

### Storage
- Bucket: `medical-documentation` (private, encrypted)
- Path structure: `{submissionId}/{timestamp}.{ext}`
- Supported formats: PDF, DOC, DOCX, JPG, PNG

### Database Tracking
- Files stored in `file_uploads` table
- Linked via `form_submission_id`
- Automatically marks submission as `has_uploads: true`

## UI/UX Updates

### Homepage Hero
- Two-column layout (desktop)
- Left: Headline, description, CTAs, stats
- Right: QuickIntakeForm card
- Mobile: Stacked layout

### Design System
- Primary color: Indigo (#4F46E5)
- Accent: Slate (#1E293B)
- Clean, minimal aesthetic
- Rounded corners (lg/xl)
- Subtle shadows

### Header
- Simplified navigation: Services, Pricing, About
- "Book a Call" CTA button
- Logo with tagline

## Admin Considerations

### Viewing Submissions

Admins can query `form_submissions` table to see:
- All form submissions by type
- Contact information
- Form-specific data in JSONB field
- Upload status
- Submission status

### Future Enhancements

1. Admin dashboard for form submissions
2. Email notifications on submission
3. Status tracking workflow
4. Form analytics
5. Additional form types (easy to add)

## Adding New Form Types

To add a new form type:

1. **Update FORM_TYPES array** in both form components:
```javascript
{ value: 'new_form', label: 'New Form Name', requiresUpload: true/false }
```

2. **Update database constraint** in migration:
```sql
CHECK (form_type IN ('quick_intake', 'aid_attendance', 'unsure', 'new_form'))
```

3. **Add form-specific fields** to `formData` object as needed

4. **Create dedicated page** (optional) for complex forms

## Testing

### Manual Testing Checklist

- [ ] Submit Quick Intake form
- [ ] Submit Aid & Attendance with files
- [ ] Submit "I'm not sure" form
- [ ] Verify file uploads to Supabase Storage
- [ ] Check database records in `form_submissions`
- [ ] Test mobile responsive layout
- [ ] Test form validation
- [ ] Test "Start Free Discovery" email link
- [ ] Test "Upload Records" button states

### Database Queries

```sql
-- View all submissions
SELECT * FROM form_submissions ORDER BY created_at DESC;

-- View submissions with uploads
SELECT fs.*, COUNT(fu.id) as file_count
FROM form_submissions fs
LEFT JOIN file_uploads fu ON fu.form_submission_id = fs.id
GROUP BY fs.id;

-- View by form type
SELECT * FROM form_submissions WHERE form_type = 'aid_attendance';
```

## Security

- RLS policies enabled on all tables
- File uploads are private by default
- PHI data properly flagged
- HIPAA-compliant storage
- Audit logging for admin actions

## Deployment

1. Run migration: `supabase migration up`
2. Verify storage bucket exists: `medical-documentation`
3. Deploy frontend with updated code
4. Test form submissions in production
5. Monitor Supabase logs for errors
