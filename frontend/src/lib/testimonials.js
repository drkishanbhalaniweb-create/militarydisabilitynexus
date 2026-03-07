export const TESTIMONIAL_TAG_OPTIONS = [
  'nexus letter',
  'dbq',
  'aid and attendance',
  'claim readiness review',
  'c&p exam coaching',
  '1151 claim',
];

export const testimonialThemes = [
  {
    title: 'Clarity instead of guesswork',
    summary:
      'Veterans often need a cleaner understanding of what evidence matters, what the VA may focus on, and where their file is still weak.',
  },
  {
    title: 'Respectful, evidence-first communication',
    summary:
      'The strongest feedback themes in this category are usually about being heard, avoiding hype, and getting support grounded in real medical reasoning.',
  },
  {
    title: 'Preparation that lowers stress',
    summary:
      'Whether the service is a nexus letter, DBQ, or coaching session, the practical value is usually less uncertainty before a high-stakes VA step.',
  },
];

export const getUniqueTestimonialTags = (testimonials = []) => {
  const tags = new Set();

  testimonials.forEach((testimonial) => {
    (testimonial.tags || []).forEach((tag) => {
      if (tag) {
        tags.add(tag);
      }
    });
  });

  return Array.from(tags);
};

export const getAverageRating = (testimonials = []) => {
  if (!testimonials.length) {
    return null;
  }

  const ratings = testimonials
    .map((testimonial) => Number(testimonial.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  if (!ratings.length) {
    return null;
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return total / ratings.length;
};

export const getUniqueBranchCount = (testimonials = []) => {
  const branches = new Set(
    testimonials
      .map((testimonial) => testimonial.branch?.trim())
      .filter(Boolean)
  );

  return branches.size;
};

export const getTagCount = (testimonials = [], tag) =>
  testimonials.filter((testimonial) => (testimonial.tags || []).includes(tag)).length;

export const getTestimonialTagTone = (tag = '') => {
  const normalized = tag.toLowerCase();

  if (normalized.includes('nexus')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  if (normalized.includes('dbq')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  if (normalized.includes('aid and attendance')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }

  if (normalized.includes('claim readiness')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  if (normalized.includes('c&p')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (normalized.includes('1151')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const shortenFeedback = (feedback = '', maxLength = 240) => {
  const normalized = feedback.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const slice = normalized.slice(0, maxLength);
  const breakpoint = slice.lastIndexOf(' ');

  return `${slice.slice(0, breakpoint > 80 ? breakpoint : maxLength).trim()}...`;
};
