import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, User, Clock, ArrowLeft, CheckCircle, Award } from 'lucide-react';
import { supabase } from '../../../src/lib/supabase';
import SEO from '../../../src/components/SEO';
import Layout from '../../../src/components/Layout';
import { toast } from 'sonner';

export async function getStaticPaths() {
    try {
        // Fetch recently active questions to generate static paths for
        const { data } = await supabase
            .from('community_questions')
            .select('slug')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(5000);

        const paths = (data || []).map((q) => ({
            params: { slug: q.slug },
        }));

        return { paths, fallback: false };
    } catch (error) {
        console.error('Error getting static paths for questions:', error);
        return { paths: [], fallback: false };
    }
}

export async function getStaticProps({ params }) {
    try {
        const { data: questionData, error: questionError } = await supabase
            .from('community_questions')
            .select('*')
            .eq('slug', params.slug)
            .eq('status', 'published')
            .single();

        if (questionError || !questionData) {
            return { notFound: true };
        }

        const { data: answersData } = await supabase
            .from('community_answers')
            .select('*')
            .eq('question_id', questionData.id)
            .eq('status', 'published')
            .order('is_expert_answer', { ascending: false, nullsFirst: false })
            .order('is_best_answer', { ascending: false, nullsFirst: false })
            .order('upvotes', { ascending: false });

        return {
            props: {
                initialQuestion: questionData,
                initialAnswers: answersData || [],
            },
            revalidate: 60, // Revalidate every minute
        };
    } catch (error) {
        console.error(`Error fetching question for slug ${params.slug}:`, error);
        return { notFound: true };
    }
}

const QuestionDetail = ({ initialQuestion, initialAnswers }) => {
    const router = useRouter();
    const [question, setQuestion] = useState(initialQuestion);
    const [answers, setAnswers] = useState(initialAnswers || []);
    const [user, setUser] = useState(null);
    const [newAnswer, setNewAnswer] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        checkUser();
        // Increment view count on mount (client-side)
        if (question?.id) {
            incrementViews(question.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const incrementViews = async (id) => {
        await supabase.from('community_questions').update({ views_count: (question.views_count || 0) + 1 }).eq('id', id);
    };

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const handleVote = async (type, itemType, itemId, currentVotes) => {
        if (!user) { toast.error('Please sign in to vote'); return; }
        const table = itemType === 'question' ? 'community_questions' : 'community_answers';
        const field = type === 'up' ? 'upvotes' : 'downvotes';
        const newValue = (currentVotes || 0) + 1;
        try {
            await supabase.from(table).update({ [field]: newValue }).eq('id', itemId);
            if (itemType === 'question') setQuestion({ ...question, [field]: newValue });
            else setAnswers(answers.map(a => a.id === itemId ? { ...a, [field]: newValue } : a));
            toast.success('Vote recorded!');
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) { toast.error('Please enter your answer'); return; }
        setSubmitting(true);
        try {
            const { data, error } = await supabase.from('community_answers').insert({
                question_id: question.id,
                user_id: user?.id || null, // NULL for anonymous users
                content: newAnswer.trim(),
                is_anonymous: isAnonymous,
                display_name: isAnonymous ? null : (displayName.trim() || 'Community Member'),
                user_email: userEmail.trim() || null,
                status: 'published' // Auto-publish answers
            }).select().single();

            if (error) throw error;

            // Update local state immediately
            if (data) {
                setAnswers(prev => [...prev, data]);
                setQuestion(prev => ({ ...prev, answers_count: (prev.answers_count || 0) + 1 }));
            }

            await supabase.from('community_questions').update({ answers_count: (question.answers_count || 0) + 1 }).eq('id', question.id);

            toast.success('Answer posted successfully!');
            // trackAnswerPosted(question.id); // Implement tracking if needed
            setNewAnswer('');
            setDisplayName('');
            setUserEmail('');
            setIsAnonymous(false);

            // Re-fetch to be safe or rely on local update
            router.replace(router.asPath);

        } catch (error) {
            console.error('Error posting answer:', error);
            toast.error('Failed to post answer');
        } finally {
            setSubmitting(false);
        }
    };

    if (router.isFallback) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700" />
                </div>
            </Layout>
        );
    }

    if (!question) return (
        <Layout>
            <div className="relative min-h-screen overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-12">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Question not found</h1>
                    <Link href="/community" className="text-navy-700 hover:text-navy-800 font-semibold">Back to Community</Link>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <SEO title={question.title + ' | Community'} description={question.content.substring(0, 160)} breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Community', path: '/community' }, { name: question.title, path: `/community/question/${question.slug}` }]} />
            <div className="relative min-h-screen overflow-hidden">
                {/* Fixed Background */}
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url("/blogimg.png")',
                            filter: 'blur(4px)',
                            transform: 'scale(1.1)',
                            width: '100%',
                            height: '100%'
                        }}
                        role="presentation"
                        aria-hidden="true"
                    ></div>
                    <div className="absolute inset-0 bg-white/50"></div>
                </div>

                <div className="relative z-10 py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link href="/community" className="inline-flex items-center gap-2 text-slate-600 hover:text-navy-700 mb-6 font-semibold transition-colors"><ArrowLeft className="w-4 h-4" />Back to Community</Link>
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-6 mb-6">
                            <h1 className="text-2xl font-bold text-slate-900 mb-4">{question.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                <span className="flex items-center gap-1"><User className="w-4 h-4" />{question.is_anonymous ? 'Anonymous' : (question.display_name || 'User')}</span>
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap mb-6">{question.content}</p>
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                <button onClick={() => handleVote('up', 'question', question.id, question.upvotes)} className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors"><ThumbsUp className="w-5 h-5" /><span>{question.upvotes || 0}</span></button>
                                <button onClick={() => handleVote('down', 'question', question.id, question.downvotes)} className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors"><ThumbsDown className="w-5 h-5" /><span>{question.downvotes || 0}</span></button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" />{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</h2>
                            {answers.length === 0 ? (
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-6 text-center"><p className="text-slate-500">No answers yet. Be the first to help!</p></div>
                            ) : (
                                <div className="space-y-4">
                                    {answers.map((answer) => (
                                        <div key={answer.id} className={'bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border p-6 relative ' + (answer.is_expert_answer ? 'border-amber-400 border-2' : answer.is_best_answer ? 'border-emerald-500 border-2' : 'border-white/40')}>
                                            {answer.is_expert_answer && (
                                                <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-amber-900 text-sm font-semibold rounded-full shadow-md">
                                                    <Award className="w-4 h-4" />
                                                    Expert Answer
                                                </div>
                                            )}
                                            {answer.is_best_answer && !answer.is_expert_answer && <div className="flex items-center gap-2 text-emerald-600 mb-3"><CheckCircle className="w-5 h-5" /><span className="font-medium">Accepted Answer</span></div>}
                                            <p className="text-slate-700 whitespace-pre-wrap mb-4 mt-2">{answer.content}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => handleVote('up', 'answer', answer.id, answer.upvotes)} className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors"><ThumbsUp className="w-4 h-4" /><span>{answer.upvotes || 0}</span></button>
                                                    <button onClick={() => handleVote('down', 'answer', answer.id, answer.downvotes)} className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors"><ThumbsDown className="w-4 h-4" /><span>{answer.downvotes || 0}</span></button>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1"><User className="w-4 h-4" />{answer.is_anonymous ? 'Anonymous' : (answer.display_name || 'User')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Answer</h3>
                            <form onSubmit={handleSubmitAnswer}>
                                <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Share your knowledge or experience..." rows={5} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none mb-4" required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Display Name {!isAnonymous && <span className="text-slate-500 font-normal">(optional)</span>}
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none"
                                            disabled={isAnonymous}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Email <span className="text-slate-500 font-normal">(for notifications, not shown)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={userEmail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-600 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#B91C3C' }} />
                                        <span className="text-sm text-slate-600">Post anonymously</span>
                                    </label>
                                    <button type="submit" disabled={submitting} className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg" style={{ backgroundColor: '#B91C3C' }}>{submitting ? 'Posting...' : 'Post Answer'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default QuestionDetail;
