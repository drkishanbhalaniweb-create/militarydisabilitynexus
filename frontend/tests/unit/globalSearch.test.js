import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GlobalSearch, { MobileSearchTrigger } from '../../src/components/GlobalSearch';
import Header from '../../src/components/Header';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const h = React.createElement;

// Mock next/router
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    asPath: '/',
  }),
}));

// Mock next/link to render simple anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => h('a', { href, ...props }, children),
}));

// Test harness helpers
let container;
let root;

async function render(ui) {
  await act(async () => {
    root.render(ui);
  });
}

async function clickElement(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.click();
  });
}

async function fillInput(input, value) {
  await act(async () => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

async function pressKey(target, keyOptions) {
  await act(async () => {
    target.dispatchEvent(new KeyboardEvent('keydown', { ...keyOptions, bubbles: true }));
  });
}

async function waitFor(callback, { timeout = 2500, interval = 25 } = {}) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
      return callback();
    } catch {
      // retry until timeout
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return callback();
}

const mockSearchResults = {
  query: 'nexus',
  total: 4,
  results: {
    conditions: [
      {
        id: 'cond-1',
        title: 'PTSD Nexus Letter',
        category: 'conditions',
        url: '/services/independent-medical-opinion-nexus-letter/mental-health/ptsd-nexus-letter',
        description: 'Nexus letter service for service-connected PTSD claims.',
        badge: 'Condition',
      },
    ],
    services: [
      {
        id: 'serv-1',
        title: 'Nexus Letter / IMO',
        category: 'services',
        url: '/services/independent-medical-opinion-nexus-letter',
        description: 'Independent medical opinions linking conditions to service.',
        badge: 'Service',
      },
    ],
    blog_posts: [
      {
        id: 'blog-1',
        title: 'Understanding VA Nexus Letters',
        category: 'blog_posts',
        url: '/blog/understanding-va-nexus-letters',
        description: 'Comprehensive guide to what makes a winning nexus letter.',
        badge: 'Blog',
      },
    ],
    community_questions: [
      {
        id: 'comm-1',
        title: 'How long does a nexus letter take?',
        category: 'community_questions',
        url: '/community/question/how-long-does-a-nexus-letter-take',
        description: 'Average turnaround times for clinician-led nexus letters.',
        badge: 'Community Q&A',
      },
    ],
    case_studies: [],
  },
};

describe('GlobalSearch Component & Header Integration', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    mockPush.mockReset();

    if (typeof window.ResizeObserver === 'undefined') {
      window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = vi.fn(() => false);
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = vi.fn();
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = vi.fn();
    }

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('1. Search Trigger Rendering', () => {
    it('renders desktop search trigger with search icon and keyboard shortcut badge', async () => {
      await render(h(GlobalSearch));

      const trigger = document.querySelector('[data-testid="search-trigger"]');
      expect(trigger).not.toBeNull();
      expect(trigger).toHaveAttribute('aria-label', 'Search');
      expect(trigger.textContent).toMatch(/Search\.\.\./i);
      expect(trigger.textContent).toMatch(/(Ctrl\+K|⌘K)/);
    });

    it('renders standalone MobileSearchTrigger button with correct accessible label', async () => {
      const handleClick = vi.fn();
      await render(h(MobileSearchTrigger, { onClick: handleClick }));

      const mobileTrigger = document.querySelector('[data-testid="mobile-search-trigger"]');
      expect(mobileTrigger).not.toBeNull();
      expect(mobileTrigger).toHaveAttribute('aria-label', 'Search');

      await clickElement(mobileTrigger);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Header Integration', () => {
    it('renders search trigger in Header on desktop and mobile', async () => {
      await render(h(Header));

      // Desktop trigger present
      const desktopTrigger = document.querySelector('[data-testid="search-trigger"]');
      expect(desktopTrigger).not.toBeNull();

      // Mobile trigger present
      const mobileTrigger = document.querySelector('[data-testid="mobile-search-trigger"]');
      expect(mobileTrigger).not.toBeNull();

      // Preserves existing logo and nav elements
      expect(document.querySelector('[data-testid="header-logo"]')).not.toBeNull();
      expect(document.querySelector('[data-testid="header-cta-button"]')).not.toBeNull();
      expect(document.querySelector('[data-testid="mobile-menu-button"]')).not.toBeNull();
    });

    it('clicking desktop search trigger in Header opens the search dialog', async () => {
      await render(h(Header));

      const desktopTrigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(desktopTrigger);

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).not.toBeNull();
      });
    });

    it('clicking mobile search trigger in Header opens the search dialog', async () => {
      await render(h(Header));

      const mobileTrigger = document.querySelector('[data-testid="mobile-search-trigger"]');
      await clickElement(mobileTrigger);

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).not.toBeNull();
      });
    });

    it('clicking drawer search trigger inside mobile menu opens search dialog', async () => {
      await render(h(Header));

      // Open mobile menu
      const hamburger = document.querySelector('[data-testid="mobile-menu-button"]');
      await clickElement(hamburger);

      const drawerSearchBtn = await waitFor(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          b.textContent.includes('Search conditions, services, articles...')
        );
        expect(btn).toBeDefined();
        return btn;
      });

      await clickElement(drawerSearchBtn);

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).not.toBeNull();
      });
    });
  });

  describe('3. Keyboard Shortcuts (Cmd+K / Ctrl+K and Escape)', () => {
    it('opens dialog when pressing Ctrl+K and closes when pressing Ctrl+K again', async () => {
      await render(h(GlobalSearch));

      // Initially closed
      expect(document.querySelector('input[placeholder*="Search conditions"]')).toBeNull();

      // Press Ctrl+K to open
      await pressKey(document, { key: 'k', ctrlKey: true });

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).not.toBeNull();
      });

      // Press Ctrl+K again to toggle close
      await pressKey(document, { key: 'k', ctrlKey: true });

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).toBeNull();
      });
    });

    it('opens dialog when pressing Meta+K (Cmd+K on Mac)', async () => {
      await render(h(GlobalSearch));

      await pressKey(document, { key: 'K', metaKey: true });

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).not.toBeNull();
      });
    });

    it('closes dialog when pressing Escape', async () => {
      await render(h(GlobalSearch));

      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).not.toBeNull();
      });

      // Press Escape
      await pressKey(document, { key: 'Escape' });

      await waitFor(() => {
        const input = document.querySelector('input[placeholder*="Search conditions"]');
        expect(input).toBeNull();
      });
    });
  });

  describe('4. Debounced Search & Categorized Results', () => {
    it('issues debounced fetch to /api/search and renders grouped categories with badges', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSearchResults,
      });

      await render(h(GlobalSearch));

      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      // Type query
      await fillInput(input, 'nexus');

      // Wait for debounce and fetch execution
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/search?q=nexus'),
          expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
      });

      // Verify category items rendered in DOM
      await waitFor(() => {
        expect(document.body.textContent).toContain('PTSD Nexus Letter');
        expect(document.body.textContent).toContain('Nexus Letter / IMO');
        expect(document.body.textContent).toContain('Understanding VA Nexus Letters');
        expect(document.body.textContent).toContain('How long does a nexus letter take?');
      });

      // Verify category badges
      const badges = Array.from(document.querySelectorAll('[data-testid="category-badge"]'));
      const badgeTexts = badges.map((b) => b.textContent);
      expect(badgeTexts).toContain('Condition');
      expect(badgeTexts).toContain('Service');
      expect(badgeTexts).toContain('Blog');
      expect(badgeTexts).toContain('Community');

      // Verify empty category (case_studies) is NOT rendered
      expect(document.body.textContent).not.toContain('Case Studies');
    });

    it('renders badges with compliant colors adhering to PURPLE BAN', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSearchResults,
      });

      await render(h(GlobalSearch));
      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      await fillInput(input, 'nexus');

      await waitFor(() => {
        expect(document.body.textContent).toContain('PTSD Nexus Letter');
      });

      const badges = Array.from(document.querySelectorAll('[data-testid="category-badge"]'));
      expect(badges.length).toBeGreaterThan(0);
      badges.forEach((badge) => {
        const classNames = badge.className;
        expect(classNames).not.toMatch(/purple/i);
        expect(classNames).not.toMatch(/violet/i);
      });
    });
  });

  describe('5. Fast-Path & Empty State Feedback', () => {
    it('does not send request for empty or single-character query and displays prompt', async () => {
      global.fetch = vi.fn();

      await render(h(GlobalSearch));
      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      await fillInput(input, 'a');

      // Wait 350ms to ensure debounce window passes
      await new Promise((r) => setTimeout(r, 350));

      expect(global.fetch).not.toHaveBeenCalled();
      expect(document.body.textContent).toMatch(/type at least 2 characters to search/i);
    });

    it('displays clear empty state when search query returns 0 results', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          query: 'xyznonexistent',
          total: 0,
          results: {
            conditions: [],
            services: [],
            blog_posts: [],
            community_questions: [],
            case_studies: [],
          },
        }),
      });

      await render(h(GlobalSearch));
      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      await fillInput(input, 'xyznonexistent');

      await waitFor(() => {
        const empty = document.querySelector('[data-testid="search-empty"]');
        expect(empty).not.toBeNull();
        expect(empty.textContent).toMatch(/no results found for/i);
        expect(empty.textContent).toContain('xyznonexistent');
      });
    });
  });

  describe('6. Navigation & Dialog Close on Item Selection', () => {
    it('navigates to canonical destination and closes dialog when result item is selected', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSearchResults,
      });

      await render(h(GlobalSearch));
      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      await fillInput(input, 'nexus');

      await waitFor(() => {
        expect(document.body.textContent).toContain('PTSD Nexus Letter');
      });

      const resultItems = Array.from(document.querySelectorAll('[data-testid="search-result-item"]'));
      expect(resultItems.length).toBeGreaterThan(0);

      await clickElement(resultItems[0]);

      expect(mockPush).toHaveBeenCalledWith(
        '/services/independent-medical-opinion-nexus-letter/mental-health/ptsd-nexus-letter'
      );

      // Dialog should close
      await waitFor(() => {
        expect(document.querySelector('input[placeholder*="Search conditions"]')).toBeNull();
      });
    });
  });

  describe('7. Resilience, AbortController & State Cleanup', () => {
    it('aborts prior in-flight request when user types rapidly', async () => {
      let abortCount = 0;
      global.fetch = vi.fn().mockImplementation((url, options) => {
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            abortCount += 1;
          });
        }
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockSearchResults,
            });
          }, 400);
        });
      });

      await render(h(GlobalSearch));
      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      // First query triggers fetch after 250ms debounce
      await fillInput(input, 'nex');

      // Wait 280ms so fetch is in flight (mock fetch delay is 400ms)
      await new Promise((r) => setTimeout(r, 280));

      // Second query arrives while first fetch is in flight
      await fillInput(input, 'nexus');

      await waitFor(() => {
        expect(abortCount).toBeGreaterThanOrEqual(1);
      });
    });

    it('handles network error or HTTP 500 without crashing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await render(h(GlobalSearch));
      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      await fillInput(input, 'nexus');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Component remains intact and input still present
      expect(document.querySelector('input[placeholder*="Search conditions"]')).not.toBeNull();
      consoleSpy.mockRestore();
    });

    it('resets query and results when dialog is closed', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSearchResults,
      });

      await render(h(GlobalSearch));
      const trigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(trigger);

      const input = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      await fillInput(input, 'nexus');

      await waitFor(() => {
        expect(document.body.textContent).toContain('PTSD Nexus Letter');
      });

      // Close dialog via Escape
      await pressKey(document, { key: 'Escape' });

      await waitFor(() => {
        expect(document.querySelector('input[placeholder*="Search conditions"]')).toBeNull();
      });

      // Re-open dialog: should have reset query and results
      const reOpenTrigger = document.querySelector('[data-testid="search-trigger"]');
      await clickElement(reOpenTrigger);

      const freshInput = await waitFor(() => {
        const el = document.querySelector('input[placeholder*="Search conditions"]');
        expect(el).not.toBeNull();
        return el;
      });

      expect(freshInput.value).toBe('');
      expect(document.body.textContent).not.toContain('PTSD Nexus Letter');
    });
  });
});
