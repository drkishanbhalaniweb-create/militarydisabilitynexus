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

export const editorialTeam = {
  name: 'Military Disability Nexus Editorial Team',
  role: 'Content authorship and evidence-based educational publishing',
  href: '/editorial-policy',
  description:
    'Publishes site content designed to explain documentation standards, common claim issues, and what veterans should understand before purchasing services.',
};

export const clinicalReviewTeam = {
  name: 'Military Disability Nexus Clinical Review Team',
  role: 'Clinical review for medically sensitive educational and proof content',
  href: '/medical-review-policy',
  description:
    'Reviews medically sensitive content for clinical accuracy, scope limitations, and consistency with the site’s non-treatment positioning.',
};

export const aboutProcessSteps = [
  {
    title: 'Record intake and scope review',
    body:
      'Every case starts with understanding the veteran’s question, what records exist, and whether the request fits the site’s non-clinical medicolegal scope.',
  },
  {
    title: 'Clinician-led evidence analysis',
    body:
      'Licensed clinicians review the medical file for causation, chronology, functional impact, and gaps that affect whether documentation is persuasive and defensible.',
  },
  {
    title: 'Clear documentation standards',
    body:
      'Written work is structured to be readable, clinically grounded, and aligned with the evidentiary purpose of VA disability claims rather than treatment planning.',
  },
  {
    title: 'Respectful limits and disclosures',
    body:
      'The site is explicit about what it does not provide: legal representation, treatment, emergency care, or guarantees of VA outcomes.',
  },
];

export const editorialPolicyHighlights = [
  'Content is written to clarify documentation standards, claim evidence issues, and common decision-point questions for veterans.',
  'Pages are reviewed for accuracy, restraint, and consistency with the site’s legal disclaimers before publication.',
  'The site avoids guarantees, exaggerated success claims, and unsupported medical or legal promises.',
  'When a page contains medically sensitive educational content, it is labeled with clinical review context.',
];

export const medicalReviewHighlights = [
  'Clinical review is focused on medical accuracy, evidentiary framing, and consistency with the site’s non-treatment role.',
  'Review does not create a physician-patient relationship and is not a substitute for diagnosis, treatment, or emergency care.',
  'Medically sensitive pages are checked for overstatement, unsupported causation language, and ambiguity around scope of services.',
  'Clinical review aims to reduce misinformation while keeping content readable for veterans making high-stakes decisions.',
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
