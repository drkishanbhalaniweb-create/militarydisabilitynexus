import { supabase, STORAGE_BUCKETS } from './supabase';
import {
  createSubmissionMeta,
  prepareContactSubmission,
  prepareFormSubmission,
} from './submissionValidation';

// ============================================
// SERVICES
// ============================================

export const servicesApi = {
  async getAll() {
    const { data: dbServices, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return dbServices;
  },

  async getBySlug(slug) {
    const { data: dbService, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(); // Use maybeSingle to avoid error on not found

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is JSON object is null, though maybeSingle shouldn't throw it

    if (dbService) return dbService;

    // If we're here, it's truly not found
    return null;
  },

  async delete(id) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

// ============================================
// BLOG
// ============================================

export const blogApi = {
  async getAll(limit = 100) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    return data;
  },

  async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .in('id', ids)
      .eq('is_published', true);

    if (error) throw error;
    return data;
  },

  async search(query, category = null) {
    let queryBuilder = supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true);

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,excerpt.ilike.%${query}%,content_html.ilike.%${query}%`
      );
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error } = await queryBuilder
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },
};

// ============================================
// TESTIMONIALS
// ============================================

export const testimonialApi = {
  normalize(testimonial) {
    if (!testimonial) {
      return null;
    }

    return {
      ...testimonial,
      name: testimonial.name || testimonial.client_name || '',
      branch: testimonial.branch || testimonial.client_title || '',
      feedback: testimonial.feedback || testimonial.testimonial_text || '',
      tags: testimonial.tags || [],
      rating: testimonial.rating || 0,
    };
  },

  async getAll(limit = null) {
    let query = supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((testimonial) => testimonialApi.normalize(testimonial));
  },

  async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .in('id', ids)
      .eq('is_published', true);

    if (error) throw error;
    return (data || []).map((testimonial) => testimonialApi.normalize(testimonial));
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return testimonialApi.normalize(data);
  },

  async create(testimonialData) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([
        {
          name: testimonialData.name,
          branch: testimonialData.branch,
          tags: testimonialData.tags || [],
          rating: testimonialData.rating,
          feedback: testimonialData.feedback,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return testimonialApi.normalize(data);
  },

  async update(id, testimonialData) {
    const { data, error } = await supabase
      .from('testimonials')
      .update({
        name: testimonialData.name,
        branch: testimonialData.branch,
        tags: testimonialData.tags || [],
        rating: testimonialData.rating,
        feedback: testimonialData.feedback,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return testimonialApi.normalize(data);
  },

  async delete(id) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

// ============================================
// CONTACTS
// ============================================

export const contactsApi = {
  async submit(contactData, submissionMeta = null) {
    const preparedContact = prepareContactSubmission(contactData);

    const response = await fetch('/api/submit-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...preparedContact,
        meta: submissionMeta ? createSubmissionMeta(submissionMeta) : undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to submit contact form.');
    }

    return result.contact;
  },
};

// ============================================
// GENERIC FORM SUBMISSION
// ============================================

export const submitGenericForm = async (formData) => {
  return contactsApi.submit({
    name: formData.name,
    email: formData.email,
    phone: formData.phone || null,
    subject: 'Generic Form Submission',
    message: formData.additionalDetails || 'No additional details provided',
  });
};

// ============================================
// FILE UPLOADS
// ============================================

export const fileUploadApi = {
  async upload(file, contactId, category = 'other') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contactId}/${Date.now()}.${fileExt}`;

    // Validate category - must be one of the allowed values
    const validCategories = ['medical_record', 'insurance', 'identification', 'other'];
    const validCategory = validCategories.includes(category) ? category : 'other';

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(STORAGE_BUCKETS.MEDICAL_DOCUMENTS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (storageError) throw storageError;

    // Create database record
    const { data: dbData, error: dbError } = await supabase
      .from('file_uploads')
      .insert([
        {
          contact_id: contactId,
          original_filename: file.name,
          storage_path: storageData.path,
          file_size: file.size,
          mime_type: file.type,
          file_category: validCategory,
          upload_status: 'uploaded',
          is_phi: true,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;
    return dbData;
  },

  async getAll(contactId = null, formSubmissionId = null) {
    let query = supabase
      .from('file_uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (formSubmissionId) {
      query = query.eq('form_submission_id', formSubmissionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(fileId) {
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) throw error;
    return data;
  },

  async getDownloadUrl(storagePath) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.MEDICAL_DOCUMENTS)
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  },

  async delete(fileId, storagePath) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKETS.MEDICAL_DOCUMENTS)
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete database record
    const { error: dbError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;
    return true;
  },
};

// ============================================
// FORM SUBMISSIONS
// ============================================

export const formSubmissionsApi = {
  async submit(formData, submissionMeta = null) {
    const preparedSubmission = prepareFormSubmission(formData);

    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...preparedSubmission,
        meta: submissionMeta ? createSubmissionMeta(submissionMeta) : undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to submit form.');
    }

    return result.submission;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

// Update file upload to support form submissions
const originalUpload = fileUploadApi.upload;
fileUploadApi.upload = async function (file, contactIdOrFormId, category = 'other', isFormSubmission = false) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${contactIdOrFormId}/${Date.now()}.${fileExt}`;

  const validCategories = ['medical_record', 'insurance', 'identification', 'other'];
  const validCategory = validCategories.includes(category) ? category : 'other';

  const { data: storageData, error: storageError } = await supabase.storage
    .from(STORAGE_BUCKETS.MEDICAL_DOCUMENTS)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (storageError) throw storageError;

  const insertData = {
    original_filename: file.name,
    storage_path: storageData.path,
    file_size: file.size,
    mime_type: file.type,
    file_category: validCategory,
    upload_status: 'uploaded',
    is_phi: true,
  };

  if (isFormSubmission) {
    insertData.form_submission_id = contactIdOrFormId;
  } else {
    insertData.contact_id = contactIdOrFormId;
  }

  const { data: dbData, error: dbError } = await supabase
    .from('file_uploads')
    .insert([insertData])
    .select()
    .single();

  if (dbError) throw dbError;

  // Update parent record to mark it has uploads
  if (isFormSubmission) {
    await supabase
      .from('form_submissions')
      .update({ has_uploads: true })
      .eq('id', contactIdOrFormId);
  }

  return dbData;
};

// ============================================
// CASE STUDIES
// ============================================

// Utility function to generate slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Check if slug exists and generate unique slug if needed
const ensureUniqueSlug = async (slug, excludeId = null) => {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    let query = supabase
      .from('case_studies')
      .select('id')
      .eq('slug', uniqueSlug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
};

export const caseStudyApi = {
  async getAll(includeUnpublished = false) {
    let query = supabase
      .from('case_studies')
      .select('*')
      .order('published_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .in('id', ids)
      .eq('is_published', true);

    if (error) throw error;
    return data;
  },

  async create(caseStudyData) {
    // Generate slug from title if not provided
    let slug = caseStudyData.slug || generateSlug(caseStudyData.title);

    // Ensure slug is unique
    slug = await ensureUniqueSlug(slug);

    const { data, error } = await supabase
      .from('case_studies')
      .insert([
        {
          slug,
          title: caseStudyData.title,
          excerpt: caseStudyData.excerpt,
          content_html: caseStudyData.content_html || caseStudyData.challenge,
          challenge: caseStudyData.challenge || null,
          solution: caseStudyData.solution || null,
          results: caseStudyData.results || null,
          key_takeaway: caseStudyData.key_takeaway || null,
          tags: caseStudyData.tags || [],
          is_published: caseStudyData.is_published !== undefined ? caseStudyData.is_published : true,
          published_at: caseStudyData.published_at || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, caseStudyData) {
    const updateData = {
      title: caseStudyData.title,
      excerpt: caseStudyData.excerpt,
      content_html: caseStudyData.content_html || caseStudyData.challenge,
      challenge: caseStudyData.challenge || null,
      solution: caseStudyData.solution || null,
      results: caseStudyData.results || null,
      key_takeaway: caseStudyData.key_takeaway || null,
      tags: caseStudyData.tags || [],
      is_published: caseStudyData.is_published,
      published_at: caseStudyData.published_at,
    };

    // If slug is provided and different, ensure it's unique
    if (caseStudyData.slug) {
      const slug = generateSlug(caseStudyData.slug);
      updateData.slug = await ensureUniqueSlug(slug, id);
    }

    const { data, error } = await supabase
      .from('case_studies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('case_studies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async togglePublished(id, currentStatus) {
    const { data, error } = await supabase
      .from('case_studies')
      .update({ is_published: !currentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementViews(slug) {
    const { error } = await supabase.rpc('increment_case_study_views', {
      study_slug: slug,
    });

    if (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for view increment failures
    }
  },
};

// ============================================
// CLINICAL PROFILES
// ============================================

export const clinicalProfileApi = {
  async getAll(activeOnly = true) {
    let query = supabase
      .from('clinical_profiles')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('clinical_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  async getById(id) {
    if (!id) return null;
    const { data, error } = await supabase
      .from('clinical_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(profileData) {
    let slug = profileData.slug || generateSlug(profileData.full_name);

    // Ensure unique slug within clinical_profiles
    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const { data } = await supabase
        .from('clinical_profiles')
        .select('id')
        .eq('slug', uniqueSlug);

      if (!data || data.length === 0) break;
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    const { data, error } = await supabase
      .from('clinical_profiles')
      .insert([{
        slug: uniqueSlug,
        full_name: profileData.full_name,
        credentials: profileData.credentials || null,
        photo_url: profileData.photo_url || null,
        bio: profileData.bio,
        linkedin_url: profileData.linkedin_url || null,
        is_active: profileData.is_active !== undefined ? profileData.is_active : true,
        display_order: profileData.display_order || 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, profileData) {
    const updateData = {
      full_name: profileData.full_name,
      credentials: profileData.credentials || null,
      photo_url: profileData.photo_url || null,
      bio: profileData.bio,
      linkedin_url: profileData.linkedin_url || null,
      is_active: profileData.is_active,
      display_order: profileData.display_order || 0,
    };

    if (profileData.slug) {
      const slug = generateSlug(profileData.slug);
      let uniqueSlug = slug;
      let counter = 1;
      while (true) {
        const { data } = await supabase
          .from('clinical_profiles')
          .select('id')
          .eq('slug', uniqueSlug)
          .neq('id', id);

        if (!data || data.length === 0) break;
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
      updateData.slug = uniqueSlug;
    }

    const { data, error } = await supabase
      .from('clinical_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('clinical_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleActive(id, currentStatus) {
    const { data, error } = await supabase
      .from('clinical_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// CONDITIONS (Programmatic SEO)
// ============================================

export const conditionApi = {
  async getAll(includeUnpublished = false, serviceId = null) {
    let query = supabase
      .from('conditions')
      .select('*, service:services(*)')
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getBySlug(slug, serviceId = null) {
    let query = supabase
      .from('conditions')
      .select('*, service:services(*), body_system:body_systems(*)')
      .eq('slug', slug)
      .eq('is_published', true);
      
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    
    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('conditions')
      .select('*, service:services(*), body_system:body_systems(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByBodySystem(systemId, serviceId = null) {
    let query = supabase
      .from('conditions')
      .select('*')
      .eq('body_system_id', systemId)
      .eq('is_published', true)
      .order('display_order', { ascending: true });
      
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(conditionData) {
    let slug = conditionData.slug || generateSlug(conditionData.page_title);

    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      let q = supabase
        .from('conditions')
        .select('id')
        .eq('slug', uniqueSlug);
        
      if (conditionData.service_id) {
        q = q.eq('service_id', conditionData.service_id);
      }
      
      const { data } = await q;

      if (!data || data.length === 0) break;
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    const { data, error } = await supabase
      .from('conditions')
      .insert([{
        slug: uniqueSlug,
        page_title: conditionData.page_title,
        meta_description: conditionData.meta_description,
        hero_description: conditionData.hero_description || null,
        hero_heading: conditionData.hero_heading,
        content_html: conditionData.content_html,
        faqs: conditionData.faqs || [],
        service_id: conditionData.service_id || null,
        is_published: conditionData.is_published !== undefined ? conditionData.is_published : true,
        body_system_id: conditionData.body_system_id || null,
        icon: conditionData.icon || '📋',
        short_description: conditionData.short_description || null,
        display_order: conditionData.display_order || 0,
        dc_code: conditionData.dc_code || null,
        dc_name: conditionData.dc_name || null,
        ratings: conditionData.ratings || [],
        features: conditionData.features || [],
        secondary_connections: conditionData.secondary_connections || [],
        specialist_guide: conditionData.specialist_guide || [],
        paired_conditions: conditionData.paired_conditions || [],
        pair_note: conditionData.pair_note || null,
        seo_keywords: conditionData.seo_keywords || [],
        internal_links: conditionData.internal_links || [],
        stat_cards: conditionData.stat_cards || [],
        layout_sections: conditionData.layout_sections || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, conditionData) {
    const updateData = {
      page_title: conditionData.page_title,
      meta_description: conditionData.meta_description,
      hero_description: conditionData.hero_description || null,
      hero_heading: conditionData.hero_heading,
      content_html: conditionData.content_html,
      faqs: conditionData.faqs || [],
      service_id: conditionData.service_id || null,
      is_published: conditionData.is_published,
      body_system_id: conditionData.body_system_id || null,
      icon: conditionData.icon || '📋',
      short_description: conditionData.short_description || null,
      display_order: conditionData.display_order || 0,
      dc_code: conditionData.dc_code || null,
      dc_name: conditionData.dc_name || null,
      ratings: conditionData.ratings || [],
      features: conditionData.features || [],
      secondary_connections: conditionData.secondary_connections || [],
      specialist_guide: conditionData.specialist_guide || [],
      paired_conditions: conditionData.paired_conditions || [],
      pair_note: conditionData.pair_note || null,
      seo_keywords: conditionData.seo_keywords || [],
      internal_links: conditionData.internal_links || [],
      stat_cards: conditionData.stat_cards || [],
      layout_sections: conditionData.layout_sections || null,
    };

    if (conditionData.slug) {
      const slug = generateSlug(conditionData.slug);
      
      // If we are checking uniqueness, we need to know the service_id.
      // If it's not in conditionData, we'll let the database throw a unique constraint error if it collides.
      let q = supabase
        .from('conditions')
        .select('id')
        .eq('slug', slug)
        .neq('id', id);
        
      if (conditionData.service_id) {
        q = q.eq('service_id', conditionData.service_id);
      }
        
      const { data } = await q;
        
      if (data && data.length > 0) {
        throw new Error('A condition with this slug already exists for the selected service.');
      }
      updateData.slug = slug;
    }

    const { data, error } = await supabase
      .from('conditions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('conditions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

// ============================================
// PRICING TIERS
// ============================================

export const pricingTierApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(tierData) {
    let slug = tierData.slug || generateSlug(tierData.name);

    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const { data } = await supabase
        .from('pricing_tiers')
        .select('id')
        .eq('slug', uniqueSlug);

      if (!data || data.length === 0) break;
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    const { data, error } = await supabase
      .from('pricing_tiers')
      .insert([{
        slug: uniqueSlug,
        name: tierData.name,
        provider_description: tierData.provider_description || null,
        base_price: tierData.base_price,
        mental_health_price: tierData.mental_health_price || null,
        note: tierData.note || null,
        best_for: tierData.best_for || null,
        features: tierData.features || [],
        is_featured: tierData.is_featured || false,
        display_order: tierData.display_order || 0,
        is_active: tierData.is_active !== undefined ? tierData.is_active : true,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, tierData) {
    const updateData = {
      name: tierData.name,
      provider_description: tierData.provider_description || null,
      base_price: tierData.base_price,
      mental_health_price: tierData.mental_health_price || null,
      note: tierData.note || null,
      best_for: tierData.best_for || null,
      features: tierData.features || [],
      is_featured: tierData.is_featured || false,
      display_order: tierData.display_order || 0,
      is_active: tierData.is_active,
    };

    if (tierData.slug) {
      const slug = generateSlug(tierData.slug);
      const { data: existing } = await supabase
        .from('pricing_tiers')
        .select('id')
        .eq('slug', slug)
        .neq('id', id);

      if (existing && existing.length > 0) {
        throw new Error('A pricing tier with this slug already exists.');
      }
      updateData.slug = slug;
    }

    const { data, error } = await supabase
      .from('pricing_tiers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('pricing_tiers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleActive(id, currentStatus) {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .update({ is_active: !currentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// BODY SYSTEMS
// ============================================

export const bodySystemApi = {
  async getAll(includeUnpublished = false) {
    let query = supabase
      .from('body_systems')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('body_systems')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    return data;
  },

  async getById(id) {
    if (!id) return null;
    const { data, error } = await supabase
      .from('body_systems')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(systemData) {
    let slug = systemData.slug || generateSlug(systemData.name);

    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const { data } = await supabase
        .from('body_systems')
        .select('id')
        .eq('slug', uniqueSlug);

      if (!data || data.length === 0) break;
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    const { data, error } = await supabase
      .from('body_systems')
      .insert([{
        slug: uniqueSlug,
        name: systemData.name,
        icon: systemData.icon,
        description: systemData.description,
        overview: systemData.overview,
        hero_description: systemData.hero_description || null,
        is_mental_health: systemData.is_mental_health || false,
        specialist_guide: systemData.specialist_guide || [],
        paired_systems: systemData.paired_systems || [],
        pair_note: systemData.pair_note || null,
        stat_cards: systemData.stat_cards || [],
        build_trust_links: systemData.build_trust_links || [],
        faqs: systemData.faqs || [],
        pathways: systemData.pathways || [],
        challenges: systemData.challenges || [],
        service_descriptions: systemData.service_descriptions || [],
        display_order: systemData.display_order || 0,
        is_published: systemData.is_published !== undefined ? systemData.is_published : true,
        pathways_intro: systemData.pathways_intro || null,
        challenges_title: systemData.challenges_title || null,
        services_title: systemData.services_title || null,
        services_intro: systemData.services_intro || null,
        paired_title: systemData.paired_title || null,
        cta_price: systemData.cta_price || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, systemData) {
    const updateData = {
      name: systemData.name,
      icon: systemData.icon,
      description: systemData.description,
      overview: systemData.overview,
      hero_description: systemData.hero_description || null,
      is_mental_health: systemData.is_mental_health || false,
      specialist_guide: systemData.specialist_guide || [],
      paired_systems: systemData.paired_systems || [],
      pair_note: systemData.pair_note || null,
      stat_cards: systemData.stat_cards || [],
      build_trust_links: systemData.build_trust_links || [],
      faqs: systemData.faqs || [],
      pathways: systemData.pathways || [],
      challenges: systemData.challenges || [],
      service_descriptions: systemData.service_descriptions || [],
      display_order: systemData.display_order || 0,
      is_published: systemData.is_published,
      pathways_intro: systemData.pathways_intro || null,
      challenges_title: systemData.challenges_title || null,
      services_title: systemData.services_title || null,
      services_intro: systemData.services_intro || null,
      paired_title: systemData.paired_title || null,
      cta_price: systemData.cta_price || null,
    };

    if (systemData.slug) {
      const slug = generateSlug(systemData.slug);
      const { data: existing } = await supabase
        .from('body_systems')
        .select('id')
        .eq('slug', slug)
        .neq('id', id);

      if (existing && existing.length > 0) {
        throw new Error('A body system with this slug already exists.');
      }
      updateData.slug = slug;
    }

    const { data, error } = await supabase
      .from('body_systems')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('body_systems')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async togglePublished(id, currentStatus) {
    const { data, error } = await supabase
      .from('body_systems')
      .update({ is_published: !currentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default {
  services: servicesApi,
  blog: blogApi,
  testimonials: testimonialApi,
  contacts: contactsApi,
  fileUpload: fileUploadApi,
  formSubmissions: formSubmissionsApi,
  caseStudy: caseStudyApi,
  clinicalProfile: clinicalProfileApi,
  condition: conditionApi,
  pricingTier: pricingTierApi,
  bodySystem: bodySystemApi,
};
