import { useState, useEffect } from 'react';

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

function formatFullDate(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TimeAgo({ date, className = 'text-sm text-slate-500' }) {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);

    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds >= 3600) return;

    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [date]);

  if (!mounted) return <span className={className} />;

  return (
    <time
      dateTime={new Date(date).toISOString()}
      title={formatFullDate(date)}
      className={className}
    >
      {getTimeAgo(date)}
    </time>
  );
}

export default TimeAgo;
