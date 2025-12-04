# Development Guide

## Quick Start

```bash
cd frontend
npm install
npm start
```

## Project Structure

```
medical-consulting-website/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Radix UI components
│   │   │   ├── FileUpload.js  # File upload component
│   │   │   ├── FileList.js    # File list component
│   │   │   ├── Header.js      # Site header
│   │   │   ├── Footer.js      # Site footer
│   │   │   └── Layout.js      # Page layout wrapper
│   │   ├── pages/             # Page components
│   │   │   ├── Home.js        # Homepage
│   │   │   ├── Services.js    # Services listing
│   │   │   ├── ServiceDetail.js # Individual service
│   │   │   ├── Blog.js        # Blog listing
│   │   │   ├── BlogPost.js    # Individual blog post
│   │   │   ├── Contact.js     # Contact form
│   │   │   ├── AidAttendanceForm.js # A&A form
│   │   │   └── About.js       # About page
│   │   ├── lib/               # Utilities and API
│   │   │   ├── api.js         # Supabase API functions
│   │   │   ├── supabase.js    # Supabase client
│   │   │   └── utils.js       # Helper functions
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── use-toast.js   # Toast notifications
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   │   ├── index.html
│   │   └── manifest.json
│   ├── .env                   # Environment variables
│   └── package.json           # Dependencies
├── supabase/                  # Database files
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Database schema
│   ├── seed.sql               # Sample data
│   └── enable_all_access.sql  # RLS policies
└── README.md                  # Main documentation
```

## Key Files

### API Layer (`frontend/src/lib/api.js`)
Contains all Supabase API functions:
- `servicesApi` - Service CRUD operations
- `blogApi` - Blog post operations
- `contactsApi` - Contact form submissions
- `fileUploadApi` - File upload/download/delete

### Supabase Client (`frontend/src/lib/supabase.js`)
Initializes the Supabase client with environment variables.

### Components
- **FileUpload** - Drag & drop file upload with validation
- **FileList** - Display and manage uploaded files
- **Layout** - Consistent page layout with header/footer

## Adding New Features

### Add a New Page

1. Create component in `frontend/src/pages/NewPage.js`
2. Add route in `frontend/src/App.js`
3. Add navigation link in `frontend/src/components/Header.js`

### Add a New Database Table

1. Create migration in `supabase/migrations/`
2. Run migration in Supabase SQL Editor
3. Add RLS policies
4. Create API functions in `frontend/src/lib/api.js`

### Add a New API Function

```javascript
// In frontend/src/lib/api.js
export const newApi = {
  async getData() {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    
    if (error) throw error;
    return data;
  },
};
```

## Styling

Uses TailwindCSS for styling. Common patterns:

```jsx
// Card
<div className="bg-white rounded-2xl p-8 shadow-lg">

// Button
<button className="bg-teal-600 text-white px-6 py-3 rounded-full hover:bg-teal-700">

// Input
<input className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500" />
```

## Common Tasks

### Update Services
Edit `supabase/seed.sql` and re-run in Supabase SQL Editor.

### Update Blog Posts
Add new entries to `blog_posts` table via Supabase dashboard or SQL.

### Change Colors
Update TailwindCSS classes:
- Primary: `teal-600`
- Secondary: `emerald-600`
- Text: `slate-900`, `slate-600`

### Add Form Validation
Use React Hook Form with Zod schema validation.

## Troubleshooting

### 401 Unauthorized
- Check RLS policies in Supabase
- Verify environment variables
- Run `supabase/enable_all_access.sql`

### File Upload Fails
- Check storage bucket exists
- Verify storage policies
- Check file category is valid

### Build Errors
```bash
cd frontend
rm -rf node_modules
npm install
npm start
```

## Testing

### Manual Testing Checklist
- [ ] Services page loads
- [ ] Blog page loads
- [ ] Contact form submits
- [ ] File upload works
- [ ] File download works
- [ ] File delete works
- [ ] Aid & Attendance form submits

## Performance

- Images are lazy loaded
- Code splitting with React Router
- Supabase CDN for file delivery
- TailwindCSS purges unused styles

## Security

- RLS policies on all tables
- Private storage bucket
- Signed URLs for downloads
- Input validation on forms
- HIPAA-compliant file storage
