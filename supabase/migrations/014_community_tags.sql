-- Add tags column to community_questions table
-- Tags will be stored as an array of text values

ALTER TABLE community_questions 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tags to improve query performance
CREATE INDEX idx_community_questions_tags ON community_questions USING GIN (tags);

-- Add comment
COMMENT ON COLUMN community_questions.tags IS 'Array of tags for categorizing questions (e.g., Nexus Letter, Mental Health, etc.)';
