-- =====================================================
-- Fix and Standardize Notification System
-- =====================================================

-- 1. Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. Update the config functions with YOUR actual values
-- ⚠️ IMPORTANT: Replace the placeholder values below before running!

CREATE OR REPLACE FUNCTION get_supabase_url()
RETURNS TEXT 
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- ⚠️ Replace with your actual Supabase project URL
  RETURN 'https://YOUR-PROJECT-REF.supabase.co';
END;
$$;

CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS TEXT 
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ⚠️ Replace with your actual secret key
  RETURN 'YOUR-SECRET-KEY';
END;
$$;

-- 3. Extend email_logs for community features
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'community_question_id') THEN
        ALTER TABLE email_logs ADD COLUMN community_question_id UUID REFERENCES community_questions(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'community_answer_id') THEN
        ALTER TABLE email_logs ADD COLUMN community_answer_id UUID REFERENCES community_answers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Refactor notify_question_author with error handling
CREATE OR REPLACE FUNCTION notify_question_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  question_record RECORD;
  answer_author TEXT;
  target_url TEXT;
  target_key TEXT;
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
      -- Get config from the helper functions (same ones your other triggers use)
      target_url := get_supabase_url();
      target_key := get_service_role_key();
      
      -- Skip if config is still placeholder
      IF target_url LIKE '%YOUR-PROJECT-REF%' OR target_key = 'YOUR-SECRET-KEY' OR target_key = 'YOUR-SERVICE-ROLE-KEY' THEN
        RAISE WARNING 'Notification skipped: Supabase URL or Secret Key not configured. Run the config update SQL.';
        RETURN NEW;
      END IF;

      -- Get answer author name
      IF NEW.is_anonymous THEN
        answer_author := 'Someone';
      ELSE
        answer_author := COALESCE(NEW.display_name, 'A community member');
      END IF;
      
      -- Call the edge function to send email
      PERFORM net.http_post(
        url := target_url || '/functions/v1/notify-answer-posted',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || target_key
        ),
        body := jsonb_build_object(
          'questionId', question_record.id,
          'questionTitle', question_record.title,
          'questionSlug', question_record.slug,
          'questionAuthorEmail', question_record.user_email,
          'questionAuthorName', question_record.display_name,
          'answerAuthor', answer_author,
          'answerContent', LEFT(NEW.content, 200),
          'answerId', NEW.id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the answer insert
    RAISE WARNING 'Failed to trigger community notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Recreate the trigger with the updated function
DROP TRIGGER IF EXISTS trigger_notify_answer ON community_answers;
CREATE TRIGGER trigger_notify_answer
  AFTER INSERT ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION notify_question_author();

-- 6. Documentation
COMMENT ON FUNCTION notify_question_author() IS 'Triggers answer notification Edge Function. Uses get_supabase_url() and get_service_role_key() for config.';
