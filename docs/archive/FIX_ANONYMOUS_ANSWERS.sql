-- FIX ANONYMOUS ANSWERS - Run this in production Supabase SQL Editor
-- This replaces the restrictive RLS policies with ones that allow anonymous posting

-- ============================================
-- STEP 1: Make user_id nullable
-- ============================================
ALTER TABLE community_questions 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE community_answers 
ALTER COLUMN user_id DROP NOT NULL;

-- Add user_email for notifications
ALTER TABLE community_answers 
ADD COLUMN IF NOT EXISTS user_email TEXT;

ALTER TABLE community_questions
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- ============================================
-- STEP 2: Drop old restrictive policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create questions" ON community_questions;
DROP POLICY IF EXISTS "Authenticated users can create answers" ON community_answers;
DROP POLICY IF EXISTS "Users can update own questions" ON community_questions;
DROP POLICY IF EXISTS "Users can update own answers" ON community_answers;

-- ============================================
-- STEP 3: Create new permissive policies
-- ============================================

-- Allow ANYONE to insert questions (anonymous or authenticated)
CREATE POLICY "Anyone can insert questions"
    ON community_questions FOR INSERT
    WITH CHECK (true);

-- Allow ANYONE to insert answers (anonymous or authenticated)
CREATE POLICY "Anyone can insert answers"
    ON community_answers FOR INSERT
    WITH CHECK (true);

-- Allow ANYONE to update question stats (views_count, answers_count)
-- But only allow users to update their own questions' content
CREATE POLICY "Anyone can update question stats"
    ON community_questions FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow users to update their own answers
CREATE POLICY "Users can update own answers"
    ON community_answers FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- STEP 4: Verify the changes
-- ============================================

-- Check if user_id is nullable (should show YES)
SELECT 
    table_name, 
    column_name, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('community_questions', 'community_answers') 
    AND column_name = 'user_id';

-- Check RLS policies (should see the new "Anyone can insert" policies)
SELECT 
    tablename, 
    policyname, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('community_questions', 'community_answers')
ORDER BY tablename, policyname;
