import { Star } from 'lucide-react';

const StarRating = ({
    value = 0,
    onChange = null,
    size = 18,
    className = '',
}) => {
    const safeValue = Math.max(0, Math.min(5, Number(value) || 0));

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= safeValue;
                const baseClasses = filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300';

                if (onChange) {
                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            className="rounded-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Set rating to ${star} star${star === 1 ? '' : 's'}`}
                        >
                            <Star className={baseClasses} size={size} />
                        </button>
                    );
                }

                return <Star key={star} className={baseClasses} size={size} aria-hidden="true" />;
            })}
        </div>
    );
};

export default StarRating;
