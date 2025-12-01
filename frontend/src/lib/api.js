import { supabase, STORAGE_BUCKETS } from './supabase';

// ============================================
// SERVICES
// ============================================

export const servicesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
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
// CONTACTS
// ============================================

export const contactsApi = {
  async submit(contactData) {
    // Convert serviceTypes array to a comma-separated string for subject
    const subject = contactData.serviceTypes && contactData.serviceTypes.length > 0
      ? contactData.serviceTypes.map(type => 
          type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        ).join(', ')
      : contactData.subject || 'General Inquiry';

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || null,
          subject: subject,
          message: contactData.message,
          service_interest: contactData.serviceTypes ? contactData.serviceTypes.join(', ') : (contactData.serviceInterest || contactData.service || null),
          status: 'new',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// GENERIC FORM SUBMISSION
// ============================================

export const submitGenericForm = async (formData) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: 'Generic Form Submission',
        message: formData.additionalDetails || 'No additional details provided',
        status: 'new',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
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
  async submit(formData) {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([
        {
          form_type: formData.formType,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          form_data: formData.formData || {},
          requires_upload: formData.requiresUpload || false,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
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
fileUploadApi.upload = async function(file, contactIdOrFormId, category = 'other', isFormSubmission = false) {
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

  // Update form submission to mark it has uploads
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
          client_name: caseStudyData.client_name || null,
          excerpt: caseStudyData.excerpt,
          content_html: caseStudyData.content_html,
          challenge: caseStudyData.challenge || null,
          solution: caseStudyData.solution || null,
          results: caseStudyData.results || null,
          featured_image: caseStudyData.featured_image || null,
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
      client_name: caseStudyData.client_name || null,
      excerpt: caseStudyData.excerpt,
      content_html: caseStudyData.content_html,
      challenge: caseStudyData.challenge || null,
      solution: caseStudyData.solution || null,
      results: caseStudyData.results || null,
      featured_image: caseStudyData.featured_image || null,
      is_published: caseStudyData.is_published,
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

export default {
  services: servicesApi,
  blog: blogApi,
  contacts: contactsApi,
  fileUpload: fileUploadApi,
  formSubmissions: formSubmissionsApi,
  caseStudy: caseStudyApi,
};
