import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * Category configuration conforming to design guidelines and PURPLE BAN.
 * Uses brand navy, slate, blue, emerald, amber, and teal palettes.
 */
const CATEGORIES = [
  {
    key: 'conditions',
    heading: 'Conditions',
    badge: 'Condition',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    key: 'services',
    heading: 'Services',
    badge: 'Service',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  {
    key: 'blog_posts',
    heading: 'Blog Posts',
    badge: 'Blog',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    key: 'community_questions',
    heading: 'Community Q&A',
    badge: 'Community',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    key: 'case_studies',
    heading: 'Case Studies',
    badge: 'Case Study',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
];

const INITIAL_RESULTS = {
  conditions: [],
  services: [],
  blog_posts: [],
  community_questions: [],
  case_studies: [],
};

/**
 * Global Search component featuring a responsive trigger and a command palette modal.
 * Supports keyboard shortcut (⌘K / Ctrl+K), debounced async search, and category grouping.
 */
export default function GlobalSearch({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showDesktopTrigger = true,
  className = '',
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [loading, setLoading] = useState(false);
  const [shortcutText, setShortcutText] = useState('Ctrl+K');

  const abortControllerRef = useRef(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (nextVal) => {
      if (isControlled) {
        if (typeof nextVal === 'function') {
          controlledOnOpenChange?.(nextVal(open));
        } else {
          controlledOnOpenChange?.(nextVal);
        }
      } else {
        setInternalOpen(nextVal);
      }
    },
    [isControlled, controlledOnOpenChange, open]
  );

  // OS detection for keyboard shortcut display (⌘K on macOS, Ctrl+K on Windows/Linux)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(
        window.navigator?.userAgent || window.navigator?.platform || ''
      );
      setShortcutText(isMac ? '⌘K' : 'Ctrl+K');
    }
  }, []);

  // Global keyboard shortcut listener: Cmd+K / Ctrl+K toggles dialog, Escape closes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Clean up state and abort in-flight requests when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults(INITIAL_RESULTS);
      setLoading(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [open]);

  // Debounced search querying /api/search?q=...
  useEffect(() => {
    const trimmed = query.trim();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (trimmed.length < 2) {
      setLoading(false);
      setResults(INITIAL_RESULTS);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Search request failed with status: ${res.status}`);
        }

        const data = await res.json();
        if (!controller.signal.aborted) {
          setResults(data.results || INITIAL_RESULTS);
          setLoading(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          console.error('[GlobalSearch] Search fetch error:', err);
          setResults(INITIAL_RESULTS);
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = useCallback(
    (url) => {
      if (!url) return;
      setOpen(false);
      router.push(url);
    },
    [router, setOpen]
  );

  const handleInputChange = useCallback((val) => {
    setQuery(val);
  }, []);

  const hasResults = Object.values(results).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );

  return (
    <>
      {showDesktopTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-testid="search-trigger"
          aria-label="Search"
          className={cn(
            'flex items-center gap-2.5 px-3 py-1.5 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent cursor-pointer shadow-sm',
            className
          )}
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="font-normal text-slate-500">Search...</span>
          <kbd className="inline-flex items-center gap-0.5 pointer-events-none select-none rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 shadow-xs">
            {shortcutText}
          </kbd>
        </button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <DialogTitle className="sr-only">Global Site Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across conditions, services, blog posts, community Q&amp;A, and case studies.
        </DialogDescription>

        <CommandInput
          cmdk-input=""
          data-testid="search-input"
          placeholder="Search conditions, services, articles..."
          value={query}
          onValueChange={handleInputChange}
          onChange={(e) => handleInputChange(e.target.value)}
          autoFocus
        />

        {loading && hasResults && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-50/80 border-b border-slate-100"
            data-testid="search-loading-bar"
          >
            <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
            <span>Updating results...</span>
          </div>
        )}

        <CommandList aria-label="Search Results" data-testid="search-dialog">
          <CommandEmpty data-testid="search-empty">
            {loading ? (
              <div
                className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500"
                data-testid="search-loading"
              >
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Searching...</span>
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No results found for &quot;
                <span className="font-medium text-slate-800">{query.trim()}</span>&quot;
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-slate-400">
                Type at least 2 characters to search...
              </div>
            )}
          </CommandEmpty>

          {CATEGORIES.map((cat) => {
            const items = results?.[cat.key] || [];
            if (!items.length) return null;

            return (
              <CommandGroup key={cat.key} heading={cat.heading}>
                {items.map((item) => (
                  <CommandItem
                    key={`${cat.key}-${item.id || item.url}`}
                    value={`${item.title} ${item.id || item.url || ''}`.trim()}
                    onSelect={() => handleSelect(item.url)}
                    onClick={() => handleSelect(item.url)}
                    data-testid="search-result-item"
                    className="flex items-start justify-between gap-3 px-3 py-2.5 cursor-pointer rounded-md hover:bg-slate-100 data-[selected=true]:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 truncate text-sm">
                          {item.title}
                        </span>
                        <span
                          data-testid="category-badge"
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border shrink-0',
                            cat.badgeClass
                          )}
                        >
                          {cat.badge}
                        </span>
                      </div>
                      {item.description ? (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}

/**
 * Mobile-specific search trigger icon button.
 */
export function MobileSearchTrigger({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400',
        className
      )}
      data-testid="mobile-search-trigger"
      aria-label="Search"
    >
      <Search className="w-5 h-5 text-slate-700" />
    </button>
  );
}
