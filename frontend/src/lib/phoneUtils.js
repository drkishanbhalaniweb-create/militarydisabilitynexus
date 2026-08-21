/**
 * Utility functions for US phone number formatting and validation.
 */

/**
 * Normalizes input string to raw 10-digit US format (stripping country code if present).
 * Returns empty string if invalid or incomplete.
 * @param {string} value
 * @returns {string}
 */
export function normalizePhoneNumber(value) {
  if (!value || typeof value !== 'string') return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits.length === 10 ? digits : '';
}

/**
 * Formats a phone number string in real-time as the user types into US (XXX) XXX-XXXX format.
 * Automatically handles leading 1 or +1 country code by stripping it for 10-digit US numbers.
 * @param {string} value
 * @returns {string}
 */
export function formatPhoneNumber(value) {
  if (!value || typeof value !== 'string') return '';

  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  // If 11 digits starting with 1 (e.g. pasted 15551234567 or +15551234567)
  const usDigits = (digits.length === 11 && digits.startsWith('1'))
    ? digits.slice(1)
    : digits.slice(0, 10);

  if (usDigits.length === 0) return '';
  if (usDigits.length <= 3) return `(${usDigits}`;
  if (usDigits.length <= 6) return `(${usDigits.slice(0, 3)}) ${usDigits.slice(3)}`;
  return `(${usDigits.slice(0, 3)}) ${usDigits.slice(3, 6)}-${usDigits.slice(6, 10)}`;
}

/**
 * Validates whether a phone number is a valid 10-digit US phone number.
 * Area code must not start with 0 or 1.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidPhoneNumber(value) {
  const normalized = normalizePhoneNumber(value);
  if (!normalized || normalized.length !== 10) return false;
  // US area codes start with 2-9
  return /^[2-9]\d{9}$/.test(normalized);
}
