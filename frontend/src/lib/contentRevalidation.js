import { supabase } from './supabase';

export function createConditionRouteSnapshot(condition) {
  if (!condition?.service_id || !condition?.body_system_id || !condition?.slug) {
    return null;
  }

  return {
    serviceId: condition.service_id,
    bodySystemId: condition.body_system_id,
    conditionSlug: condition.slug,
  };
}

export async function revalidateConditionRoutes(routes) {
  const snapshots = (routes || [])
    .map((route) => createConditionRouteSnapshot({
      service_id: route?.serviceId || route?.service_id,
      body_system_id: route?.bodySystemId || route?.body_system_id,
      slug: route?.conditionSlug || route?.slug,
    }))
    .filter(Boolean);

  if (snapshots.length === 0) {
    return { revalidated: [], skipped: true };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error('Your admin session expired. Sign in again to refresh the public pages.');
  }

  const response = await fetch('/api/revalidate-condition', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ routes: snapshots }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'Public page refresh failed.');
  }

  return result;
}
