import { describe, it, expect } from 'vitest';
import { testimonialApi } from '../../src/lib/api';
import { compareTestimonialsByPinned } from '../../src/lib/testimonials';

describe('Pinned / Featured Testimonials Logic', () => {
  describe('testimonialApi.normalize - is_pinned and pin_order', () => {
    it('normalizes is_pinned and pin_order when present as booleans and numbers', () => {
      const raw = {
        id: 'test-1',
        name: 'John Doe',
        feedback: 'Great service',
        is_pinned: true,
        pin_order: 1,
      };

      const normalized = testimonialApi.normalize(raw);
      expect(normalized.is_pinned).toBe(true);
      expect(normalized.pin_order).toBe(1);
    });

    it('falls back to default values when is_pinned and pin_order are undefined or null', () => {
      const raw = {
        id: 'test-2',
        name: 'Jane Smith',
        feedback: 'Helpful doctor',
      };

      const normalized = testimonialApi.normalize(raw);
      expect(normalized.is_pinned).toBe(false);
      expect(normalized.pin_order).toBe(0);

      const rawWithNulls = {
        id: 'test-3',
        is_pinned: null,
        pin_order: null,
      };

      const normalizedNulls = testimonialApi.normalize(rawWithNulls);
      expect(normalizedNulls.is_pinned).toBe(false);
      expect(normalizedNulls.pin_order).toBe(0);
    });

    it('coerces string pin_order to a number', () => {
      const raw = {
        id: 'test-4',
        is_pinned: true,
        pin_order: '3',
      };

      const normalized = testimonialApi.normalize(raw);
      expect(normalized.is_pinned).toBe(true);
      expect(normalized.pin_order).toBe(3);
    });

    it('coerces truthy/falsy is_pinned values to strict boolean', () => {
      expect(testimonialApi.normalize({ is_pinned: 1 }).is_pinned).toBe(true);
      expect(testimonialApi.normalize({ is_pinned: 0 }).is_pinned).toBe(false);
      expect(testimonialApi.normalize({ is_pinned: 'true' }).is_pinned).toBe(true);
      expect(testimonialApi.normalize({ is_pinned: '' }).is_pinned).toBe(false);
    });
  });

  describe('compareTestimonialsByPinned sorting comparator', () => {
    it('sorts is_pinned: true before is_pinned: false', () => {
      const unpinned = {
        id: 'unpinned-1',
        name: 'Unpinned User',
        is_pinned: false,
        pin_order: 0,
        created_at: '2026-03-01T00:00:00Z',
      };

      const pinned = {
        id: 'pinned-1',
        name: 'Pinned User',
        is_pinned: true,
        pin_order: 1,
        created_at: '2025-01-01T00:00:00Z',
      };

      expect(compareTestimonialsByPinned(pinned, unpinned)).toBeLessThan(0);
      expect(compareTestimonialsByPinned(unpinned, pinned)).toBeGreaterThan(0);

      const list = [unpinned, pinned];
      const sorted = [...list].sort(compareTestimonialsByPinned);
      expect(sorted[0].id).toBe('pinned-1');
      expect(sorted[1].id).toBe('unpinned-1');
    });

    it('orders pinned items by pin_order ASC', () => {
      const pinnedFirst = {
        id: 'p-1',
        name: 'Priority 1',
        is_pinned: true,
        pin_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      };

      const pinnedSecond = {
        id: 'p-2',
        name: 'Priority 2',
        is_pinned: true,
        pin_order: 2,
        created_at: '2026-02-01T00:00:00Z',
      };

      const pinnedThird = {
        id: 'p-3',
        name: 'Priority 3',
        is_pinned: true,
        pin_order: 5,
        created_at: '2026-03-01T00:00:00Z',
      };

      const list = [pinnedThird, pinnedFirst, pinnedSecond];
      const sorted = [...list].sort(compareTestimonialsByPinned);

      expect(sorted.map((item) => item.id)).toEqual(['p-1', 'p-2', 'p-3']);
    });

    it('orders pinned items with identical pin_order by created_at DESC', () => {
      const olderPinned = {
        id: 'p-old',
        is_pinned: true,
        pin_order: 1,
        created_at: '2026-01-01T00:00:00Z',
      };

      const newerPinned = {
        id: 'p-new',
        is_pinned: true,
        pin_order: 1,
        created_at: '2026-02-01T00:00:00Z',
      };

      const sorted = [olderPinned, newerPinned].sort(compareTestimonialsByPinned);
      expect(sorted[0].id).toBe('p-new');
      expect(sorted[1].id).toBe('p-old');
    });

    it('orders unpinned items by created_at DESC', () => {
      const older = {
        id: 'u-old',
        is_pinned: false,
        pin_order: 0,
        created_at: '2026-01-01T00:00:00Z',
      };

      const newer = {
        id: 'u-new',
        is_pinned: false,
        pin_order: 0,
        created_at: '2026-03-01T00:00:00Z',
      };

      const sorted = [older, newer].sort(compareTestimonialsByPinned);
      expect(sorted[0].id).toBe('u-new');
      expect(sorted[1].id).toBe('u-old');
    });

    it('correctly handles a complete mixed list', () => {
      const items = [
        { id: 'u-1', is_pinned: false, pin_order: 0, created_at: '2026-03-01T00:00:00Z' },
        { id: 'p-2', is_pinned: true, pin_order: 2, created_at: '2026-01-01T00:00:00Z' },
        { id: 'p-1', is_pinned: true, pin_order: 1, created_at: '2026-02-01T00:00:00Z' },
        { id: 'u-2', is_pinned: false, pin_order: 0, created_at: '2026-04-01T00:00:00Z' },
        { id: 'p-3', is_pinned: true, pin_order: 3, created_at: '2026-02-15T00:00:00Z' },
      ];

      const sorted = [...items].sort(compareTestimonialsByPinned);
      // Pinned by pin_order ASC (p-1, p-2, p-3), then unpinned by created_at DESC (u-2, u-1)
      expect(sorted.map((item) => item.id)).toEqual(['p-1', 'p-2', 'p-3', 'u-2', 'u-1']);
    });

    it('handles items with null or missing properties gracefully', () => {
      const incomplete1 = { id: 'inc-1' };
      const incomplete2 = { id: 'inc-2', is_pinned: null, pin_order: undefined };
      const pinned = { id: 'pinned', is_pinned: true, pin_order: 1 };

      expect(() => {
        [incomplete1, pinned, incomplete2].sort(compareTestimonialsByPinned);
      }).not.toThrow();

      const sorted = [incomplete1, pinned, incomplete2].sort(compareTestimonialsByPinned);
      expect(sorted[0].id).toBe('pinned');
    });
  });
});
