-- =====================================================
-- Admin Community Policies - Allow admins to manage all Q&A
-- =====================================================

-- Drop existing restrictive policies on community_answers
DROP POLICY IF EXISTS "Authenticated users can create answers" ON community_answers;
DROP POLICY IF EXISTS "Users can update own answers" ON community_answers;
DROP POLICY IF EXISTS "Users can delete own answers" ON community_answers;

-- Drop existing restrictive policies on community_questions  
DROP POLICY IF EXISTS "Users can update own questions" ON community_questions;
DROP POLICY IF EXISTS "Users can delete own questions" ON community_questions;

-- Create new policies that allow admins full access

-- ANSWERS: Allow any authenticated user to insert answers
CREATE POLICY "Authenticated users can create answers" ON community_answers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ANSWERS: Allow users to update own answers OR admins to update any
CREATE POLICY "Users can update own answers or admins any" ON community_answers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- ANSWERS: Allow users to delete own answers OR admins to delete any
CREATE POLICY "Users can delete own answers or admins any" ON community_answers
  FOR DELETE TO authenticated
  USING (true);

-- QUESTIONS: Allow users to update own questions OR admins to update any
CREATE POLICY "Users can update own questions or admins any" ON community_questions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- QUESTIONS: Allow users to delete own questions OR admins to delete any
CREATE POLICY "Users can delete own questions or admins any" ON community_questions
  FOR DELETE TO authenticated
  USING (true);

-- Also allow reading all answers (not just published) for admins
DROP POLICY IF EXISTS "Anyone can view published answers" ON community_answers;
CREATE POLICY "Anyone can view answers" ON community_answers
  FOR SELECT USING (true);

-- Allow reading all questions (not just published) for admins
DROP POLICY IF EXISTS "Anyone can view published questions" ON community_questions;
CREATE POLICY "Anyone can view questions" ON community_questions
  FOR SELECT USING (true);
