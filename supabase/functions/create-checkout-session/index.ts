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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  formSubmissionId: string;
  serviceType: string;
  amount: number;
  isRushService: boolean;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

const getServiceName = (serviceType: string): string => {
  const serviceNames: Record<string, string> = {
    aid_attendance: 'Aid & Attendance Evaluation',
    nexus_letter: 'Nexus Letter',
    dbq_completion: 'DBQ Completion',
    medical_opinion: 'Medical Opinion Letter',
    cp_exam_prep: 'C&P Exam Preparation',
    claim_1151: '1151 Claim Support',
  };
  return serviceNames[serviceType] || 'VA Disability Service';
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      formSubmissionId,
      serviceType,
      amount,
      isRushService,
      customerEmail,
      successUrl,
      cancelUrl,
    }: CheckoutRequest = await req.json();

    // Validate input
    if (!formSubmissionId || !serviceType || !amount || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: getServiceName(serviceType),
              description: isRushService
                ? 'Includes rush service (36-48 hours)'
                : 'Standard service (7-10 business days)',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      currency_options: {
        usd: {
          unit_amount: amount,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        formSubmissionId,
        serviceType,
        isRushService: isRushService.toString(),
      },
    });

    // Store pending payment in database
    const { error: dbError } = await supabase.from('payments').insert({
      form_submission_id: formSubmissionId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      amount,
      currency: 'usd',
      status: 'pending',
      service_type: serviceType,
      is_rush_service: isRushService,
      receipt_email: customerEmail,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - webhook will handle it
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
