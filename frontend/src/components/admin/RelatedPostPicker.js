import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, X, Loader2, Plus } from 'lucide-react';

const RelatedPostPicker = ({ selectedIds = [], onChange, limit = 3 }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Load initial selected posts details
    useEffect(() => {
        const loadSelectedDetails = async () => {
            if (!selectedIds || selectedIds.length === 0) {
                setSelectedPosts([]);
                return;
            }

            setLoading(true);
            try {
                // Fetch from both tables
                const [blogRes, studyRes] = await Promise.all([
                    supabase.from('blog_posts').select('id, title, slug').in('id', selectedIds),
                    supabase.from('case_studies').select('id, title, slug').in('id', selectedIds)
                ]);

                if (blogRes.error) throw blogRes.error;
                if (studyRes.error) throw studyRes.error;

                const items = [
                    ...(blogRes.data || []).map(p => ({ ...p, type: 'blog' })),
                    ...(studyRes.data || []).map(p => ({ ...p, type: 'case_study' }))
                ];

                // Maintain the order of selectedIds
                const orderedItems = selectedIds
                    .map(id => items.find(item => item.id === id))
                    .filter(Boolean);

                setSelectedPosts(orderedItems);
            } catch (error) {
                console.error('Error loading selected posts:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSelectedDetails();
    }, [selectedIds]);

    // Search logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            
            setSearching(true);
            try {
                const [blogRes, studyRes] = await Promise.all([
                    supabase.from('blog_posts').select('id, title, slug').ilike('title', `%${searchQuery}%`).limit(5),
                    supabase.from('case_studies').select('id, title, slug').ilike('title', `%${searchQuery}%`).limit(5)
                ]);

                if (blogRes.error) throw blogRes.error;
                if (studyRes.error) throw studyRes.error;

                const results = [
                    ...(blogRes.data || []).map(p => ({ ...p, type: 'blog' })),
                    ...(studyRes.data || []).map(p => ({ ...p, type: 'case_study' }))
                ];

                setSearchResults(results.filter(r => !selectedIds.includes(r.id)));
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedIds]);

const handleAdd = (post) => {
    if (selectedIds.length >= limit) return;
    const newIds = [...selectedIds, post.id];
    setSelectedPosts([...selectedPosts, post]);
    onChange(newIds);
    setSearchQuery('');
    setSearchResults([]);
};

const handleRemove = (id) => {
    const updatedIds = selectedIds.filter(item => item !== id);
    setSelectedPosts(selectedPosts.filter(p => p.id !== id));
    onChange(updatedIds);
};

return (
    <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
            Related Insights (Manually Selected - Max {limit})
            <span className="block text-xs font-normal text-slate-500 mt-1">
                If fewer than {limit} are selected, others will be auto-populated based on category/tags.
            </span>
        </label>

        {/* Selected Posts */}
        <div className="flex flex-wrap gap-3">
            {selectedPosts.map((post) => (
                <div
                    key={post.id}
                    className="flex items-center gap-2 bg-slate-100 border border-slate-200 pl-3 pr-2 py-1.5 rounded-lg text-sm group animate-in fade-in slide-in-from-left-2"
                >
                    <span className={`text-[10px] font-bold uppercase ${post.type === 'case_study' ? 'text-red-600' : 'text-indigo-600'}`}>
                        {post.type === 'case_study' ? 'CS' : 'BLOG'}
                    </span>
                    <span className="font-medium text-slate-700 max-w-[200px] truncate">{post.title}</span>
                    <button
                        type="button"
                        onClick={() => handleRemove(post.id)}
                        className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>

        {/* Search Input */}
        {selectedIds.length < limit && (
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {searching ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" /> : <Search className="w-4 h-4 text-slate-400" />}
                </div>
                <input
                    type="text"
                    placeholder="Search for blogs or case studies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                        {searchResults.map((post) => (
                            <button
                                key={post.id}
                                type="button"
                                onClick={() => handleAdd(post)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 group"
                            >
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase ${post.type === 'case_study' ? 'text-red-600' : 'text-indigo-600'}`}>
                                        {post.type === 'case_study' ? 'Case Study' : 'Blog'}
                                    </span>
                                    <span className="text-sm font-medium text-slate-800">{post.title}</span>
                                </div>
                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
);
};

export default RelatedPostPicker;
