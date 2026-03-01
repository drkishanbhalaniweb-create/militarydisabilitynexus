import { supabase } from './supabase';

export const paymentApi = {
  /**
   * Create a Stripe checkout session
   * @param {Object} data - Checkout session data
   * @returns {Promise<{sessionId: string, url: string}>}
   */
  async createCheckoutSession(data) {
    const { data: result, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: data,
      }
    );

    if (error) throw error;
    return result;
  },

  /**
   * Get payment status for a form submission
   * @param {string} formSubmissionId - Form submission ID
   * @returns {Promise<Object>}
   */
  async getPaymentStatus(formSubmissionId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('form_submission_id', formSubmissionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
    return data;
  },

  /**
   * Get all payments for admin
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async getAllPayments(filters = {}) {
    let query = supabase
      .from('payments')
      .select('*, form_submissions(form_type, contact_id)')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.serviceType) {
      query = query.eq('service_type', filters.serviceType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>}
   */
  async getPaymentById(paymentId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, form_submissions(form_type, contact_id)')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  },
};

/**
 * Service pricing configuration (fallback - actual prices fetched from database)
 */
export const SERVICE_PRICING = {
  claim_readiness_review: {
    name: 'Claim Readiness Review',
    basePrice: 22500, // $225 in cents
    rushFee: 0, // No rush service for this
  },
  aid_attendance: {
    name: 'Aid & Attendance Evaluation',
    basePrice: 200000, // $2,000 in cents
    rushFee: 50000, // $500 in cents
  },
  nexus_letter: {
    name: 'Nexus Letter',
    basePrice: 150000, // $1,500
    rushFee: 50000,
  },
  dbq_completion: {
    name: 'DBQ Completion',
    basePrice: 80000, // $800
    rushFee: 30000,
  },
  medical_opinion: {
    name: 'Medical Opinion Letter',
    basePrice: 120000, // $1,200
    rushFee: 40000,
  },
  cp_exam_prep: {
    name: 'C&P Exam Preparation',
    basePrice: 15000, // $150
    rushFee: 0,
  },
  claim_1151: {
    name: '1151 Claim Support',
    basePrice: 200000, // $2,000
    rushFee: 50000,
  },
};

/**
 * Fetch pricing from database
 * @returns {Promise<Object>} Pricing configuration
 */
export const fetchPricing = async () => {
  try {
    const { data, error } = await supabase
      .from('service_pricing')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    // Convert to SERVICE_PRICING format
    const pricing = {};
    data.forEach(item => {
      pricing[item.service_type] = {
        name: item.service_name,
        basePrice: item.base_price,
        rushFee: item.rush_fee,
      };
    });

    return pricing;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return SERVICE_PRICING; // Fallback to hardcoded pricing
  }
};

/**
 * Calculate total price including rush service
 * @param {string} serviceType - Service type key
 * @param {boolean} isRushService - Whether rush service is selected
 * @param {Object} customPricing - Optional custom pricing object (from database)
 * @returns {number} Total price in cents
 */
export const calculatePrice = (serviceType, isRushService = false, customPricing = null) => {
  const pricing = customPricing || SERVICE_PRICING;
  const service = pricing[serviceType];
  if (!service) return 0;

  return service.basePrice + (isRushService ? service.rushFee : 0);
};

/**
 * Format price in cents to USD string
 * @param {number} cents - Price in cents
 * @returns {string} Formatted price (e.g., "$2,000.00")
 */
export const formatPrice = (cents) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};
