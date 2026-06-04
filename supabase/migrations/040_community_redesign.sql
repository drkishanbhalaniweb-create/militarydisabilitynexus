-- =====================================================
-- 040: Community Redesign
-- Adds community_users, community_comments, hot_score,
-- handle_community_vote_v2, and simplified RLS.
-- =====================================================

-- ==========================================
-- 1. community_users table
-- ==========================================
CREATE TABLE IF NOT EXISTS community_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_color TEXT DEFAULT '#' || substr(md5(random()::text), 1, 6),
  is_verified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  karma INTEGER DEFAULT 0,
  questions_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_users_email
  ON community_users(email);
CREATE INDEX IF NOT EXISTS idx_community_users_supabase_uid
  ON community_users(supabase_user_id);

ALTER TABLE community_users ENABLE ROW LEVEL SECURITY;

-- Anyone can read community_users
CREATE POLICY "select_community_users" ON community_users
  FOR SELECT USING (true);

-- Writes go through service_role (API routes)
CREATE POLICY "service_insert_community_users" ON community_users
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_update_community_users" ON community_users
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_delete_community_users" ON community_users
  FOR DELETE TO service_role USING (true);

GRANT SELECT ON community_users TO anon, authenticated;

-- updated_at trigger
DROP TRIGGER IF EXISTS trigger_community_users_updated_at ON community_users;
CREATE TRIGGER trigger_community_users_updated_at
  BEFORE UPDATE ON community_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 2. community_comments table
-- ==========================================
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES community_answers(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  community_user_id UUID NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 3),
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'flagged', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_answer_id
  ON community_comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON community_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created
  ON community_comments(created_at DESC);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_published_comments" ON community_comments
  FOR SELECT USING (status = 'published');
CREATE POLICY "service_insert_comments" ON community_comments
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_update_comments" ON community_comments
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_delete_comments" ON community_comments
  FOR DELETE TO service_role USING (true);

GRANT SELECT ON community_comments TO anon, authenticated;

-- updated_at trigger
DROP TRIGGER IF EXISTS trigger_comments_updated_at ON community_comments;
CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 3. Add columns to existing tables
-- ==========================================
ALTER TABLE community_questions
  ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;
ALTER TABLE community_questions
  ADD COLUMN IF NOT EXISTS community_user_id UUID REFERENCES community_users(id);

ALTER TABLE community_answers
  ADD COLUMN IF NOT EXISTS community_user_id UUID REFERENCES community_users(id);

-- Composite index for efficient hot-feed queries
CREATE INDEX IF NOT EXISTS idx_questions_status_hot
  ON community_questions(status, hot_score DESC);

CREATE INDEX IF NOT EXISTS idx_questions_community_user
  ON community_questions(community_user_id);
CREATE INDEX IF NOT EXISTS idx_answers_community_user
  ON community_answers(community_user_id);


-- ==========================================
-- 4. Hot score function + trigger
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_hot_score(
  p_upvotes INTEGER,
  p_downvotes INTEGER,
  p_answers_count INTEGER,
  p_created_at TIMESTAMPTZ
) RETURNS FLOAT
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  score FLOAT;
  hours_age FLOAT;
BEGIN
  score := COALESCE(p_upvotes, 0)
         - COALESCE(p_downvotes, 0)
         + COALESCE(p_answers_count, 0) * 2;
  hours_age := EXTRACT(EPOCH FROM (NOW() - COALESCE(p_created_at, NOW()))) / 3600.0;
  RETURN score / POWER(hours_age + 2, 1.5);
END;
$$;

-- Trigger function: recalculate on every question update
CREATE OR REPLACE FUNCTION update_hot_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.hot_score := calculate_hot_score(
    NEW.upvotes, NEW.downvotes, NEW.answers_count, NEW.created_at
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_hot_score ON community_questions;
CREATE TRIGGER trigger_update_hot_score
  BEFORE UPDATE ON community_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_hot_score();

-- Back-fill existing questions
CREATE OR REPLACE FUNCTION recalculate_all_hot_scores()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_questions
  SET hot_score = calculate_hot_score(upvotes, downvotes, answers_count, created_at);
END;
$$;

-- Run once to seed existing data
SELECT recalculate_all_hot_scores();


-- ==========================================
-- 5. Extend community_votes + vote v2 RPC
-- ==========================================
-- Make existing user_id nullable (community users may not have auth accounts)
ALTER TABLE community_votes
  ALTER COLUMN user_id DROP NOT NULL;

-- Add community_user_id column
ALTER TABLE community_votes
  ADD COLUMN IF NOT EXISTS community_user_id UUID REFERENCES community_users(id) ON DELETE CASCADE;

-- Extend target_type to support comments
ALTER TABLE community_votes
  DROP CONSTRAINT IF EXISTS community_votes_target_type_check;
ALTER TABLE community_votes
  ADD CONSTRAINT community_votes_target_type_check
  CHECK (target_type IN ('question', 'answer', 'comment'));

-- Unique constraint for community_user_id votes
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_community_user_target
  ON community_votes(community_user_id, target_type, target_id)
  WHERE community_user_id IS NOT NULL;

-- v2 vote handler using community_user_id
CREATE OR REPLACE FUNCTION handle_community_vote_v2(
  p_community_user_id UUID,
  p_target_type TEXT,
  p_target_id UUID,
  p_vote_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_vote RECORD;
  result JSON;
  new_up INTEGER;
  new_down INTEGER;
BEGIN
  -- Validate inputs
  IF p_target_type NOT IN ('question', 'answer', 'comment') THEN
    RAISE EXCEPTION 'Invalid target_type: %', p_target_type;
  END IF;
  IF p_vote_type NOT IN ('upvote', 'downvote') THEN
    RAISE EXCEPTION 'Invalid vote_type: %', p_vote_type;
  END IF;

  -- Check for existing vote
  SELECT * INTO existing_vote
  FROM community_votes
  WHERE community_user_id = p_community_user_id
    AND target_type = p_target_type
    AND target_id = p_target_id;

  IF existing_vote IS NOT NULL THEN
    IF existing_vote.vote_type = p_vote_type THEN
      -- Same vote → remove (toggle off)
      DELETE FROM community_votes WHERE id = existing_vote.id;

      IF p_target_type = 'question' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_questions SET upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_questions SET downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        END IF;
      ELSIF p_target_type = 'answer' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_answers SET upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_answers SET downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        END IF;
      ELSIF p_target_type = 'comment' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_comments SET upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_comments SET downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        END IF;
      END IF;

      result := json_build_object('action', 'removed', 'vote_type', p_vote_type);
    ELSE
      -- Different vote → change
      UPDATE community_votes
      SET vote_type = p_vote_type, created_at = NOW()
      WHERE id = existing_vote.id;

      IF p_target_type = 'question' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_questions SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_questions SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        END IF;
      ELSIF p_target_type = 'answer' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_answers SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_answers SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        END IF;
      ELSIF p_target_type = 'comment' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_comments SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_comments SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        END IF;
      END IF;

      result := json_build_object('action', 'changed', 'vote_type', p_vote_type);
    END IF;
  ELSE
    -- New vote
    INSERT INTO community_votes (community_user_id, target_type, target_id, vote_type)
    VALUES (p_community_user_id, p_target_type, p_target_id, p_vote_type);

    IF p_target_type = 'question' THEN
      IF p_vote_type = 'upvote' THEN
        UPDATE community_questions SET upvotes = upvotes + 1 WHERE id = p_target_id;
      ELSE
        UPDATE community_questions SET downvotes = downvotes + 1 WHERE id = p_target_id;
      END IF;
    ELSIF p_target_type = 'answer' THEN
      IF p_vote_type = 'upvote' THEN
        UPDATE community_answers SET upvotes = upvotes + 1 WHERE id = p_target_id;
      ELSE
        UPDATE community_answers SET downvotes = downvotes + 1 WHERE id = p_target_id;
      END IF;
    ELSIF p_target_type = 'comment' THEN
      IF p_vote_type = 'upvote' THEN
        UPDATE community_comments SET upvotes = upvotes + 1 WHERE id = p_target_id;
      ELSE
        UPDATE community_comments SET downvotes = downvotes + 1 WHERE id = p_target_id;
      END IF;
    END IF;

    result := json_build_object('action', 'added', 'vote_type', p_vote_type);
  END IF;

  -- Fetch updated counts for the target
  IF p_target_type = 'question' THEN
    SELECT upvotes, downvotes INTO new_up, new_down FROM community_questions WHERE id = p_target_id;
  ELSIF p_target_type = 'answer' THEN
    SELECT upvotes, downvotes INTO new_up, new_down FROM community_answers WHERE id = p_target_id;
  ELSIF p_target_type = 'comment' THEN
    SELECT upvotes, downvotes INTO new_up, new_down FROM community_comments WHERE id = p_target_id;
  END IF;

  RETURN json_build_object(
    'action', result->>'action',
    'vote_type', result->>'vote_type',
    'new_upvotes', COALESCE(new_up, 0),
    'new_downvotes', COALESCE(new_down, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION handle_community_vote_v2 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_hot_score TO anon, authenticated;
GRANT EXECUTE ON FUNCTION recalculate_all_hot_scores TO authenticated;


-- ==========================================
-- 6. RLS Policy Overhaul
-- ==========================================
-- Strategy: SELECT for public reads, all writes via service_role (API routes).

-- ---- community_questions ----
DROP POLICY IF EXISTS "Anyone can view published questions" ON community_questions;
DROP POLICY IF EXISTS "Anyone can view questions" ON community_questions;
DROP POLICY IF EXISTS "Authenticated users can create questions" ON community_questions;
DROP POLICY IF EXISTS "Users can update own questions" ON community_questions;
DROP POLICY IF EXISTS "Users can delete own questions" ON community_questions;
DROP POLICY IF EXISTS "Users can update own questions or admins any" ON community_questions;
DROP POLICY IF EXISTS "Users can delete own questions or admins any" ON community_questions;
DROP POLICY IF EXISTS "Admins can view all questions" ON community_questions;
DROP POLICY IF EXISTS "Admins can update any question" ON community_questions;
DROP POLICY IF EXISTS "Admins can delete any question" ON community_questions;
DROP POLICY IF EXISTS "select_questions" ON community_questions;
DROP POLICY IF EXISTS "insert_questions" ON community_questions;
DROP POLICY IF EXISTS "update_questions" ON community_questions;
DROP POLICY IF EXISTS "delete_questions" ON community_questions;

CREATE POLICY "community_questions_select" ON community_questions
  FOR SELECT USING (status = 'published');
CREATE POLICY "community_questions_insert" ON community_questions
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "community_questions_update" ON community_questions
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "community_questions_delete" ON community_questions
  FOR DELETE TO service_role USING (true);

-- ---- community_answers ----
DROP POLICY IF EXISTS "Anyone can view published answers" ON community_answers;
DROP POLICY IF EXISTS "Anyone can view answers" ON community_answers;
DROP POLICY IF EXISTS "Anyone can insert answers" ON community_answers;
DROP POLICY IF EXISTS "Authenticated users can create answers" ON community_answers;
DROP POLICY IF EXISTS "Users can update own answers" ON community_answers;
DROP POLICY IF EXISTS "Users can delete own answers" ON community_answers;
DROP POLICY IF EXISTS "Users can update own answers or admins any" ON community_answers;
DROP POLICY IF EXISTS "Users can delete own answers or admins any" ON community_answers;
DROP POLICY IF EXISTS "Admins can view all answers" ON community_answers;
DROP POLICY IF EXISTS "Admins can update any answer" ON community_answers;
DROP POLICY IF EXISTS "Admins can delete any answer" ON community_answers;
DROP POLICY IF EXISTS "select_answers" ON community_answers;
DROP POLICY IF EXISTS "insert_answers" ON community_answers;
DROP POLICY IF EXISTS "update_answers" ON community_answers;
DROP POLICY IF EXISTS "delete_answers" ON community_answers;
DROP POLICY IF EXISTS "Published answers are viewable by everyone" ON community_answers;

CREATE POLICY "community_answers_select" ON community_answers
  FOR SELECT USING (status = 'published');
CREATE POLICY "community_answers_insert" ON community_answers
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "community_answers_update" ON community_answers
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "community_answers_delete" ON community_answers
  FOR DELETE TO service_role USING (true);

-- ---- community_votes ----
DROP POLICY IF EXISTS "Users can view own votes" ON community_votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON community_votes;
DROP POLICY IF EXISTS "Users can change own votes" ON community_votes;
DROP POLICY IF EXISTS "Users can remove own votes" ON community_votes;

CREATE POLICY "community_votes_select" ON community_votes
  FOR SELECT USING (true);
CREATE POLICY "community_votes_insert" ON community_votes
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "community_votes_update" ON community_votes
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "community_votes_delete" ON community_votes
  FOR DELETE TO service_role USING (true);

-- Grant base SELECT on all community tables to public roles
GRANT SELECT ON community_questions TO anon, authenticated;
GRANT SELECT ON community_answers TO anon, authenticated;
GRANT SELECT ON community_votes TO anon, authenticated;
