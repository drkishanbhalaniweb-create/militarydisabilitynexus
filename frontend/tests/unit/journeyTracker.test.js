import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  categorizeReferrer,
  generateUUID,
  getAnonymousJourneyId,
  getAttributionPayload,
  getDeviceClass,
  handleRouteChange,
  initJourneyTracker,
  parseUtmParams,
} from '../../src/lib/journeyTracker';
import { sanitizeAttributionPayload } from '../../src/lib/submissionValidation';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('journeyTracker', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.cookie = 'nexus_journey_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    vi.restoreAllMocks();
  });

  describe('UUID generation & Journey ID management', () => {
    test('generates valid RFC4122 v4 UUID format', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(UUID_V4_REGEX);
    });

    test('generates and stores anonymous journey id in sessionStorage and cookie', () => {
      const journeyId = getAnonymousJourneyId();
      expect(journeyId).toMatch(UUID_V4_REGEX);
      expect(sessionStorage.getItem('nexus_anonymous_journey_id')).toBe(journeyId);
      expect(document.cookie).toContain(`nexus_journey_id=${journeyId}`);
    });

    test('reuses existing journey ID from sessionStorage', () => {
      const existingId = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
      sessionStorage.setItem('nexus_anonymous_journey_id', existingId);

      const journeyId = getAnonymousJourneyId();
      expect(journeyId).toBe(existingId);
    });

    test('recovers existing journey ID from cookie if sessionStorage is empty', () => {
      const existingId = '12345678-1234-4234-8234-123456789abc';
      document.cookie = `nexus_journey_id=${existingId}; path=/`;

      const journeyId = getAnonymousJourneyId();
      expect(journeyId).toBe(existingId);
      expect(sessionStorage.getItem('nexus_anonymous_journey_id')).toBe(existingId);
    });
  });

  describe('Device class detection', () => {
    test('identifies desktop browsers', () => {
      expect(getDeviceClass('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36')).toBe('desktop');
      expect(getDeviceClass('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15')).toBe('desktop');
    });

    test('identifies mobile browsers', () => {
      expect(getDeviceClass('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148')).toBe('mobile');
      expect(getDeviceClass('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36')).toBe('mobile');
    });

    test('identifies tablet browsers', () => {
      expect(getDeviceClass('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')).toBe('tablet');
      expect(getDeviceClass('Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 Safari/537.36')).toBe('tablet');
    });
  });

  describe('UTM parsing', () => {
    test('extracts standard UTM and ad click parameters', () => {
      const search = '?utm_source=google&utm_medium=cpc&utm_campaign=va_nexus_lead&utm_content=hero_cta&utm_term=nexus+letter&gclid=test-gclid-123';
      const parsed = parseUtmParams(search);

      expect(parsed).toEqual({
        source: 'google',
        medium: 'cpc',
        campaign: 'va_nexus_lead',
        content: 'hero_cta',
        term: 'nexus letter',
        gclid: 'test-gclid-123',
        fbclid: null,
        msclkid: null,
        ttclid: null,
        rdtCid: null,
      });
    });

    test('handles empty and missing queries gracefully', () => {
      expect(parseUtmParams('')).toEqual({});
      expect(parseUtmParams(null)).toEqual({});
    });
  });

  describe('Referrer categorization', () => {
    test('categorizes organic search engines', () => {
      expect(categorizeReferrer('https://www.google.com/search?q=va+disability')).toEqual({
        category: 'organic_search',
        source: 'google',
        medium: 'organic',
      });

      expect(categorizeReferrer('https://www.bing.com/search?q=nexus+letter')).toEqual({
        category: 'organic_search',
        source: 'bing',
        medium: 'organic',
      });

      expect(categorizeReferrer('https://duckduckgo.com/?q=dbq+forms')).toEqual({
        category: 'organic_search',
        source: 'duckduckgo',
        medium: 'organic',
      });
    });

    test('categorizes AI search and social engines', () => {
      expect(categorizeReferrer('https://www.perplexity.ai/search/123')).toEqual({
        category: 'social_ai',
        source: 'perplexity',
        medium: 'ai_search',
      });

      expect(categorizeReferrer('https://chatgpt.com/c/abc')).toEqual({
        category: 'social_ai',
        source: 'chatgpt',
        medium: 'ai_search',
      });

      expect(categorizeReferrer('https://claude.ai/chat/123')).toEqual({
        category: 'social_ai',
        source: 'claude',
        medium: 'ai_search',
      });

      expect(categorizeReferrer('https://www.reddit.com/r/VeteransBenefits/')).toEqual({
        category: 'social_ai',
        source: 'reddit',
        medium: 'social',
      });
    });

    test('categorizes paid ad clicks', () => {
      expect(categorizeReferrer('https://www.google.com/', { gclid: 'abc1234', medium: 'cpc' })).toEqual({
        category: 'paid',
        source: 'google',
        medium: 'cpc',
      });

      expect(categorizeReferrer('https://l.facebook.com/', { fbclid: 'fb123', source: 'facebook', medium: 'paidsocial' })).toEqual({
        category: 'paid',
        source: 'facebook',
        medium: 'paidsocial',
      });
    });

    test('categorizes direct and internal traffic', () => {
      expect(categorizeReferrer('')).toEqual({
        category: 'direct',
        source: 'direct',
        medium: 'none',
      });

      expect(categorizeReferrer('https://militarydisabilitynexus.com/blog/nexus-letters')).toEqual({
        category: 'direct',
        source: 'direct',
        medium: 'none',
      });
    });

    test('categorizes generic external referral', () => {
      expect(categorizeReferrer('https://veteranresourcehub.org/links')).toEqual({
        category: 'referral',
        source: 'veteranresourcehub.org',
        medium: 'referral',
      });
    });
  });

  describe('Lifecycle tracking & attribution payload', () => {
    test('initializes and preserves immutable first touch while updating last touch', () => {
      delete window.location;
      window.location = new URL('https://militarydisabilitynexus.com/?utm_source=google&utm_medium=cpc&utm_campaign=nexus_launch');
      Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/', configurable: true });

      initJourneyTracker();

      const payload1 = getAttributionPayload();
      expect(payload1.first_touch_source).toBe('google');
      expect(payload1.first_touch_campaign).toBe('nexus_launch');
      expect(payload1.last_touch_source).toBe('google');

      // Navigate to another page from Reddit
      Object.defineProperty(document, 'referrer', { value: 'https://www.reddit.com/', configurable: true });
      window.location = new URL('https://militarydisabilitynexus.com/services/nexus-letter');
      handleRouteChange('/services/nexus-letter');

      const payload2 = getAttributionPayload();
      // First touch unchanged
      expect(payload2.first_touch_source).toBe('google');
      expect(payload2.first_touch_campaign).toBe('nexus_launch');
      expect(payload2.first_touch_landing_page).toBe('/');

      // Last touch updated
      expect(payload2.last_touch_source).toBe('reddit');
      expect(payload2.last_touch_landing_page).toBe('/services/nexus-letter');
    });
  });

  describe('sanitizeAttributionPayload', () => {
    test('sanitizes valid attribution payload', () => {
      const input = {
        anonymous_journey_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        first_touch_source: '  google  ',
        first_touch_medium: 'cpc',
        first_touch_campaign: 'va_campaign',
        first_touch_landing_page: '/services/nexus-letter',
        first_touch_at: '2026-09-01T12:00:00.000Z',
        referrer_category: 'paid',
        device_class: 'MOBILE',
        qualification_status: 'qualified',
      };

      const sanitized = sanitizeAttributionPayload(input);

      expect(sanitized.anonymous_journey_id).toBe('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
      expect(sanitized.first_touch_source).toBe('google');
      expect(sanitized.device_class).toBe('mobile');
      expect(sanitized.qualification_status).toBe('qualified');
      expect(sanitized.referrer_category).toBe('paid');
    });

    test('defaults and rejects invalid or malformed data', () => {
      const sanitized = sanitizeAttributionPayload({
        anonymous_journey_id: 'not-a-valid-uuid',
        device_class: 'smart-fridge',
        qualification_status: 'invalid-status',
        first_touch_at: 'invalid-date',
      });

      expect(sanitized.anonymous_journey_id).toBeNull();
      expect(sanitized.device_class).toBeNull();
      expect(sanitized.qualification_status).toBe('pending');
      expect(sanitized.first_touch_at).toBeNull();
      expect(sanitized.referrer_category).toBe('direct');
    });

    test('handles null/undefined gracefully', () => {
      const sanitized = sanitizeAttributionPayload(null);
      expect(sanitized.anonymous_journey_id).toBeNull();
      expect(sanitized.qualification_status).toBe('pending');
      expect(sanitized.referrer_category).toBe('direct');
    });
  });
});
