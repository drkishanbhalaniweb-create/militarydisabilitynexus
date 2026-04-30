-- Add SEO columns to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;
