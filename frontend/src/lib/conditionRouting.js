const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeContentSlug(value) {
  return typeof value === 'string' && SAFE_SLUG_PATTERN.test(value);
}

export function buildConditionPath({ serviceSlug, bodySystemSlug, conditionSlug }) {
  if (![serviceSlug, bodySystemSlug, conditionSlug].every(isSafeContentSlug)) {
    return null;
  }

  return `/services/${serviceSlug}/${bodySystemSlug}/${conditionSlug}`;
}

export function getCanonicalConditionPath(condition) {
  return buildConditionPath({
    serviceSlug: condition?.service?.slug,
    bodySystemSlug: condition?.body_system?.slug,
    conditionSlug: condition?.slug,
  });
}

export function getConditionRoutingDecision({ requestedService, requestedBodySystem, condition }) {
  const canonicalPath = getCanonicalConditionPath(condition);
  const relationshipsAreConsistent = Boolean(
    canonicalPath
    && condition?.service_id
    && condition?.body_system_id
    && condition.service_id === condition.service?.id
    && condition.body_system_id === condition.body_system?.id
  );

  if (!relationshipsAreConsistent || !requestedService?.id || !requestedBodySystem?.id) {
    return { type: 'notFound' };
  }

  const requestedPath = buildConditionPath({
    serviceSlug: requestedService.slug,
    bodySystemSlug: requestedBodySystem.slug,
    conditionSlug: condition.slug,
  });

  if (
    requestedPath !== canonicalPath
    || requestedService.id !== condition.service_id
    || requestedBodySystem.id !== condition.body_system_id
  ) {
    return { type: 'redirect', destination: canonicalPath };
  }

  return { type: 'render', canonicalPath };
}
