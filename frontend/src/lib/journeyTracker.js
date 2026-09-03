/**
 * Nexus Journey Tracker (Phase 1)
 * Lightweight, zero-dependency, HIPAA-compliant first-touch & last-touch attribution tracker.
 *
 * Privacy Guarantees:
 * - anonymous_journey_id is a crypto-random UUIDv4.
 * - No patient health information (PHI), symptoms, medical history, or free text is captured.
 * - All storage uses client-side sessionStorage and first-party cookies only.
 */

const STORAGE_KEY_JOURNEY_ID = 'nexus_anonymous_journey_id';
const STORAGE_KEY_FIRST_TOUCH = 'nexus_first_touch';
const STORAGE_KEY_LAST_TOUCH = 'nexus_last_touch';
const COOKIE_KEY_JOURNEY_ID = 'nexus_journey_id';

const KNOWN_SEARCH_ENGINES = [
  { domain: 'google.', name: 'google' },
  { domain: 'bing.', name: 'bing' },
  { domain: 'duckduckgo.', name: 'duckduckgo' },
  { domain: 'yahoo.', name: 'yahoo' },
  { domain: 'ecosia.', name: 'ecosia' },
  { domain: 'baidu.', name: 'baidu' },
  { domain: 'yandex.', name: 'yandex' },
];

const KNOWN_AI_AND_SOCIAL = [
  { domain: 'perplexity.ai', name: 'perplexity', category: 'social_ai' },
  { domain: 'chatgpt.com', name: 'chatgpt', category: 'social_ai' },
  { domain: 'openai.com', name: 'chatgpt', category: 'social_ai' },
  { domain: 'claude.ai', name: 'claude', category: 'social_ai' },
  { domain: 'anthropic.com', name: 'claude', category: 'social_ai' },
  { domain: 'reddit.com', name: 'reddit', category: 'social_ai' },
  { domain: 'twitter.com', name: 'twitter', category: 'social_ai' },
  { domain: 'x.com', name: 'twitter', category: 'social_ai' },
  { domain: 't.co', name: 'twitter', category: 'social_ai' },
  { domain: 'facebook.com', name: 'facebook', category: 'social_ai' },
  { domain: 'fb.me', name: 'facebook', category: 'social_ai' },
  { domain: 'instagram.com', name: 'instagram', category: 'social_ai' },
  { domain: 'threads.net', name: 'threads', category: 'social_ai' },
  { domain: 'linkedin.com', name: 'linkedin', category: 'social_ai' },
  { domain: 'lnkd.in', name: 'linkedin', category: 'social_ai' },
  { domain: 'youtube.com', name: 'youtube', category: 'social_ai' },
  { domain: 'youtu.be', name: 'youtube', category: 'social_ai' },
  { domain: 'tiktok.com', name: 'tiktok', category: 'social_ai' },
];

const PAID_MEDIUMS = new Set([
  'cpc',
  'ppc',
  'paid',
  'paidsocial',
  'paid_social',
  'paidsearch',
  'paid_search',
  'display',
  'banner',
  'retargeting',
]);

const INTERNAL_HOSTS = new Set([
  'militarydisabilitynexus.com',
  'www.militarydisabilitynexus.com',
  'localhost',
  '127.0.0.1',
]);

/**
 * Generate a random UUIDv4 safely in any browser environment
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }

  // RFC4122 v4 compliant fallback
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC4122
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // Pure Math.random fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
  } catch {
    // Ignore cookie errors (e.g. disabled cookies)
  }
}

/**
 * Retrieve or generate the anonymous journey UUID
 */
export function getAnonymousJourneyId() {
  if (typeof window === 'undefined') return null;

  try {
    // Check sessionStorage first
    let journeyId = sessionStorage.getItem(STORAGE_KEY_JOURNEY_ID);
    if (journeyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(journeyId)) {
      return journeyId;
    }

    // Check first-party cookie
    journeyId = getCookie(COOKIE_KEY_JOURNEY_ID);
    if (journeyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(journeyId)) {
      sessionStorage.setItem(STORAGE_KEY_JOURNEY_ID, journeyId);
      return journeyId;
    }

    // Generate new UUID
    journeyId = generateUUID();
    sessionStorage.setItem(STORAGE_KEY_JOURNEY_ID, journeyId);
    setCookie(COOKIE_KEY_JOURNEY_ID, journeyId);
    return journeyId;
  } catch {
    return generateUUID();
  }
}

/**
 * Classify client device class: mobile, tablet, desktop
 */
export function getDeviceClass(userAgent = '') {
  const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').toLowerCase();
  if (!ua) return 'desktop';

  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|windows ce|palm/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Parse URL search string for marketing and attribution parameters
 */
export function parseUtmParams(search = '') {
  if (!search) return {};
  const query = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(query);

  const utmSource = params.get('utm_source')?.trim() || null;
  const utmMedium = params.get('utm_medium')?.trim() || null;
  const utmCampaign = params.get('utm_campaign')?.trim() || null;
  const utmContent = params.get('utm_content')?.trim() || null;
  const utmTerm = params.get('utm_term')?.trim() || null;

  const gclid = params.get('gclid')?.trim() || null;
  const fbclid = params.get('fbclid')?.trim() || null;
  const msclkid = params.get('msclkid')?.trim() || null;
  const ttclid = params.get('ttclid')?.trim() || null;
  const rdtCid = params.get('rdt_cid')?.trim() || null;

  return {
    source: utmSource,
    medium: utmMedium,
    campaign: utmCampaign,
    content: utmContent,
    term: utmTerm,
    gclid,
    fbclid,
    msclkid,
    ttclid,
    rdtCid,
  };
}

/**
 * Categorize document referrer into standard taxonomy
 */
export function categorizeReferrer(referrerUrl = '', utm = {}) {
  const utmMedium = (utm.medium || '').toLowerCase();
  const isPaidMedium = PAID_MEDIUMS.has(utmMedium) || Boolean(utm.gclid || utm.fbclid || utm.msclkid || utm.ttclid || utm.rdtCid);

  if (isPaidMedium) {
    let source = utm.source;
    if (!source) {
      if (utm.gclid) source = 'google';
      else if (utm.fbclid) source = 'facebook';
      else if (utm.msclkid) source = 'bing';
      else if (utm.rdtCid) source = 'reddit';
      else if (utm.ttclid) source = 'tiktok';
      else source = 'paid_ad';
    }
    return {
      category: 'paid',
      source,
      medium: utm.medium || 'cpc',
    };
  }

  if (!referrerUrl) {
    if (utm.source) {
      return {
        category: 'referral',
        source: utm.source,
        medium: utm.medium || 'custom',
      };
    }
    return {
      category: 'direct',
      source: 'direct',
      medium: 'none',
    };
  }

  let hostname = '';
  try {
    const url = new URL(referrerUrl);
    hostname = url.hostname.toLowerCase();
  } catch {
    return {
      category: 'direct',
      source: 'direct',
      medium: 'none',
    };
  }

  if (INTERNAL_HOSTS.has(hostname) || (typeof window !== 'undefined' && hostname === window.location.hostname)) {
    if (utm.source) {
      return {
        category: 'referral',
        source: utm.source,
        medium: utm.medium || 'campaign',
      };
    }
    return {
      category: 'direct',
      source: 'direct',
      medium: 'none',
    };
  }

  // Check known AI search & Social platforms
  for (const item of KNOWN_AI_AND_SOCIAL) {
    if (hostname === item.domain || hostname.endsWith(`.${item.domain}`)) {
      return {
        category: item.category,
        source: utm.source || item.name,
        medium: utm.medium || (item.name === 'perplexity' || item.name === 'chatgpt' || item.name === 'claude' ? 'ai_search' : 'social'),
      };
    }
  }

  // Check search engines
  for (const engine of KNOWN_SEARCH_ENGINES) {
    if (hostname.includes(engine.domain) || hostname === engine.name) {
      return {
        category: 'organic_search',
        source: utm.source || engine.name,
        medium: utm.medium || 'organic',
      };
    }
  }

  // Default external referral
  return {
    category: 'referral',
    source: utm.source || hostname,
    medium: utm.medium || 'referral',
  };
}

/**
 * Clean path to ensure privacy (strip query, hashes, keep standard path)
 */
function sanitizeLandingPath(urlOrPath = '') {
  if (!urlOrPath) return '/';
  try {
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      const parsed = new URL(urlOrPath);
      return parsed.pathname || '/';
    }
    const clean = urlOrPath.split('?')[0].split('#')[0];
    return clean.startsWith('/') ? clean : `/${clean}`;
  } catch {
    return '/';
  }
}

/**
 * Capture current touchpoint details
 */
function captureTouchpoint(overridePath = null) {
  if (typeof window === 'undefined') return null;

  const currentPath = sanitizeLandingPath(overridePath || window.location.pathname);
  const utm = parseUtmParams(window.location.search);
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const classified = categorizeReferrer(referrer, utm);

  return {
    source: classified.source || utm.source || 'direct',
    medium: classified.medium || utm.medium || 'none',
    campaign: utm.campaign || null,
    landingPage: currentPath,
    category: classified.category || 'direct',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Initialize Journey Tracker on page mount
 */
export function initJourneyTracker() {
  if (typeof window === 'undefined') return null;

  try {
    const journeyId = getAnonymousJourneyId();
    const currentTouch = captureTouchpoint();
    if (!currentTouch) return null;

    // Check first touch - immutable once written
    const existingFirstTouch = sessionStorage.getItem(STORAGE_KEY_FIRST_TOUCH);
    if (!existingFirstTouch) {
      sessionStorage.setItem(STORAGE_KEY_FIRST_TOUCH, JSON.stringify(currentTouch));
    }

    // Set last touch
    sessionStorage.setItem(STORAGE_KEY_LAST_TOUCH, JSON.stringify(currentTouch));

    return {
      journeyId,
      firstTouch: existingFirstTouch ? JSON.parse(existingFirstTouch) : currentTouch,
      lastTouch: currentTouch,
    };
  } catch (error) {
    console.error('Journey tracker init error:', error);
    return null;
  }
}

/**
 * Update tracker on client-side route transition
 */
export function handleRouteChange(url) {
  if (typeof window === 'undefined') return;

  try {
    const currentTouch = captureTouchpoint(url);
    if (currentTouch) {
      sessionStorage.setItem(STORAGE_KEY_LAST_TOUCH, JSON.stringify(currentTouch));
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Assemble sanitized attribution payload for form submissions
 */
export function getAttributionPayload() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const journeyId = getAnonymousJourneyId();
    let firstTouch = null;
    let lastTouch = null;

    try {
      const rawFirst = sessionStorage.getItem(STORAGE_KEY_FIRST_TOUCH);
      if (rawFirst) firstTouch = JSON.parse(rawFirst);
    } catch {
      // Ignore
    }

    try {
      const rawLast = sessionStorage.getItem(STORAGE_KEY_LAST_TOUCH);
      if (rawLast) lastTouch = JSON.parse(rawLast);
    } catch {
      // Ignore
    }

    // Fallback if tracker didn't run before submission
    if (!firstTouch || !lastTouch) {
      const fallbackTouch = captureTouchpoint();
      if (!firstTouch) firstTouch = fallbackTouch;
      if (!lastTouch) lastTouch = fallbackTouch;
    }

    const deviceClass = getDeviceClass();

    return {
      anonymous_journey_id: journeyId || null,
      first_touch_source: firstTouch?.source || null,
      first_touch_medium: firstTouch?.medium || null,
      first_touch_campaign: firstTouch?.campaign || null,
      first_touch_landing_page: firstTouch?.landingPage || null,
      first_touch_at: firstTouch?.timestamp || null,
      last_touch_source: lastTouch?.source || null,
      last_touch_medium: lastTouch?.medium || null,
      last_touch_campaign: lastTouch?.campaign || null,
      last_touch_landing_page: lastTouch?.landingPage || null,
      last_touch_at: lastTouch?.timestamp || null,
      referrer_category: firstTouch?.category || lastTouch?.category || 'direct',
      device_class: deviceClass,
    };
  } catch {
    return {
      anonymous_journey_id: generateUUID(),
      referrer_category: 'direct',
      device_class: 'desktop',
    };
  }
}
