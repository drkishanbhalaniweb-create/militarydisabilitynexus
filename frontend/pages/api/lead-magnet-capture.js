import { createClient } from '@supabase/supabase-js';
import {
  sanitizeEmail,
  sanitizeInlineText,
  validateSubmissionMeta,
} from '../../src/lib/submissionValidation';

const RATE_LIMIT_MAX = 6;
const RATE_LIMIT_WINDOW_MINUTES = 60;
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;
const PDF_PATH_REGEX = /^pdfs\/[a-zA-Z0-9._/-]+\.pdf$/;

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
    .map((byte) => byte.toString(16).padStart(2, '0'))
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
    const error = new Error('Too many submissions from this network. Please wait and try again.');
    error.status = 429;
    throw error;
  }

  const { error: insertError } = await supabase
    .from('submission_rate_limits')
    .insert({ route, ip_hash: ipHash });

  if (insertError) {
    console.error('Rate limit write failed:', insertError);
  }
}

function sanitizePdfPath(value) {
  const path = sanitizeInlineText(value, 300);

  if (!PDF_PATH_REGEX.test(path) || path.includes('..')) {
    throw new Error('Invalid PDF selection.');
  }

  return path;
}

function sanitizeSourcePath(value) {
  const sourcePath = sanitizeInlineText(value, 300);
  if (!sourcePath || !sourcePath.startsWith('/') || sourcePath.startsWith('//')) {
    return null;
  }

  return sourcePath;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildEmail({ title, downloadUrl }) {
  const safeTitle = escapeHtml(title);
  const safeUrl = escapeHtml(downloadUrl);

  return {
    subject: `Your ${title} download`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h1 style="font-size: 22px; margin-bottom: 12px;">Your ${safeTitle} download is ready</h1>
        <p>Use the button below to download your PDF template.</p>
        <p style="margin: 24px 0;">
          <a href="${safeUrl}" style="display: inline-block; background: #B91C3C; color: #ffffff; padding: 12px 18px; border-radius: 6px; text-decoration: none; font-weight: 700;">
            Download PDF
          </a>
        </p>
        <p style="font-size: 13px; color: #64748b;">This private download link expires in 7 days.</p>
      </div>
    `,
    text: `Your ${title} download is ready:\n\n${downloadUrl}\n\nThis private download link expires in 7 days.`,
  };
}

async function sendEmail(supabase, email) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: email,
  });

  if (!error && data?.success !== false) {
    return {
      provider: 'supabase-functions',
      id: data?.id || null,
    };
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(error?.message || data?.error || 'Failed to send email.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM_HEADER || 'Military Disability Nexus <contact@militarydisabilitynexus.com>',
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: process.env.MAIL_REPLY_TO || 'contact@militarydisabilitynexus.com',
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || 'Failed to send email.');
  }

  return {
    provider: 'resend',
    id: result?.id || null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let supabase;
  let captureId = null;

  try {
    const payload = req.body || {};

    if (payload.meta) {
      validateSubmissionMeta(payload.meta);
    }

    const email = sanitizeEmail(payload.email);
    const pdfPath = sanitizePdfPath(payload.pdfPath);
    const title = sanitizeInlineText(payload.title, 140) || 'Free PDF Template';
    const fileName = sanitizeInlineText(payload.fileName, 180) || null;
    const sourcePath = sanitizeSourcePath(payload.sourcePath);

    supabase = getSupabaseAdmin();

    const clientIp = getClientIp(req);
    await enforceRateLimit(supabase, 'lead_magnet_capture', clientIp);
    const ipHash = clientIp ? await hashValue(clientIp) : null;

    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('lead-magnets')
      .createSignedUrl(pdfPath, SIGNED_URL_TTL_SECONDS);

    if (signedUrlError || !signedUrl?.signedUrl) {
      console.error('Lead magnet signed URL failed:', signedUrlError);
      throw new Error('Unable to prepare this PDF.');
    }

    const { data: capture, error: insertError } = await supabase
      .from('lead_magnet_captures')
      .insert({
        email,
        lead_magnet_title: title,
        pdf_storage_path: pdfPath,
        pdf_file_name: fileName,
        source_path: sourcePath,
        ip_hash: ipHash,
        user_agent: sanitizeInlineText(req.headers['user-agent'], 500) || null,
        email_status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Lead magnet capture insert failed:', insertError);
      throw new Error('Unable to capture this email.');
    }

    captureId = capture.id;

    const emailPayload = buildEmail({
      title,
      downloadUrl: signedUrl.signedUrl,
    });

    await sendEmail(supabase, {
      to: email,
      ...emailPayload,
    });

    const { error: updateError } = await supabase
      .from('lead_magnet_captures')
      .update({
        email_status: 'sent',
        email_sent_at: new Date().toISOString(),
        email_error: null,
      })
      .eq('id', captureId);

    if (updateError) {
      console.error('Lead magnet capture status update failed:', updateError);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send the PDF.';
    const status = error.status || (message.includes('Please ') || message.includes('Invalid ') ? 400 : 500);

    if (supabase && captureId) {
      await supabase
        .from('lead_magnet_captures')
        .update({
          email_status: 'failed',
          email_error: message.slice(0, 500),
        })
        .eq('id', captureId)
        .then(({ error: updateError }) => {
          if (updateError) console.error('Lead magnet failure status update failed:', updateError);
        });
    }

    console.error('lead-magnet-capture API error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}
