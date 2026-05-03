-- Add featured_image_alt to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;

-- Update existing posts to have a default alt tag based on the title
UPDATE blog_posts SET featured_image_alt = title WHERE featured_image_alt IS NULL;
