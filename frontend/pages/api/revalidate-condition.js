import { supabaseAdmin } from '../../src/lib/supabaseAdmin';
import {
  buildConditionPath,
  getCanonicalConditionPath,
  isSafeContentSlug,
} from '../../src/lib/conditionRouting';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_ROUTE_SNAPSHOTS = 6;

function normalizeRouteSnapshots(routes) {
  if (!Array.isArray(routes) || routes.length === 0 || routes.length > MAX_ROUTE_SNAPSHOTS) {
    return [];
  }

  const uniqueRoutes = new Map();

  routes.forEach((route) => {
    if (
      UUID_PATTERN.test(route?.serviceId)
      && UUID_PATTERN.test(route?.bodySystemId)
      && isSafeContentSlug(route?.conditionSlug)
    ) {
      const key = `${route.serviceId}:${route.bodySystemId}:${route.conditionSlug}`;
      uniqueRoutes.set(key, {
        serviceId: route.serviceId,
        bodySystemId: route.bodySystemId,
        conditionSlug: route.conditionSlug,
      });
    }
  });

  return [...uniqueRoutes.values()];
}

async function requireActiveAdmin(req) {
  const authorization = req.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) return null;

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(match[1]);
  if (authError || !authData.user) return null;

  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('id', authData.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (adminError || !admin) return null;
  return admin;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await requireActiveAdmin(req);
    if (!admin) {
      return res.status(401).json({ error: 'An active admin session is required.' });
    }

    const routeSnapshots = normalizeRouteSnapshots(req.body?.routes);
    if (routeSnapshots.length === 0) {
      return res.status(400).json({ error: 'No valid condition routes were provided.' });
    }

    const serviceIds = [...new Set(routeSnapshots.map((route) => route.serviceId))];
    const bodySystemIds = [...new Set(routeSnapshots.map((route) => route.bodySystemId))];
    const conditionSlugs = [...new Set(routeSnapshots.map((route) => route.conditionSlug))];

    const [servicesResult, bodySystemsResult, currentConditionsResult] = await Promise.all([
      supabaseAdmin.from('services').select('id, slug').in('id', serviceIds),
      supabaseAdmin.from('body_systems').select('id, slug').in('id', bodySystemIds),
      supabaseAdmin
        .from('conditions')
        .select(`
          slug,
          service_id,
          body_system_id,
          service:services(id, slug),
          body_system:body_systems(id, slug)
        `)
        .in('slug', conditionSlugs)
        .eq('is_published', true),
    ]);

    const queryError = servicesResult.error
      || bodySystemsResult.error
      || currentConditionsResult.error;
    if (queryError) throw queryError;

    const servicesById = new Map((servicesResult.data || []).map((service) => [service.id, service]));
    const bodySystemsById = new Map(
      (bodySystemsResult.data || []).map((bodySystem) => [bodySystem.id, bodySystem]),
    );
    const paths = new Set(['/services']);

    routeSnapshots.forEach((route) => {
      const service = servicesById.get(route.serviceId);
      const bodySystem = bodySystemsById.get(route.bodySystemId);
      if (!service || !bodySystem) return;

      paths.add(`/services/${service.slug}`);
      paths.add(`/services/${service.slug}/${bodySystem.slug}`);

      const conditionPath = buildConditionPath({
        serviceSlug: service.slug,
        bodySystemSlug: bodySystem.slug,
        conditionSlug: route.conditionSlug,
      });
      if (conditionPath) paths.add(conditionPath);
    });

    (currentConditionsResult.data || []).forEach((condition) => {
      if (
        condition.service_id !== condition.service?.id
        || condition.body_system_id !== condition.body_system?.id
      ) {
        return;
      }

      const currentPath = getCanonicalConditionPath(condition);
      if (!currentPath) return;

      paths.add(`/services/${condition.service.slug}`);
      paths.add(`/services/${condition.service.slug}/${condition.body_system.slug}`);
      paths.add(currentPath);
    });

    const revalidatedPaths = [];
    const failedPaths = [];

    for (const path of paths) {
      try {
        await res.revalidate(path);
        revalidatedPaths.push(path);
      } catch (error) {
        console.error(`Condition page revalidation failed for ${path}:`, error);
        failedPaths.push(path);
      }
    }

    if (failedPaths.length > 0) {
      return res.status(500).json({
        error: 'The condition was saved, but one or more public pages could not be refreshed.',
        failedPaths,
      });
    }

    return res.status(200).json({ revalidated: revalidatedPaths });
  } catch (error) {
    console.error('Condition revalidation error:', error);
    return res.status(500).json({ error: 'Unable to refresh condition pages.' });
  }
}
