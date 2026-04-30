# PLAN: Admin SEO Keywords & Metadata Management

## 1. Context & Objectives
- **Goal:** Enable dynamic SEO metadata (`seo_keywords`, `seo_description`) management via the admin CMS, completely removing developer dependency.
- **Admin Freedom:** Admins can input **any** custom keywords they want; they are not restricted to the blog's existing categories or tags.
- **Backward Compatibility:** All existing SEO logic (category + tags) will be preserved via a database migration and a code-level fallback safety net.
- **SEO Fundamentals Alignment:** Enhances Content SEO and Technical SEO by enabling 150-160 char descriptions and aligning with `BlogPosting` Schema Markup.

---

## 2. Agent Assignments
| Agent | Role | Tasks |
|-------|------|-------|
| `backend-specialist` | Database & Migration | Supabase schema updates, write and execute the migration script. |
| `frontend-specialist` | CMS UI Integration | Build the CMS input fields, validation logic, and form submission payloads. |
| `frontend-specialist` | Public SEO Injection | Update `<SEO />` and `JSON-LD` Schema in the blog slug page. |

---

## 3. Task Breakdown

### Phase 1: Database Updates & Data Migration (`backend-specialist`)
**Objective:** Add the necessary schema fields to Supabase and migrate the existing dynamic keywords so no SEO data is lost.
1. **Schema Update (`blogs` table):**
   - Add `seo_keywords` (text, nullable) - Allows any custom comma-separated keywords.
   - Add `seo_description` (text, nullable).
2. **Data Migration Script (`scripts/migrate_seo_metadata.mjs`):**
   - Fetch all existing blog posts.
   - For `seo_keywords`: Compute `${post.category}, VA disability, ${post.tags.join(', ')}` and inject.
   - For `seo_description`: Copy the existing `post.excerpt` to ensure safe transitions.
   - Execute script against the Supabase database.
   - *Result:* When the admin opens the CMS, the existing SEO data is pre-populated and fully editable.

### Phase 2: CMS Admin Panel Updates (`frontend-specialist`)
**Objective:** Allow the admin to view, edit, and freely type any custom SEO metadata directly in the dashboard.
1. **Editor UI (`pages/admin/blog/new.js` & `edit/[id].js`):**
   - Add a new "SEO Settings" collapsible section below the content editor.
   - **SEO Keywords Field:** Comma-separated text input. The admin can type **any** keywords they want here.
   - **SEO Description Field:** Textarea with a character counter validating the SEO Fundamental best practice: **150-160 characters**.
2. **API Payload:** Update Supabase insert/update API calls to include these two new fields.

### Phase 3: Frontend Integration & Schema Updates (`frontend-specialist`)
**Objective:** Render the custom keywords on the public blog pages with a safety fallback, satisfying both HTML tags and JSON-LD schema.
1. **HTML Meta Tags (`pages/blog/[slug].js`):**
   - Read from database first, fallback to defaults if empty:
     ```javascript
     const defaultKeywords = `${post.category}, VA disability, ${post.tags?.join(', ')}`;
     <SEO
         title={post.title}
         description={post.seo_description || post.excerpt}
         keywords={post.seo_keywords || defaultKeywords}
     />
     ```
2. **JSON-LD Schema Markup Updates (`BlogPosting` schema):**
   - To align with `@[/seo-fundamentals]`, update the `structuredData` object so search engines read the new fields:
     ```javascript
     "description": post.seo_description || post.excerpt,
     "keywords": post.seo_keywords ? post.seo_keywords.split(',').map(k => k.trim()) : (post.tags || []),
     ```

---

## 4. Verification & Smoke Tests

### Backend/DB Checks
- [ ] Columns `seo_keywords` and `seo_description` exist and are accessible via RLS.
- [ ] Migration script ran successfully; existing posts have populated SEO fields.

### CMS Integrity
- [ ] **Create Flow:** Admin can create a new test blog post, fill in any random custom SEO keywords, save, and verify they persist.
- [ ] **Edit Flow:** Admin can open an existing migrated blog post, overwrite the keywords with completely new ones, save, and verify changes.
- [ ] **Validation Flow:** CMS UI properly warns if `seo_description` exceeds 160 characters.
- [ ] **Empty State Flow:** Empty SEO fields save without throwing validation errors.

### Frontend Technical SEO
- [ ] **Custom Keywords Check:** Visit the URL of the test blog post, inspect the `<head>`, and verify `<meta name="keywords">` and `<meta name="description">` exactly match the admin's free-text input.
- [ ] **Fallback Check:** Visit an existing blog post where `seo_keywords` is intentionally left null. Inspect the `<head>` and verify it falls back to the default dynamic structure.
- [ ] **Schema Check:** Inspect the `application/ld+json` script tag to ensure the `BlogPosting` schema accurately reflects the new `seo_description` and parsed `keywords` array.
