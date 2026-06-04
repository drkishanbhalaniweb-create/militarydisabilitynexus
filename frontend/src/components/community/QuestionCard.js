import Link from 'next/link';
import { MessageSquare, Eye, Award } from 'lucide-react';
import { VoteButtons } from './VoteButtons';
import { UserBadge } from './UserBadge';
import { TimeAgo } from './TimeAgo';

export function QuestionCard({ question, onVote }) {
  const {
    id,
    title,
    slug,
    content,
    display_name,
    is_anonymous,
    upvotes,
    downvotes,
    views_count,
    answers_count,
    tags,
    created_at,
    is_featured,
    community_users,
  } = question;

  const hasExpertAnswer = question.answers?.some((a) => a.is_expert_answer) ?? false;

  return (
    <article
      id={`question-card-${id}`}
      className={`bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all relative ${
        is_featured ? 'border-l-4 border-l-amber-400' : ''
      }`}
    >
      {hasExpertAnswer && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
          <Award className="w-3 h-3" />
          Expert Answer
        </span>
      )}

      <div className="flex">
        <div className="flex-shrink-0 hidden sm:block">
          <VoteButtons
            targetType="question"
            targetId={id}
            initialUpvotes={upvotes}
            initialDownvotes={downvotes}
            onVote={onVote}
          />
        </div>

        <div className="flex-1 min-w-0 p-4 sm:pl-0">
          <Link href={`/community/question/${slug}`}>
            <h3 className="text-lg font-semibold text-slate-900 hover:text-navy-700 transition-colors line-clamp-2 cursor-pointer">
              {title}
            </h3>
          </Link>

          {content && (
            <Link href={`/community/question/${slug}`}>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1 cursor-pointer">
                {content}
              </p>
            </Link>
          )}

          {tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-navy-100 text-navy-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-3 text-sm text-slate-500 flex-wrap">
            <UserBadge
              displayName={community_users?.display_name || display_name}
              avatarColor={community_users?.avatar_color}
              isVerified={community_users?.is_verified}
              isAnonymous={is_anonymous}
              role={community_users?.role}
              size="sm"
            />
            <span className="text-slate-300">·</span>
            <TimeAgo date={created_at} className="text-xs text-slate-500" />
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {answers_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {views_count ?? 0}
            </span>

            <div className="sm:hidden ml-auto">
              <VoteButtons
                targetType="question"
                targetId={id}
                initialUpvotes={upvotes}
                initialDownvotes={downvotes}
                onVote={onVote}
                layout="horizontal"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default QuestionCard;
