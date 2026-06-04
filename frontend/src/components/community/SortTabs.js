import { Flame, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

const TABS = [
  { value: 'hot', label: 'Hot', Icon: Flame },
  { value: 'new', label: 'New', Icon: Sparkles },
  { value: 'top', label: 'Top', Icon: TrendingUp },
  { value: 'unanswered', label: 'Unanswered', Icon: HelpCircle },
];

export function SortTabs({ activeSort, onSortChange }) {
  return (
    <nav
      className="flex gap-2 items-center border-b border-slate-200 pb-2"
      role="tablist"
      aria-label="Sort questions"
    >
      {TABS.map(({ value, label, Icon }) => {
        const active = activeSort === value;
        return (
          <button
            key={value}
            id={`sort-tab-${value}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSortChange(value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              active
                ? 'bg-navy-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export default SortTabs;
