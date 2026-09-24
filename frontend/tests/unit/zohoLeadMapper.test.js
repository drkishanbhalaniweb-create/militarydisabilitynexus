import { describe, expect, it } from 'vitest';
import zohoLeadMapper, {
  deriveLeadSource,
  formatAttributionSummary,
  mapContactToZohoLead,
  mapFormSubmissionToZohoLead,
  mapLeadMagnetToZohoLead,
  splitFullName,
} from '../../src/lib/zohoLeadMapper';

describe('zohoLeadMapper module', () => {
  describe('splitFullName', () => {
    it('handles single name properly with Last_Name populated and First_Name empty', () => {
      const result = splitFullName('Alex');
      expect(result).toEqual({ firstName: '', lastName: 'Alex' });
    });

    it('handles standard two-part name', () => {
      const result = splitFullName('John Doe');
      expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
    });

    it('handles multi-part names by putting all prior parts into firstName and last part into lastName', () => {
      const result = splitFullName('John Paul Jones');
      expect(result).toEqual({ firstName: 'John Paul', lastName: 'Jones' });
    });

    it('trims leading, trailing, and excessive internal whitespace', () => {
      const result = splitFullName('   Jane    Marie    Smith   ');
      expect(result).toEqual({ firstName: 'Jane Marie', lastName: 'Smith' });
    });

    it('falls back to "Inquirer" for empty strings, whitespace, null, and undefined', () => {
      expect(splitFullName('')).toEqual({ firstName: '', lastName: 'Inquirer' });
      expect(splitFullName('   ')).toEqual({ firstName: '', lastName: 'Inquirer' });
      expect(splitFullName(null)).toEqual({ firstName: '', lastName: 'Inquirer' });
      expect(splitFullName(undefined)).toEqual({ firstName: '', lastName: 'Inquirer' });
      expect(splitFullName(123)).toEqual({ firstName: '', lastName: 'Inquirer' });
    });

    it('strips non-printable control characters', () => {
      const result = splitFullName('Major\x00 John\x08 Miller\x1F');
      expect(result).toEqual({ firstName: 'Major John', lastName: 'Miller' });
    });

    it('respects maximum length bounds', () => {
      const longFirst = 'A'.repeat(150);
      const longLast = 'B'.repeat(150);
      const result = splitFullName(`${longFirst} ${longLast}`);
      expect(result.firstName.length).toBeLessThanOrEqual(120);
      expect(result.lastName.length).toBeLessThanOrEqual(120);
    });
  });

  describe('deriveLeadSource', () => {
    it('identifies Google Paid (CPC/PPC/Paid) vs Google Organic', () => {
      expect(
        deriveLeadSource({
          last_touch_source: 'google',
          last_touch_medium: 'cpc',
        }),
      ).toBe('Google Ads');

      expect(
        deriveLeadSource({
          last_touch_source: 'google',
          last_touch_medium: 'paid',
        }),
      ).toBe('Google Ads');

      expect(
        deriveLeadSource({
          last_touch_source: 'google',
          last_touch_medium: 'organic',
        }),
      ).toBe('Google / Organic');

      expect(
        deriveLeadSource({
          last_touch_source: 'google',
        }),
      ).toBe('Google / Organic');
    });

    it('identifies known social and search platforms', () => {
      expect(deriveLeadSource({ last_touch_source: 'reddit' })).toBe('Reddit');
      expect(deriveLeadSource({ last_touch_source: 'reddit', last_touch_medium: 'cpc' })).toBe('Reddit Ads');
      expect(deriveLeadSource({ last_touch_source: 'facebook' })).toBe('Facebook');
      expect(deriveLeadSource({ last_touch_source: 'meta', last_touch_medium: 'paid' })).toBe('Facebook Ads');
      expect(deriveLeadSource({ last_touch_source: 'bing', last_touch_medium: 'cpc' })).toBe('Bing Ads');
      expect(deriveLeadSource({ last_touch_source: 'bing' })).toBe('Bing / Organic');
      expect(deriveLeadSource({ last_touch_source: 'youtube' })).toBe('YouTube');
      expect(deriveLeadSource({ last_touch_source: 'linkedin' })).toBe('LinkedIn');
      expect(deriveLeadSource({ last_touch_source: 'twitter' })).toBe('Twitter / X');
      expect(deriveLeadSource({ last_touch_source: 'tiktok' })).toBe('TikTok');
      expect(deriveLeadSource({ last_touch_source: 'instagram' })).toBe('Instagram');
    });

    it('prioritizes last_touch_source over first_touch_source', () => {
      const attribution = {
        first_touch_source: 'google',
        first_touch_medium: 'organic',
        last_touch_source: 'reddit',
      };
      expect(deriveLeadSource(attribution)).toBe('Reddit');
    });

    it('falls back to first_touch_source if last_touch_source is missing', () => {
      const attribution = {
        first_touch_source: 'facebook',
      };
      expect(deriveLeadSource(attribution)).toBe('Facebook');
    });

    it('capitalizes custom recognized sources', () => {
      expect(deriveLeadSource({ last_touch_source: 'veteran_blog' })).toBe('Veteran_blog');
    });

    it('falls back to defaultSource or "Website" when source is empty, direct, or unknown', () => {
      expect(deriveLeadSource({}, 'Website - Contact Form')).toBe('Website - Contact Form');
      expect(deriveLeadSource(null, 'Website - Intake Form')).toBe('Website - Intake Form');
      expect(deriveLeadSource({ last_touch_source: 'direct' }, 'Fallback Form')).toBe('Fallback Form');
      expect(deriveLeadSource({})).toBe('Website');
    });
  });

  describe('formatAttributionSummary', () => {
    it('builds a structured multi-line text block with all fields populated', () => {
      const attribution = {
        last_touch_source: 'google',
        last_touch_medium: 'cpc',
        last_touch_campaign: 'va-nexus-letters-2026',
        last_touch_landing_page: 'https://militarydisabilitynexus.com/nexus-letter',
        referrer_category: 'paid_search',
        device_class: 'desktop',
        anonymous_journey_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        last_touch_at: '2026-09-23T10:00:00.000Z',
      };

      const meta = {
        submittedAt: 1774346400000,
      };

      const summary = formatAttributionSummary(attribution, meta);

      expect(summary).toContain('--- MARKETING & ATTRIBUTION ---');
      expect(summary).toContain('Source / Medium: google / cpc');
      expect(summary).toContain('Campaign: va-nexus-letters-2026');
      expect(summary).toContain('Landing Page: https://militarydisabilitynexus.com/nexus-letter');
      expect(summary).toContain('Referrer Category: paid_search');
      expect(summary).toContain('Device: desktop');
      expect(summary).toContain('Journey ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(summary).toContain('Submitted At:');
    });

    it('handles empty or missing attribution gracefully without throwing', () => {
      const summary = formatAttributionSummary();
      expect(summary).toContain('--- MARKETING & ATTRIBUTION ---');
      expect(summary).toContain('Source / Medium: direct / none');
      expect(summary).toContain('Campaign: N/A');
      expect(summary).toContain('Landing Page: N/A');
      expect(summary).toContain('Device: N/A');
      expect(summary).toContain('Journey ID: N/A');
    });
  });

  describe('mapContactToZohoLead', () => {
    it('builds a complete Zoho Lead record with Company: "Veteran (Self)" and rich Description', () => {
      const contactData = {
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '(555) 234-5678',
        subject: 'Nexus Letter for Sleep Apnea',
        serviceInterest: 'nexus_letter',
        message: 'Looking for assistance with a secondary service connection claim for sleep apnea.',
      };

      const attribution = {
        last_touch_source: 'google',
        last_touch_medium: 'cpc',
        last_touch_campaign: 'nexus-search',
        last_touch_landing_page: '/nexus-letter',
        anonymous_journey_id: '12345678-1234-1234-1234-123456789abc',
      };

      const lead = mapContactToZohoLead(contactData, attribution);

      expect(lead).toEqual({
        First_Name: 'Marcus',
        Last_Name: 'Vance',
        Email: 'marcus.vance@example.com',
        Phone: '(555) 234-5678',
        Company: 'Veteran (Self)',
        Lead_Source: 'Google Ads',
        Description: expect.stringContaining('--- CONTACT FORM INQUIRY ---'),
      });

      expect(lead.Description).toContain('Subject: Nexus Letter for Sleep Apnea');
      expect(lead.Description).toContain('Service Interest: nexus_letter');
      expect(lead.Description).toContain('Looking for assistance with a secondary service connection');
      expect(lead.Description).toContain('--- MARKETING & ATTRIBUTION ---');
      expect(lead.Description).toContain('Source / Medium: google / cpc');
    });

    it('handles single-word names and missing optional fields', () => {
      const contactData = {
        name: 'Jordan',
        email: 'JORDAN@EXAMPLE.COM',
        message: 'Need help with DBQ.',
      };

      const lead = mapContactToZohoLead(contactData);

      expect(lead.First_Name).toBe('');
      expect(lead.Last_Name).toBe('Jordan');
      expect(lead.Email).toBe('jordan@example.com');
      expect(lead.Phone).toBe('');
      expect(lead.Company).toBe('Veteran (Self)');
      expect(lead.Lead_Source).toBe('Website - Contact Form');
      expect(lead.Description).toContain('Subject: General Inquiry');
    });

    it('allows overriding Company if explicitly provided', () => {
      const contactData = {
        name: 'Captain Carter',
        company: 'VFW Post 400',
        email: 'carter@vfw400.org',
        message: 'Inquiry on behalf of our post members.',
      };

      const lead = mapContactToZohoLead(contactData);
      expect(lead.Company).toBe('VFW Post 400');
    });
  });

  describe('mapFormSubmissionToZohoLead', () => {
    it('maps intake fields, rush service flag, pricing tier, and form type into structured description', () => {
      const formData = {
        fullName: 'Sarah Connor',
        email: 'sarah.connor@sky.net',
        phone: '555-987-6543',
        formType: 'nexus_letter',
        formData: {
          selectedPricingTier: 'Rush Priority - $895',
          rushService: true,
          selectedServices: ['nexus_letter', 'dbq'],
          serviceBranch: 'USMC',
          conditions: 'Tinnitus, Bilateral Hearing Loss',
          additionalDetails: 'Have upcoming C&P exam next week and need rush review.',
        },
      };

      const attribution = {
        last_touch_source: 'reddit',
        last_touch_medium: 'organic',
        device_class: 'mobile',
      };

      const lead = mapFormSubmissionToZohoLead(formData, attribution);

      expect(lead.First_Name).toBe('Sarah');
      expect(lead.Last_Name).toBe('Connor');
      expect(lead.Email).toBe('sarah.connor@sky.net');
      expect(lead.Phone).toBe('555-987-6543');
      expect(lead.Company).toBe('Veteran (Self)');
      expect(lead.Lead_Source).toBe('Reddit');

      expect(lead.Description).toContain('--- INTAKE FORM SUBMISSION ---');
      expect(lead.Description).toContain('Form Type: nexus_letter');
      expect(lead.Description).toContain('Selected Pricing Tier: Rush Priority - $895');
      expect(lead.Description).toContain('Rush Expedited: Yes (Rush Service Requested)');
      expect(lead.Description).toContain('Selected Services: nexus_letter, dbq');
      expect(lead.Description).toContain('Military Branch: USMC');
      expect(lead.Description).toContain('Conditions: Tinnitus, Bilateral Hearing Loss');
      expect(lead.Description).toContain('Have upcoming C&P exam next week and need rush review.');
      expect(lead.Description).toContain('Device: mobile');
    });

    it('handles standard delivery without rush service cleanly', () => {
      const formData = {
        full_name: 'Robert Davis',
        email: 'robert@example.com',
        phone: '1234567890',
        form_type: 'aid_attendance',
        formData: {
          rushService: false,
          additionalDetails: 'Applying for pension with aid and attendance.',
        },
      };

      const lead = mapFormSubmissionToZohoLead(formData);

      expect(lead.First_Name).toBe('Robert');
      expect(lead.Last_Name).toBe('Davis');
      expect(lead.Lead_Source).toBe('Website - Intake Form');
      expect(lead.Description).toContain('Rush Expedited: Standard Delivery');
    });
  });

  describe('mapLeadMagnetToZohoLead', () => {
    it('maps guide title, PDF storage path, source path, and attribution', () => {
      const magnetData = {
        fullName: 'David Miller',
        email: 'david.miller@example.com',
        phone: '555-432-1098',
        title: 'Complete VA Nexus Letter Strategy Guide',
        pdfPath: 'pdfs/nexus-letter-guide.pdf',
        sourcePath: '/resources/nexus-letter-guide',
      };

      const attribution = {
        last_touch_source: 'google',
        last_touch_medium: 'cpc',
        last_touch_campaign: 'free-guides',
      };

      const lead = mapLeadMagnetToZohoLead(magnetData, attribution);

      expect(lead.First_Name).toBe('David');
      expect(lead.Last_Name).toBe('Miller');
      expect(lead.Email).toBe('david.miller@example.com');
      expect(lead.Phone).toBe('555-432-1098');
      expect(lead.Company).toBe('Veteran (Self)');
      expect(lead.Lead_Source).toBe('Google Ads');

      expect(lead.Description).toContain('--- LEAD MAGNET DOWNLOAD ---');
      expect(lead.Description).toContain('Guide Title: Complete VA Nexus Letter Strategy Guide');
      expect(lead.Description).toContain('Resource: pdfs/nexus-letter-guide.pdf');
      expect(lead.Description).toContain('Source Page: /resources/nexus-letter-guide');
      expect(lead.Description).toContain('Campaign: free-guides');
    });

    it('defaults name to "Inquirer" when lead magnet form collects only email and phone', () => {
      const magnetData = {
        email: 'anonymous.vet@example.com',
        title: 'DBQ Checklists PDF',
      };

      const lead = mapLeadMagnetToZohoLead(magnetData);

      expect(lead.First_Name).toBe('');
      expect(lead.Last_Name).toBe('Inquirer');
      expect(lead.Email).toBe('anonymous.vet@example.com');
      expect(lead.Lead_Source).toBe('Website - Lead Magnet');
      expect(lead.Company).toBe('Veteran (Self)');
    });
  });

  describe('Defensive Fallbacks and Zoho Field Limits', () => {
    it('safely handles empty objects and null values across all mapper functions', () => {
      expect(() => mapContactToZohoLead({})).not.toThrow();
      expect(() => mapFormSubmissionToZohoLead({})).not.toThrow();
      expect(() => mapLeadMagnetToZohoLead({})).not.toThrow();

      const emptyContact = mapContactToZohoLead({});
      expect(emptyContact.Last_Name).toBe('Inquirer');
      expect(emptyContact.Company).toBe('Veteran (Self)');

      const emptyForm = mapFormSubmissionToZohoLead({});
      expect(emptyForm.Last_Name).toBe('Inquirer');

      const emptyMagnet = mapLeadMagnetToZohoLead({});
      expect(emptyMagnet.Last_Name).toBe('Inquirer');
    });

    it('enforces character limits on long text strings so Zoho does not reject them', () => {
      const giantMessage = 'Z'.repeat(40000);
      const contactData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: giantMessage,
      };

      const lead = mapContactToZohoLead(contactData);
      expect(lead.Description.length).toBeLessThanOrEqual(32000);
    });

    it('provides all expected exports on the default object', () => {
      expect(zohoLeadMapper.splitFullName).toBe(splitFullName);
      expect(zohoLeadMapper.deriveLeadSource).toBe(deriveLeadSource);
      expect(zohoLeadMapper.formatAttributionSummary).toBe(formatAttributionSummary);
      expect(zohoLeadMapper.mapContactToZohoLead).toBe(mapContactToZohoLead);
      expect(zohoLeadMapper.mapFormSubmissionToZohoLead).toBe(mapFormSubmissionToZohoLead);
      expect(zohoLeadMapper.mapLeadMagnetToZohoLead).toBe(mapLeadMagnetToZohoLead);
    });
  });
});
