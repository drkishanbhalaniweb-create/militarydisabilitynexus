# Technical Specifications - Final Changes

## 1. Performance Optimization

### 1.1 Image Optimization

#### Implementation
```javascript
// frontend/src/components/OptimizedImage.js
import { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  width, 
  height,
  priority = false 
}) => {
  const [loaded, setLoaded] = useState(false);
  
  // Generate WebP and fallback URLs
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? 'loaded' : 'loading'}`}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
      />
    </picture>
  );
};
```

#### CSS for Blur-up Effect
```css
/* frontend/src/App.css */
img.loading {
  filter: blur(10px);
  transition: filter 0.3s;
}

img.loaded {
  filter: blur(0);
}
```

### 1.2 Code Splitting

#### App.js with Lazy Loading
```javascript
// frontend/src/App.js
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Eager load critical routes
import Home from './pages/Home';
import Layout from './components/Layout';

// Lazy load non-critical routes
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));

// Lazy load admin panel (separate chunk)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="blog" element={<Blog />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 1.3 Bundle Optimization

#### Optimize Radix UI Imports
```javascript
// ❌ Bad - imports entire library
import * as Dialog from '@radix-ui/react-dialog';

// ✅ Good - imports only what's needed
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
```

### 1.4 Vercel Configuration

#### Updated vercel.json
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "framework": "create-react-app",
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 2. Blog Image Upload Feature

### 2.1 Database Schema

#### Migration: 007_blog_images.sql
```sql
-- Add content_images column to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS content_images JSONB DEFAULT '[]'::jsonb;

-- Add index for content_images
CREATE INDEX IF NOT EXISTS idx_blog_content_images 
ON blog_posts USING GIN(content_images);

-- Update featured_image to allow NULL
ALTER TABLE blog_posts 
ALTER COLUMN featured_image DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN blog_posts.content_images IS 
'Array of image objects: [{url, alt, caption, position}]';
```

### 2.2 Storage Bucket Setup

#### Supabase Storage Configuration
```javascript
// Create bucket via Supabase Dashboard or SQL
// Bucket name: blog-images
// Public: true
// File size limit: 5MB
// Allowed MIME types: image/jpeg, image/png, image/webp

// RLS Policy for uploads
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');
```

### 2.3 Image Upload Component

#### frontend/src/components/admin/ImageUpload.js
```javascript
import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const ImageUpload = ({ onUploadComplete, existingImage = null }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingImage);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl, filePath);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreview(null);
    onUploadComplete(null, null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={uploading}
          />
          
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-sm font-semibold text-slate-700 mb-2">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-slate-500">
              PNG, JPG, WebP up to 5MB
            </p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
```

### 2.4 Updated BlogForm with Images

#### Key Changes to frontend/src/pages/admin/BlogForm.js
```javascript
import ImageUpload from '../../components/admin/ImageUpload';

// Add to formData state
const [formData, setFormData] = useState({
  // ... existing fields
  featured_image: '',
  featured_image_path: '',
  content_images: [],
});

// Add image upload handler
const handleFeaturedImageUpload = (url, path) => {
  setFormData({
    ...formData,
    featured_image: url,
    featured_image_path: path,
  });
};

// In the form JSX, add:
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Featured Image
  </label>
  <ImageUpload
    onUploadComplete={handleFeaturedImageUpload}
    existingImage={formData.featured_image}
  />
</div>
```

---

## 3. Admin Account Creation Feature

### 3.1 Database Schema

#### Migration: 008_admin_users.sql
```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Create index
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all admin users"
ON admin_users FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Super admins can create admin users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

CREATE POLICY "Super admins can update admin users"
ON admin_users FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true
    )
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = user_id 
        AND role = 'super_admin' 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_login
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE admin_users
    SET last_login = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION update_admin_last_login();

-- Add comment
COMMENT ON TABLE admin_users IS 'Admin user management with role-based access control';
```

### 3.2 Supabase Edge Function

#### supabase/functions/create-admin-user/index.ts
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify requester is super admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is super admin
    const { data: adminCheck } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminCheck || adminCheck.role !== 'super_admin') {
      throw new Error('Only super admins can create admin users');
    }

    // Get request body
    const { email, password, full_name, role } = await req.json();

    // Validate input
    if (!email || !password || !full_name || !role) {
      throw new Error('Missing required fields');
    }

    if (!['admin', 'editor', 'super_admin'].includes(role)) {
      throw new Error('Invalid role');
    }

    // Create user in auth.users
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    });

    if (createError) throw createError;

    // Create entry in admin_users table
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: newUser.user.id,
        email,
        full_name,
        role,
        created_by: user.id,
      });

    if (insertError) throw insertError;

    // Log in audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action: 'create_admin_user',
      resource_type: 'admin_user',
      resource_id: newUser.user.id,
      changes: { email, full_name, role },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUser.user.id, 
          email, 
          full_name, 
          role 
        } 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

### 3.3 Admin Users Page

#### frontend/src/pages/admin/AdminUsers.js
```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { UserPlus, Shield, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminUserForm from '../../components/admin/AdminUserForm';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchAdminUsers();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!data || data.role !== 'super_admin') {
      toast.error('You do not have permission to access this page');
      window.location.href = '/admin/dashboard';
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchAdminUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      editor: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Users</h1>
            <p className="text-slate-600 mt-2">Manage admin accounts and permissions</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Admin</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <AdminUserForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchAdminUsers();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
```

---

## 4. Stripe Live Mode Configuration

### 4.1 Environment Variables

#### Production (.env.production)
```bash
# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Stripe LIVE Keys
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Calendly
REACT_APP_CALENDLY_URL=https://calendly.com/your-username/discovery-call
```

#### Development (.env.local)
```bash
# Keep test keys for development
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
```

### 4.2 Supabase Secrets

```bash
# Update via Supabase Dashboard or CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_secret
```

---

## 5. Deployment Configuration

### 5.1 Vercel Environment Variables

Required variables in Vercel Dashboard:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` (live key)
- `REACT_APP_CALENDLY_URL`

### 5.2 Build Settings

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "installCommand": "cd frontend && npm install",
  "framework": "create-react-app"
}
```

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Status:** Ready for Implementation
