import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  supabase: { from: vi.fn() },
  update: vi.fn(),
}));

vi.mock('../../src/lib/supabase', () => ({
  supabase: mocks.supabase,
  STORAGE_BUCKETS: {},
}));

const createMutationChain = () => {
  const chain = {
    update: vi.fn((payload) => {
      mocks.update(payload);
      return chain;
    }),
    eq: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(async () => ({ data: { id: 'body-system-1' }, error: null })),
  };
  return chain;
};

describe('bodySystemApi layout persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.supabase.from.mockReturnValue(createMutationChain());
  });

  it('persists an existing layout array without normalizing its live content', async () => {
    const { bodySystemApi } = await import('../../src/lib/api');
    const layoutSections = [
      {
        id: 'custom-live',
        type: 'custom_rich_text',
        title: 'Live title',
        content_html: '<p>Do not change this</p>',
        is_visible: true,
      },
    ];

    await bodySystemApi.update('body-system-1', { layout_sections: layoutSections });

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ layout_sections: layoutSections }),
    );
    expect(mocks.update.mock.calls[0][0].layout_sections[0].content_html)
      .toBe('<p>Do not change this</p>');
  });

  it('keeps a default layout null when no custom layout was supplied', async () => {
    const { bodySystemApi } = await import('../../src/lib/api');

    await bodySystemApi.update('body-system-1', { layout_sections: null });

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ layout_sections: null }),
    );
  });
});

describe('conditionApi layout persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.supabase.from.mockReturnValue(createMutationChain());
  });

  it('preserves an explicitly empty layout instead of replacing it with defaults', async () => {
    const { conditionApi } = await import('../../src/lib/api');

    await conditionApi.update('condition-1', { layout_sections: [] });

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ layout_sections: [] }),
    );
  });
});
