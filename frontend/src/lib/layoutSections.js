export const DEFAULT_SERVICE_SECTIONS = [
    { id: 'overview', type: 'standard', name: 'Overview', is_visible: true },
    { id: 'included', type: 'standard', name: "What's Included", is_visible: true },
    { id: 'pricing', type: 'standard', name: 'Pricing at a Glance', is_visible: true },
    { id: 'systems', type: 'standard', name: 'Browse by Medical Category', is_visible: true },
    { id: 'faq', type: 'standard', name: 'Frequently Asked Questions', is_visible: true },
    { id: 'insights', type: 'standard', name: 'Related Insights', is_visible: true },
    { id: 'testimonials', type: 'standard', name: 'Relevant Veteran Feedback', is_visible: true },
    { id: 'related_services', type: 'standard', name: 'Related Services', is_visible: true },
];

export const SERVICE_SECTION_ALIASES = {
    features: 'included',
    faqs: 'faq',
};

export const DEFAULT_BODY_SYSTEM_SECTIONS = [
    { id: 'overview', type: 'standard', name: 'Overview', is_visible: true },
    { id: 'conditions_directory', type: 'standard', name: 'Conditions Directory', is_visible: true },
    { id: 'signature_pathways', type: 'standard', name: 'Signature Pathways', is_visible: true },
    { id: 'challenges', type: 'standard', name: 'Challenges', is_visible: true },
    { id: 'services_comparison', type: 'standard', name: 'Services Comparison', is_visible: true },
    { id: 'specialist_guide', type: 'standard', name: 'Specialist Guide', is_visible: true },
    { id: 'paired_systems', type: 'standard', name: 'Paired Systems', is_visible: true },
    { id: 'faqs', type: 'standard', name: 'Frequently Asked Questions', is_visible: true },
    { id: 'related_systems', type: 'standard', name: 'Related Body Systems', is_visible: true },
];

export const DEFAULT_CONDITION_SECTIONS = [
    { id: 'ratings', type: 'standard', name: 'VA Diagnostic Code', is_visible: true },
    { id: 'about', type: 'standard', name: 'Overview Section', is_visible: true },
    { id: 'features', type: 'standard', name: "What's Included", is_visible: true },
    { id: 'connections', type: 'standard', name: 'Secondary Connections', is_visible: true },
    { id: 'specialist', type: 'standard', name: 'Specialist Guide', is_visible: true },
    { id: 'faqs', type: 'standard', name: 'Frequently Asked Questions', is_visible: true },
    { id: 'related_pages', type: 'standard', name: 'Related Pages', is_visible: true },
    { id: 'paired_conditions', type: 'standard', name: 'Commonly Paired Conditions', is_visible: true },
    { id: 'insights', type: 'standard', name: 'Related Insights & Proof', is_visible: true },
];

export const cloneLayoutSections = (sections) => sections.map((section) => ({ ...section }));

export const isLayoutSectionVisible = (section) => section?.is_visible !== false;

export const hasMeaningfulLayoutRichContent = (html) => {
    if (typeof html !== 'string') return false;

    const visibleMarkup = html
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');

    if (/<(?:img|video|audio|iframe|embed|source)\b[^>]*(?:src|srcset)\s*=\s*(?:"[^"]+"|'[^']+'|[^\s>]+)/i.test(visibleMarkup)) return true;
    if (/<object\b[^>]*data\s*=\s*(?:"[^"]+"|'[^']+'|[^\s>]+)/i.test(visibleMarkup)) return true;
    if (/<svg\b[^>]*>[\s\S]*?<(?:path|circle|ellipse|line|polygon|polyline|rect|text)\b/i.test(visibleMarkup)) return true;

    return visibleMarkup
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;|&#160;|&#x0*a0;|&ZeroWidthSpace;|&#8203;|&#x0*200b;/gi, ' ')
        .replace(/[\s\u00a0\u200b-\u200d\u2060\ufeff]/g, '')
        .length > 0;
};

export const getLayoutSectionsShapeError = (sections, { aliases = {} } = {}) => {
    if (!Array.isArray(sections)) return 'Layout sections must be an array.';

    const seenIds = new Set();
    const seenCanonicalStandardIds = new Set();
    for (const section of sections) {
        if (!section || typeof section !== 'object' || Array.isArray(section)) {
            return 'The saved layout contains an invalid section entry.';
        }

        if (typeof section.id !== 'string' || !section.id.trim()) {
            return 'Every layout section must have a non-empty ID.';
        }

        const sectionId = section.id.trim();
        if (seenIds.has(sectionId)) {
            return `The saved layout contains the duplicate section ID "${sectionId}".`;
        }
        seenIds.add(sectionId);

        if (section.type !== 'standard' && section.type !== 'custom_rich_text') {
            return `The saved layout section "${section.id}" has an unsupported type.`;
        }

        if (section.type === 'standard') {
            const canonicalId = aliases[sectionId] || sectionId;
            if (seenCanonicalStandardIds.has(canonicalId)) {
                return `The saved layout contains more than one section for "${canonicalId}".`;
            }
            seenCanonicalStandardIds.add(canonicalId);
        }

        if ('is_visible' in section && typeof section.is_visible !== 'boolean') {
            return `The saved layout section "${section.id}" has an invalid visibility value.`;
        }

        if (section.type === 'custom_rich_text') {
            if (section.title != null && typeof section.title !== 'string') {
                return `The saved layout section "${section.id}" has an invalid title.`;
            }
            if (section.content_html != null && typeof section.content_html !== 'string') {
                return `The saved layout section "${section.id}" has invalid rich-text content.`;
            }
        }
    }

    return null;
};

export const getRenderableLayoutSections = (
    sections,
    defaults,
    {
        aliases = {},
        preserveEmpty = false,
        appendMissingStandards = false,
        supportedStandardIdsOnly = false,
        fallbackWhenEmpty = false,
        requireRenderableCustomContent = false,
    } = {},
) => {
    if (!Array.isArray(sections)) return cloneLayoutSections(defaults);
    if (sections.length === 0) return preserveEmpty ? [] : cloneLayoutSections(defaults);

    const seenIds = new Set();
    const seenCanonicalStandardIds = new Set();
    const renderableSections = [];
    const defaultIds = new Set(defaults.map((section) => section.id));

    sections.forEach((section) => {
        if (!section || typeof section !== 'object' || Array.isArray(section)) return;
        if (typeof section.id !== 'string' || !section.id.trim()) return;

        const sectionId = section.id.trim();
        if (seenIds.has(sectionId)) return;

        const canonicalId = aliases[sectionId] || sectionId;
        const isCustom = section.type === 'custom_rich_text';
        const isStandard = section.type === 'standard' || (!section.type && defaultIds.has(canonicalId));
        if (!isCustom && !isStandard) return;
        if (isCustom && requireRenderableCustomContent && !hasMeaningfulLayoutRichContent(section.content_html)) return;
        if (isStandard && supportedStandardIdsOnly && !defaultIds.has(canonicalId)) return;
        if (isStandard && seenCanonicalStandardIds.has(canonicalId)) return;

        seenIds.add(sectionId);
        if (isStandard) seenCanonicalStandardIds.add(canonicalId);
        renderableSections.push(section.id === sectionId ? section : { ...section, id: sectionId });
    });

    if (!appendMissingStandards) {
        if (fallbackWhenEmpty && renderableSections.length === 0) return cloneLayoutSections(defaults);
        return renderableSections;
    }

    const missingStandards = defaults
        .filter((section) => !seenCanonicalStandardIds.has(section.id) && !seenIds.has(section.id))
        .map((section) => ({ ...section }));

    if (missingStandards.length === 0) return renderableSections;

    const relatedServicesIndex = renderableSections.findIndex(
        (section) => (aliases[section.id.trim()] || section.id.trim()) === 'related_services',
    );
    if (relatedServicesIndex === -1) return [...renderableSections, ...missingStandards];

    return [
        ...renderableSections.slice(0, relatedServicesIndex),
        ...missingStandards,
        ...renderableSections.slice(relatedServicesIndex),
    ];
};

export const moveLayoutSection = (sections, index, direction) => {
    if (!Array.isArray(sections)) return sections;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || index >= sections.length || newIndex < 0 || newIndex >= sections.length) {
        return sections;
    }

    const nextSections = [...sections];
    [nextSections[index], nextSections[newIndex]] = [nextSections[newIndex], nextSections[index]];
    return nextSections;
};

export const toggleLayoutSectionVisibility = (sections, index) => {
    if (!Array.isArray(sections) || index < 0 || index >= sections.length) return sections;

    const nextSections = [...sections];
    nextSections[index] = {
        ...nextSections[index],
        is_visible: !isLayoutSectionVisible(nextSections[index]),
    };
    return nextSections;
};

export const createCustomLayoutSection = (id, name = 'New Custom Section') => ({
    id,
    type: 'custom_rich_text',
    name,
    title: '',
    content_html: '',
    is_visible: true,
});
