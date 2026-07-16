import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import {
  buildConditionPath,
  getCanonicalConditionPath,
  getConditionRoutingDecision,
} from '../../src/lib/conditionRouting';

const require = createRequire(import.meta.url);

const service = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'independent-medical-opinion-nexus-letter',
};
const pulmonology = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 'pulmonology',
};
const mentalHealth = {
  id: '33333333-3333-4333-8333-333333333333',
  slug: 'mental-health',
};
const sleepApnea = {
  slug: 'sleep-apnea-nexus-letter',
  service_id: service.id,
  body_system_id: pulmonology.id,
  service,
  body_system: pulmonology,
};

describe('condition routing', () => {
  test('builds the canonical route from stored relationships', () => {
    expect(getCanonicalConditionPath(sleepApnea)).toBe(
      '/services/independent-medical-opinion-nexus-letter/pulmonology/sleep-apnea-nexus-letter',
    );
  });

  test('redirects a valid but incorrect body-system URL to the canonical route', () => {
    expect(
      getConditionRoutingDecision({
        requestedService: service,
        requestedBodySystem: mentalHealth,
        condition: sleepApnea,
      }),
    ).toEqual({
      type: 'redirect',
      destination:
        '/services/independent-medical-opinion-nexus-letter/pulmonology/sleep-apnea-nexus-letter',
    });
  });

  test('renders only when both route relationships match the condition', () => {
    expect(
      getConditionRoutingDecision({
        requestedService: service,
        requestedBodySystem: pulmonology,
        condition: sleepApnea,
      }).type,
    ).toBe('render');
  });

  test('fails closed when a stored relationship is inconsistent', () => {
    expect(
      getConditionRoutingDecision({
        requestedService: service,
        requestedBodySystem: pulmonology,
        condition: { ...sleepApnea, body_system_id: mentalHealth.id },
      }),
    ).toEqual({ type: 'notFound' });
  });

  test('rejects unsafe route segments', () => {
    expect(
      buildConditionPath({
        serviceSlug: service.slug,
        bodySystemSlug: '../mental-health',
        conditionSlug: sleepApnea.slug,
      }),
    ).toBeNull();
  });

  test('does not register a build-time condition catch-all redirect', async () => {
    const nextConfig = require('../../next.config.js');
    const redirects = await nextConfig.redirects();

    expect(redirects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ source: '/conditions/:slug' })]),
    );
  });
});
