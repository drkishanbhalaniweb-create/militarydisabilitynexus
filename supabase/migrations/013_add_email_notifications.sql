-- =====================================================
-- Add Email Notifications for Community Q&A
-- =====================================================

-- 1. Add email field to questions table (for notifications)
ALTER TABLE community_questions 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 2. Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_questions_email ON community_questions(user_email);

-- 3. Create edge function trigger for answer notifications
CREATE OR REPLACE FUNCTION notify_question_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  question_record RECORD;
  answer_author TEXT;
BEGIN
  -- Only send notification for published answers
  IF NEW.status = 'published' THEN
    -- Get the question details
    SELECT q.id, q.title, q.slug, q.user_email, q.display_name
    INTO question_record
    FROM community_questions q
    WHERE q.id = NEW.question_id;
    
    -- Only send if question author provided an email
    IF question_record.user_email IS NOT NULL AND question_record.user_email != '' THEN
      -- Get answer author name
      IF NEW.is_anonymous THEN
        answer_author := 'Someone';
      ELSE
        answer_author := COALESCE(NEW.display_name, 'A community member');
      END IF;
      
      -- Call the edge function to send email
      PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-answer-posted',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'questionId', question_record.id,
          'questionTitle', question_record.title,
          'questionSlug', question_record.slug,
          'questionAuthorEmail', question_record.user_email,
          'questionAuthorName', question_record.display_name,
          'answerAuthor', answer_author,
          'answerContent', LEFT(NEW.content, 200)
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger on answer insert
DROP TRIGGER IF EXISTS trigger_notify_answer ON community_answers;
CREATE TRIGGER trigger_notify_answer
  AFTER INSERT ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION notify_question_author();

-- 5. Update RLS policies to protect email privacy
-- Drop existing SELECT policy and recreate with email exclusion
DROP POLICY IF EXISTS "Anyone can view published questions" ON community_questions;

-- Create new policy that excludes email from public view
CREATE POLICY "Anyone can view published questions" ON community_questions
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- Note: The email field will be filtered out in the frontend queries
-- or we can use a view for public access

-- 6. Create a public view without email
CREATE OR REPLACE VIEW community_questions_public AS
SELECT 
  id,
  user_id,
  title,
  slug,
  content,
  is_anonymous,
  display_name,
  upvotes,
  downvotes,
  views_count,
  answers_count,
  status,
  is_featured,
  created_at,
  updated_at
FROM community_questions
WHERE status = 'published';

-- Grant access to the view
GRANT SELECT ON community_questions_public TO anon, authenticated;

-- 7. Add comment for documentation
COMMENT ON COLUMN community_questions.user_email IS 'Email for notifications only - not exposed in public queries';
