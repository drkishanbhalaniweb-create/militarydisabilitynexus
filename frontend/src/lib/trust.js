export const organizationEntity = {
  name: 'Military Disability Nexus',
  legalName: 'MAGLINC CONSULTANCY LLC',
  url: 'https://www.militarydisabilitynexus.com',
  email: 'contact@militarydisabilitynexus.com',
  telephone: '+1-888-215-9785',
  sameAs: [
    'https://www.linkedin.com/company/military-disability-nexus/',
    'https://www.facebook.com/share/1DXxUd6Q74/?mibextid=wwXIfr',
    'https://www.instagram.com/military_disability_nexus?igsh=MTFtMmtvODg3NmZlMA==&utm_source=ig_contact_invite',
  ],
  address: {
    streetAddress: '30 N Gould St Ste R',
    addressLocality: 'Sheridan',
    addressRegion: 'WY',
    postalCode: '82801',
    addressCountry: 'US',
  },
};

export const organizationSocialProfiles = [
  {
    label: 'LinkedIn',
    href: organizationEntity.sameAs[0],
  },
  {
    label: 'Facebook',
    href: organizationEntity.sameAs[1],
  },
  {
    label: 'Instagram',
    href: organizationEntity.sameAs[2],
  },
];

export const editorialTeam = {
  name: 'Military Disability Nexus Editorial Team',
  role: 'Educational Guidance and Evidence Research',
  href: '/editorial-policy',
  description:
    'Our team plans and writes every guide on this site to help you understand documentation standards and avoid common claim pitfalls.',
};

export const clinicalReviewTeam = {
  name: 'Military Disability Nexus Clinical Review Team',
  role: 'Clinical Integrity and Accuracy Review',
  href: '/medical-review-policy',
  description:
    'Every piece of medically sensitive content is reviewed by our clinicians to ensure it is accurate, honest, and stays within our professional scope.',
};

export const aboutProcessSteps = [
  {
    title: 'Understanding your records',
    body:
      'We start by reviewing your specific medical history to understand your journey and determine if our specialized expertise is the right fit for your needs.',
  },
  {
    title: 'Expert clinical analysis',
    body:
      'Our licensed clinicians perform a deep-dive into your records, looking for the medical evidence, chronology, and functional impacts that the VA requires.',
  },
  {
    title: 'Professional documentation',
    body:
      'We build your documentation to be clear, clinically grounded, and strictly focused on providing the evidence needed for a fair disability review.',
  },
  {
    title: 'Honest boundaries',
    body:
      'We are always clear about our limits. We provide expert medical review and documentation—not legal representation, treatment, or guaranteed outcomes.',
  },
];

export const editorialPolicyHighlights = [
  'We write to bring clarity to complex VA documentation standards.',
  'Every page is reviewed for accuracy and honesty before it goes live.',
  'We avoid hype, exaggerated claims, and unrealistic promises.',
  'When we discuss medical topics, we provide the clinical context you need.',
];

export const medicalReviewHighlights = [
  'Our clinical review ensures every medical statement is accurate and responsible.',
  'We maintain a clear line: we provide expert review, not medical treatment or diagnosis.',
  'We check every page to ensure our language is clear, supported, and professional.',
  'Our goal is to eliminate confusion and provide veterans with reliable, expert-backed information.',
];

export const serviceTagMap = {
  'independent-medical-opinion-nexus-letter': ['nexus letter'],
  'disability-benefits-questionnaire-dbq': ['dbq'],
  'aid-and-attendance': ['aid and attendance'],
  'claim-readiness-review': ['claim readiness review'],
  'va-medical-malpractice-1151-case': ['1151 claim'],
  'cp-exam-coaching': ['c&p exam coaching'],
};

export const buildOrganizationReference = () => ({
  '@type': 'Organization',
  name: organizationEntity.name,
  legalName: organizationEntity.legalName,
  url: organizationEntity.url,
  email: organizationEntity.email,
  telephone: organizationEntity.telephone,
  sameAs: organizationEntity.sameAs,
  address: {
    '@type': 'PostalAddress',
    ...organizationEntity.address,
  },
});

export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  ...buildOrganizationReference(),
});

export const buildWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: organizationEntity.name,
  url: organizationEntity.url,
  publisher: buildOrganizationReference(),
});
