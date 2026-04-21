-- Update blog_posts and case_studies to allow manual selection of related content
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_post_ids UUID[] DEFAULT '{}';
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS related_post_ids UUID[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN blog_posts.related_post_ids IS 'Array of blog_post IDs selected by admin to show in the related section';
COMMENT ON COLUMN case_studies.related_post_ids IS 'Array of case_study or blog_post IDs selected by admin';
