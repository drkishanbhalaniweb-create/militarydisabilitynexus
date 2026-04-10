import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  formatInlineHtml,
  formatSafeEmail,
  sanitizeSubjectLine,
} from '../_shared/email-safety.ts'
import { sanitizeInlineText } from '../_shared/submission-utils.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'

serve(async (req) => {
  try {
    const { record } = await req.json()

    if (!record) {
      throw new Error('No record provided')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    await sendAdminNotification(supabase, record)

    return new Response(
      JSON.stringify({ success: true, message: 'Admin notifications sent' }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
})

async function sendAdminNotification(supabase: any, diagnostic: any) {
  try {
    const { data: admins, error: adminError } = await supabase
      .from('admin_email_settings')
      .select('admin_email')
      .eq('notify_new_diagnostic', true)
      .eq('is_active', true)

    if (adminError) throw adminError
    if (!admins || admins.length === 0) {
      console.log('No active admins to notify for diagnostic')
      return
    }

    const html = generateAdminNotificationEmail(diagnostic)
    const subject = sanitizeSubjectLine(
      `New Lead: VA Claim Diagnostic Completion - ${sanitizeInlineText(diagnostic.first_name, 120) || 'Anonymous'}`,
      'New Lead: VA Claim Diagnostic Completion',
    )

    for (const admin of admins) {
      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: admin.admin_email,
            subject,
            html,
          },
        })

        if (error) throw error

        await supabase.from('email_logs').insert({
          recipient_email: admin.admin_email,
          email_type: 'admin_notification',
          subject,
          status: 'sent',
          email_service_id: data?.id,
          sent_at: new Date().toISOString(),
          template_variables: {
            diagnostic_id: diagnostic.id,
            first_name: diagnostic.first_name,
            email: diagnostic.email,
            score: diagnostic.total_score,
          },
        })
      } catch (error) {
        console.error(`Error sending to admin ${admin.admin_email}:`, error)

        await supabase.from('email_logs').insert({
          recipient_email: admin.admin_email,
          email_type: 'admin_notification',
          subject,
          status: 'failed',
          error_message: error.message,
          failed_at: new Date().toISOString(),
        })
      }
    }
  } catch (error) {
    console.error('Error sending admin notifications:', error)
  }
}

function generateAdminNotificationEmail(diagnostic: any): string {
  const adminUrl = `${frontendUrl}/admin/analytics`
  const safeName = formatInlineHtml(diagnostic.first_name, 'Not provided', 120)
  const safeEmail = formatSafeEmail(diagnostic.email)
  const safeRecommendation = formatInlineHtml(
    sanitizeInlineText(diagnostic.recommendation, 120).replace(/_/g, ' '),
    'Not provided',
    120,
  )
  const safeSessionId = formatInlineHtml(diagnostic.session_id, 'Unavailable', 120)
  const submittedDate = new Date(diagnostic.completed_at || diagnostic.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Diagnostic Lead</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: #10b981; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 22px;">New Diagnostic Lead Captured</h2>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Lead Contact Information</h3>
          <p style="margin: 8px 0;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #667eea;">${safeEmail}</a></p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Diagnostic Results</h3>
          <p style="margin: 8px 0;"><strong>Readiness Score:</strong> ${diagnostic.total_score}/10</p>
          <p style="margin: 8px 0;"><strong>Recommendation:</strong> ${safeRecommendation}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${adminUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Analytics</a>
        </div>

        <p style="margin-top: 20px; color: #6b7280; font-size: 14px; text-align: center;">
          Completed: ${submittedDate}<br>
          Session ID: ${safeSessionId}
        </p>
      </div>
    </body>
    </html>
  `
}
