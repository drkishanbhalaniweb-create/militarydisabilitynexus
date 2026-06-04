import { useRouter } from 'next/router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../src/lib/supabase';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import { toast } from 'sonner';
import { useDebounce } from '../../src/hooks/useDebounce';
import { useCommunityUser } from '../../src/hooks/useCommunityUser';
import {
  QuestionCard,
  SortTabs,
  TagSidebar,
  Pagination,
  AskQuestionModal,
} from '../../src/components/community';

export async function getStaticProps() {
  try {
    const { data: featuredData } = await supabase
      .from('community_questions')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    const { data, count } = await supabase
      .from('community_questions')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .eq('is_featured', false)
      .order('hot_score', { ascending: false })
      .range(0, 4);

    // Community stats
    const { count: totalQuestions } = await supabase
      .from('community_questions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const { count: totalAnswers } = await supabase
      .from('community_answers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const { count: totalMembers } = await supabase
      .from('community_users')
      .select('*', { count: 'exact', head: true });

    return {
      props: {
        featuredQuestions: featuredData || [],
        initialQuestions: data || [],
        initialTotal: count || 0,
        stats: {
          totalQuestions: totalQuestions || 0,
          totalAnswers: totalAnswers || 0,
          totalMembers: totalMembers || 0,
        },
      },
      revalidate: 120,
    };
  } catch (error) {
    console.error('Error fetching community data:', error);
    return {
      props: {
        featuredQuestions: [],
        initialQuestions: [],
        initialTotal: 0,
        stats: { totalQuestions: 0, totalAnswers: 0, totalMembers: 0 },
      },
      revalidate: 120,
    };
  }
}

const PER_PAGE = 5;

const Community = ({ initialQuestions, featuredQuestions = [], initialTotal, stats }) => {
  const router = useRouter();
  const { communityUser, login } = useCommunityUser();

  const [questions, setQuestions] = useState(initialQuestions || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  const [selectedTag, setSelectedTag] = useState(null);
  const [page, setPage] = useState(1);
  const [showAskForm, setShowAskForm] = useState(false);

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const debouncedSearch = useDebounce(searchTerm, 300);
  const totalPages = Math.ceil(total / PER_PAGE);

  const isFiltered = sortBy !== 'hot' || debouncedSearch || selectedTag || page > 1;

  const fetchQuestions = useCallback(async (params = {}) => {
    const {
      sort = sortBy,
      search = debouncedSearch,
      tag = selectedTag,
      pg = page,
    } = params;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        sort,
        page: pg.toString(),
        per_page: PER_PAGE.toString(),
      });
      if (search) queryParams.set('search', search);
      if (tag) queryParams.set('tag', tag);

      const res = await fetch(`/api/community/questions?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [sortBy, debouncedSearch, selectedTag, page]);

  // Re-fetch when filters/sort/search/page change
  useEffect(() => {
    if (isFiltered) {
      fetchQuestions();
    } else {
      setQuestions(initialQuestions || []);
      setTotal(initialTotal || 0);
    }
  }, [sortBy, debouncedSearch, selectedTag, page]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVote = async (targetType, targetId, voteType) => {
    if (!communityUser) {
      toast.error('Enter your name and email to vote');
      return;
    }
    const res = await fetch('/api/community/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        vote_type: voteType || 'upvote',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Vote failed');
    }
    return res.json();
  };

  const handleQuestionSuccess = (newQuestion) => {
    if (newQuestion?.slug) {
      router.push('/community/question/' + newQuestion.slug);
    } else {
      fetchQuestions();
    }
  };

  return (
    <Layout>
      <SEO
        title="VA Benefits Q&A Forum — Expert Answers for Veterans | Military Disability Nexus"
        description="Free expert answers to VA disability claim questions — from clinicians, not Reddit. Search by condition: PTSD, tinnitus, sleep apnea, migraines, nexus letters and more."
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Community', path: '/community' }]}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Main Content Wrapper */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Hero Banner Box */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-700 text-white rounded-2xl shadow-sm px-6 py-10 sm:px-12 sm:py-12 mb-8 text-center relative overflow-hidden">
            {/* Subtle decorative elements for a premium feel similar to conditions page */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                VA Benefits Q&A — Expert Answers, Free
              </h1>
              <p className="text-navy-200 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Ask any question about your VA disability claim and get answers from our clinical team.
                Every Expert Answer comes from a licensed clinician with direct VA claims experience.
              </p>
            </div>
          </div>
          {/* Featured Questions - Compact Horizontal */}
          {featuredQuestions.length > 0 && !isFiltered && (
            <div className="mb-6 relative group/slider">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Featured Expert Discussions
              </h2>
              <div className="relative">
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white p-1.5 rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-navy-700 hover:bg-slate-50 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:opacity-100 hidden sm:block"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div 
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 scroll-smooth"
                >
                  {featuredQuestions.map((q) => (
                    <Link
                      key={q.id}
                      href={'/community/question/' + q.slug}
                      className="flex-shrink-0 w-72 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all p-4 group"
                    >
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        Expert Answer
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-navy-700 line-clamp-2 mt-1 transition-colors">
                        {q.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{q.answers_count || 0} answers</span>
                        <span>{q.upvotes || 0} votes</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white p-1.5 rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-navy-700 hover:bg-slate-50 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:opacity-100 hidden sm:block"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-6">
            {/* Left Column - Feed */}
            <div className="flex-1 min-w-0">
              {/* Search + Sort + Ask */}
              <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="community-search"
                      type="text"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none"
                    />
                  </div>
                  <button
                    id="ask-question-button"
                    onClick={() => setShowAskForm(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                    style={{ backgroundColor: '#B91C3C' }}
                  >
                    <Plus className="w-4 h-4" />
                    Ask Question
                  </button>
                </div>
              </div>

              {/* Sort Tabs */}
              <div className="mb-4">
                <SortTabs activeSort={sortBy} onSortChange={handleSortChange} />
              </div>

              {/* Mobile Tag Filter */}
              <div className="lg:hidden mb-4">
                <TagSidebar
                  selectedTag={selectedTag}
                  onTagSelect={handleTagSelect}
                  onAskQuestion={() => setShowAskForm(true)}
                />
              </div>

              {/* Question Feed */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-navy-700 border-t-transparent mx-auto" />
                  <p className="mt-3 text-sm text-slate-500">Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                  <div className="text-slate-300 mb-3">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">No questions found</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {debouncedSearch || selectedTag
                      ? 'Try adjusting your filters or search terms.'
                      : 'Be the first to ask a question!'}
                  </p>
                  <button
                    onClick={() => setShowAskForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#B91C3C' }}
                  >
                    <Plus className="w-4 h-4" />
                    Ask Question
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="sr-only">Community Questions</h2>
                  <div className="space-y-3">
                    {questions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        onVote={handleVote}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      total={total}
                      perPage={PER_PAGE}
                    />
                  )}
                </>
              )}
            </div>

            {/* Right Column - Sidebar (Desktop) */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <TagSidebar
                  selectedTag={selectedTag}
                  onTagSelect={handleTagSelect}
                  stats={stats}
                  onAskQuestion={() => setShowAskForm(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={showAskForm}
        onClose={() => setShowAskForm(false)}
        communityUser={communityUser}
        onLogin={login}
        onSuccess={handleQuestionSuccess}
      />
    </Layout>
  );
};

export default Community;
