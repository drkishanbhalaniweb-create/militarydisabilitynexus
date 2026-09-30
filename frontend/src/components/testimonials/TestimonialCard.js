import Link from 'next/link';
import { CalendarDays, ArrowRight, Video, Award } from 'lucide-react';
import StarRating from './StarRating';
import VideoFacade from './VideoFacade';
import {
    getTestimonialTagTone,
    shortenFeedback,
} from '../../lib/testimonials';

const formatDate = (dateString) => {
    if (!dateString) {
        return null;
    }

    try {
        const d = new Date(dateString);
        return !Number.isNaN(d.getTime())
            ? d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : null;
    } catch {
        return null;
    }
};

const TestimonialCard = ({
    testimonial,
    compact = false,
    showDate = true,
    className = '',
}) => {
    const hasVideo = Boolean(testimonial.video_url);

    const feedback = compact
        ? shortenFeedback(testimonial.feedback, 280)
        : testimonial.feedback;

    const paragraphs = feedback
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return (
        <article className={`flex flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
            <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <StarRating value={testimonial.rating} className="mb-3" />
                            {testimonial.is_pinned && (
                                <span
                                    className="mb-3 inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700"
                                    aria-label="Pinned testimonial"
                                >
                                    <span>📌 {hasVideo ? 'Pinned Story' : 'Featured Review'}</span>
                                </span>
                            )}
                            {hasVideo && (
                                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                                    <Video className="h-3 w-3" />
                                    <span>Video Story</span>
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{testimonial.name || 'Veteran'}</h3>
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

                {testimonial.claim_outcome && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{testimonial.claim_outcome}</span>
                    </div>
                )}

                {/* Video Facade for Video Testimonials */}
                {hasVideo && (
                    <div className="mt-4 mx-auto w-full max-w-md">
                        <VideoFacade
                            videoUrl={testimonial.video_url}
                            aspectRatio={testimonial.video_aspect_ratio || '4:5'}
                            thumbnailUrl={testimonial.video_thumbnail_url}
                            duration={testimonial.video_duration}
                            title={`${testimonial.name || 'Veteran'}'s Video Testimonial`}
                        />
                    </div>
                )}

                {testimonial.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
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

                <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-700">
                    {paragraphs.map((paragraph, index) => (
                        <p key={`${testimonial.id}-paragraph-${index}`}>{paragraph}</p>
                    ))}
                </div>
            </div>

            {hasVideo && testimonial.slug && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                        href={`/testimonials/${testimonial.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#B91C3C] hover:text-[#991530] transition-colors group"
                    >
                        <span>Watch Case Breakdown & Full Transcript</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            )}
        </article>
    );
};

export default TestimonialCard;
