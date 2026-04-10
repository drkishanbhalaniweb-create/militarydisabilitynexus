export const SUBMISSION_MIN_AGE_MS = 3000;

const MULTIPLE_SPACES_REGEX = /[^\S\r\n]+/g;
const MULTIPLE_NEWLINES_REGEX = /\n{3,}/g;

const CONTACT_SERVICE_TYPES = new Set([
  'nexus_letter',
  'dbq',
  '1151_claim',
  'aid_attendance',
  'unsure',
]);

const ALLOWED_FORM_TYPES = new Set([
  'quick_intake',
  'aid_attendance',
  'unsure',
  'general',
  'claim_readiness_review',
  'nexus_letter',
  'dbq',
  '1151_claim',
]);

const MULTILINE_FIELD_HINTS = [
  'summary',
  'message',
  'details',
  'info',
  'history',
  'description',
  'diagnosis',
  'diagnoses',
  'medication',
  'medications',
  'caregiver',
];

function toStringValue(value) {
  return typeof value === 'string' ? value : '';
}

function stripControlChars(value) {
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join('');
}

export function sanitizeInlineText(value, maxLength = 120) {
  const sanitized = toStringValue(value)
    .replace(/\r\n?/g, '\n')
    .trim();

  const normalized = stripControlChars(sanitized)
    .replace(/\r?\n+/g, ' ')
    .replace(MULTIPLE_SPACES_REGEX, ' ')
    .trim();

  return normalized.slice(0, maxLength).trim();
}

export function sanitizeMultilineText(value, maxLength = 5000) {
  const sanitized = toStringValue(value)
    .replace(/\r\n?/g, '\n')
    .trim();

  const normalized = stripControlChars(sanitized)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(MULTIPLE_SPACES_REGEX, ' ')
    .replace(MULTIPLE_NEWLINES_REGEX, '\n\n')
    .trim();

  return normalized.slice(0, maxLength).trim();
}

export function sanitizeEmail(value) {
  const sanitized = sanitizeInlineText(value, 254).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(sanitized)) {
    throw new Error('Please provide a valid email address.');
  }

  return sanitized;
}

export function sanitizePhone(value) {
  const raw = toStringValue(value).replace(/[^\d+().\-\s]/g, '').trim();

  if (!raw) {
    return null;
  }

  const normalized = raw.replace(/\s+/g, ' ').slice(0, 32).trim();

  if (normalized.length < 7) {
    throw new Error('Please provide a valid phone number.');
  }

  return normalized;
}

function sanitizeAllowedStringArray(value, allowedValues) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => sanitizeInlineText(item, 50))
    .filter((item) => allowedValues.has(item));
}

function isLikelyMultilineField(keyPath) {
  const normalized = keyPath.toLowerCase();
  return MULTILINE_FIELD_HINTS.some((hint) => normalized.includes(hint));
}

function sanitizeJsonValue(value, keyPath = '') {
  if (value === null) {
    return null;
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return isLikelyMultilineField(keyPath)
      ? sanitizeMultilineText(value, 5000)
      : sanitizeInlineText(value, 500);
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => sanitizeJsonValue(item, `${keyPath}[${index}]`))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, childValue]) => {
          const sanitizedChild = sanitizeJsonValue(childValue, keyPath ? `${keyPath}.${key}` : key);
          return sanitizedChild === undefined ? null : [key, sanitizedChild];
        })
        .filter(Boolean),
    );
  }

  return undefined;
}

export function sanitizeFormDataObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return sanitizeJsonValue(value) || {};
}

function getFormTypeLabel(type) {
  const labels = {
    quick_intake: 'Quick Intake',
    aid_attendance: 'Aid & Attendance',
    unsure: 'General Inquiry',
    general: 'General Inquiry',
    claim_readiness_review: 'Claim Readiness Review',
    nexus_letter: 'Nexus Letter',
    dbq: 'DBQ',
    '1151_claim': '1151 Claim',
  };

  return labels[type] || sanitizeInlineText(type, 50) || 'Form Submission';
}

export function createSubmissionMeta({
  honeypot = '',
  startedAt = Date.now(),
  submittedAt = Date.now(),
} = {}) {
  return {
    honeypot: sanitizeInlineText(honeypot, 255),
    startedAt: Number(startedAt) || Date.now(),
    submittedAt: Number(submittedAt) || Date.now(),
  };
}

export function validateSubmissionMeta(meta) {
  if (!meta) {
    return;
  }

  if (meta.honeypot) {
    throw new Error('Unable to process this submission.');
  }

  if (
    Number.isFinite(meta.startedAt) &&
    Number.isFinite(meta.submittedAt) &&
    meta.submittedAt - meta.startedAt < SUBMISSION_MIN_AGE_MS
  ) {
    throw new Error('Please wait a few seconds before submitting.');
  }
}

export function prepareContactSubmission(contactData) {
  const name = sanitizeInlineText(contactData.name, 120);
  const email = sanitizeEmail(contactData.email);
  const phone = sanitizePhone(contactData.phone);
  const message = sanitizeMultilineText(contactData.message, 5000);
  const serviceTypes = sanitizeAllowedStringArray(contactData.serviceTypes, CONTACT_SERVICE_TYPES);
  const subject = serviceTypes.length > 0
    ? serviceTypes.map((type) => getFormTypeLabel(type)).join(', ')
    : sanitizeInlineText(contactData.subject, 200) || 'General Inquiry';
  const serviceInterest = serviceTypes.length > 0
    ? serviceTypes.join(', ')
    : sanitizeInlineText(contactData.serviceInterest || contactData.service, 255) || null;

  if (name.length < 2) {
    throw new Error('Please provide your full name.');
  }

  if (message.length < 10) {
    throw new Error('Please add a little more detail to your message.');
  }

  return {
    name,
    email,
    phone,
    subject,
    message,
    serviceTypes,
    serviceInterest,
  };
}

export function prepareFormSubmission(formData) {
  const formType = sanitizeInlineText(formData.formType || formData.form_type, 50);
  const fullName = sanitizeInlineText(formData.fullName || formData.full_name, 120);
  const email = sanitizeEmail(formData.email);
  const phone = sanitizePhone(formData.phone);
  const sanitizedFormData = sanitizeFormDataObject(formData.formData || formData.form_data);

  if (!ALLOWED_FORM_TYPES.has(formType)) {
    throw new Error('Please choose a valid service type.');
  }

  if (fullName.length < 2) {
    throw new Error('Please provide your full name.');
  }

  if (Array.isArray(sanitizedFormData.selectedServices)) {
    sanitizedFormData.selectedServices = sanitizeAllowedStringArray(
      sanitizedFormData.selectedServices,
      CONTACT_SERVICE_TYPES,
    );
  }

  return {
    formType,
    fullName,
    email,
    phone,
    formData: sanitizedFormData,
    requiresUpload: Boolean(formData.requiresUpload || formData.requires_upload),
  };
}
