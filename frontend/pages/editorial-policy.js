import Link from 'next/link';
import { ArrowRight, FilePenLine, ShieldCheck } from 'lucide-react';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';
import {
    buildOrganizationSchema,
    editorialPolicyHighlights,
    editorialTeam,
} from '../src/lib/trust';

const EditorialPolicyPage = () => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Editorial Policy',
        url: 'https://www.militarydisabilitynexus.com/editorial-policy',
        about: buildOrganizationSchema(),
    };

    return (
        <Layout>
            <SEO
                title="Editorial Policy"
                description="Learn how Military Disability Nexus plans, writes, reviews, and maintains educational content for veterans researching VA disability documentation."
                canonical="/editorial-policy"
                structuredData={structuredData}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Editorial Policy', path: '/editorial-policy' },
                ]}
            />

            <div className="min-h-screen bg-slate-50 py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 px-8 py-12 text-white shadow-2xl sm:px-12">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                            <FilePenLine className="h-4 w-4" />
                            <span>Editorial Policy</span>
                        </div>
                        <h1 className="mt-6 text-4xl font-bold sm:text-5xl">How site content is written and maintained</h1>
                        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">
                            Because this is a YMYL website, content has to be clear, restrained, and aligned with the actual scope of the business. This page explains the standard used for educational pages, service pages, and proof content.
                        </p>
                    </section>

                    <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-navy-700" />
                            <h2 className="text-2xl font-bold text-slate-900">Editorial standards</h2>
                        </div>
                        <div className="mt-6 space-y-4">
                            {editorialPolicyHighlights.map((item) => (
                                <div key={item} className="rounded-xl bg-slate-50 p-4 text-slate-700">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-10 grid gap-6 lg:grid-cols-2">
                        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900">Who writes content</h2>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                Content is published under <strong>{editorialTeam.name}</strong>. The goal is to explain VA documentation issues, not to imitate legal representation or treatment advice.
                            </p>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                Pages are reviewed for readability, factual restraint, and consistency with the site’s disclaimers before publication or major updates.
                            </p>
                        </article>

                        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900">How updates happen</h2>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                Pages are updated when service details change, policy language needs clarification, or a page needs stronger trust alignment for veterans making high-stakes decisions.
                            </p>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                Significant changes should preserve legal and clinical boundaries already disclosed elsewhere on the site.
                            </p>
                        </article>
                    </section>

                    <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
                        <h2 className="text-2xl font-bold text-slate-900">Related trust pages</h2>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Link href="/medical-review-policy" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">
                                Medical Review Policy
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
                                About the Team
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default EditorialPolicyPage;
