-- Migration to add SEO override columns to Blogs, Case Studies, and Services
-- Adds seo_title, seo_keywords, and seo_description where they are missing

-- 1. Blog Posts (Already has keywords and description)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);

-- 2. Case Studies
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 3. Services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;
