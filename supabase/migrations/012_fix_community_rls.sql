-- =====================================================
-- Fix Community Q&A RLS Policies
-- =====================================================
-- Issue: Answers not visible to anonymous users on public site
-- The SELECT policy needs to explicitly allow anon role

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published answers" ON community_answers;
DROP POLICY IF EXISTS "Anyone can view published questions" ON community_questions;

-- Recreate with explicit anon access
CREATE POLICY "Anyone can view published questions" ON community_questions
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Anyone can view published answers" ON community_answers
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- Also allow admins to see all questions/answers regardless of status
-- First check if admin_users table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    -- Drop existing admin policies if they exist
    DROP POLICY IF EXISTS "Admins can view all questions" ON community_questions;
    DROP POLICY IF EXISTS "Admins can view all answers" ON community_answers;
    DROP POLICY IF EXISTS "Admins can update any question" ON community_questions;
    DROP POLICY IF EXISTS "Admins can delete any question" ON community_questions;
    DROP POLICY IF EXISTS "Admins can update any answer" ON community_answers;
    DROP POLICY IF EXISTS "Admins can delete any answer" ON community_answers;
    
    -- Create admin policies
    CREATE POLICY "Admins can view all questions" ON community_questions
      FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
      );
    
    CREATE POLICY "Admins can view all answers" ON community_answers
      FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
      );
    
    CREATE POLICY "Admins can update any question" ON community_questions
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
    
    CREATE POLICY "Admins can delete any question" ON community_questions
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
    
    CREATE POLICY "Admins can update any answer" ON community_answers
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
    
    CREATE POLICY "Admins can delete any answer" ON community_answers
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Add is_accepted column if it doesn't exist (alias for is_best_answer for frontend compatibility)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'community_answers' AND column_name = 'is_accepted') THEN
    ALTER TABLE community_answers ADD COLUMN is_accepted BOOLEAN DEFAULT false;
    -- Sync with is_best_answer
    UPDATE community_answers SET is_accepted = is_best_answer;
  END IF;
END $$;

-- Create trigger to keep is_accepted and is_best_answer in sync
CREATE OR REPLACE FUNCTION sync_answer_accepted_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_accepted IS DISTINCT FROM OLD.is_accepted THEN
      NEW.is_best_answer := NEW.is_accepted;
    ELSIF NEW.is_best_answer IS DISTINCT FROM OLD.is_best_answer THEN
      NEW.is_accepted := NEW.is_best_answer;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_answer_status ON community_answers;
CREATE TRIGGER trigger_sync_answer_status
  BEFORE UPDATE ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION sync_answer_accepted_status();
