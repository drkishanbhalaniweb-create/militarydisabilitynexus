import { CalendarDays } from 'lucide-react';
import StarRating from './StarRating';
import {
    getTestimonialTagTone,
    shortenFeedback,
} from '../../lib/testimonials';

const formatDate = (dateString) => {
    if (!dateString) {
        return null;
    }

    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const TestimonialCard = ({
    testimonial,
    compact = false,
    showDate = true,
    className = '',
}) => {
    const feedback = compact
        ? shortenFeedback(testimonial.feedback, 280)
        : testimonial.feedback;

    const paragraphs = feedback
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return (
        <article className={`rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <StarRating value={testimonial.rating} className="mb-3" />
                    <h3 className="text-xl font-bold text-slate-900">{testimonial.name}</h3>
                    {testimonial.branch && (
                        <p className="mt-1 text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                            {testimonial.branch}
                        </p>
                    )}
                </div>

                {showDate && testimonial.created_at && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{formatDate(testimonial.created_at)}</span>
                    </div>
                )}
            </div>

            {testimonial.tags?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                    {testimonial.tags.map((tag) => (
                        <span
                            key={`${testimonial.id}-${tag}`}
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getTestimonialTagTone(tag)}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-700">
                {paragraphs.map((paragraph, index) => (
                    <p key={`${testimonial.id}-paragraph-${index}`}>{paragraph}</p>
                ))}
            </div>
        </article>
    );
};

export default TestimonialCard;
