import { User, CheckCircle, Award } from 'lucide-react';

const SIZE_MAP = {
  sm: {
    avatar: 'w-5 h-5 text-[10px]',
    name: 'text-xs',
    icon: 'w-3 h-3',
    badge: 'text-[9px] px-1 py-px',
  },
  md: {
    avatar: 'w-7 h-7 text-xs',
    name: 'text-sm',
    icon: 'w-3.5 h-3.5',
    badge: 'text-[10px] px-1.5 py-px',
  },
  lg: {
    avatar: 'w-9 h-9 text-sm',
    name: 'text-base',
    icon: 'w-4 h-4',
    badge: 'text-[10px] px-1.5 py-0.5',
  },
};

export function UserBadge({
  displayName,
  avatarColor,
  isVerified = false,
  isAnonymous = false,
  isExpert = false,
  role,
  size = 'md',
}) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const name = isAnonymous ? 'Anonymous' : displayName || 'User';
  const initial = name.charAt(0).toUpperCase();

  return (
    <span className="inline-flex items-center gap-1.5">
      {isAnonymous ? (
        <span
          className={`${s.avatar} rounded-full bg-slate-300 text-slate-600 flex items-center justify-center flex-shrink-0`}
        >
          <User className={s.icon} />
        </span>
      ) : (
        <span
          className={`${s.avatar} rounded-full text-white font-semibold flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: avatarColor || '#64748b' }}
        >
          {initial}
        </span>
      )}

      <span className={`font-medium text-slate-700 ${s.name} truncate max-w-[140px]`}>
        {name}
      </span>

      {isVerified && (
        <CheckCircle className={`${s.icon} text-emerald-500 flex-shrink-0`} aria-label="Verified" />
      )}

      {isExpert && (
        <Award className={`${s.icon} text-amber-500 flex-shrink-0`} aria-label="Expert" />
      )}

      {role === 'admin' && (
        <span className={`${s.badge} bg-emerald-100 text-emerald-700 font-semibold rounded`}>
          MOD
        </span>
      )}
    </span>
  );
}

export default UserBadge;
