import { describe, expect, test } from 'vitest';
import { formatBlogHTML } from '../../src/lib/htmlUtils';

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

  test('returns empty values for missing html', () => {
    expect(formatBlogHTML('')).toBe('');
    expect(formatBlogHTML('', { extractToc: true })).toEqual({
      html: '',
      tocItems: [],
      hasToc: false,
    });
  });
});
