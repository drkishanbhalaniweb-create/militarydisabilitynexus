import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import {
  sanitizeMailboxHeader,
  sanitizeReplyToAddress,
  sanitizeSubjectLine,
} from '../_shared/email-safety.ts'
import { sanitizeEmailAddress } from '../_shared/submission-utils.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FALLBACK_FROM_HEADER = 'Military Disability Nexus <contact@militarydisabilitynexus.com>'
const DEFAULT_FROM_EMAIL = Deno.env.get('MAIL_FROM_EMAIL') || 'contact@militarydisabilitynexus.com'
const DEFAULT_FROM_NAME = Deno.env.get('MAIL_FROM_NAME') || 'Military Disability Nexus'
const DEFAULT_REPLY_TO = Deno.env.get('MAIL_REPLY_TO') || DEFAULT_FROM_EMAIL

interface EmailRequest {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, from, replyTo }: EmailRequest = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    const recipients = sanitizeRecipients(to)
    const defaultFromHeader = sanitizeMailboxHeader(
      `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      FALLBACK_FROM_HEADER,
    )
    const fromHeader = sanitizeMailboxHeader(
      from,
      defaultFromHeader,
    )
    const replyToHeader = sanitizeReplyToAddress(replyTo, DEFAULT_REPLY_TO)
    const safeSubject = sanitizeSubjectLine(subject, 'Military Disability Nexus')

    // Send email via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromHeader,
        to: recipients,
        subject: safeSubject,
        html,
        text: text || stripHtml(html),
        reply_to: replyToHeader,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend API error:', data)
      throw new Error(data.message || 'Failed to send email')
    }

    return jsonResponse(
      {
        success: true,
        id: data.id,
        message: 'Email sent successfully',
      },
    )
  } catch (error) {
    console.error('Email send error:', error)

    return jsonResponse(
      {
        success: false,
        error: error.message || 'Failed to send email',
      },
      { status: 500 },
    )
  }
})

function sanitizeRecipients(to: string | string[]): string[] {
  const values = Array.isArray(to) ? to : [to]
  const recipients = values.flatMap((value) => {
    try {
      return [sanitizeEmailAddress(value)]
    } catch {
      return []
    }
  })

  if (recipients.length === 0) {
    throw new Error('Missing required fields: to, subject, html')
  }

  return recipients
}

/**
 * Strip HTML tags from string for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
