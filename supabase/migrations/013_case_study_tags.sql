-- Add tags column to case_studies table
-- Tags will be stored as an array of text values

ALTER TABLE case_studies 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tags to improve query performance
CREATE INDEX idx_case_studies_tags ON case_studies USING GIN (tags);

-- Add comment
COMMENT ON COLUMN case_studies.tags IS 'Array of tags for categorizing case studies (e.g., SMC/Aid & Attendance, Primary Service Connection, etc.)';
