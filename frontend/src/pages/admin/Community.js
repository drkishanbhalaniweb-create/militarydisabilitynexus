import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Trash2, Eye, MessageSquare, ThumbsUp, Clock, User, ChevronDown, ChevronUp, Send, Award } from 'lucide-react';
import { toast } from 'sonner';

const AdminCommunity = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [expertAnswer, setExpertAnswer] = useState({});
  const [submittingAnswer, setSubmittingAnswer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { fetchQuestions(); fetchCurrentUser(); }, [statusFilter]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase.from('community_questions').select('*').order('created_at', { ascending: false });
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (questionId) => {
    try {
      const { data, error } = await supabase.from('community_answers').select('*').eq('question_id', questionId).order('created_at', { ascending: true });
      if (error) throw error;
      setAnswers(prev => ({ ...prev, [questionId]: data || [] }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleExpand = async (questionId) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
      if (!answers[questionId]) await fetchAnswers(questionId);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question and all its answers?')) return;
    setDeleting(id);
    try {
      await supabase.from('community_answers').delete().eq('question_id', id);
      const { error } = await supabase.from('community_questions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Question deleted');
      fetchQuestions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAnswer = async (answerId, questionId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      const { error } = await supabase.from('community_answers').delete().eq('id', answerId);
      if (error) throw error;
      const question = questions.find(q => q.id === questionId);
      if (question) {
        await supabase.from('community_questions').update({ answers_count: Math.max(0, (question.answers_count || 1) - 1) }).eq('id', questionId);
      }
      toast.success('Answer deleted');
      fetchAnswers(questionId);
      fetchQuestions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('community_questions').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success('Status updated');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmitExpertAnswer = async (questionId) => {
    const content = expertAnswer[questionId]?.trim();
    if (!content) {
      toast.error('Please enter an answer');
      return;
    }
    if (!currentUser) {
      toast.error('You must be logged in');
      return;
    }
    setSubmittingAnswer(questionId);
    try {
      const insertData = {
        question_id: questionId,
        user_id: currentUser.id,
        content: content,
        is_anonymous: false,
        display_name: 'Expert',
        is_expert_answer: true,
        status: 'published'
      };
      console.log('Inserting expert answer:', insertData);
      
      const { data, error } = await supabase.from('community_answers').insert(insertData).select();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Insert successful:', data);
      
      // Update answers count
      const question = questions.find(q => q.id === questionId);
      if (question) {
        await supabase.from('community_questions').update({ 
          answers_count: (question.answers_count || 0) + 1 
        }).eq('id', questionId);
      }
      
      toast.success('Expert answer posted!');
      setExpertAnswer(prev => ({ ...prev, [questionId]: '' }));
      fetchAnswers(questionId);
      fetchQuestions();
    } catch (error) {
      console.error('Full error:', error);
      toast.error(error.message || 'Failed to post answer');
    } finally {
      setSubmittingAnswer(null);
    }
  };

  const filteredQuestions = questions.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()) || q.content.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Community Q&A Management</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none w-48" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm"><MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No questions found</p></div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={'px-2 py-0.5 text-xs font-medium rounded-full ' + (question.status === 'published' ? 'bg-emerald-100 text-emerald-700' : question.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>{question.status}</span>
                        <span className="text-sm text-slate-500">{formatDate(question.created_at)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{question.title}</h3>
                      <p className="text-slate-600 text-sm line-clamp-2">{question.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><User className="w-4 h-4" />{question.is_anonymous ? 'Anonymous' : (question.display_name || 'User')}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{question.upvotes || 0}</span>
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{question.views || 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{question.answers_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={question.status} onChange={(e) => handleStatusChange(question.id, e.target.value)} className="text-sm px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-navy-600 focus:outline-none">
                        <option value="published">Published</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button onClick={() => toggleExpand(question.id)} className="p-2 text-slate-400 hover:text-navy-700 transition-colors">{expandedQuestion === question.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>
                      <button onClick={() => handleDeleteQuestion(question.id)} disabled={deleting === question.id} className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                {expandedQuestion === question.id && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    {/* Expert Answer Form */}
                    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <h4 className="font-medium text-amber-800">Post Expert Answer</h4>
                      </div>
                      <textarea
                        value={expertAnswer[question.id] || ''}
                        onChange={(e) => setExpertAnswer(prev => ({ ...prev, [question.id]: e.target.value }))}
                        placeholder="Write your expert answer here..."
                        rows={3}
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm mb-2"
                      />
                      <button
                        onClick={() => handleSubmitExpertAnswer(question.id)}
                        disabled={submittingAnswer === question.id}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        <Send className="w-4 h-4" />
                        {submittingAnswer === question.id ? 'Posting...' : 'Post Expert Answer'}
                      </button>
                    </div>

                    <h4 className="font-medium text-slate-700 mb-3">Answers ({answers[question.id]?.length || 0})</h4>
                    {!answers[question.id] ? (
                      <p className="text-slate-500 text-sm">Loading answers...</p>
                    ) : answers[question.id].length === 0 ? (
                      <p className="text-slate-500 text-sm">No answers yet</p>
                    ) : (
                      <div className="space-y-3">
                        {answers[question.id].map((answer) => (
                          <div key={answer.id} className={'bg-white rounded-lg p-3 relative ' + (answer.is_expert_answer ? 'ring-2 ring-amber-400' : answer.is_best_answer ? 'ring-2 ring-emerald-500' : 'border border-slate-200')}>
                            {answer.is_expert_answer && (
                              <span className="absolute -top-2 right-3 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-semibold rounded-full">
                                Expert Answer
                              </span>
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                {answer.is_best_answer && !answer.is_expert_answer && <span className="text-xs font-medium text-emerald-600 mb-1 block">Accepted Answer</span>}
                                <p className="text-slate-700 text-sm">{answer.content}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                  <span>{answer.is_anonymous ? 'Anonymous' : (answer.display_name || 'User')}</span>
                                  <span>{formatDate(answer.created_at)}</span>
                                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{answer.upvotes || 0}</span>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteAnswer(answer.id, question.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommunity;
