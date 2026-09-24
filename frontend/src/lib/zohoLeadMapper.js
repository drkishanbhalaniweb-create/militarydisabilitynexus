/**
 * Zoho CRM Lead Mapper Module
 *
 * Transforms incoming form submissions (Contact Us, Intake Forms, Lead Magnets)
 * into standardized Zoho CRM Lead record payloads with marketing journey attribution,
 * defensive name parsing, and Zoho CRM field compatibility.
 */

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;
const MAX_COMPANY_LENGTH = 200;
const MAX_LEAD_SOURCE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 32000;

/**
 * Strips non-printable ASCII control characters except \t, \n, \r.
 *
 * @param {string} value
 * @returns {string}
 */
function stripControlChars(value) {
  if (typeof value !== 'string') return '';
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join('');
}

/**
 * Sanitizes and bounds inline text.
 *
 * @param {any} value
 * @param {number} [maxLength=120]
 * @returns {string}
 */
function sanitizeString(value, maxLength = 120) {
  if (value === null || value === undefined) return '';
  const str = stripControlChars(String(value)).trim();
  return str.slice(0, maxLength);
}

/**
 * Splits a full name string into First_Name and Last_Name.
 * Zoho CRM strictly requires a non-empty Last_Name.
 *
 * - 0 words / empty / null: { firstName: '', lastName: 'Inquirer' }
 * - 1 word: { firstName: '', lastName: word } (e.g. 'Alex' -> { firstName: '', lastName: 'Alex' })
 * - 2+ words: { firstName: 'John Paul', lastName: 'Jones' }
 *
 * @param {string|null|undefined} fullName
 * @returns {{ firstName: string, lastName: string }}
 */
export function splitFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: 'Inquirer' };
  }

  const cleaned = stripControlChars(fullName).trim();
  if (!cleaned) {
    return { firstName: '', lastName: 'Inquirer' };
  }

  // Split on multiple whitespace characters
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: '', lastName: 'Inquirer' };
  }

  if (parts.length === 1) {
    return {
      firstName: '',
      lastName: sanitizeString(parts[0], MAX_NAME_LENGTH) || 'Inquirer',
    };
  }

  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(' ');

  return {
    firstName: sanitizeString(firstName, MAX_NAME_LENGTH),
    lastName: sanitizeString(lastName, MAX_NAME_LENGTH) || 'Inquirer',
  };
}

/**
 * Derives a standard Zoho CRM Lead_Source from attribution data.
 *
 * Checks last_touch_source first, then first_touch_source.
 * Intelligently recognizes major search/ad/social networks and medium.
 *
 * @param {object} [attribution={}]
 * @param {string} [defaultSource='Website']
 * @returns {string}
 */
export function deriveLeadSource(attribution = {}, defaultSource = 'Website') {
  if (!attribution || typeof attribution !== 'object') {
    return sanitizeString(defaultSource, MAX_LEAD_SOURCE_LENGTH) || 'Website';
  }

  const rawSource = attribution.last_touch_source || attribution.first_touch_source || '';
  const rawMedium = attribution.last_touch_medium || attribution.first_touch_medium || '';

  const source = String(rawSource).trim().toLowerCase();
  const medium = String(rawMedium).trim().toLowerCase();

  const isPaid =
    medium === 'cpc' ||
    medium === 'paid' ||
    medium === 'ppc' ||
    medium.includes('ad') ||
    medium.includes('sponsor');

  if (source.includes('google')) {
    return isPaid ? 'Google Ads' : 'Google / Organic';
  }

  if (source.includes('reddit')) {
    return isPaid ? 'Reddit Ads' : 'Reddit';
  }

  if (source.includes('facebook') || source.includes('meta') || source.includes('fb')) {
    return isPaid ? 'Facebook Ads' : 'Facebook';
  }

  if (source.includes('bing')) {
    return isPaid ? 'Bing Ads' : 'Bing / Organic';
  }

  if (source.includes('youtube')) {
    return isPaid ? 'YouTube Ads' : 'YouTube';
  }

  if (source.includes('linkedin')) {
    return isPaid ? 'LinkedIn Ads' : 'LinkedIn';
  }

  if (source.includes('twitter') || source === 'x' || source.includes('t.co')) {
    return isPaid ? 'Twitter Ads' : 'Twitter / X';
  }

  if (source.includes('tiktok')) {
    return isPaid ? 'TikTok Ads' : 'TikTok';
  }

  if (source.includes('instagram')) {
    return isPaid ? 'Instagram Ads' : 'Instagram';
  }

  // If a specific, meaningful source exists (e.g. partner, email, referral)
  if (source && source !== 'direct' && source !== 'none' && source !== 'unknown') {
    // Capitalize first character
    const formatted = source.charAt(0).toUpperCase() + source.slice(1);
    return sanitizeString(isPaid ? `${formatted} (Paid)` : formatted, MAX_LEAD_SOURCE_LENGTH);
  }

  return sanitizeString(defaultSource, MAX_LEAD_SOURCE_LENGTH) || 'Website';
}

/**
 * Formats attribution tracking metadata into a multi-line structured text section.
 *
 * @param {object} [attribution={}]
 * @param {object} [meta={}]
 * @returns {string}
 */
export function formatAttributionSummary(attribution = {}, meta = {}) {
  const safeAttr = attribution && typeof attribution === 'object' ? attribution : {};
  const safeMeta = meta && typeof meta === 'object' ? meta : {};

  const source = safeAttr.last_touch_source || safeAttr.first_touch_source || 'direct';
  const medium = safeAttr.last_touch_medium || safeAttr.first_touch_medium || 'none';
  const campaign = safeAttr.last_touch_campaign || safeAttr.first_touch_campaign || 'N/A';
  const landingPage = safeAttr.last_touch_landing_page || safeAttr.first_touch_landing_page || 'N/A';
  const referrerCategory = safeAttr.referrer_category || 'direct';
  const deviceClass = safeAttr.device_class || 'N/A';
  const journeyId = safeAttr.anonymous_journey_id || safeAttr.journey_id || 'N/A';

  let submittedAt = 'N/A';
  if (safeMeta.submittedAt) {
    try {
      submittedAt = new Date(safeMeta.submittedAt).toISOString();
    } catch {
      submittedAt = String(safeMeta.submittedAt);
    }
  } else if (safeAttr.last_touch_at || safeAttr.first_touch_at) {
    submittedAt = safeAttr.last_touch_at || safeAttr.first_touch_at;
  } else {
    submittedAt = new Date().toISOString();
  }

  return [
    '--- MARKETING & ATTRIBUTION ---',
    `Source / Medium: ${source} / ${medium}`,
    `Campaign: ${campaign}`,
    `Landing Page: ${landingPage}`,
    `Referrer Category: ${referrerCategory}`,
    `Device: ${deviceClass}`,
    `Journey ID: ${journeyId}`,
    `Submitted At: ${submittedAt}`,
  ].join('\n');
}

/**
 * Normalizes email address.
 *
 * @param {any} email
 * @returns {string}
 */
function cleanEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return stripControlChars(email).trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH);
}

/**
 * Normalizes phone number.
 *
 * @param {any} phone
 * @returns {string}
 */
function cleanPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return stripControlChars(phone).trim().slice(0, MAX_PHONE_LENGTH);
}

/**
 * Truncates and sanitizes a multi-line description block.
 *
 * @param {string} text
 * @returns {string}
 */
function clampDescription(text) {
  const cleaned = stripControlChars(text).trim();
  return cleaned.slice(0, MAX_DESCRIPTION_LENGTH);
}

/**
 * Maps Contact Us submissions into a Zoho CRM Lead record.
 *
 * @param {object} contactData - Data from Contact Us form (name, email, phone, subject, serviceInterest/serviceTypes, message)
 * @param {object} [attribution={}] - Marketing attribution payload
 * @param {object} [meta={}] - Submission metadata
 * @returns {object} Zoho CRM Lead record
 */
export function mapContactToZohoLead(contactData = {}, attribution = {}, meta = {}) {
  const { firstName, lastName } = splitFullName(contactData.name || contactData.fullName);

  const email = cleanEmail(contactData.email);
  const phone = cleanPhone(contactData.phone);
  const company = sanitizeString(contactData.company, MAX_COMPANY_LENGTH) || 'Veteran (Self)';
  const leadSource = deriveLeadSource(attribution, 'Website - Contact Form');

  const subject = sanitizeString(contactData.subject, 200) || 'General Inquiry';
  const serviceInterest = sanitizeString(
    contactData.serviceInterest ||
      contactData.service ||
      (Array.isArray(contactData.serviceTypes) ? contactData.serviceTypes.join(', ') : ''),
    200,
  ) || 'Not specified';
  const message = stripControlChars(String(contactData.message || '')).trim() || 'No message provided.';

  const descriptionLines = [
    '--- CONTACT FORM INQUIRY ---',
    `Subject: ${subject}`,
    `Service Interest: ${serviceInterest}`,
    '',
    'Message:',
    message,
    '',
    formatAttributionSummary(attribution, meta),
  ];

  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: email,
    Phone: phone,
    Company: company,
    Lead_Source: leadSource,
    Description: clampDescription(descriptionLines.join('\n')),
  };
}

/**
 * Maps Intake / Get Started form submissions into a Zoho CRM Lead record.
 *
 * @param {object} formData - Data from Intake Form (fullName, email, phone, formType, formData: { additionalDetails, rushService, selectedPricingTier, ... })
 * @param {object} [attribution={}] - Marketing attribution payload
 * @param {object} [meta={}] - Submission metadata
 * @returns {object} Zoho CRM Lead record
 */
export function mapFormSubmissionToZohoLead(formData = {}, attribution = {}, meta = {}) {
  const fullName = formData.fullName || formData.full_name || formData.name;
  const { firstName, lastName } = splitFullName(fullName);

  const email = cleanEmail(formData.email);
  const phone = cleanPhone(formData.phone);
  const company = sanitizeString(formData.company, MAX_COMPANY_LENGTH) || 'Veteran (Self)';
  const leadSource = deriveLeadSource(attribution, 'Website - Intake Form');

  const formType = sanitizeString(formData.formType || formData.form_type, 100) || 'Intake Form';
  const nested = formData.formData && typeof formData.formData === 'object' ? formData.formData : {};

  const pricingTier = sanitizeString(nested.selectedPricingTier || nested.pricingTier || nested.tier, 100);
  const isRush = Boolean(nested.rushService || nested.rush || nested.isRush);
  const additionalDetails = stripControlChars(
    String(nested.additionalDetails || nested.details || nested.message || ''),
  ).trim();

  const caseLines = [
    '--- INTAKE FORM SUBMISSION ---',
    `Form Type: ${formType}`,
    pricingTier ? `Selected Pricing Tier: ${pricingTier}` : null,
    `Rush Expedited: ${isRush ? 'Yes (Rush Service Requested)' : 'Standard Delivery'}`,
  ].filter(Boolean);

  // Add additional selected services if provided
  if (Array.isArray(nested.selectedServices) && nested.selectedServices.length > 0) {
    caseLines.push(`Selected Services: ${nested.selectedServices.join(', ')}`);
  }

  // Add conditions/branch if provided
  if (nested.conditions) {
    caseLines.push(`Conditions: ${sanitizeString(nested.conditions, 500)}`);
  }
  if (nested.serviceBranch) {
    caseLines.push(`Military Branch: ${sanitizeString(nested.serviceBranch, 100)}`);
  }

  if (additionalDetails) {
    caseLines.push('', 'Case Notes / Details:', additionalDetails);
  }

  caseLines.push('', formatAttributionSummary(attribution, meta));

  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: email,
    Phone: phone,
    Company: company,
    Lead_Source: leadSource,
    Description: clampDescription(caseLines.join('\n')),
  };
}

/**
 * Maps Lead Magnet downloads into a Zoho CRM Lead record.
 *
 * @param {object} magnetData - Data from Lead Magnet capture (fullName/name, email, phone, title/magnetTitle, pdfPath/magnetSlug, sourcePath)
 * @param {object} [attribution={}] - Marketing attribution payload
 * @param {object} [meta={}] - Submission metadata
 * @returns {object} Zoho CRM Lead record
 */
export function mapLeadMagnetToZohoLead(magnetData = {}, attribution = {}, meta = {}) {
  const rawName = magnetData.fullName || magnetData.name || '';
  const { firstName, lastName } = splitFullName(rawName);

  const email = cleanEmail(magnetData.email);
  const phone = cleanPhone(magnetData.phone);
  const company = sanitizeString(magnetData.company, MAX_COMPANY_LENGTH) || 'Veteran (Self)';
  const leadSource = deriveLeadSource(attribution, 'Website - Lead Magnet');

  const guideTitle = sanitizeString(
    magnetData.magnetTitle || magnetData.title || magnetData.lead_magnet_title,
    200,
  ) || 'Free PDF Template';
  const resourcePath = sanitizeString(
    magnetData.pdfPath || magnetData.pdf_storage_path || magnetData.magnetSlug,
    300,
  ) || 'N/A';
  const sourcePath = sanitizeString(
    magnetData.sourcePath || magnetData.source_path,
    300,
  ) || 'N/A';

  const magnetLines = [
    '--- LEAD MAGNET DOWNLOAD ---',
    `Guide Title: ${guideTitle}`,
    `Resource: ${resourcePath}`,
    `Source Page: ${sourcePath}`,
    '',
    formatAttributionSummary(attribution, meta),
  ];

  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: email,
    Phone: phone,
    Company: company,
    Lead_Source: leadSource,
    Description: clampDescription(magnetLines.join('\n')),
  };
}

const zohoLeadMapper = {
  splitFullName,
  deriveLeadSource,
  formatAttributionSummary,
  mapContactToZohoLead,
  mapFormSubmissionToZohoLead,
  mapLeadMagnetToZohoLead,
};

export default zohoLeadMapper;
