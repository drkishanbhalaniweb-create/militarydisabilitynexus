import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import {
  enforceRateLimit,
  validateFormSubmission,
  validateSubmissionMeta,
} from '../_shared/submission-utils.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function getErrorStatus(message: string): number {
  if (message.includes('Too many submissions')) {
    return 429;
  }

  if (
    message.includes('Please ') ||
    message.includes('valid email') ||
    message.includes('Unable to process')
  ) {
    return 400;
  }

  return 500;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    validateSubmissionMeta(payload.meta);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await enforceRateLimit(supabase, 'form_submission', req, 10, 60);

    const submission = validateFormSubmission(payload);
    const { data, error } = await supabase
      .from('form_submissions')
      .insert(submission)
      .select()
      .single();

    if (error) {
      console.error('Form submission insert failed:', error);
      throw new Error('Failed to submit form.');
    }

    return jsonResponse({ success: true, submission: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit form.';
    console.error('submit-form-submission error:', error);
    return jsonResponse(
      { success: false, error: message },
      { status: getErrorStatus(message) },
    );
  }
});
