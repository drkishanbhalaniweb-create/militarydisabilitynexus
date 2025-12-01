import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
  try {
    const {
      questionTitle,
      questionSlug,
      questionAuthorEmail,
      questionAuthorName,
      answerAuthor,
      answerContent,
    }: NotificationRequest = await req.json();

    // Validate required fields
    if (!questionAuthorEmail || !questionTitle || !questionSlug) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build the question URL
    const questionUrl = `${SUPABASE_URL.replace('/v1', '')}/community/question/${questionSlug}`;

    // Prepare email content
    const greeting = questionAuthorName && !questionAuthorName.includes('@')
      ? `Hi ${questionAuthorName}`
      : 'Hi';

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
            <h1 style="color: white; margin: 0; font-size: 24px;">New Answer to Your Question!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">${greeting},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${answerAuthor}</strong> just answered your question:
            </p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #B91C3C; margin: 20px 0; border-radius: 5px;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #1e3a5f;">${questionTitle}</h2>
              <p style="color: #666; font-size: 14px; margin: 0; font-style: italic;">
                "${answerContent}${answerContent.length >= 200 ? '...' : ''}"
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${questionUrl}" 
                 style="display: inline-block; background: #B91C3C; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                View Full Answer
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; margin: 0;">
              You're receiving this email because you asked a question on our Community Q&A platform.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Military Disability Nexus - Community Q&A</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
${greeting},

${answerAuthor} just answered your question: "${questionTitle}"

Answer preview:
"${answerContent}${answerContent.length >= 200 ? '...' : ''}"

View the full answer here: ${questionUrl}

---
You're receiving this email because you asked a question on our Community Q&A platform.
    `;

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Community Q&A <noreply@militarydisabilitynexus.com>',
        to: [questionAuthorEmail],
        subject: `New answer to your question: "${questionTitle}"`,
        html: emailHtml,
        text: emailText,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-answer-posted function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
