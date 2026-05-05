import { supabase } from './supabase';

const BUCKET_NAME = 'lead-magnets';
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'application/x-pdf'];

const hasPdfExtension = (fileName = '') => fileName.toLowerCase().endsWith('.pdf');

const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const safeBaseName = originalName
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'lead-magnet';

  return `${timestamp}-${safeBaseName}-${random}.pdf`;
};

export const validatePdf = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No PDF selected');
    return { valid: false, errors };
  }

  const looksLikePdf = ALLOWED_TYPES.includes(file.type) || hasPdfExtension(file.name);
  if (!looksLikePdf) {
    errors.push('Please upload a PDF file.');
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`PDF is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const uploadLeadMagnetPdf = async (file, folder = 'pdfs') => {
  const validation = validatePdf(file);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const fileName = generateFileName(file.name);
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) throw error;

  return {
    bucket: BUCKET_NAME,
    path: filePath,
    originalName: file.name,
    size: file.size,
  };
};
