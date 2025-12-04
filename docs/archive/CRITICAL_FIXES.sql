-- CRITICAL FIXES FOR PRODUCTION DATABASE
-- Run this in Supabase SQL Editor to fix the 409/400 errors and enable anonymous posting

-- ============================================
-- FIX #1: Make user_id nullable for anonymous users
-- ============================================
ALTER TABLE community_questions 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE community_answers 
ALTER COLUMN user_id DROP NOT NULL;

-- Add user_email column for notifications
ALTER TABLE community_answers 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- ============================================
-- FIX #2: Update RLS policies for anonymous posting
-- ============================================

-- Allow anyone to insert questions
DROP POLICY IF EXISTS "Anyone can insert questions" ON community_questions;
CREATE POLICY "Anyone can insert questions"
    ON community_questions FOR INSERT
    WITH CHECK (true);

-- Allow anyone to insert answers
DROP POLICY IF EXISTS "Anyone can insert answers" ON community_answers;
CREATE POLICY "Anyone can insert answers"
    ON community_answers FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update question answer count and views
DROP POLICY IF EXISTS "Anyone can update question stats" ON community_questions;
CREATE POLICY "Anyone can update question stats"
    ON community_questions FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Ensure public can view published content
DROP POLICY IF EXISTS "Published questions are viewable by everyone" ON community_questions;
CREATE POLICY "Published questions are viewable by everyone"
    ON community_questions FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Published answers are viewable by everyone" ON community_answers;
CREATE POLICY "Published answers are viewable by everyone"
    ON community_answers FOR SELECT
    USING (status = 'published');

-- ============================================
-- FIX #3: Add tags column to case_studies (if missing)
-- ============================================
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS key_takeaway TEXT;

CREATE INDEX IF NOT EXISTS idx_case_studies_tags ON case_studies USING GIN (tags);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the fixes worked:

-- Check if user_id is nullable
SELECT 
    table_name, 
    column_name, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('community_questions', 'community_answers') 
    AND column_name = 'user_id';

-- Check RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd 
FROM pg_policies 
WHERE tablename IN ('community_questions', 'community_answers')
ORDER BY tablename, policyname;

-- Test anonymous insert (should work now)
-- INSERT INTO community_answers (question_id, content, status, display_name) 
-- VALUES ('your-question-id', 'Test answer', 'published', 'Anonymous');
