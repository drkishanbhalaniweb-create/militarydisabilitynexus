import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MessageSquare, Award, CheckCircle, User, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../src/lib/supabase';
import SEO from '../../../src/components/SEO';
import Layout from '../../../src/components/Layout';
import { toast } from 'sonner';
import { useCommunityUser } from '../../../src/hooks/useCommunityUser';
import {
  VoteButtons,
  UserBadge,
  TimeAgo,
  CommentThread,
  AnswerForm,
} from '../../../src/components/community';

export async function getStaticPaths() {
  try {
    const { data } = await supabase
      .from('community_questions')
      .select('slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5000);

    const paths = (data || []).map((q) => ({
      params: { slug: q.slug },
    }));

    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error('Error getting static paths for questions:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { data: questionData, error: questionError } = await supabase
      .from('community_questions')
      .select('*, community_user:community_users(id, display_name, avatar_color, is_verified, role)')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single();

    if (questionError || !questionData) {
      return { notFound: true };
    }

    const { data: answersData } = await supabase
      .from('community_answers')
      .select('*, clinical_profiles(*), community_user:community_users(id, display_name, avatar_color, is_verified, role)')
      .eq('question_id', questionData.id)
      .eq('status', 'published')
      .order('is_expert_answer', { ascending: false, nullsFirst: false })
      .order('is_best_answer', { ascending: false, nullsFirst: false })
      .order('upvotes', { ascending: false });

    // Fetch comments for all answers
    const answerIds = (answersData || []).map((a) => a.id);
    let commentsData = [];
    if (answerIds.length > 0) {
      const { data: rawComments } = await supabase
        .from('community_comments')
        .select('*, community_user:community_users(id, display_name, avatar_color, is_verified, role)')
        .in('answer_id', answerIds)
        .eq('status', 'published')
        .order('created_at', { ascending: true });
      commentsData = rawComments || [];
    }

    // Nest comments by answer and parent
    const answersWithComments = (answersData || []).map((answer) => {
      const answerComments = commentsData.filter((c) => c.answer_id === answer.id);
      const commentMap = {};
      const rootComments = [];

      answerComments.forEach((c) => {
        commentMap[c.id] = { ...c, replies: [] };
      });

      answerComments.forEach((c) => {
        if (c.parent_comment_id && commentMap[c.parent_comment_id]) {
          commentMap[c.parent_comment_id].replies.push(commentMap[c.id]);
        } else {
          rootComments.push(commentMap[c.id]);
        }
      });

      return { ...answer, comments: rootComments };
    });

    // Related questions by tag overlap
    let relatedQuestionsData = [];
    if (questionData.tags?.length > 0) {
      const { data: related } = await supabase
        .from('community_questions')
        .select('slug, title, answers_count, upvotes')
        .eq('status', 'published')
        .neq('id', questionData.id)
        .contains('tags', [questionData.tags[0]])
        .limit(3);
      relatedQuestionsData = related || [];
    }

    return {
      props: {
        initialQuestion: questionData,
        initialAnswers: answersWithComments,
        relatedQuestions: relatedQuestionsData,
      },
      revalidate: 120,
    };
  } catch (error) {
    console.error(`Error fetching question for slug ${params.slug}:`, error);
    return { notFound: true };
  }
}

const ANSWER_SORT_OPTIONS = [
  { value: 'best', label: 'Best' },
  { value: 'new', label: 'New' },
  { value: 'old', label: 'Old' },
];

const QuestionDetail = ({ initialQuestion, initialAnswers, relatedQuestions = [] }) => {
  const router = useRouter();
  const { communityUser, login } = useCommunityUser();
  const [question, setQuestion] = useState(initialQuestion);
  const [answers, setAnswers] = useState(initialAnswers || []);
  const [answerSort, setAnswerSort] = useState('best');

  // Increment view count on mount using RPC
  useEffect(() => {
    if (question?.id) {
      const incrementViews = async () => {
        await supabase.rpc('increment_question_views', { p_question_id: question.id });
      };
      incrementViews();
    }
  }, [question?.id]);

  const handleVote = useCallback(async (targetType, targetId, voteType) => {
    if (!communityUser) {
      toast.error('Enter your name and email to vote');
      throw new Error('Not logged in');
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
  }, [communityUser]);

  const handleCommentReply = useCallback(async (answerId, parentCommentId, content) => {
    if (!communityUser) {
      toast.error('Enter your name and email to comment');
      return;
    }
    try {
      const res = await fetch('/api/community/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer_id: answerId,
          parent_comment_id: parentCommentId,
          content,
          is_anonymous: false,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to post comment');
      }
      const newComment = await res.json();
      // Add new comment to the local state
      setAnswers((prev) =>
        prev.map((a) => {
          if (a.id !== answerId) return a;
          const addReply = (comments) =>
            comments.map((c) => {
              if (c.id === parentCommentId) {
                return { ...c, replies: [...(c.replies || []), { ...newComment, replies: [], community_user: communityUser }] };
              }
              return { ...c, replies: addReply(c.replies || []) };
            });
          if (!parentCommentId) {
            return { ...a, comments: [...(a.comments || []), { ...newComment, replies: [], community_user: communityUser }] };
          }
          return { ...a, comments: addReply(a.comments || []) };
        })
      );
      toast.success('Comment posted!');
    } catch (error) {
      toast.error(error.message);
    }
  }, [communityUser]);

  const handleAnswerSuccess = useCallback((newAnswer) => {
    if (newAnswer) {
      setAnswers((prev) => [...prev, { ...newAnswer, comments: [], community_user: communityUser }]);
      setQuestion((prev) => ({ ...prev, answers_count: (prev.answers_count || 0) + 1 }));
    }
  }, [communityUser]);

  const sortedAnswers = [...answers].sort((a, b) => {
    // Expert/best answers always first
    if (a.is_expert_answer && !b.is_expert_answer) return -1;
    if (!a.is_expert_answer && b.is_expert_answer) return 1;
    if (a.is_best_answer && !b.is_best_answer) return -1;
    if (!a.is_best_answer && b.is_best_answer) return 1;

    switch (answerSort) {
      case 'new':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'old':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'best':
      default:
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    }
  });

  if (router.isFallback) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-navy-700 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Question not found</h1>
            <Link href="/community" className="text-navy-700 hover:text-navy-800 font-semibold">
              Back to Community
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const expertAnswer = answers.find((a) => a.is_expert_answer) || answers.find((a) => a.is_best_answer);
  const clinician = expertAnswer?.clinical_profiles;

  const qaPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    name: question.seo_title || question.title,
    description: question.seo_description || (question.content?.substring(0, 160) || `Community question about ${question.title}`),
    url: `https://www.militarydisabilitynexus.com/community/question/${question.slug}`,
    mainEntity: {
      '@type': 'Question',
      name: question.title,
      text: question.content,
      dateCreated: question.created_at,
      answerCount: answers.length,
      ...(expertAnswer && {
        acceptedAnswer: {
          '@type': 'Answer',
          text: expertAnswer.content.replace(/<[^>]*>/g, ''),
          dateCreated: expertAnswer.created_at,
          upvoteCount: expertAnswer.upvotes || 0,
          url: `https://www.militarydisabilitynexus.com/community/question/${question.slug}#expert-answer`,
          author: {
            '@type': 'Person',
            name: clinician ? clinician.full_name : (expertAnswer.is_anonymous ? 'Anonymous' : (expertAnswer.display_name || 'Community Member')),
            ...(expertAnswer.is_expert_answer && {
              jobTitle: clinician?.credentials || 'Clinician',
              worksFor: {
                '@type': 'MedicalOrganization',
                name: 'Military Disability Nexus',
                url: 'https://www.militarydisabilitynexus.com',
              },
            }),
          },
        },
      }),
    },
  };

  return (
    <Layout>
      <SEO
        title={question.seo_title || (question.title + ' | Community')}
        description={question.seo_description || (question.content?.substring(0, 160) || `Community question about ${question.title}`)}
        structuredData={qaPageSchema}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Community', path: '/community' },
          { name: question.title, path: `/community/question/${question.slug}` },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Link */}
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Community
          </Link>

          {/* Question Card */}
          <div className="bg-white rounded-lg border border-slate-200 mb-4">
            <div className="flex">
              {/* Vote Column */}
              <div className="flex-shrink-0 hidden sm:block border-r border-slate-100">
                <VoteButtons
                  targetType="question"
                  targetId={question.id}
                  initialUpvotes={question.upvotes}
                  initialDownvotes={question.downvotes}
                  onVote={handleVote}
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  {question.title}
                </h1>

                <div className="flex items-center gap-3 text-sm text-slate-500 mb-4 flex-wrap">
                  <UserBadge
                    displayName={question.community_user?.display_name || question.display_name}
                    avatarColor={question.community_user?.avatar_color}
                    isVerified={question.community_user?.is_verified}
                    isAnonymous={question.is_anonymous}
                    role={question.community_user?.role}
                    size="md"
                  />
                  <span className="text-slate-300">·</span>
                  <TimeAgo date={question.created_at} />
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {question.views_count || 0} views
                  </span>
                </div>

                {question.content && (
                  <p className="text-slate-700 whitespace-pre-wrap mb-4 leading-relaxed">
                    {question.content}
                  </p>
                )}

                {question.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {question.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/community?tag=${encodeURIComponent(tag)}`}
                        className="bg-navy-100 text-navy-700 text-xs px-2.5 py-0.5 rounded-full hover:bg-navy-200 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mobile Vote */}
                <div className="sm:hidden flex items-center gap-4 pt-3 border-t border-slate-100">
                  <VoteButtons
                    targetType="question"
                    targetId={question.id}
                    initialUpvotes={question.upvotes}
                    initialDownvotes={question.downvotes}
                    onVote={handleVote}
                    layout="horizontal"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </h2>

              {answers.length > 1 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-slate-500 mr-1">Sort:</span>
                  {ANSWER_SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswerSort(opt.value)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        answerSort === opt.value
                          ? 'bg-navy-700 text-white'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {answers.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No answers yet. Be the first to help!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    id={answer.is_expert_answer || answer.is_best_answer ? 'expert-answer' : undefined}
                    className={`bg-white rounded-lg border overflow-hidden ${
                      answer.is_expert_answer
                        ? 'border-amber-300 border-l-4 border-l-amber-400'
                        : answer.is_best_answer
                        ? 'border-emerald-300 border-l-4 border-l-emerald-400'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex">
                      {/* Vote Column */}
                      <div className="flex-shrink-0 hidden sm:block border-r border-slate-100">
                        <VoteButtons
                          targetType="answer"
                          targetId={answer.id}
                          initialUpvotes={answer.upvotes}
                          initialDownvotes={answer.downvotes}
                          onVote={handleVote}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        {/* Badges */}
                        {answer.is_expert_answer && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full mb-3">
                            <Award className="w-3.5 h-3.5" />
                            Expert Answer
                          </div>
                        )}
                        {answer.is_best_answer && !answer.is_expert_answer && (
                          <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mb-3">
                            <CheckCircle className="w-4 h-4" />
                            Accepted Answer
                          </div>
                        )}

                        {/* Answer Content */}
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-3">
                          {answer.content}
                        </p>

                        {/* Per-Expert Answer Microline */}
                        {answer.is_expert_answer && (
                          <div className="mt-4 pt-3 border-t border-dashed border-slate-200 text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                            <strong className="font-semibold text-slate-700">Expert Answers are general educational information</strong> from a licensed clinician, based only on the details in the question above. They are not individualized medical or legal advice and do not create a clinician-patient relationship. For advice on your specific claim, request a personal review.
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="sm:hidden">
                            <VoteButtons
                              targetType="answer"
                              targetId={answer.id}
                              initialUpvotes={answer.upvotes}
                              initialDownvotes={answer.downvotes}
                              onVote={handleVote}
                              layout="horizontal"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {answer.is_expert_answer && answer.clinical_profiles ? (
                              <Link
                                href={`/clinician/${answer.clinical_profiles.slug}`}
                                className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium transition-colors"
                              >
                                {answer.clinical_profiles.photo_url ? (
                                  <img
                                    src={answer.clinical_profiles.photo_url}
                                    alt={answer.clinical_profiles.full_name}
                                    className="w-6 h-6 rounded-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                                <span>
                                  {answer.clinical_profiles.full_name}
                                  {answer.clinical_profiles.credentials
                                    ? `, ${answer.clinical_profiles.credentials}`
                                    : ''}
                                </span>
                              </Link>
                            ) : (
                              <UserBadge
                                displayName={answer.community_user?.display_name || answer.display_name}
                                avatarColor={answer.community_user?.avatar_color}
                                isVerified={answer.community_user?.is_verified}
                                isAnonymous={answer.is_anonymous}
                                size="sm"
                              />
                            )}
                            <span className="text-slate-300">·</span>
                            <TimeAgo date={answer.created_at} className="text-xs text-slate-500" />
                          </div>
                        </div>

                        {/* Comment Thread */}
                        {answer.comments?.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <CommentThread
                              comments={answer.comments}
                              answerId={answer.id}
                              onReply={handleCommentReply}
                              onVote={handleVote}
                              communityUser={communityUser}
                            />
                          </div>
                        )}

                        {/* Add Comment Button */}
                        {communityUser && !answer.comments?.length && (
                          <button
                            type="button"
                            onClick={() => handleCommentReply(answer.id, null, '')}
                            className="mt-3 text-xs text-slate-500 hover:text-slate-700 transition-colors font-medium inline-flex items-center gap-1"
                            style={{ display: 'none' }}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Add a comment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answer Form */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
            <AnswerForm
              questionId={question.id}
              communityUser={communityUser}
              onLogin={login}
              onSuccess={handleAnswerSuccess}
            />
          </div>

          {/* Related Questions */}
          {relatedQuestions?.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Veterans also asked</h3>
              <div className="space-y-2">
                {relatedQuestions.map((rq) => (
                  <Link
                    key={rq.slug}
                    href={`/community/question/${rq.slug}`}
                    className="block p-3 rounded-lg border border-slate-100 hover:border-navy-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-medium text-sm text-navy-800 line-clamp-1">{rq.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {rq.answers_count || 0} answers · {rq.upvotes || 0} votes
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Standing Disclaimer */}
          <div className="bg-[#FAF7F2] border border-amber-200/60 rounded-xl p-5 mt-8 mb-6 text-left">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="font-semibold text-slate-900">About this community.</strong> The Military Disability Nexus Q&A is a free, public forum for general education about VA disability claims. <strong className="font-semibold text-slate-800">Expert Answers are general information only</strong> – based solely on the limited facts in a posted question, not individualized medical or legal advice, and they do <strong className="font-semibold text-slate-800">not</strong> create a clinician-patient or attorney-client relationship. Member posts are their own; we don&apos;t verify or endorse them and may moderate or remove content. The VA decides every claim on its own facts – <strong className="font-semibold text-slate-800">no outcome is promised or guaranteed</strong>. We are an independent medical-evidence provider, <strong className="font-semibold text-slate-800">not affiliated with or endorsed by the VA</strong>. Free help is available from VA-accredited VSOs; see our{' '}
              <Link href="/community-guidelines" className="underline text-amber-800 hover:text-amber-950 font-medium">
                Community Guidelines
              </Link>{' '}
              and{' '}
              <Link href="/disclaimer" className="underline text-amber-800 hover:text-amber-950 font-medium">
                Disclaimer
              </Link>.
            </p>
          </div>

          {/* Community Disclaimers & Crisis Line Box */}
          <div className="border-t border-slate-200 mt-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crisis Line (Left) */}
              <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left h-full">
                <div className="w-8 h-8 rounded-full bg-[#B91C3C] text-white flex items-center justify-center flex-shrink-0 font-bold text-lg leading-none select-none">
                  +
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Veterans Crisis Line</span> —{' '}
                  <strong className="font-semibold text-slate-900">988 then press 1</strong>,{' '}
                  text <strong className="font-semibold text-slate-900">838255</strong>, or chat at{' '}
                  <a
                    href="https://www.veteranscrisisline.net/get-help-now/chat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#B91C3C] hover:text-red-800 font-medium"
                  >
                    VeteransCrisisLine.net/Chat
                  </a>.
                </div>
              </div>

              {/* Disclaimer Box (Right) */}
              <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left h-full">
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <Link href="/disclaimer" className="font-semibold text-slate-800 hover:text-navy-700 underline">
                    Community disclaimer.
                  </Link>{' '}
                  Expert Answers are general education only and don&apos;t create a clinician–patient relationship;
                  the VA decides every claim. Not affiliated with the VA.{' '}
                  <Link href="/disclaimer" className="underline text-navy-700 hover:text-navy-900 font-medium">
                    Full disclaimer
                  </Link>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionDetail;
