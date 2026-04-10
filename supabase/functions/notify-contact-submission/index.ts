import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  formatInlineHtml,
  formatMultilineHtml,
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

    await sendUserConfirmation(supabase, record)
    await sendAdminNotification(supabase, record)

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
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

async function sendUserConfirmation(supabase: any, contact: any) {
  try {
    const html = generateUserConfirmationEmail(contact)

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: contact.email,
        subject: 'Thank you for contacting Military Disability Nexus',
        html,
      },
    })

    if (error) throw error

    await supabase.from('email_logs').insert({
      contact_id: contact.id,
      recipient_email: contact.email,
      recipient_name: contact.name,
      email_type: 'user_confirmation',
      subject: 'Thank you for contacting Military Disability Nexus',
      status: 'sent',
      email_service_id: data?.id,
      sent_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error sending user confirmation:', error)

    await supabase.from('email_logs').insert({
      contact_id: contact.id,
      recipient_email: contact.email,
      recipient_name: contact.name,
      email_type: 'user_confirmation',
      subject: 'Thank you for contacting Military Disability Nexus',
      status: 'failed',
      error_message: error.message,
      failed_at: new Date().toISOString(),
    })
  }
}

async function sendAdminNotification(supabase: any, contact: any) {
  try {
    const { data: admins, error: adminError } = await supabase
      .from('admin_email_settings')
      .select('admin_email')
      .eq('notify_new_contact', true)
      .eq('is_active', true)

    if (adminError) throw adminError
    if (!admins || admins.length === 0) {
      console.log('No active admins to notify')
      return
    }

    const html = generateAdminNotificationEmail(contact)
    const subject = sanitizeSubjectLine(
      `New Contact Form Submission from ${sanitizeInlineText(contact.name, 120) || 'Website visitor'}`,
      'New Contact Form Submission',
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
          contact_id: contact.id,
          recipient_email: admin.admin_email,
          email_type: 'admin_notification',
          subject,
          status: 'sent',
          email_service_id: data?.id,
          sent_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error(`Error sending to admin ${admin.admin_email}:`, error)

        await supabase.from('email_logs').insert({
          contact_id: contact.id,
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

function generateUserConfirmationEmail(contact: any): string {
  const referenceNumber = contact.id.substring(0, 8).toUpperCase()
  const safeName = formatInlineHtml(contact.name, 'there', 120)
  const safeSubject = formatInlineHtml(contact.subject || 'General Inquiry', 'General Inquiry', 200)
  const submittedDate = new Date(contact.created_at).toLocaleString('en-US', {
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
      <title>Thank You</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Military Disability Nexus</h1>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-top: 0;">Thank You for Contacting Us</h2>

        <p>Dear ${safeName},</p>

        <p>We have received your inquiry and appreciate you reaching out to Military Disability Nexus. Our team is dedicated to helping veterans secure the benefits they deserve.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #667eea; font-size: 18px;">Your Submission Details</h3>
          <p style="margin: 8px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
          <p style="margin: 8px 0;"><strong>Subject:</strong> ${safeSubject}</p>
          <p style="margin: 8px 0;"><strong>Submitted:</strong> ${submittedDate}</p>
        </div>

        <h3 style="color: #1f2937; font-size: 18px;">What Happens Next?</h3>
        <ul style="padding-left: 20px; line-height: 1.8;">
          <li>Our team will review your inquiry within 24-48 hours</li>
          <li>A specialist will reach out to discuss your needs</li>
          <li>We'll provide guidance on the best path forward for your claim</li>
        </ul>

        <p style="margin-top: 30px;">If you have any urgent questions, please don't hesitate to contact us at <a href="mailto:contact@militarydisabilitynexus.com" style="color: #667eea; text-decoration: none;">contact@militarydisabilitynexus.com</a></p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 5px 0;"><strong>Military Disability Nexus</strong></p>
          <p style="margin: 5px 0;">Professional Medical Documentation for VA Claims</p>
          <p style="margin: 15px 0;">
            <a href="https://militarydisabilitynexus.com" style="color: #667eea; text-decoration: none; margin: 0 10px;">Website</a> |
            <a href="mailto:contact@militarydisabilitynexus.com" style="color: #667eea; text-decoration: none; margin: 0 10px;">Email</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateAdminNotificationEmail(contact: any): string {
  const adminUrl = `${frontendUrl}/admin/contacts`
  const referenceNumber = contact.id.substring(0, 8).toUpperCase()
  const safeName = formatInlineHtml(contact.name, 'Not provided', 120)
  const safeEmail = formatSafeEmail(contact.email)
  const safePhone = sanitizeInlineText(contact.phone, 32)
  const safeSubject = formatInlineHtml(contact.subject || 'General Inquiry', 'General Inquiry', 200)
  const safeServiceInterest = sanitizeInlineText(contact.service_interest, 255)
  const safeMessageHtml = formatMultilineHtml(contact.message || 'No message provided', 'No message provided', 5000)
  const submittedDate = new Date(contact.created_at).toLocaleString('en-US', {
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
      <title>New Contact Submission</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: #1f2937; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 22px;">New Contact Form Submission</h2>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Contact Information</h3>
          <p style="margin: 8px 0;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #667eea;">${safeEmail}</a></p>
          ${safePhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${formatInlineHtml(safePhone, '', 32)}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Subject:</strong> ${safeSubject}</p>
          ${safeServiceInterest ? `<p style="margin: 8px 0;"><strong>Service Interest:</strong> ${formatInlineHtml(safeServiceInterest, '', 255)}</p>` : ''}
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Message</h3>
          <p style="white-space: pre-wrap; margin: 0;">${safeMessageHtml}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${adminUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
        </div>

        <p style="margin-top: 20px; color: #6b7280; font-size: 14px; text-align: center;">
          Submitted: ${submittedDate}<br>
          Reference: ${referenceNumber}
        </p>
      </div>
    </body>
    </html>
  `
}
