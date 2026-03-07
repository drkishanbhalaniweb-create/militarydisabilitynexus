import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Briefcase, Filter, Share2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { caseStudyApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';

const AVAILABLE_TAGS = [
    'SMC/Aid & Attendance',
    'Primary Service Connection',
    'Secondary Service Connection',
    'Mental Health Claim',
    '1151 Claim',
    'Claim Readiness Review'
];

const getTagColors = (tag) => {
    if (tag?.includes('SMC') || tag?.includes('Aid')) {
        return { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', dot: 'bg-amber-500' };
    }
    if (tag?.includes('PTSD') || tag?.includes('Mental')) {
        return { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', dot: 'bg-blue-500' };
    }
    if (tag?.includes('Secondary')) {
        return { text: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', dot: 'bg-orange-500' };
    }
    if (tag?.includes('Primary')) {
        return { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-500' };
    }
    if (tag?.includes('1151')) {
        return { text: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300', dot: 'bg-purple-500' };
    }
    if (tag?.includes('Claim Readiness') || tag?.includes('Readiness Review')) {
        return { text: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-300', dot: 'bg-indigo-500' };
    }
    return { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', dot: 'bg-slate-500' };
};

export async function getStaticProps() {
    try {
        const initialCaseStudies = await caseStudyApi.getAll();
        return {
            props: {
                initialCaseStudies,
            },
            revalidate: 10,
        };
    } catch (error) {
        console.error('Error fetching case studies:', error);
        return {
            props: {
                initialCaseStudies: [],
            },
            revalidate: 60,
        };
    }
}

const CaseStudies = ({ initialCaseStudies }) => {
    const [caseStudies, setCaseStudies] = useState(initialCaseStudies || []);
    const [filteredCaseStudies, setFilteredCaseStudies] = useState(initialCaseStudies || []);
    const [selectedTag, setSelectedTag] = useState(null);

    const handleShare = async (event, slug) => {
        event.preventDefault();
        event.stopPropagation();
        const url = `${window.location.origin}/case-studies/${slug}`;
        await navigator.clipboard.writeText(url);
        toast.success('Case study link copied to clipboard');
    };

    useEffect(() => {
        if (selectedTag) {
            setFilteredCaseStudies(
                caseStudies.filter((caseStudy) => caseStudy.tags && caseStudy.tags.includes(selectedTag))
            );
        } else {
            setFilteredCaseStudies(caseStudies);
        }
    }, [selectedTag, caseStudies]);

    return (
        <Layout>
            <SEO
                title="Case Studies - Success Stories & Client Results"
                description="Explore case study summaries showing how medically grounded evidence and documentation support VA disability claims."
                keywords="case studies, success stories, client results, VA disability success, nexus letter results"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Case Studies', path: '/case-studies' }
                ]}
            />
            <div className="relative min-h-screen overflow-hidden">
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <img
                        src="/blogimg.png"
                        alt="Background pattern"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{
                            filter: 'blur(4px)',
                            transform: 'scale(1.1)'
                        }}
                        role="presentation"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-white/50"></div>
                </div>

                <div className="relative z-10">
                    <section className="py-20">
                        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                            <div className="rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-12 text-center shadow-2xl sm:p-16">
                                <div className="mb-6 inline-flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg" style={{ backgroundColor: '#B91C3C' }}>
                                    <Briefcase className="h-4 w-4" />
                                    <span>CASE STUDIES</span>
                                </div>
                                <h1 className="text-4xl font-bold text-white sm:text-5xl">
                                    Success Stories
                                </h1>
                                <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-white/90 sm:text-xl">
                                    These summaries show the type of documentation problems veterans bring to the site and the kind of medically grounded support that can help clarify a claim. The detailed narrative lives on each case study’s own page.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="mx-auto max-w-7xl px-4 py-12 pb-20 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-2">
                                <Filter className="h-5 w-5 text-slate-600" />
                                <span className="text-sm font-semibold text-slate-700">Filter by Category:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${selectedTag === null
                                            ? 'bg-slate-800 text-white shadow-lg'
                                            : 'border border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                                        }`}
                                >
                                    All Case Studies
                                </button>
                                {AVAILABLE_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${selectedTag === tag
                                                ? 'bg-amber-500 text-white shadow-lg'
                                                : 'border border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            {selectedTag && (
                                <p className="mt-3 text-sm text-slate-600">
                                    Showing {filteredCaseStudies.length} case {filteredCaseStudies.length === 1 ? 'study' : 'studies'} for "{selectedTag}"
                                </p>
                            )}
                        </div>

                        {filteredCaseStudies.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-xl text-slate-600">
                                    {selectedTag ? `No case studies found for "${selectedTag}"` : 'No case studies available yet'}
                                </p>
                                {selectedTag && (
                                    <button
                                        onClick={() => setSelectedTag(null)}
                                        className="mt-4 font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        View all case studies
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCaseStudies.map((caseStudy) => {
                                    const primaryTag = caseStudy.tags?.[0] || 'Case Study';
                                    const tagColors = getTagColors(primaryTag);

                                    return (
                                        <article
                                            key={caseStudy.id}
                                            data-testid={`case-study-${caseStudy.slug}`}
                                            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
                                        >
                                            <div className="mb-4 flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${tagColors.bg} ${tagColors.text} ${tagColors.border}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${tagColors.dot}`}></span>
                                                    {primaryTag}
                                                </span>
                                                <button
                                                    onClick={(event) => handleShare(event, caseStudy.slug)}
                                                    className="ml-auto rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-600"
                                                    title="Copy Link"
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <h2 className="text-xl font-bold leading-tight text-slate-900">
                                                {caseStudy.title}
                                            </h2>
                                            <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                                {caseStudy.excerpt}
                                            </p>

                                            {caseStudy.tags && caseStudy.tags.length > 1 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {caseStudy.tags.slice(1, 3).map((tag) => (
                                                        <span key={`${caseStudy.id}-${tag}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-6 border-t border-slate-200 pt-5">
                                                <Link
                                                    href={`/case-studies/${caseStudy.slug}`}
                                                    className="inline-flex items-center gap-2 font-semibold text-navy-700 transition-colors hover:text-navy-800"
                                                >
                                                    Read full case study
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mx-auto mt-16 mb-12 max-w-5xl">
                            <div className="rounded-2xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
                                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                    What these case studies are for
                                </h2>
                                <ul className="mt-6 space-y-4 text-slate-700">
                                    <li className="leading-relaxed">They are proof summaries, not outcome guarantees.</li>
                                    <li className="leading-relaxed">They show how documentation issues can be framed more clearly for VA decision-makers.</li>
                                    <li className="leading-relaxed">The index page stays brief so the detailed narrative remains on the individual case-study URLs.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mx-auto mb-16 max-w-5xl">
                            <div className="rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-10 text-center shadow-2xl sm:p-14">
                                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                    Ready to Strengthen Your VA Claim?
                                </h2>
                                <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-white/90">
                                    If your claim has been denied, deferred, or feels stuck, a clearer medical opinion may help the VA better understand your condition and its connection to service.
                                </p>
                                <div className="mt-8 flex flex-wrap justify-center gap-4">
                                    <Link
                                        href="/contact"
                                        className="inline-block rounded-lg px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        Start Your Case Review
                                    </Link>
                                    <Link
                                        href="/testimonials"
                                        className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                                    >
                                        Read Testimonials
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CaseStudies;
