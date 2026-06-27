import { Tag, BarChart3, X } from 'lucide-react';

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
  'Others',
];

export function TagSidebar({ selectedTag, onTagSelect, stats, onAskQuestion }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block space-y-4">
        {/* Veterans Crisis Line Card */}
        <div className="bg-[#FCF9F5] border border-slate-200 border-l-4 border-l-[#B91C3C] rounded-r-lg p-4 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#B91C3C] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm leading-none select-none">
            +
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-850">Veterans Crisis Line</span> —{' '}
            <strong className="font-semibold text-slate-900">988 then press 1</strong>,{' '}
            text <strong className="font-semibold text-slate-900">838255</strong>, or chat at{' '}
            <a
              href="https://www.veteranscrisisline.net/get-help-now/chat/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#B91C3C] hover:text-red-800 font-semibold"
            >
              VeteransCrisisLine.net/Chat
            </a>.
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
            <Tag className="w-4 h-4" />
            Filter by Tag
          </h3>
          <div className="border-t border-slate-100 mb-3" />

          <div className="max-h-64 overflow-y-auto space-y-0.5 scrollbar-hide">
            {AVAILABLE_TAGS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  id={`tag-filter-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => onTagSelect(active ? null : tag)}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                    active
                      ? 'bg-navy-100 text-navy-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${active ? 'bg-navy-600' : 'bg-slate-300'}`} />
                  {tag}
                </button>
              );
            })}
          </div>

          {selectedTag && (
            <button
              id="clear-tag-filter"
              type="button"
              onClick={() => onTagSelect(null)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear filter
            </button>
          )}
        </div>

        {stats && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
              <BarChart3 className="w-4 h-4" />
              Community Stats
            </h3>
            <div className="border-t border-slate-100 mb-3" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Questions</span>
                <span className="font-semibold text-slate-800">{stats.totalQuestions ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Answers</span>
                <span className="font-semibold text-slate-800">{stats.totalAnswers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Members</span>
                <span className="font-semibold text-slate-800">{stats.totalMembers ?? 0}</span>
              </div>
            </div>
          </div>
        )}

        <button
          id="sidebar-ask-question"
          type="button"
          onClick={onAskQuestion}
          className="w-full bg-[#B91C3C] text-white rounded-lg py-2.5 font-medium hover:opacity-90 transition-opacity"
        >
          Ask a Question
        </button>
      </aside>

      {/* Mobile horizontal tag bar */}
      <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {AVAILABLE_TAGS.map((tag) => {
          const active = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(active ? null : tag)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                active
                  ? 'bg-navy-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </>
  );
}

export { AVAILABLE_TAGS };
export default TagSidebar;
