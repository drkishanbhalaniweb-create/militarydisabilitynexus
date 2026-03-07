import Link from 'next/link';
import { ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';
import SEO from '../src/components/SEO';
import Layout from '../src/components/Layout';
import {
    buildOrganizationSchema,
    clinicalReviewTeam,
    medicalReviewHighlights,
} from '../src/lib/trust';

const MedicalReviewPolicyPage = () => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Medical Review Policy',
        url: 'https://www.militarydisabilitynexus.com/medical-review-policy',
        about: buildOrganizationSchema(),
    };

    return (
        <Layout>
            <SEO
                title="Medical Review Policy"
                description="Learn how Military Disability Nexus handles clinical review for medically sensitive educational and proof content on this website."
                canonical="/medical-review-policy"
                structuredData={structuredData}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Medical Review Policy', path: '/medical-review-policy' },
                ]}
            />

            <div className="min-h-screen bg-slate-50 py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 px-8 py-12 text-white shadow-2xl sm:px-12">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                            <Stethoscope className="h-4 w-4" />
                            <span>Medical Review Policy</span>
                        </div>
                        <h1 className="mt-6 text-4xl font-bold sm:text-5xl">How medically sensitive content is reviewed</h1>
                        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">
                            On a site about VA disability evidence, medical language has to be accurate and tightly scoped. This page explains what clinical review means here and what it does not mean.
                        </p>
                    </section>

                    <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-navy-700" />
                            <h2 className="text-2xl font-bold text-slate-900">Clinical review standards</h2>
                        </div>
                        <div className="mt-6 space-y-4">
                            {medicalReviewHighlights.map((item) => (
                                <div key={item} className="rounded-xl bg-slate-50 p-4 text-slate-700">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-10 grid gap-6 lg:grid-cols-2">
                        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900">What review covers</h2>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                Review is performed under the <strong>{clinicalReviewTeam.name}</strong> label for medically sensitive educational pages, case studies, and proof content where inaccurate wording could mislead visitors.
                            </p>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                The emphasis is on medical reasoning boundaries, service scope, and ensuring the site does not drift into treatment claims or legal guarantees.
                            </p>
                        </article>

                        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900">What review does not mean</h2>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                Clinical review of website content is not personal medical advice, diagnosis, or treatment. It does not create a physician-patient relationship and it does not replace individualized evaluation from a treating clinician.
                            </p>
                            <p className="mt-4 leading-relaxed text-slate-700">
                                The review standard exists to improve content quality, not to broaden the legal scope of the business.
                            </p>
                        </article>
                    </section>

                    <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
                        <h2 className="text-2xl font-bold text-slate-900">Related trust pages</h2>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Link href="/editorial-policy" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">
                                Editorial Policy
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/disclaimer" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
                                Disclaimer
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default MedicalReviewPolicyPage;
