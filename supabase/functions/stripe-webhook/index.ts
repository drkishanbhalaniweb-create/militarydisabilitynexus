import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'stripe-signature, content-type',
      },
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  let body: string;
  try {
    body = await req.text();
  } catch (err) {
    console.error('Failed to read request body:', err);
    return new Response('Invalid request body', { status: 400 });
  }

  // Verify webhook secret is configured
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 for successfully received webhooks
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Still return 200 to acknowledge receipt, but log the error
    // This prevents Stripe from retrying on application errors
    return new Response(
      JSON.stringify({ received: true, error: error.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    const { formSubmissionId } = session.metadata || {};

    if (!formSubmissionId) {
      console.error('No formSubmissionId in session metadata');
      return;
    }

    console.log(`Processing checkout complete for form submission: ${formSubmissionId}`);

    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'processing',
        stripe_customer_id: session.customer as string,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_checkout_session_id', session.id);

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
    } else {
      console.log('Payment record updated successfully');
    }

    // Update form submission
    const { error: formError } = await supabase
      .from('form_submissions')
      .update({
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', formSubmissionId);

    if (formError) {
      console.error('Error updating form submission:', formError);
    } else {
      console.log('Form submission updated successfully');
    }
  } catch (error) {
    console.error('Exception in handleCheckoutComplete:', error);
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Processing payment success for payment intent: ${paymentIntent.id}`);

    // Get payment method details
    let paymentMethod: Stripe.PaymentMethod | null = null;
    if (paymentIntent.payment_method) {
      try {
        paymentMethod = await stripe.paymentMethods.retrieve(
          paymentIntent.payment_method as string
        );
      } catch (err) {
        console.error('Error retrieving payment method:', err);
      }
    }

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        payment_method_type: paymentMethod?.type || null,
        card_brand: paymentMethod?.card?.brand || null,
        card_last4: paymentMethod?.card?.last4 || null,
        receipt_url: paymentIntent.charges.data[0]?.receipt_url || null,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select()
      .single();

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return;
    }

    console.log('Payment record updated successfully');

    // Update form submission
    if (payment) {
      const { error: formError } = await supabase
        .from('form_submissions')
        .update({
          payment_status: 'paid',
          payment_amount: payment.amount,
          payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.form_submission_id);

      if (formError) {
        console.error('Error updating form submission:', formError);
      } else {
        console.log('Form submission updated successfully');
      }
    }
  } catch (error) {
    console.error('Exception in handlePaymentSuccess:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Processing payment failure for payment intent: ${paymentIntent.id}`);

    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating payment:', error);
    } else {
      console.log('Payment failure recorded successfully');
    }
  } catch (error) {
    console.error('Exception in handlePaymentFailed:', error);
  }
}
