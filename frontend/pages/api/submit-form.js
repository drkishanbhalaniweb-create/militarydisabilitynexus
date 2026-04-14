import { createClient } from '@supabase/supabase-js';
import {
  prepareFormSubmission,
  createSubmissionMeta,
  validateSubmissionMeta,
} from '../../src/lib/submissionValidation';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MINUTES = 60;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing server Supabase config.');
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = (typeof forwarded === 'string' ? forwarded : forwarded[0])
      .split(',')[0]
      ?.trim();
    if (first) return first;
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || null;
}

async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function enforceRateLimit(supabase, route, clientIp) {
  if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1') {
    return;
  }

  const ipHash = await hashValue(clientIp);
  const cutoff = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { count, error: countError } = await supabase
    .from('submission_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('route', route)
    .eq('ip_hash', ipHash)
    .gte('created_at', cutoff);

  if (countError) {
    console.error('Rate limit check failed:', countError);
    return;
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    const err = new Error(
      'Too many submissions from this network. Please wait and try again.'
    );
    err.status = 429;
    throw err;
  }

  await supabase
    .from('submission_rate_limits')
    .insert({ route, ip_hash: ipHash })
    .then(({ error }) => {
      if (error) console.error('Rate limit write failed:', error);
    });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    // Validate anti-spam meta
    if (payload.meta) {
      validateSubmissionMeta(payload.meta);
    }

    // Sanitize and validate
    const preparedSubmission = prepareFormSubmission(payload);

    const supabase = getSupabaseAdmin();

    // Rate limiting
    const clientIp = getClientIp(req);
    await enforceRateLimit(supabase, 'form_submission', clientIp);

    // Insert into form_submissions table (service role key bypasses RLS)
    const { data, error } = await supabase
      .from('form_submissions')
      .insert({
        form_type: preparedSubmission.formType,
        full_name: preparedSubmission.fullName,
        email: preparedSubmission.email,
        phone: preparedSubmission.phone,
        form_data: preparedSubmission.formData,
        requires_upload: preparedSubmission.requiresUpload,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Form submission insert failed:', error);
      throw new Error('Failed to submit form.');
    }

    return res.status(200).json({ success: true, submission: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit form.';
    const status = error.status || (message.includes('Please ') ? 400 : 500);

    console.error('submit-form API error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}
