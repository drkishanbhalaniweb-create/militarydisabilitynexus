import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BODY_SYSTEM_SECTIONS,
  DEFAULT_CONDITION_SECTIONS,
  DEFAULT_SERVICE_SECTIONS,
  cloneLayoutSections,
  createCustomLayoutSection,
  getLayoutSectionsShapeError,
  getRenderableLayoutSections,
  hasMeaningfulLayoutRichContent,
  isLayoutSectionVisible,
  moveLayoutSection,
  SERVICE_SECTION_ALIASES,
  toggleLayoutSectionVisibility,
} from '../../src/lib/layoutSections';

describe('layout section defaults', () => {
  it('keeps service section IDs aligned with the public renderer contract', () => {
    expect(DEFAULT_SERVICE_SECTIONS.map(({ id }) => id)).toEqual([
      'overview',
      'included',
      'pricing',
      'systems',
      'faq',
      'insights',
      'testimonials',
      'related_services',
    ]);
  });

  it('keeps body-system and condition fallback sections complete', () => {
    expect(DEFAULT_BODY_SYSTEM_SECTIONS.map(({ id }) => id)).toContain('related_systems');
    expect(DEFAULT_BODY_SYSTEM_SECTIONS).toHaveLength(9);
    expect(DEFAULT_CONDITION_SECTIONS).toHaveLength(9);
  });

  it('clones defaults before they are materialized into form state', () => {
    const cloned = cloneLayoutSections(DEFAULT_SERVICE_SECTIONS);

    expect(cloned).toEqual(DEFAULT_SERVICE_SECTIONS);
    expect(cloned).not.toBe(DEFAULT_SERVICE_SECTIONS);
    expect(cloned[0]).not.toBe(DEFAULT_SERVICE_SECTIONS[0]);
  });
});

describe('layout section mutations', () => {
  it('reorders a cloned array without mutating the live source array', () => {
    const source = cloneLayoutSections(DEFAULT_SERVICE_SECTIONS);
    const reordered = moveLayoutSection(source, 1, 'up');

    expect(reordered.map(({ id }) => id).slice(0, 2)).toEqual(['included', 'overview']);
    expect(source.map(({ id }) => id).slice(0, 2)).toEqual(['overview', 'included']);
  });

  it('returns the original array for an out-of-range move', () => {
    const source = cloneLayoutSections(DEFAULT_SERVICE_SECTIONS);
    expect(moveLayoutSection(source, 0, 'up')).toBe(source);
    expect(moveLayoutSection(source, source.length - 1, 'down')).toBe(source);
  });

  it('treats a missing visibility flag as visible before an explicit toggle', () => {
    const source = [{ id: 'overview', type: 'standard', name: 'Overview' }];
    const toggled = toggleLayoutSectionVisibility(source, 0);

    expect(isLayoutSectionVisible(source[0])).toBe(true);
    expect(toggled).toEqual([
      { id: 'overview', type: 'standard', name: 'Overview', is_visible: false },
    ]);
    expect(source[0]).not.toHaveProperty('is_visible');
  });

  it('creates custom content inside the persisted layout object contract', () => {
    expect(createCustomLayoutSection('custom-1')).toEqual({
      id: 'custom-1',
      type: 'custom_rich_text',
      name: 'New Custom Section',
      title: '',
      content_html: '',
      is_visible: true,
    });
  });

  it('keeps legacy service layouts renderable without mutating the saved array', () => {
    const savedLayout = [
      { id: 'overview', type: 'standard', name: 'Overview', is_visible: true },
      { id: 'features', type: 'standard', name: 'Features', is_visible: false },
      { id: 'faqs', type: 'standard', name: 'FAQs', is_visible: true },
      { id: 'related_services', type: 'standard', name: 'Related Services', is_visible: true },
    ];

    const renderable = getRenderableLayoutSections(savedLayout, DEFAULT_SERVICE_SECTIONS, {
      aliases: SERVICE_SECTION_ALIASES,
      appendMissingStandards: true,
    });

    expect(renderable.map(({ id }) => id)).toEqual([
      'overview',
      'features',
      'faqs',
      'pricing',
      'systems',
      'insights',
      'testimonials',
      'related_services',
    ]);
    expect(renderable[1].is_visible).toBe(false);
    expect(savedLayout).toHaveLength(4);
  });

  it('rejects malformed and canonical duplicate layouts before admin mutations', () => {
    expect(getLayoutSectionsShapeError([null])).toMatch(/invalid section entry/i);
    expect(getLayoutSectionsShapeError([
      { id: 'features', type: 'standard' },
      { id: 'included', type: 'standard' },
    ], { aliases: SERVICE_SECTION_ALIASES })).toMatch(/more than one section/i);
  });

  it('falls back for nonempty unknown layouts while preserving an intentional empty layout', () => {
    const options = {
      preserveEmpty: true,
      supportedStandardIdsOnly: true,
      fallbackWhenEmpty: true,
    };

    expect(getRenderableLayoutSections([], DEFAULT_CONDITION_SECTIONS, options)).toEqual([]);
    expect(getRenderableLayoutSections([
      { id: 'unknown', type: 'standard' },
      null,
    ], DEFAULT_CONDITION_SECTIONS, options)).toEqual(DEFAULT_CONDITION_SECTIONS);
  });

  it('uses the same meaningful rich-content rule for saving and public fallback', () => {
    expect(hasMeaningfulLayoutRichContent('<p><br></p>')).toBe(false);
    expect(hasMeaningfulLayoutRichContent('<img src="/proof.png" alt="Proof" />')).toBe(true);

    expect(getRenderableLayoutSections([
      { id: 'custom-1', type: 'custom_rich_text', content_html: null },
    ], DEFAULT_CONDITION_SECTIONS, {
      preserveEmpty: true,
      supportedStandardIdsOnly: true,
      fallbackWhenEmpty: true,
      requireRenderableCustomContent: true,
    })).toEqual(DEFAULT_CONDITION_SECTIONS);
  });
});
