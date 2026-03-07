import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Filter, Quote, ShieldCheck, Stethoscope } from 'lucide-react';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';
import TestimonialCard from '../src/components/testimonials/TestimonialCard';
import { testimonialApi } from '../src/lib/api';
import {
    getAverageRating,
    getTagCount,
    getUniqueBranchCount,
    TESTIMONIAL_TAG_OPTIONS,
    testimonialThemes,
} from '../src/lib/testimonials';

export async function getStaticProps() {
    try {
        const initialTestimonials = await testimonialApi.getAll();

        return {
            props: {
                initialTestimonials,
            },
            revalidate: 10,
        };
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return {
            props: {
                initialTestimonials: [],
            },
            revalidate: 60,
        };
    }
}

const TestimonialsPage = ({ initialTestimonials }) => {
    const [selectedTag, setSelectedTag] = useState(null);

    const filteredTestimonials = useMemo(() => {
        if (!selectedTag) {
            return initialTestimonials;
        }

        return initialTestimonials.filter((testimonial) =>
            (testimonial.tags || []).includes(selectedTag)
        );
    }, [initialTestimonials, selectedTag]);

    const averageRating = getAverageRating(initialTestimonials);
    const branchCount = getUniqueBranchCount(initialTestimonials);
    const latestTestimonial = initialTestimonials[0] || null;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Testimonials and Veteran Feedback',
        url: 'https://www.militarydisabilitynexus.com/testimonials',
        description: 'Read real client feedback for Military Disability Nexus across nexus letters, DBQs, Aid and Attendance support, claim reviews, C&P exam coaching, and 1151 claims.',
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: initialTestimonials.length,
        },
        about: {
            '@type': 'Organization',
            name: 'Military Disability Nexus',
            url: 'https://www.militarydisabilitynexus.com',
        },
    };

    return (
        <Layout>
            <SEO
                title="Testimonials and Veteran Feedback"
                description="Read real client feedback for Military Disability Nexus across nexus letters, DBQs, Aid and Attendance support, claim reviews, C&P exam coaching, and 1151 claims."
                canonical="/testimonials"
                structuredData={structuredData}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Testimonials', path: '/testimonials' },
                ]}
            />

            <div className="min-h-screen bg-slate-50">
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(185,28,60,0.18),transparent_28%)]" />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                            <div className="max-w-4xl">
                                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                                    Testimonials
                                </div>
                                <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                                    Real feedback from veterans who used the service
                                </h1>
                                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                    On a YMYL site, this page should reinforce trust with specificity: who the client was, what kind of help they received, and what the experience actually felt like.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    <Link
                                        href="/forms?view=schedule"
                                        className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        Start Your Review
                                    </Link>
                                    <Link
                                        href="/case-studies"
                                        className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 font-semibold text-white/90 transition-colors hover:bg-white/10"
                                    >
                                        See Case Studies
                                    </Link>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                                <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                                    <div className="text-3xl font-bold text-white">{initialTestimonials.length}</div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                                        Public testimonials
                                    </div>
                                </article>
                                <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                                    <div className="text-3xl font-bold text-white">
                                        {averageRating ? averageRating.toFixed(1) : 'N/A'}
                                    </div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                                        Average stars
                                    </div>
                                </article>
                                <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                                    <div className="text-3xl font-bold text-white">{branchCount}</div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                                        Branches represented
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                {latestTestimonial && (
                    <section className="py-16 sm:py-20">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
                                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
                                    <div className="flex items-center gap-3 text-navy-700">
                                        <Quote className="h-7 w-7" />
                                        <span className="text-sm font-semibold uppercase tracking-[0.22em]">
                                            Latest Feedback
                                        </span>
                                    </div>
                                    <p className="mt-6 text-xl italic leading-relaxed text-slate-700 sm:text-2xl">
                                        "{latestTestimonial.feedback.split(/\n{2,}/)[0]}"
                                    </p>
                                    <div className="mt-8">
                                        <div className="font-semibold text-slate-900">{latestTestimonial.name}</div>
                                        <div className="text-sm text-slate-500">{latestTestimonial.branch}</div>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {testimonialThemes.map((theme, index) => {
                                        const icons = [
                                            ShieldCheck,
                                            Stethoscope,
                                            Filter,
                                        ];
                                        const Icon = icons[index] || ShieldCheck;

                                        return (
                                            <article
                                                key={theme.title}
                                                className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
                                            >
                                                <Icon className="h-8 w-8 text-navy-700" />
                                                <h2 className="mt-4 text-xl font-bold text-slate-900">{theme.title}</h2>
                                                <p className="mt-3 leading-relaxed text-slate-600">{theme.summary}</p>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="pb-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                                <Filter className="h-4 w-4" />
                                <span>Filter by service</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTag(null)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedTag === null
                                        ? 'bg-slate-900 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                All Testimonials
                            </button>
                            {TESTIMONIAL_TAG_OPTIONS.map((tag) => {
                                const count = getTagCount(initialTestimonials, tag);

                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setSelectedTag(tag)}
                                        disabled={!count}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedTag === tag
                                                ? 'bg-red-700 text-white'
                                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                            } ${count ? '' : 'cursor-not-allowed opacity-40'}`}
                                    >
                                        {tag} {count ? `(${count})` : ''}
                                    </button>
                                );
                            })}
                        </div>

                        {filteredTestimonials.length === 0 ? (
                            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    No testimonials match that tag yet
                                </h2>
                                <p className="mt-3 text-slate-600">
                                    Clear the filter to see all public testimonials currently on the site.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTag(null)}
                                    className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
                                >
                                    Show all testimonials
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {filteredTestimonials.map((testimonial) => (
                                    <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="pb-20">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-[2rem] bg-gradient-to-br from-navy-700 to-slate-900 px-8 py-10 text-white shadow-2xl sm:px-12 sm:py-14">
                            <h2 className="text-3xl font-bold sm:text-4xl">Need help with your own claim file?</h2>
                            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/85">
                                Testimonials help with trust, but they should sit next to clinician bios, service details, and case studies that explain the work more concretely.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    href="/case-studies"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-navy-800 transition-colors hover:bg-slate-100"
                                >
                                    Browse Case Studies
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/services"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                                >
                                    Explore Services
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default TestimonialsPage;
