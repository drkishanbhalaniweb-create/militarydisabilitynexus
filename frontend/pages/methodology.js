import Layout from '../src/components/Layout';
import SEO from '../src/components/SEO';
import Link from 'next/link';
import { clinicalProfileApi } from '../src/lib/api';
import { CheckCircle, ShieldCheck } from 'lucide-react';

const LAST_REVIEWED = 'June 2026';

export async function getStaticProps() {
    try {
        const reviewers = await clinicalProfileApi.getAll(true);
        return {
            props: {
                reviewers: reviewers || [],
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error fetching clinical profiles in methodology:', error);
        return {
            props: {
                reviewers: [],
            },
            revalidate: 300,
        };
    }
}

export default function Methodology({ reviewers }) {
    const getShortBio = (bio) => {
        if (!bio) return '';
        // Split by sentence endings (. followed by space or end of string)
        const sentences = bio.match(/[^.!?]+[.!?]+(\s|$)/g);
        if (!sentences || sentences.length === 0) return bio;
        return sentences.slice(0, 2).join('').trim();
    };

    return (
        <Layout>
            <SEO
                title="Our Methodology & Editorial Standards | Military Disability Nexus"
                description="How Military Disability Nexus produces clinical content: named clinician reviewers, peer-reviewed and 38 CFR sourcing, honest independent opinions, and transparent use of AI."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Methodology', path: '/methodology' }]}
            />
            
            <div className="min-h-screen bg-slate-50 py-16 sm:py-20 font-sans">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 px-8 py-12 text-white shadow-2xl sm:px-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b8893b]">
                                <span>Methodology &amp; Standards</span>
                            </div>
                            <h1 className="mt-6 text-4xl font-bold sm:text-5xl leading-tight text-white">
                                How we research, review, and stand behind our content
                            </h1>
                            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
                                Accurate medical reasoning can change the outcome of a VA claim. Here is exactly how our content and evaluations are produced &mdash; who reviews them, what we cite, and the limits we're honest about.
                            </p>
                            <div className="mt-6 text-xs text-slate-400 font-medium">
                                Last reviewed: {LAST_REVIEWED} &middot; Maintained by the MDN Clinical Editorial Team
                            </div>
                        </div>
                    </section>

                    <main className="mt-12">
                        <p className="text-xl text-slate-700 leading-relaxed font-medium mb-10">
                            Every page on this site is built to one rule: give veterans the medicine and the law straight, sourced to authority, and reviewed by a licensed clinician before it's published.
                        </p>

                        <div className="space-y-8">
                            {/* 1. Clinical authorship & review */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        1
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Clinical authorship &amp; review</h2>
                                        <p className="text-slate-700 leading-relaxed mb-6">
                                            Every article, guide, and case study is authored or reviewed by a licensed healthcare professional with direct experience in independent medical opinions (IMOs) and the VA rating schedule. Clinical statements are checked against the source before publication. Our current medical reviewers:
                                        </p>

                                        {/* Reviewers Grid */}
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            {reviewers && reviewers.length > 0 ? (
                                                reviewers.map((profile) => (
                                                    <div key={profile.id} className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col justify-between shadow-sm">
                                                        <div>
                                                            <div className="flex items-center gap-4 mb-4">
                                                                {profile.photo_url ? (
                                                                    <img
                                                                        src={profile.photo_url}
                                                                        alt={profile.full_name}
                                                                        className="w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border border-slate-200 flex-shrink-0">
                                                                        <svg className="w-6 h-6 text-[#8b2332]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{profile.full_name}</h3>
                                                                    <p className="text-sm font-semibold text-[#8b2332] mt-0.5">{profile.credentials}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-slate-600 text-sm leading-relaxed">{getShortBio(profile.bio)}</p>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4 text-xs font-semibold">
                                                            <Link href={`/clinician/${profile.slug}`} className="text-[#8b2332] hover:text-[#1e3a5f] hover:underline flex items-center gap-1">
                                                                Read Profile &rarr;
                                                            </Link>
                                                            {profile.linkedin_url && (
                                                                <a
                                                                    href={profile.linkedin_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-slate-500 hover:text-slate-800 hover:underline"
                                                                >
                                                                    LinkedIn
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[#8b2332] font-semibold text-sm uppercase tracking-wider mb-2">Clinical Review Team</span>
                                                    <h3 className="font-bold text-slate-900 text-lg">MDN Clinical Reviewers</h3>
                                                    <p className="text-slate-600 text-sm leading-relaxed mt-2 max-w-md">
                                                        Medically sensitive content is reviewed by licensed physicians, NPs, and PAs with direct experience in VA rating schedule guidelines.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                                            Each reviewer's name and credentials appear on the content they review. You can verify any clinician's license through the relevant state board.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* 2. What we cite — and how */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What we cite &mdash; and how</h2>
                                        <p className="text-slate-700 leading-relaxed">
                                            We don't ask you to take our word for it. Our content is sourced to primary authority, not summarized from other blogs:
                                        </p>
                                        <ul className="mt-6 space-y-4">
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                                                <p className="text-slate-700 leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Rating criteria</strong> cite the governing regulation by diagnostic code (for example, 38 CFR &sect; 4.124a, DC 8100 for migraine), drawn from the VA Schedule for Rating Disabilities (VASRD).
                                                </p>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                                                <p className="text-slate-700 leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Medical mechanism claims</strong> cite peer-reviewed literature &mdash; PubMed/NCBI, JAMA, NEJM, and established clinical guidelines.
                                                </p>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                                                <p className="text-slate-700 leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Case examples</strong> cite the actual Board of Veterans' Appeals decision by citation and docket number, so you can read the source yourself.
                                                </p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Independence, objectivity & honest opinions */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        3
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Independence, objectivity &amp; honest opinions</h2>
                                        <p className="text-slate-700 leading-relaxed">
                                            Military Disability Nexus is an independent medical-evidence provider. We are not a law firm, we do not provide legal advice, and we are not affiliated with, endorsed by, or acting on behalf of the U.S. Department of Veterans Affairs.
                                        </p>
                                        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-6 shadow-sm">
                                            <div className="flex gap-4">
                                                <ShieldCheck className="h-6 w-6 text-amber-700 flex-shrink-0 mt-0.5" />
                                                <div className="space-y-3">
                                                    <p className="text-slate-700 text-sm leading-relaxed">
                                                        <strong className="text-slate-900 font-semibold">Our clinicians give honest opinions based on the evidence.</strong> We do not guarantee a favorable opinion, and an evaluation may conclude that the evidence does not support a service connection. A clinician's assessment is independent of whether you purchase any service.
                                                    </p>
                                                    <p className="text-slate-700 text-sm leading-relaxed">
                                                        <strong className="text-slate-900 font-semibold">The VA decides every claim.</strong> No website, letter, or evaluation can promise a rating or outcome &mdash; and we never will.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 4. How we use (and don't use) AI */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        4
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How we use (and don't use) AI</h2>
                                        <p className="text-slate-700 leading-relaxed">
                                            We're transparent about our tools. AI may assist with background research and drafting, which helps us cover more conditions in plain language. But <strong className="text-slate-900 font-semibold">AI is never the final authority on anything clinical.</strong> Every medical statement, citation, and rating reference is independently reviewed, verified, and approved by a licensed clinician before it is published. A person &mdash; not a model &mdash; is accountable for the accuracy of what you read here.
                                        </p>
                                        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-semibold text-navy-800">
                                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                                <circle cx="12" cy="12" r="9" />
                                            </svg>
                                            <span>Human-reviewed &middot; clinician-approved</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Corrections & continuous updating */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        5
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Corrections &amp; continuous updating</h2>
                                        <p className="text-slate-700 leading-relaxed">
                                            VA law and medical science change &mdash; presumptive lists expand, rating criteria get revised, new case law lands. We audit and update our content to track PACT Act changes, VASRD revisions, and current medical consensus, and each article shows a "Last reviewed" date.
                                        </p>
                                        <p className="text-slate-700 leading-relaxed mt-4">
                                            Found something that looks wrong? We want to know. Our <Link href="/corrections-policy" className="text-[#8b2332] hover:text-[#1e3a5f] font-semibold hover:underline">Corrections Policy</Link> explains how we review and fix errors, and how to flag one. For the limits of this educational content, see our <Link href="/disclaimer" className="text-[#8b2332] hover:text-[#1e3a5f] font-semibold hover:underline">Disclaimer</Link>.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Meta links block */}
                        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 text-sm text-slate-500">
                            <div className="flex gap-6 font-semibold">
                                <Link href="/corrections-policy" className="hover:text-slate-800 hover:underline">
                                    Corrections Policy
                                </Link>
                                <Link href="/disclaimer" className="hover:text-slate-800 hover:underline">
                                    Disclaimer
                                </Link>
                                <Link href="/about" className="hover:text-slate-800 hover:underline">
                                    About Us
                                </Link>
                            </div>
                            <div className="italic">Page last reviewed: {LAST_REVIEWED}</div>
                        </div>

                        {/* Call To Action */}
                        <div className="mt-12 rounded-[2rem] bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 p-8 text-center text-white shadow-lg sm:p-10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_25%)]" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-3 text-white">Questions about our process?</h3>
                                <p className="mb-6 text-slate-300 max-w-lg mx-auto">
                                    Our clinical team is glad to walk you through how we'd approach your specific case.
                                </p>
                                <Link href="/contact" className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-sm">
                                    Contact us &rarr;
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </Layout>
    );
}
