import { describe, expect, test } from 'vitest';
import { formatBlogHTML, formatRichHTML } from '../../src/lib/htmlUtils';

describe('blog HTML formatting', () => {
  test('injects heading ids and extracts h2 table-of-contents items', () => {
    const result = formatBlogHTML(
      '<h2>First Section</h2><p>Body</p><h3>Nested Detail</h3><div class="toc-block"></div>',
      { extractToc: true },
    );

    expect(result.hasToc).toBe(true);
    expect(result.tocItems).toEqual([{ id: 'first-section', text: 'First Section' }]);
    expect(result.html).toContain('id="first-section"');
    expect(result.html).not.toContain('toc-block');
  });

  test('preserves custom blocks outside generated prose wrappers', () => {
    const formatted = formatBlogHTML(
      '<p>Intro</p><div class="highlight-box"><p>Important</p></div><p>Outro</p>',
    );

    expect(formatted).toContain('<div class="highlight-box"><p>Important</p></div>');
    expect(formatted).toContain('prose prose-slate');
  });

  test('preserves rating-box outside generated prose wrappers', () => {
    const formatted = formatBlogHTML(
      '<p>Intro</p><div class="rating-box"><div class="rating-badge"><span class="rating-value">10</span><span class="rating-label">PERCENT</span></div><div class="rating-content"><p>Criteria</p></div></div><p>Outro</p>',
    );

    expect(formatted).toContain('<div class="rating-box"><div class="rating-badge"><span class="rating-value">10</span><span class="rating-label">PERCENT</span></div><div class="rating-content"><p>Criteria</p></div></div>');
    expect(formatted).toContain('prose prose-slate');
  });

  test('returns empty values for missing html', () => {
    expect(formatBlogHTML('')).toBe('');
    expect(formatBlogHTML('', { extractToc: true })).toEqual({
      html: '',
      tocItems: [],
      hasToc: false,
    });
  });
});

describe('rich HTML formatting', () => {
  test('groups consecutive custom-boxes into a grid', () => {
    const input = `
      <div class="custom-box">Box 1</div>
      <div class="custom-box">Box 2</div>
    `;
    const result = formatRichHTML(input);
    expect(result).toContain('<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">');
    expect(result).toContain('<div class="col-span-1"><div class="custom-box">Box 1</div></div>');
    expect(result).toContain('<div class="col-span-1"><div class="custom-box">Box 2</div></div>');
  });

  test('keeps non-custom-box content outside the grid', () => {
    const input = `
      <p>Intro text</p>
      <div class="custom-box">Box 1</div>
      <p>Outro text</p>
    `;
    const result = formatRichHTML(input);
    expect(result).toContain('<p>Intro text</p>');
    expect(result).toContain('<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">');
    expect(result).toContain('<p>Outro text</p>');
  });

  test('handles missing or empty HTML', () => {
    expect(formatRichHTML('')).toBe('');
    expect(formatRichHTML(null)).toBe('');
  });
});
