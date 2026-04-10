import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import {
  formatInlineHtml,
  formatMultilineHtml,
  sanitizeMailboxHeader,
  sanitizeReplyToAddress,
  sanitizeSubjectLine,
} from '../_shared/email-safety.ts';
import {
  sanitizeEmailAddress,
  sanitizeInlineText,
  sanitizeMultilineText,
} from '../_shared/submission-utils.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';
const fallbackFromHeader = 'Military Disability Nexus <contact@militarydisabilitynexus.com>';
const defaultFromEmail = Deno.env.get('MAIL_FROM_EMAIL') || 'contact@militarydisabilitynexus.com';
const defaultReplyTo = Deno.env.get('MAIL_REPLY_TO') || defaultFromEmail;

interface NotificationRequest {
  questionId: string;
  questionTitle: string;
  questionSlug: string;
  questionAuthorEmail: string;
  questionAuthorName?: string;
  answerAuthor: string;
  answerContent: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: NotificationRequest = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const recipientEmail = sanitizeEmailAddress(payload.questionAuthorEmail);
    const safeQuestionTitle =
      sanitizeInlineText(payload.questionTitle, 180) || 'your question';
    const safeQuestionSlug = encodeURIComponent(
      sanitizeInlineText(payload.questionSlug, 200) || '',
    );
    const safeQuestionAuthorName = sanitizeInlineText(payload.questionAuthorName, 120);
    const safeAnswerAuthor =
      sanitizeInlineText(payload.answerAuthor, 120) || 'Someone from our community';
    const normalizedAnswer = sanitizeMultilineText(payload.answerContent, 1200);
    const answerPreview =
      normalizedAnswer.length > 240
        ? `${normalizedAnswer.slice(0, 237).trimEnd()}...`
        : normalizedAnswer || 'A new answer is waiting for you.';

    if (!safeQuestionSlug) {
      return jsonResponse({ error: 'Missing required fields' }, { status: 400 });
    }

    const questionUrl = `${frontendUrl}/community/question/${safeQuestionSlug}`;
    const greeting =
      safeQuestionAuthorName && !safeQuestionAuthorName.includes('@')
        ? `Hi ${safeQuestionAuthorName},`
        : 'Hi,';
    const safeSubject = sanitizeSubjectLine(
      `New answer to your question: ${safeQuestionTitle}`,
      'New answer to your question',
    );
    const defaultFromHeader = sanitizeMailboxHeader(
      `Military Disability Nexus <${defaultFromEmail}>`,
      fallbackFromHeader,
    );
    const communityFromHeader = sanitizeMailboxHeader(
      `Community Q&A <${defaultFromEmail}>`,
      defaultFromHeader,
    );
    const replyToHeader = sanitizeReplyToAddress(defaultReplyTo, defaultFromEmail);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Answer to Your Question</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Answer to Your Question</h1>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">${formatInlineHtml(greeting, 'Hi,', 140)}</p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${formatInlineHtml(safeAnswerAuthor, 'Community member', 120)}</strong> just answered your question:
            </p>

            <div style="background: white; padding: 20px; border-left: 4px solid #B91C3C; margin: 20px 0; border-radius: 5px;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #1e3a5f;">${formatInlineHtml(safeQuestionTitle, 'Your question', 180)}</h2>
              <p style="color: #666; font-size: 14px; margin: 0;">${formatMultilineHtml(answerPreview, 'A new answer is waiting for you.', 300)}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${questionUrl}"
                 style="display: inline-block; background: #B91C3C; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                View Full Answer
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 14px; color: #666; margin: 0;">
              You're receiving this email because you asked a question on our Community Q&amp;A platform.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Military Disability Nexus - Community Q&amp;A</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `${greeting}

${safeAnswerAuthor} just answered your question: ${safeQuestionTitle}

Answer preview:
${answerPreview}

View the full answer here: ${questionUrl}

---
You're receiving this email because you asked a question on our Community Q&A platform.`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: communityFromHeader,
        to: [recipientEmail],
        subject: safeSubject,
        html: emailHtml,
        text: emailText,
        reply_to: replyToHeader,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return jsonResponse(
        { error: 'Failed to send email', details: data },
        { status: 500 },
      );
    }

    return jsonResponse({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Error in notify-answer-posted function:', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 },
    );
  }
});
