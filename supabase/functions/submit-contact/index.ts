import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import {
  enforceRateLimit,
  validateContactSubmission,
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
    message.includes('Unable to process') ||
    message.includes('valid email') ||
    message.includes('valid service')
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
    await enforceRateLimit(supabase, 'contact_submission', req, 8, 60);

    const contact = validateContactSubmission(payload);
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (error) {
      console.error('Contact submission insert failed:', error);
      throw new Error('Failed to submit contact form.');
    }

    return jsonResponse({ success: true, contact: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit contact form.';
    console.error('submit-contact error:', error);
    return jsonResponse(
      { success: false, error: message },
      { status: getErrorStatus(message) },
    );
  }
});
