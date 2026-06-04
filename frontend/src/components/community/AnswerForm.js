import { useState } from 'react';
import { toast } from 'sonner';

export function AnswerForm({ questionId, communityUser, onLogin, onSuccess }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const needsIdentity = !communityUser;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) return;
    setLoginLoading(true);
    try {
      await onLogin(email.trim(), displayName.trim());
    } catch {
      toast.error('Failed to join. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/community/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          content: content.trim(),
          is_anonymous: isAnonymous,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to post answer');
      }

      const data = await res.json();
      toast.success('Answer posted!');
      setContent('');
      setIsAnonymous(false);
      onSuccess?.(data);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="answer-form"
      className="bg-white rounded-lg border border-slate-200 p-5"
    >
      <h3 className="text-base font-semibold text-slate-900 mb-4">Your Answer</h3>

      {needsIdentity ? (
        <form onSubmit={handleLogin} className="space-y-3">
          <p className="text-sm text-slate-600">
            Join the community to share your answer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="answer-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="answer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm"
              />
            </div>
            <div>
              <label htmlFor="answer-display-name" className="block text-sm font-medium text-slate-700 mb-1">
                Display Name
              </label>
              <input
                id="answer-display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm"
              />
            </div>
          </div>
          <button
            id="answer-login-submit"
            type="submit"
            disabled={loginLoading}
            className="bg-[#B91C3C] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
          >
            {loginLoading ? 'Joining…' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            id="answer-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience or knowledge..."
            rows={5}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm resize-y min-h-[120px]"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="answer-anonymously"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
              />
              <span className="text-sm text-slate-600">Post anonymously</span>
            </label>

            <button
              id="submit-answer"
              type="submit"
              disabled={!content.trim() || submitting}
              className="bg-[#B91C3C] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
            >
              {submitting ? 'Posting…' : 'Submit Answer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AnswerForm;
