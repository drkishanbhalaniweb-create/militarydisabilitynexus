const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const MULTIPLE_SPACES_REGEX = /[^\S\r\n]+/g;
const MULTIPLE_NEWLINES_REGEX = /\n{3,}/g;

export const SUBMISSION_MIN_AGE_MS = 3000;

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

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function sanitizeInlineText(value: unknown, maxLength = 120): string {
  const sanitized = toStringValue(value)
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(/\r?\n+/g, ' ')
    .replace(MULTIPLE_SPACES_REGEX, ' ')
    .trim();

  return sanitized.slice(0, maxLength).trim();
}

export function sanitizeMultilineText(value: unknown, maxLength = 5000): string {
  const sanitized = toStringValue(value)
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(MULTIPLE_SPACES_REGEX, ' ')
    .replace(MULTIPLE_NEWLINES_REGEX, '\n\n')
    .trim();

  return sanitized.slice(0, maxLength).trim();
}

export function sanitizeEmailAddress(value: unknown): string {
  const sanitized = sanitizeInlineText(value, 254).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(sanitized)) {
    throw new Error('Please provide a valid email address.');
  }

  return sanitized;
}

export function sanitizePhoneNumber(value: unknown): string | null {
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

function sanitizeAllowedStringArray(value: unknown, allowedValues: Set<string>): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => sanitizeInlineText(item, 50))
    .filter((item) => allowedValues.has(item));
}

function isLikelyMultilineField(keyPath: string): boolean {
  const normalized = keyPath.toLowerCase();
  return MULTILINE_FIELD_HINTS.some((hint) => normalized.includes(hint));
}

function sanitizeJsonValue(value: unknown, keyPath = ''): JsonValue | undefined {
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
    const items = value
      .map((item, index) => sanitizeJsonValue(item, `${keyPath}[${index}]`))
      .filter((item): item is JsonValue => item !== undefined);

    return items;
  }

  if (typeof value === 'object') {
    const sanitizedEntries = Object.entries(value as Record<string, unknown>)
      .map(([key, childValue]) => {
        const sanitizedChild = sanitizeJsonValue(childValue, keyPath ? `${keyPath}.${key}` : key);
        return sanitizedChild === undefined ? null : [key, sanitizedChild] as const;
      })
      .filter((entry): entry is readonly [string, JsonValue] => entry !== null);

    return Object.fromEntries(sanitizedEntries);
  }

  return undefined;
}

export function sanitizeFormDataObject(value: unknown): Record<string, JsonValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return (sanitizeJsonValue(value) as Record<string, JsonValue>) ?? {};
}

export function getFormTypeLabel(type: string): string {
  const labels: Record<string, string> = {
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

export function getSubmissionDisplayLabel(
  formType: unknown,
  formData?: Record<string, JsonValue> | null,
): string {
  const normalizedType = sanitizeInlineText(formType, 50);

  if (normalizedType === 'quick_intake' && formData) {
    const selectedServices = sanitizeAllowedStringArray(formData.selectedServices, CONTACT_SERVICE_TYPES);

    if (selectedServices.length > 0) {
      return selectedServices.map((service) => getFormTypeLabel(service)).join(', ');
    }
  }

  return getFormTypeLabel(normalizedType);
}

export function validateSubmissionMeta(meta: unknown) {
  if (!meta || typeof meta !== 'object') {
    return;
  }

  const parsedMeta = meta as Record<string, unknown>;
  const honeypot = sanitizeInlineText(parsedMeta.honeypot, 255);

  if (honeypot) {
    throw new Error('Unable to process this submission.');
  }

  const startedAt = Number(parsedMeta.startedAt);
  const submittedAt = Number(parsedMeta.submittedAt) || Date.now();

  if (Number.isFinite(startedAt) && startedAt > 0 && submittedAt - startedAt < SUBMISSION_MIN_AGE_MS) {
    throw new Error('Please wait a few seconds before submitting.');
  }
}

function getContactSubject(raw: Record<string, unknown>, serviceTypes: string[]): string {
  if (serviceTypes.length > 0) {
    return serviceTypes.map((serviceType) => getFormTypeLabel(serviceType)).join(', ');
  }

  return sanitizeInlineText(raw.subject, 200) || 'General Inquiry';
}

export function validateContactSubmission(raw: Record<string, unknown>) {
  const name = sanitizeInlineText(raw.name, 120);
  const email = sanitizeEmailAddress(raw.email);
  const phone = sanitizePhoneNumber(raw.phone);
  const message = sanitizeMultilineText(raw.message, 5000);
  const serviceTypes = sanitizeAllowedStringArray(raw.serviceTypes, CONTACT_SERVICE_TYPES);
  const subject = getContactSubject(raw, serviceTypes);
  const fallbackServiceInterest = sanitizeInlineText(raw.serviceInterest ?? raw.service, 255);

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
    service_interest: serviceTypes.length > 0 ? serviceTypes.join(', ') : fallbackServiceInterest || null,
    status: 'new',
  };
}

export function validateFormSubmission(raw: Record<string, unknown>) {
  const formType = sanitizeInlineText(raw.formType ?? raw.form_type, 50);
  const fullName = sanitizeInlineText(raw.fullName ?? raw.full_name, 120);
  const email = sanitizeEmailAddress(raw.email);
  const phone = sanitizePhoneNumber(raw.phone);
  const formData = sanitizeFormDataObject(raw.formData ?? raw.form_data);
  const requiresUpload = Boolean(raw.requiresUpload ?? raw.requires_upload);

  if (!ALLOWED_FORM_TYPES.has(formType)) {
    throw new Error('Please choose a valid service type.');
  }

  if (fullName.length < 2) {
    throw new Error('Please provide your full name.');
  }

  if (Array.isArray(formData.selectedServices)) {
    formData.selectedServices = sanitizeAllowedStringArray(formData.selectedServices, CONTACT_SERVICE_TYPES);
  }

  return {
    form_type: formType,
    full_name: fullName,
    email,
    phone,
    form_data: formData,
    requires_upload: requiresUpload,
    status: 'new',
  };
}

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const directIp = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');
  return directIp?.trim() || null;
}

function shouldSkipRateLimit(clientIp: string | null): boolean {
  if (!clientIp) {
    return true;
  }

  return clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost';
}

async function hashValue(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function enforceRateLimit(
  supabase: any,
  route: string,
  request: Request,
  maxAttempts: number,
  windowMinutes: number,
) {
  const clientIp = getClientIp(request);

  if (shouldSkipRateLimit(clientIp)) {
    return;
  }

  const ipHash = await hashValue(clientIp!);
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from('submission_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('route', route)
    .eq('ip_hash', ipHash)
    .gte('created_at', cutoff);

  if (countError) {
    console.error('Rate limit check failed:', countError);
    return;
  }

  if ((count ?? 0) >= maxAttempts) {
    throw new Error('Too many submissions from this network. Please wait and try again.');
  }

  const { error: insertError } = await supabase
    .from('submission_rate_limits')
    .insert({ route, ip_hash: ipHash });

  if (insertError) {
    console.error('Rate limit write failed:', insertError);
  }
}
