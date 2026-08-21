import { describe, expect, test } from 'vitest';
import {
  formatPhoneNumber,
  normalizePhoneNumber,
  isValidPhoneNumber,
} from '../../src/lib/phoneUtils';

describe('phoneUtils', () => {
  describe('formatPhoneNumber', () => {
    test('returns empty string for empty input', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber(null)).toBe('');
      expect(formatPhoneNumber(undefined)).toBe('');
    });

    test('formats incomplete numbers progressively', () => {
      expect(formatPhoneNumber('5')).toBe('(5');
      expect(formatPhoneNumber('555')).toBe('(555');
      expect(formatPhoneNumber('5551')).toBe('(555) 1');
      expect(formatPhoneNumber('5551234')).toBe('(555) 123-4');
    });

    test('formats full 10-digit phone number as (XXX) XXX-XXXX', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
    });

    test('strips leading 1 if 11 digits are provided', () => {
      expect(formatPhoneNumber('15551234567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('+15551234567')).toBe('(555) 123-4567');
    });

    test('caps at 10 digits', () => {
      expect(formatPhoneNumber('55512345678999')).toBe('(555) 123-4567');
    });
  });

  describe('normalizePhoneNumber', () => {
    test('normalizes various formats to 10 digits', () => {
      expect(normalizePhoneNumber('(555) 123-4567')).toBe('5551234567');
      expect(normalizePhoneNumber('+1 (555) 123-4567')).toBe('5551234567');
      expect(normalizePhoneNumber('1-555-123-4567')).toBe('5551234567');
      expect(normalizePhoneNumber('555.123.4567')).toBe('5551234567');
    });

    test('returns empty string for invalid or short numbers', () => {
      expect(normalizePhoneNumber('')).toBe('');
      expect(normalizePhoneNumber('12345')).toBe('');
      expect(normalizePhoneNumber(null)).toBe('');
    });
  });

  describe('isValidPhoneNumber', () => {
    test('validates 10-digit US phone numbers', () => {
      expect(isValidPhoneNumber('(555) 123-4567')).toBe(true);
      expect(isValidPhoneNumber('5551234567')).toBe(true);
      expect(isValidPhoneNumber('+1 800 555 1212')).toBe(true);
    });

    test('rejects numbers with invalid area codes starting with 0 or 1', () => {
      expect(isValidPhoneNumber('(012) 345-6789')).toBe(false);
      expect(isValidPhoneNumber('(123) 456-7890')).toBe(false);
    });

    test('rejects incomplete numbers', () => {
      expect(isValidPhoneNumber('555')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
      expect(isValidPhoneNumber(null)).toBe(false);
    });
  });
});
