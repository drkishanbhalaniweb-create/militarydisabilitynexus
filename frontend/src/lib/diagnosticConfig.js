// VA Claim Readiness Diagnostic Configuration
// Based on documentation: docs/CONFIGURATION.md

export const QUESTIONS = [
  {
    id: 'service_connection',
    number: 1,
    title: 'Are you confident the VA can clearly see how your condition is connected to service?',
    helper: 'A diagnosis alone isn\'t enough — the VA looks for specific medical or service evidence linking your condition to military service.',
    category: 'Service Connection',
    options: [
      { text: 'No — the connection is not clearly shown', points: 2 },
      { text: 'Somewhat — parts are there, but I\'m not fully sure', points: 1 },
      { text: 'Yes — the connection is clearly documented', points: 0 }
    ]
  },
  {
    id: 'denial_handling',
    number: 2,
    title: 'If you were denied before, do you fully understand — and have you fixed — the actual reason for denial?',
    helper: 'Many veterans later realize they were fixing the wrong issue because denial letters are easy to misunderstand.',
    category: 'Denial Handling',
    options: [
      { text: 'No — I\'m not sure what the reason was', points: 2 },
      { text: 'Somewhat — I think I understand but I\'m not certain', points: 1 },
      { text: 'Yes — I understand and have addressed it', points: 0 }
    ]
  },
  {
    id: 'pathway',
    number: 3,
    title: 'Are you certain you\'re filing under the correct claim type for your situation?',
    helper: 'Filing a new, supplemental, or increase claim under the wrong path can delay or derail a claim.',
    category: 'Claim Pathway',
    options: [
      { text: 'No — I\'m not sure which type applies', points: 2 },
      { text: 'Somewhat — I think I know but I\'m not certain', points: 1 },
      { text: 'Yes — I\'m certain of the correct pathway', points: 0 }
    ]
  },
  {
    id: 'severity',
    number: 4,
    title: 'Is your medical evidence detailed enough to support the rating level you\'re seeking?',
    helper: 'The VA rates based on documented severity, frequency, and functional impact — not just a diagnosis.',
    category: 'Medical Evidence',
    options: [
      { text: 'No — my evidence is minimal or vague', points: 2 },
      { text: 'Somewhat — I have some details but could be more thorough', points: 1 },
      { text: 'Yes — my evidence is detailed and comprehensive', points: 0 }
    ]
  },
  {
    id: 'secondaries',
    number: 5,
    title: 'Have you identified all conditions caused or worsened by your service-connected issues?',
    helper: 'Secondary conditions are often missed and discovered only after a denial or low rating.',
    category: 'Secondary Conditions',
    options: [
      { text: 'No — I haven\'t considered secondary conditions', points: 2 },
      { text: 'Somewhat — I\'ve identified some but may have missed others', points: 1 },
      { text: 'Yes — I\'ve identified all related conditions', points: 0 }
    ]
  }
];

export const RECOMMENDATION_CATEGORIES = {
  FULLY_READY: 'FULLY_READY',
  OPTIONAL_CONFIRMATION: 'OPTIONAL_CONFIRMATION',
  REVIEW_BENEFICIAL: 'REVIEW_BENEFICIAL',
  REVIEW_STRONGLY_RECOMMENDED: 'REVIEW_STRONGLY_RECOMMENDED'
};

export const RECOMMENDATIONS = {
  FULLY_READY: {
    category: 'FULLY_READY',
    scoreRange: [0, 0],
    message: 'Your claim appears READY to file',
    subtitle: 'Your answers suggest your claim is well-prepared and aligned with VA requirements.',
    color: '#10b981',
    badgeColor: 'green',
    icon: 'CheckCircle',
    ctaText: 'Optional Final Readiness Review',
    ctaSubtext: 'Even strong claims benefit from a final double-check.',
    ctaOptional: true,
    tone: 'positive'
  },
  OPTIONAL_CONFIRMATION: {
    category: 'OPTIONAL_CONFIRMATION',
    scoreRange: [1, 2],
    message: 'Your claim appears mostly ready',
    subtitle: 'Your answers suggest your claim is strong, with minor areas that could benefit from review.',
    color: '#3b82f6',
    badgeColor: 'blue',
    icon: 'Info',
    ctaText: 'Get an Honest Claim Readiness Review',
    ctaSubtext: 'No guarantees. No filing. Just clarity.',
    ctaOptional: false,
    tone: 'neutral'
  },
  REVIEW_BENEFICIAL: {
    category: 'REVIEW_BENEFICIAL',
    scoreRange: [3, 6],
    message: 'Your claim appears mostly ready — with a few areas worth reviewing',
    subtitle: 'This is common. Many veterans in this range file confidently but later discover small issues.',
    color: '#f59e0b',
    badgeColor: 'orange',
    icon: 'AlertTriangle',
    ctaText: 'Get an Honest Claim Readiness Review',
    ctaSubtext: 'No guarantees. No filing. Just clarity.',
    ctaOptional: false,
    tone: 'educational'
  },
  REVIEW_STRONGLY_RECOMMENDED: {
    category: 'REVIEW_STRONGLY_RECOMMENDED',
    scoreRange: [7, 10],
    message: 'Your answers suggest your claim may face avoidable denial risks',
    subtitle: 'Most veterans only uncover these issues after a denial — often months later.',
    color: '#dc2626',
    badgeColor: 'red',
    icon: 'XCircle',
    ctaText: 'Get an Honest Claim Readiness Review',
    ctaSubtext: 'No guarantees. No filing. Just clarity.',
    ctaOptional: false,
    tone: 'serious'
  }
};

export const ASSESSMENT_AREAS = {
  service_connection: {
    name: 'Service connection clarity',
    description: 'Medical records and nexus documentation'
  },
  denial_handling: {
    name: 'Denial handling',
    description: 'Addressing previous denial reasons'
  },
  pathway: {
    name: 'Claim pathway selection',
    description: 'Correct claim type selection'
  },
  severity: {
    name: 'Severity documentation',
    description: 'Medical impact documentation'
  },
  secondaries: {
    name: 'Secondary conditions',
    description: 'Secondary condition identification'
  }
};

export const STATUS_INDICATORS = {
  ADEQUATE: {
    icon: 'CheckCircle',
    label: 'Adequate',
    color: 'green',
    points: 0
  },
  NEEDS_ATTENTION: {
    icon: 'AlertCircle',
    label: 'Needs attention',
    color: 'yellow',
    points: 1
  },
  MISSING: {
    icon: 'XCircle',
    label: 'Missing',
    color: 'red',
    points: 2
  }
};

export const TOTAL_QUESTIONS = QUESTIONS.length;
