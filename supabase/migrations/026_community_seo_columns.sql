-- Migration to add SEO override columns to community questions
ALTER TABLE community_questions
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT;
