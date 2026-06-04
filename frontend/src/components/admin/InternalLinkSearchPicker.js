import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Loader2, AlertCircle } from 'lucide-react';

const InternalLinkSearchPicker = ({ onSelect, placeholder = "Search for a page to link..." }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            setError(null);
            try {
                // Fetch from four tables: blog_posts, case_studies, services, conditions
                const [blogRes, studyRes, serviceRes, conditionRes] = await Promise.all([
                    supabase.from('blog_posts').select('id, title, slug').ilike('title', `%${searchQuery}%`).eq('is_published', true).limit(5),
                    supabase.from('case_studies').select('id, title, slug').ilike('title', `%${searchQuery}%`).eq('is_published', true).limit(5),
                    supabase.from('services').select('id, title, slug').ilike('title', `%${searchQuery}%`).eq('is_active', true).limit(5),
                    supabase.from('conditions').select('id, hero_heading, slug, service:services(slug), body_system:body_systems(slug)').ilike('hero_heading', `%${searchQuery}%`).eq('is_published', true).limit(5)
                ]);

                if (blogRes.error) throw blogRes.error;
                if (studyRes.error) throw studyRes.error;
                if (serviceRes.error) throw serviceRes.error;
                if (conditionRes.error) throw conditionRes.error;

                const results = [
                    ...(serviceRes.data || []).map(p => ({
                        id: p.id,
                        title: p.title,
                        type: 'service',
                        url: `/services/${p.slug}`
                    })),
                    ...(conditionRes.data || []).map(p => {
                        const serviceSlug = p.service?.slug || 'unknown-service';
                        const systemSlug = p.body_system?.slug || 'unknown-system';
                        return {
                            id: p.id,
                            title: p.hero_heading,
                            type: 'condition',
                            url: `/services/${serviceSlug}/${systemSlug}/${p.slug}`
                        };
                    }),
                    ...(blogRes.data || []).map(p => ({
                        id: p.id,
                        title: p.title,
                        type: 'blog',
                        url: `/blog/${p.slug}`
                    })),
                    ...(studyRes.data || []).map(p => ({
                        id: p.id,
                        title: p.title,
                        type: 'case_study',
                        url: `/case-studies/${p.slug}`
                    }))
                ];

                setSearchResults(results);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to query database.');
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelect = (item) => {
        onSelect({ title: item.title, url: item.url });
        setSearchQuery('');
        setSearchResults([]);
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'condition':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'service':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'blog':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'case_study':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'condition':
                return 'Condition';
            case 'service':
                return 'Service';
            case 'blog':
                return 'Blog';
            case 'case_study':
                return 'Case Study';
            default:
                return type;
        }
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {searching ? (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-slate-400" />
                    )}
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition-shadow"
                />
            </div>

            {error && (
                <div className="absolute z-50 mt-1 w-full bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto overflow-hidden animate-in fade-in zoom-in-95">
                    {searchResults.map((item) => (
                        <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 group transition-colors"
                        >
                            <div className="flex flex-col min-w-0 pr-4">
                                <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                </span>
                                <span className="text-xs text-slate-400 truncate font-mono">
                                    {item.url}
                                </span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border rounded-full flex-shrink-0 ${getTypeBadgeClass(item.type)}`}>
                                {getTypeLabel(item.type)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InternalLinkSearchPicker;
