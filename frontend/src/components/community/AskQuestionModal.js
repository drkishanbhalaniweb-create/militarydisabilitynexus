import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AVAILABLE_TAGS } from './TagSidebar';

export function AskQuestionModal({ isOpen, onClose, communityUser, onLogin, onSuccess }) {
  const [step, setStep] = useState(communityUser ? 2 : 1);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const backdropRef = useRef(null);

  useEffect(() => {
    setStep(communityUser ? 2 : 1);
  }, [communityUser]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const filteredTags = AVAILABLE_TAGS.filter(
    (t) =>
      t.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.includes(t)
  );

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) return;
    setLoginLoading(true);
    try {
      await onLogin(email.trim(), displayName.trim());
      setStep(2);
    } catch {
      toast.error('Failed to join. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (wordCount > 200) {
      toast.error('Details must be 200 words or fewer');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/community/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          tags: selectedTags,
          is_anonymous: isAnonymous,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to post question');
      }

      const data = await res.json();
      toast.success('Question posted!');
      onSuccess?.(data);
      resetForm();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setTagSearch('');
    setIsAnonymous(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setTagSearch('');
  };

  const totalSteps = communityUser ? 1 : 2;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ask a question"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ask the Community</h2>
            {totalSteps === 2 && (
              <div className="flex gap-1.5 mt-1.5">
                {[1, 2].map((s) => (
                  <span
                    key={s}
                    className={`w-2 h-2 rounded-full ${
                      s <= step ? 'bg-navy-700' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            id="close-ask-modal"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-sm text-slate-600">
                Join the conversation by entering your details below.
              </p>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm"
                />
              </div>
              <div>
                <label htmlFor="login-display-name" className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  id="login-display-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to appear"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm"
                />
              </div>
              <button
                id="login-submit"
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#B91C3C] text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loginLoading ? 'Joining…' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question-title" className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="question-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm"
                />
              </div>

              <div>
                <label htmlFor="question-content" className="block text-sm font-medium text-slate-700 mb-1">
                  Details
                </label>
                <textarea
                  id="question-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add more context (optional)..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm resize-y"
                />
                <p className={`text-xs mt-1 ${wordCount > 200 ? 'text-red-500' : 'text-slate-400'}`}>
                  {wordCount}/200 words
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-navy-100 text-navy-700 text-xs px-2 py-0.5 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="hover:text-navy-900"
                          aria-label={`Remove ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="tag-search"
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tags…"
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none text-sm"
                  />
                </div>
                {tagSearch && filteredTags.length > 0 && (
                  <div className="mt-1 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                {!tagSearch && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {filteredTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="post-anonymously"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
                />
                <span className="text-sm text-slate-600">Post anonymously</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  id="submit-question"
                  type="submit"
                  disabled={!title.trim() || submitting}
                  className="flex-1 bg-[#B91C3C] text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {submitting ? 'Posting…' : 'Post Question'}
                </button>
                <button
                  id="cancel-question"
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Forum Disclaimer */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            This is a public forum. Anything you post can be seen by anyone and may appear in search results. Keep your question general, and never post personal identifiers — full name, Social Security number, date of birth, address, VA file or claim number, or copies of your records or decision letters. Describe your situation in general terms instead (e.g., &quot;I'm rated 30% for PTSD and my symptoms have worsened&quot;). By posting, you allow Military Disability Nexus to display, moderate, and respond to your content.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskQuestionModal;
