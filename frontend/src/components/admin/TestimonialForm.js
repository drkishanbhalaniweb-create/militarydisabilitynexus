import { Save, X } from 'lucide-react';
import StarRating from '../testimonials/StarRating';
import { TESTIMONIAL_TAG_OPTIONS } from '../../lib/testimonials';

const TestimonialForm = ({
    title,
    formData,
    loading,
    onChange,
    onTagToggle,
    onRatingChange,
    onCancel,
    onSubmit,
    submitLabel,
}) => (
    <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <button
                type="button"
                onClick={onCancel}
                className="text-slate-600 hover:text-slate-900"
                aria-label="Close testimonial form"
            >
                <X className="h-6 w-6" />
            </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-slate-900">Testimonial Details</h2>

                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Client Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Exact public name to display"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Branch of Military Service *
                        </label>
                        <input
                            type="text"
                            name="branch"
                            value={formData.branch}
                            onChange={onChange}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Example: Army, Navy, Marine Corps"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TESTIMONIAL_TAG_OPTIONS.map((tag) => {
                                const selected = formData.tags.includes(tag);

                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => onTagToggle(tag)}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selected
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            You can select more than one tag for a single testimonial.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Star Rating *
                        </label>
                        <div className="flex items-center gap-4">
                            <StarRating value={formData.rating} onChange={onRatingChange} size={26} />
                            <span className="text-sm font-medium text-slate-600">
                                {formData.rating} out of 5
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Feedback *
                        </label>
                        <textarea
                            name="feedback"
                            value={formData.feedback}
                            onChange={onChange}
                            required
                            rows="10"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Paste the full testimonial here"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-300 px-6 py-2 text-slate-700 transition-colors hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Save className="h-5 w-5" />
                    <span>{loading ? 'Saving...' : submitLabel}</span>
                </button>
            </div>
        </form>
    </div>
);

export default TestimonialForm;
