import { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export function VoteButtons({
  targetType,
  targetId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userVote = null,
  onVote,
  layout = 'vertical',
}) {
  const [localVote, setLocalVote] = useState(userVote);
  const [score, setScore] = useState(initialUpvotes - initialDownvotes);
  const [pending, setPending] = useState(false);

  const handleVote = useCallback(
    async (voteType) => {
      if (pending) return;

      const prevVote = localVote;
      const prevScore = score;

      let nextVote;
      let nextScore = score;

      if (localVote === voteType) {
        nextVote = null;
        nextScore += voteType === 'upvote' ? -1 : 1;
      } else if (localVote === null) {
        nextVote = voteType;
        nextScore += voteType === 'upvote' ? 1 : -1;
      } else {
        nextVote = voteType;
        nextScore += voteType === 'upvote' ? 2 : -2;
      }

      setLocalVote(nextVote);
      setScore(nextScore);

      if (!onVote) return;

      setPending(true);
      try {
        await onVote(targetType, targetId, nextVote);
      } catch {
        setLocalVote(prevVote);
        setScore(prevScore);
        toast.error('Vote failed');
      } finally {
        setPending(false);
      }
    },
    [pending, localVote, score, onVote, targetType, targetId]
  );

  const upActive = localVote === 'upvote';
  const downActive = localVote === 'downvote';

  if (layout === 'horizontal') {
    return (
      <span className="inline-flex items-center gap-0.5">
        <button
          id={`vote-up-${targetId}`}
          type="button"
          onClick={() => handleVote('upvote')}
          disabled={pending}
          className={`p-0.5 rounded transition-colors ${
            upActive
              ? 'text-emerald-500'
              : 'text-slate-400 hover:text-emerald-500'
          }`}
          aria-label="Upvote"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-700 min-w-[1.25rem] text-center tabular-nums">
          {score}
        </span>
        <button
          id={`vote-down-${targetId}`}
          type="button"
          onClick={() => handleVote('downvote')}
          disabled={pending}
          className={`p-0.5 rounded transition-colors ${
            downActive
              ? 'text-red-500'
              : 'text-slate-400 hover:text-red-500'
          }`}
          aria-label="Downvote"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5 py-3 px-2">
      <button
        id={`vote-up-${targetId}`}
        type="button"
        onClick={() => handleVote('upvote')}
        disabled={pending}
        className={`p-1 rounded transition-colors ${
          upActive
            ? 'text-emerald-500'
            : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-50'
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <span className="text-sm font-bold text-slate-700 tabular-nums">{score}</span>
      <button
        id={`vote-down-${targetId}`}
        type="button"
        onClick={() => handleVote('downvote')}
        disabled={pending}
        className={`p-1 rounded transition-colors ${
          downActive
            ? 'text-red-500'
            : 'text-slate-400 hover:text-red-500 hover:bg-slate-50'
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}

export default VoteButtons;
