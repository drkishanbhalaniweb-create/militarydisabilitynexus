import { describe, expect, test } from 'vitest';
import { calculatePrice, formatPrice, SERVICE_PRICING } from '../../src/lib/payment';

describe('payment helpers', () => {
  test('calculates base and rush pricing in cents', () => {
    expect(calculatePrice('nexus_letter')).toBe(SERVICE_PRICING.nexus_letter.basePrice);
    expect(calculatePrice('nexus_letter', true)).toBe(
      SERVICE_PRICING.nexus_letter.basePrice + SERVICE_PRICING.nexus_letter.rushFee,
    );
    expect(calculatePrice('missing_service')).toBe(0);
  });

  test('uses custom pricing when provided', () => {
    expect(
      calculatePrice('review', true, {
        review: { basePrice: 1000, rushFee: 250 },
      }),
    ).toBe(1250);
  });

  test('formats cents as US dollars', () => {
    expect(formatPrice(22500)).toBe('$225.00');
    expect(formatPrice(200000)).toBe('$2,000.00');
  });
});
