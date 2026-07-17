-- Add FAQs column to blog_posts for AI-citable structured data
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
