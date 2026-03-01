-- Add notification preference for diagnostic sessions
ALTER TABLE admin_email_settings 
ADD COLUMN IF NOT EXISTS notify_new_diagnostic BOOLEAN DEFAULT true;

-- Function to notify when a diagnostic lead is captured
-- This trigger fires when a diagnostic_session record is updated with an email
CREATE OR REPLACE FUNCTION notify_diagnostic_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if email was just added (lead capture)
  IF (NEW.email IS NOT NULL AND NEW.email != '' AND (OLD.email IS NULL OR OLD.email = '')) THEN
    -- Make async HTTP POST request to Edge Function
    PERFORM net.http_post(
      url := get_function_url('notify-diagnostic-submission'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the update
    RAISE WARNING 'Failed to send diagnostic notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on diagnostic_sessions table
DROP TRIGGER IF EXISTS on_diagnostic_lead_capture ON diagnostic_sessions;
CREATE TRIGGER on_diagnostic_lead_capture
  AFTER UPDATE ON diagnostic_sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_diagnostic_submission();

-- Comment for documentation
COMMENT ON FUNCTION notify_diagnostic_submission() IS 'Triggers email notifications when a diagnostic lead is captured';
