import { describe, expect, test } from 'vitest';
import {
  canPreview,
  formatFileSize,
  getFileCategory,
  getFileExtension,
  getFileTypeLabel,
  getMimeTypeFromExtension,
  getPreviewType,
  isValidFileExtension,
  validateFile,
} from '../../src/lib/fileTypeDetection';

describe('file type detection', () => {
  test('detects extensions, MIME types, and preview capability', () => {
    expect(getFileExtension('records.PDF')).toBe('pdf');
    expect(getMimeTypeFromExtension('scan.jpg')).toBe('image/jpeg');
    expect(getFileCategory('application/pdf')).toBe('pdf');
    expect(canPreview('image/png')).toBe(true);
    expect(getPreviewType('application/msword')).toBe('none');
  });

  test('validates extensions, MIME types, and sizes', () => {
    expect(isValidFileExtension('claim.pdf', ['pdf'])).toBe(true);
    expect(
      validateFile(
        { name: 'claim.exe', mime_type: 'application/x-msdownload', size: 100 },
        { allowedExtensions: ['pdf'] },
      ),
    ).toMatchObject({ valid: false, error: expect.stringContaining('File type not allowed') });
    expect(
      validateFile(
        { name: 'claim.pdf', mime_type: 'application/pdf', size: 10_000 },
        { allowedMimeTypes: ['application/pdf'], maxSize: 1_000 },
      ),
    ).toMatchObject({ valid: false, error: expect.stringContaining('exceeds') });
  });

  test('formats labels and sizes for UI display', () => {
    expect(getFileTypeLabel('application/pdf', 'claim.pdf')).toBe('PDF Document');
    expect(getFileTypeLabel('', 'archive.7z')).toBe('7Z File');
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
});
