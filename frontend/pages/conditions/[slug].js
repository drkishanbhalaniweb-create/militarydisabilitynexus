import { supabase } from '../../src/lib/supabase';
import { getCanonicalConditionPath, isSafeContentSlug } from '../../src/lib/conditionRouting';

const LegacyConditionRedirect = () => null;

export async function getServerSideProps({ params, res }) {
  const slug = params?.slug;

  res.setHeader('Cache-Control', 'private, no-store');

  if (!isSafeContentSlug(slug)) {
    return { notFound: true };
  }

  try {
    const { data, error } = await supabase
      .from('conditions')
      .select(`
        slug,
        service_id,
        body_system_id,
        service:services!inner(id, slug, is_active),
        body_system:body_systems!inner(id, slug, is_published)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .eq('service.is_active', true)
      .eq('body_system.is_published', true)
      .limit(2);

    if (error) throw error;

    // Slugs are unique per service, so an ambiguous legacy slug must not guess.
    if (!data || data.length !== 1) {
      return { notFound: true };
    }

    const destination = getCanonicalConditionPath(data[0]);
    if (!destination) {
      return { notFound: true };
    }

    return {
      redirect: {
        destination,
        permanent: true,
      },
    };
  } catch (error) {
    console.error(`Failed to resolve legacy condition route ${slug}:`, error);
    return { notFound: true };
  }
}

export default LegacyConditionRedirect;
