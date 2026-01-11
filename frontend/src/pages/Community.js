import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ThumbsDown, Eye, Search, Plus, User, Clock, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { toast } from 'sonner';
import { trackQuestionAsked } from '../lib/redditPixel';

const AVAILABLE_TAGS = [
  'Nexus Letter',
  '1151 Claim',
  'Aid & Attendance/SMC',
  'Primary Connection',
  'Secondary Connection',
  'Migraine/Headaches',
  'Tinnitus',
  'Obstructive Sleep Apnea',
  'IBS',
  'GERD',
  'PACT Act',
  'Mental Health',
  'Orthopedic/Chronic Pain',
  'Evidence & Documentation',
  'C&P Exam',
  'Heart Condition/Hypertension',
  'Kidney Claims',
  'Cancer',
  'Others'
];

const Community = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTags, setSelectedTags] = useState([]);
  const [user, setUser] = useState(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', is_anonymous: false, display_name: '', user_email: '', tags: [] });

  useEffect(() => { fetchQuestions(); checkUser(); }, [sortBy]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase.from('community_questions').select('*').eq('status', 'published');
      if (sortBy === 'recent') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'popular') query = query.order('upvotes', { ascending: false });
      else if (sortBy === 'unanswered') query = query.eq('answers_count', 0).order('created_at', { ascending: false });
      const { data, error } = await query.limit(50);
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.title.trim()) { toast.error('Please fill in the title'); return; }
    if (!newQuestion.user_email.trim()) { toast.error('Please provide an email for notifications'); return; }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newQuestion.user_email)) { toast.error('Please provide a valid email address'); return; }

    // Check word count if content is provided
    if (newQuestion.content.trim()) {
      const wordCount = getWordCount(newQuestion.content);
      if (wordCount > 200) {
        toast.error('Details must be 200 words or less');
        return;
      }
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('community_questions').insert({
        user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Use dummy UUID if no user
        title: newQuestion.title.trim(),
        content: newQuestion.content.trim(),
        is_anonymous: newQuestion.is_anonymous,
        display_name: newQuestion.is_anonymous ? null : (newQuestion.display_name || 'Anonymous'),
        user_email: newQuestion.user_email.trim(),
        tags: newQuestion.tags || [],
      }).select().single();
      if (error) throw error;
      toast.success('Question posted! You\'ll receive an email when someone answers.');
      trackQuestionAsked(data?.id);
      setNewQuestion({ title: '', content: '', is_anonymous: false, display_name: '', user_email: '', tags: [] });
      setShowAskForm(false);
      fetchQuestions();
      if (data?.slug) navigate('/community/question/' + data.slug);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagToggle = (tag) => {
    const currentTags = newQuestion.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setNewQuestion({ ...newQuestion, tags: newTags });
  };

  const handleFilterTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || (q.tags && q.tags.some(tag => selectedTags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  const handleVote = async (e, questionId, type, currentVotes) => {
    e.preventDefault(); // Prevent navigation when clicking vote
    e.stopPropagation();
    if (!user) { toast.error('Please sign in to vote'); return; }
    const field = type === 'up' ? 'upvotes' : 'downvotes';
    const newValue = (currentVotes || 0) + 1;
    try {
      await supabase.from('community_questions').update({ [field]: newValue }).eq('id', questionId);
      setQuestions(questions.map(q => q.id === questionId ? { ...q, [field]: newValue } : q));
      toast.success('Vote recorded!');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <SEO title="Community Q and A | VA Benefits Questions" description="Ask questions and get answers about VA benefits." />
      <div className="relative min-h-screen overflow-hidden">
        {/* Fixed Background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <img
            src="/blogimg.png"
            alt="Background pattern"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'blur(4px)',
              transform: 'scale(1.1)'
            }}
            role="presentation"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-white/50"></div>
        </div>

        <div className="relative z-10 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <section className="py-8 mb-6">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-br from-navy-600 to-navy-800 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                  <MessageSquare className="w-4 h-4" />
                  <span>COMMUNITY Q&A</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 drop-shadow-sm">Community Q and A</h1>
                <p className="text-lg text-slate-700 max-w-2xl mx-auto">Ask questions about VA benefits and get answers from our community.</p>
              </div>
            </section>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-4 mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search questions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none appearance-none bg-white">
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="unanswered">Unanswered</option>
                  </select>
                </div>
                <button onClick={() => setShowAskForm(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg" style={{ backgroundColor: '#B91C3C' }}>
                  <Plus className="w-4 h-4" />Ask Question
                </button>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-4 mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Filter by Tags</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleFilterTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedTags.includes(tag)
                      ? 'bg-navy-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-3 text-sm text-navy-600 hover:text-navy-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {showAskForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Ask a Question</h2>
                    <form onSubmit={handleAskQuestion}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Question Title</label>
                        <input type="text" value={newQuestion.title} onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })} placeholder="What would you like to know?" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none" required />
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-slate-700">
                            Details <span className="text-slate-500 font-normal">(optional)</span>
                          </label>
                          <span className={`text-xs font-medium ${getWordCount(newQuestion.content) > 200 ? 'text-red-600' : 'text-slate-500'}`}>
                            {getWordCount(newQuestion.content)}/200 words
                          </span>
                        </div>
                        <textarea
                          value={newQuestion.content}
                          onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                          placeholder="Provide more details..."
                          rows={5}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none ${getWordCount(newQuestion.content) > 200 ? 'border-red-300' : 'border-slate-200'
                            }`}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Display Name (optional)</label>
                        <input type="text" value={newQuestion.display_name} onChange={(e) => setNewQuestion({ ...newQuestion, display_name: e.target.value })} placeholder="Your display name" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none" disabled={newQuestion.is_anonymous} />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email <span className="text-red-600">*</span>
                          <span className="text-xs text-slate-500 ml-2">(for notifications only, not displayed publicly)</span>
                        </label>
                        <input
                          type="email"
                          value={newQuestion.user_email}
                          onChange={(e) => setNewQuestion({ ...newQuestion, user_email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none"
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1">We'll notify you when someone answers your question</p>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tags (select relevant topics)</label>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                          {AVAILABLE_TAGS.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagToggle(tag)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(newQuestion.tags || []).includes(tag)
                                ? 'bg-navy-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={newQuestion.is_anonymous} onChange={(e) => setNewQuestion({ ...newQuestion, is_anonymous: e.target.checked })} className="w-4 h-4 rounded" style={{ accentColor: '#B91C3C' }} />
                          <span className="text-sm text-slate-600">Post anonymously</span>
                        </label>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button type="button" onClick={() => setShowAskForm(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg" style={{ backgroundColor: '#B91C3C' }}>{submitting ? 'Posting...' : 'Post Question'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700 mx-auto"></div><p className="mt-4 text-slate-600">Loading questions...</p></div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No questions yet</h3>
                <p className="text-slate-500 mb-4">Be the first to ask a question!</p>
                <button onClick={() => setShowAskForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg" style={{ backgroundColor: '#B91C3C' }}><Plus className="w-4 h-4" />Ask Question</button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="sr-only">Recent Discussions</h2>
                {filteredQuestions.map((question) => (
                  <article key={question.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl transition-all p-6">
                    <div className="flex gap-4">
                      {/* Vote buttons - Left side (Desktop) */}
                      <div className="hidden sm:flex flex-col items-center gap-1 text-center min-w-[50px]">
                        <button
                          onClick={(e) => handleVote(e, question.id, 'up', question.upvotes)}
                          className="p-1 text-slate-400 hover:text-emerald-600 transition-colors rounded hover:bg-emerald-50"
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-semibold text-slate-700">{(question.upvotes || 0) - (question.downvotes || 0)}</span>
                        <button
                          onClick={(e) => handleVote(e, question.id, 'down', question.downvotes)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                        >
                          <ThumbsDown className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-slate-500">votes</span>
                      </div>
                      {/* Question content - Middle */}
                      <div className="flex-1 min-w-0">
                        <Link to={'/community/question/' + question.slug} className="block group">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-navy-700 mb-2 line-clamp-2 transition-colors">{question.title}</h3>
                          <p className="text-slate-600 text-sm line-clamp-2 mb-3">{question.content}</p>
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {question.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-navy-100 text-navy-700 px-2 py-0.5 rounded text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><User className="w-4 h-4" />{question.is_anonymous ? 'Anonymous' : (question.display_name || 'User')}</span>
                          {/* <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDate(question.created_at)}</span> */}
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{question.views_count || 0} views</span>
                          {/* Mobile vote buttons */}
                          <div className="sm:hidden flex items-center gap-2">
                            <button onClick={(e) => handleVote(e, question.id, 'up', question.upvotes)} className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors">
                              <ThumbsUp className="w-4 h-4" />{question.upvotes || 0}
                            </button>
                            <button onClick={(e) => handleVote(e, question.id, 'down', question.downvotes)} className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors">
                              <ThumbsDown className="w-4 h-4" />{question.downvotes || 0}
                            </button>
                          </div>
                          <span className="sm:hidden flex items-center gap-1"><MessageSquare className="w-4 h-4" />{question.answers_count || 0}</span>
                        </div>
                      </div>
                      {/* Answers count - Right side (Desktop) */}
                      <div className={'hidden sm:flex flex-col items-center justify-center px-3 py-2 rounded-lg min-w-[60px] ' + (question.answers_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                        <span className="text-lg font-semibold">{question.answers_count || 0}</span>
                        <span className="text-xs">answers</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Community;
