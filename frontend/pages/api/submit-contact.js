import { createClient } from '@supabase/supabase-js';
import {
  prepareContactSubmission,
  createSubmissionMeta,
  validateSubmissionMeta,
} from '../../src/lib/submissionValidation';

const RATE_LIMIT_MAX = 8;
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
    return; // Skip rate limiting for localhost
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

    // Sanitize and validate the contact data
    const preparedContact = prepareContactSubmission(payload);

    const supabase = getSupabaseAdmin();

    // Rate limiting
    const clientIp = getClientIp(req);
    await enforceRateLimit(supabase, 'contact_submission', clientIp);

    // Insert into contacts table (service role key bypasses RLS)
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: preparedContact.name,
        email: preparedContact.email,
        phone: preparedContact.phone,
        subject: preparedContact.subject,
        message: preparedContact.message,
        service_interest:
          preparedContact.serviceInterest ||
          (preparedContact.serviceTypes?.length > 0
            ? preparedContact.serviceTypes.join(', ')
            : null),
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Contact insert failed:', error);
      throw new Error('Failed to submit contact form.');
    }

    return res.status(200).json({ success: true, contact: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit contact form.';
    const status = error.status || (message.includes('Please ') ? 400 : 500);

    console.error('submit-contact API error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}
