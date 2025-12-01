-- =====================================================
-- Community Q&A Feature - Database Schema
-- =====================================================

-- 1. Community Questions Table
CREATE TABLE IF NOT EXISTS community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT, -- Shown if not anonymous
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'archived', 'flagged')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Community Answers Table
CREATE TABLE IF NOT EXISTS community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'archived', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community Votes Table (tracks who voted on what)
CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  target_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_slug ON community_questions(slug);
CREATE INDEX IF NOT EXISTS idx_questions_status ON community_questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created ON community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_upvotes ON community_questions(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question ON community_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_best ON community_answers(is_best_answer) WHERE is_best_answer = true;
CREATE INDEX IF NOT EXISTS idx_votes_target ON community_votes(target_type, target_id);

-- 5. Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_question_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := substring(base_slug, 1, 100); -- Limit length
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM community_questions WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- 6. Trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION set_question_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_question_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_question_slug ON community_questions;
CREATE TRIGGER trigger_set_question_slug
  BEFORE INSERT ON community_questions
  FOR EACH ROW
  EXECUTE FUNCTION set_question_slug();

-- 7. Function to update answer count on question
CREATE OR REPLACE FUNCTION update_question_answers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_questions 
    SET answers_count = answers_count + 1,
        updated_at = NOW()
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_questions 
    SET answers_count = GREATEST(0, answers_count - 1),
        updated_at = NOW()
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_answers_count ON community_answers;
CREATE TRIGGER trigger_update_answers_count
  AFTER INSERT OR DELETE ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_answers_count();

-- 8. Function to handle voting
CREATE OR REPLACE FUNCTION handle_community_vote(
  p_user_id UUID,
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
BEGIN
  -- Check for existing vote
  SELECT * INTO existing_vote 
  FROM community_votes 
  WHERE user_id = p_user_id 
    AND target_type = p_target_type 
    AND target_id = p_target_id;
  
  IF existing_vote IS NOT NULL THEN
    IF existing_vote.vote_type = p_vote_type THEN
      -- Same vote type - remove the vote
      DELETE FROM community_votes WHERE id = existing_vote.id;
      
      -- Update counts
      IF p_target_type = 'question' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_questions SET upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_questions SET downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        END IF;
      ELSE
        IF p_vote_type = 'upvote' THEN
          UPDATE community_answers SET upvotes = GREATEST(0, upvotes - 1) WHERE id = p_target_id;
        ELSE
          UPDATE community_answers SET downvotes = GREATEST(0, downvotes - 1) WHERE id = p_target_id;
        END IF;
      END IF;
      
      result := json_build_object('action', 'removed', 'vote_type', p_vote_type);
    ELSE
      -- Different vote type - change the vote
      UPDATE community_votes 
      SET vote_type = p_vote_type, created_at = NOW()
      WHERE id = existing_vote.id;
      
      -- Update counts (remove old, add new)
      IF p_target_type = 'question' THEN
        IF p_vote_type = 'upvote' THEN
          UPDATE community_questions 
          SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) 
          WHERE id = p_target_id;
        ELSE
          UPDATE community_questions 
          SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) 
          WHERE id = p_target_id;
        END IF;
      ELSE
        IF p_vote_type = 'upvote' THEN
          UPDATE community_answers 
          SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) 
          WHERE id = p_target_id;
        ELSE
          UPDATE community_answers 
          SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) 
          WHERE id = p_target_id;
        END IF;
      END IF;
      
      result := json_build_object('action', 'changed', 'vote_type', p_vote_type);
    END IF;
  ELSE
    -- New vote
    INSERT INTO community_votes (user_id, target_type, target_id, vote_type)
    VALUES (p_user_id, p_target_type, p_target_id, p_vote_type);
    
    -- Update counts
    IF p_target_type = 'question' THEN
      IF p_vote_type = 'upvote' THEN
        UPDATE community_questions SET upvotes = upvotes + 1 WHERE id = p_target_id;
      ELSE
        UPDATE community_questions SET downvotes = downvotes + 1 WHERE id = p_target_id;
      END IF;
    ELSE
      IF p_vote_type = 'upvote' THEN
        UPDATE community_answers SET upvotes = upvotes + 1 WHERE id = p_target_id;
      ELSE
        UPDATE community_answers SET downvotes = downvotes + 1 WHERE id = p_target_id;
      END IF;
    END IF;
    
    result := json_build_object('action', 'added', 'vote_type', p_vote_type);
  END IF;
  
  RETURN result;
END;
$$;

-- 9. Function to increment view count
CREATE OR REPLACE FUNCTION increment_question_views(p_question_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_questions 
  SET views_count = views_count + 1 
  WHERE id = p_question_id;
END;
$$;

-- 10. RLS Policies
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

-- Questions: Anyone can read published, authenticated can create
CREATE POLICY "Anyone can view published questions" ON community_questions
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create questions" ON community_questions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON community_questions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON community_questions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Answers: Anyone can read published, authenticated can create
CREATE POLICY "Anyone can view published answers" ON community_answers
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create answers" ON community_answers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers" ON community_answers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers" ON community_answers
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Votes: Authenticated users only
CREATE POLICY "Users can view own votes" ON community_votes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote" ON community_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change own votes" ON community_votes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove own votes" ON community_votes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION handle_community_vote TO authenticated;
GRANT EXECUTE ON FUNCTION increment_question_views TO anon, authenticated;

-- 11. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_questions_updated_at ON community_questions;
CREATE TRIGGER trigger_questions_updated_at
  BEFORE UPDATE ON community_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_answers_updated_at ON community_answers;
CREATE TRIGGER trigger_answers_updated_at
  BEFORE UPDATE ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
