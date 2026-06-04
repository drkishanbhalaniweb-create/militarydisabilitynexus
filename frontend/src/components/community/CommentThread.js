import { useState } from 'react';
import { MessageSquare, Minus, Plus, ArrowRight } from 'lucide-react';
import { VoteButtons } from './VoteButtons';
import { UserBadge } from './UserBadge';
import { TimeAgo } from './TimeAgo';

const MAX_DEPTH = 3;

function SingleComment({ comment, answerId, onReply, onVote, communityUser, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    id,
    content,
    upvotes,
    downvotes,
    is_anonymous,
    created_at,
    community_users,
    replies,
  } = comment;

  const hasReplies = replies?.length > 0;
  const replyCount = replies?.length || 0;

  const handleSubmitReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReply?.(answerId, id, replyText.trim());
      setReplyText('');
      setShowReply(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (collapsed) {
    return (
      <div className="flex items-center gap-2 py-1">
        <button
          id={`expand-comment-${id}`}
          type="button"
          onClick={() => setCollapsed(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Expand comment"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-slate-500">
          <UserBadge
            displayName={community_users?.display_name}
            avatarColor={community_users?.avatar_color}
            isAnonymous={is_anonymous}
            size="sm"
          />
          {hasReplies && (
            <span className="ml-1.5">· {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div id={`comment-${id}`} className="group">
      <div className="flex gap-2">
        {depth > 0 && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="flex-shrink-0 w-5 flex justify-center group/line"
            aria-label="Collapse thread"
          >
            <div className="w-0.5 h-full bg-slate-200 group-hover/line:bg-slate-400 transition-colors rounded-full" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {depth === 0 && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition-colors"
                aria-label="Collapse comment"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
            <UserBadge
              displayName={community_users?.display_name}
              avatarColor={community_users?.avatar_color}
              isVerified={community_users?.is_verified}
              isAnonymous={is_anonymous}
              size="sm"
            />
            <span className="text-slate-300">·</span>
            <TimeAgo date={created_at} className="text-xs text-slate-500" />
          </div>

          <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{content}</p>

          <div className="flex items-center gap-3 mt-1.5">
            <VoteButtons
              targetType="comment"
              targetId={id}
              initialUpvotes={upvotes}
              initialDownvotes={downvotes}
              onVote={onVote}
              layout="horizontal"
            />

            {depth < MAX_DEPTH && (
              <button
                id={`reply-comment-${id}`}
                type="button"
                onClick={() => setShowReply(!showReply)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors font-medium"
              >
                <MessageSquare className="w-3 h-3" />
                Reply
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-2 ml-1">
              <textarea
                id={`reply-textarea-${id}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none resize-y"
              />
              <div className="flex gap-2 mt-1.5">
                <button
                  id={`submit-reply-${id}`}
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || submitting}
                  className="px-3 py-1 text-xs font-medium text-white bg-[#B91C3C] rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {submitting ? 'Posting…' : 'Post'}
                </button>
                <button
                  id={`cancel-reply-${id}`}
                  type="button"
                  onClick={() => {
                    setShowReply(false);
                    setReplyText('');
                  }}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {hasReplies && depth < MAX_DEPTH && (
            <div className="mt-2">
              {replies.map((reply) => (
                <SingleComment
                  key={reply.id}
                  comment={reply}
                  answerId={answerId}
                  onReply={onReply}
                  onVote={onVote}
                  communityUser={communityUser}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}

          {hasReplies && depth >= MAX_DEPTH && (
            <button
              type="button"
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-navy-600 hover:text-navy-800 transition-colors"
              aria-label="Continue this thread"
            >
              Continue this thread
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({ comments = [], answerId, onReply, onVote, communityUser, depth = 0 }) {
  if (!comments.length) return null;

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <SingleComment
          key={comment.id}
          comment={comment}
          answerId={answerId}
          onReply={onReply}
          onVote={onVote}
          communityUser={communityUser}
          depth={depth}
        />
      ))}
    </div>
  );
}

export default CommentThread;
