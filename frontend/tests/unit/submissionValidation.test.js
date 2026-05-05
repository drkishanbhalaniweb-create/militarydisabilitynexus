import { describe, expect, test } from 'vitest';
import {
  createSubmissionMeta,
  prepareContactSubmission,
  prepareFormSubmission,
  sanitizeEmail,
  sanitizeFormDataObject,
  sanitizeInlineText,
  sanitizeMultilineText,
  validateSubmissionMeta,
} from '../../src/lib/submissionValidation';

describe('submission validation', () => {
  test('normalizes inline, multiline, and email values', () => {
    expect(sanitizeInlineText('  Pat\t\tVeteran\nClaim  ')).toBe('Pat Veteran Claim');
    expect(sanitizeMultilineText(' First line\n\n\n\n Second line ')).toBe('First line\n\nSecond line');
    expect(sanitizeEmail('  PAT@EXAMPLE.COM ')).toBe('pat@example.com');
  });

  test('rejects invalid anti-spam metadata', () => {
    expect(() => validateSubmissionMeta(createSubmissionMeta({ honeypot: 'bot' }))).toThrow(
      /Unable to process/,
    );
    expect(() => validateSubmissionMeta({ startedAt: 1000, submittedAt: 1500 })).toThrow(
      /wait a few seconds/,
    );
  });

  test('prepares contact submissions with sanitized fields', () => {
    const prepared = prepareContactSubmission({
      name: ' Pat Veteran ',
      email: 'PAT@example.COM',
      phone: '(888) 555-1212',
      serviceTypes: ['nexus_letter', 'not_allowed'],
      message: ' I need help understanding my VA claim evidence. ',
    });

    expect(prepared).toMatchObject({
      name: 'Pat Veteran',
      email: 'pat@example.com',
      phone: '(888) 555-1212',
      subject: 'Nexus Letter',
      serviceInterest: 'nexus_letter',
      serviceTypes: ['nexus_letter'],
    });
  });

  test('prepares form submissions and filters nested service selections', () => {
    const prepared = prepareFormSubmission({
      formType: 'nexus_letter',
      fullName: ' Pat Veteran ',
      email: 'pat@example.com',
      phone: '8885551212',
      requiresUpload: true,
      formData: {
        selectedServices: ['dbq', 'bad_value'],
        message: 'Line 1\n\n\nLine 2',
        internal: undefined,
      },
    });

    expect(prepared.formType).toBe('nexus_letter');
    expect(prepared.requiresUpload).toBe(true);
    expect(prepared.formData.selectedServices).toEqual(['dbq']);
    expect(prepared.formData.message).toBe('Line 1\n\nLine 2');
    expect(prepared.formData).not.toHaveProperty('internal');
  });

  test('rejects invalid required fields', () => {
    expect(() => prepareContactSubmission({ name: 'P', email: 'bad', message: 'short' })).toThrow(
      /valid email/,
    );
    expect(() =>
      prepareFormSubmission({ formType: 'unknown', fullName: 'Pat', email: 'pat@example.com' }),
    ).toThrow(/valid service type/);
  });

  test('sanitizes arbitrary JSON form data without accepting arrays at the root', () => {
    expect(sanitizeFormDataObject([{ bad: true }])).toEqual({});
    expect(
      sanitizeFormDataObject({
        nested: { note: '  hello\u0000 world  ' },
        values: ['  a  ', undefined, 2],
      }),
    ).toEqual({
      nested: { note: 'hello world' },
      values: ['a', 2],
    });
  });
});
