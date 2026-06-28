import Layout from '../src/components/Layout';
import SEO from '../src/components/SEO';
import Link from 'next/link';
import { Mail, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

const LAST_REVIEWED = 'June 2026';

export default function CorrectionsPolicy() {
    return (
        <Layout>
            <SEO
                title="Corrections Policy | Military Disability Nexus"
                description="How Military Disability Nexus reviews and fixes errors: what counts as a correction, how to report one, our response timeline, and how medical content is re-reviewed by a licensed clinician."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Corrections Policy', path: '/corrections-policy' }]}
            />
            
            <div className="min-h-screen bg-slate-50 py-16 sm:py-20 font-sans">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 px-8 py-12 text-white shadow-2xl sm:px-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b8893b]">
                                <span>Corrections Policy</span>
                            </div>
                            <h1 className="mt-6 text-4xl font-bold sm:text-5xl leading-tight text-white font-serif">
                                When we get something wrong, we fix it &mdash; openly
                            </h1>
                            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
                                Veterans make real decisions based on what we publish. That puts a duty on us to correct errors quickly, mark them clearly, and make it easy for you to flag one.
                            </p>
                            <div className="mt-6 text-xs text-slate-400 font-medium">
                                Last reviewed: {LAST_REVIEWED} &middot; Maintained by the MDN Clinical Editorial Team
                            </div>
                        </div>
                    </section>

                    <main className="mt-12">
                        <p className="text-xl text-slate-700 leading-relaxed font-medium mb-10">
                            Accuracy is the whole point of a clinician-led resource. This policy explains what we treat as a correction, how we handle it, and how to tell us about one.
                        </p>

                        <div className="space-y-8">
                            {/* 1. Correction, update, or clarification */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        1
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">Correction, update, or clarification</h2>
                                        <p className="text-slate-700 leading-relaxed mb-6">
                                            We handle three kinds of changes, and we label them differently so you always know what happened:
                                        </p>

                                        <div className="grid gap-6 sm:grid-cols-3">
                                            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col shadow-sm">
                                                <h3 className="font-bold text-[#8b2332] text-sm uppercase tracking-wider mb-2">Correction</h3>
                                                <p className="text-slate-650 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">A factual error.</strong> A wrong regulation or diagnostic code, a misstated rating percentage, an inaccurate medical statement, a mis-cited case, or a wrong date or figure. Corrections are noted on the page.
                                                </p>
                                            </div>
                                            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col shadow-sm">
                                                <h3 className="font-bold text-[#8b2332] text-sm uppercase tracking-wider mb-2">Update</h3>
                                                <p className="text-slate-655 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">New information changed the facts.</strong> A revised VASRD criterion, a new PACT Act presumptive, or new case law. The content was accurate when published and now reflects the change, with a refreshed "Last reviewed" date.
                                                </p>
                                            </div>
                                            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col shadow-sm">
                                                <h3 className="font-bold text-[#8b2332] text-sm uppercase tracking-wider mb-2">Clarification</h3>
                                                <p className="text-slate-655 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Not wrong, but unclear.</strong> Wording that could be misread. We sharpen the language without changing the underlying facts.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 2. How we handle a correction */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        2
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">How we handle a correction</h2>
                                        <p className="text-slate-700 leading-relaxed mb-6">
                                            When an error is confirmed, we follow the same steps every time:
                                        </p>

                                        <div className="relative border-l border-slate-200 ml-4 pl-8 space-y-6 my-6">
                                            <div className="relative">
                                                <span className="absolute -left-[45px] top-0.5 w-8 h-8 rounded-full bg-slate-50 border-2 border-[#8b2332] text-[#8b2332] font-semibold text-xs flex items-center justify-center font-sans">1</span>
                                                <p className="text-slate-700 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Verify it against the source</strong> &mdash; the regulation, the peer-reviewed literature, or the Board decision &mdash; before changing anything.
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute -left-[45px] top-0.5 w-8 h-8 rounded-full bg-slate-50 border-2 border-[#8b2332] text-[#8b2332] font-semibold text-xs flex items-center justify-center font-sans">2</span>
                                                <p className="text-slate-700 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Route medical or rating content to a licensed clinician</strong> for re-review, so a fix to one statement doesn't introduce another error.
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute -left-[45px] top-0.5 w-8 h-8 rounded-full bg-slate-50 border-2 border-[#8b2332] text-[#8b2332] font-semibold text-xs flex items-center justify-center font-sans">3</span>
                                                <p className="text-slate-700 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Correct the content</strong> and, for substantive factual fixes, add a brief dated correction note at the foot of the article describing what changed.
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute -left-[45px] top-0.5 w-8 h-8 rounded-full bg-slate-50 border-2 border-[#8b2332] text-[#8b2332] font-semibold text-xs flex items-center justify-center font-sans">4</span>
                                                <p className="text-slate-700 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">Update the "Last reviewed" date</strong> so the timestamp reflects the most recent check.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-6 shadow-sm">
                                            <div className="flex gap-4">
                                                <ShieldAlert className="h-6 w-6 text-amber-700 flex-shrink-0 mt-0.5" />
                                                <p className="text-slate-700 text-sm leading-relaxed">
                                                    <strong className="text-slate-900 font-semibold">We don't quietly delete mistakes.</strong> When a correction affects the substance of what a veteran might rely on, we say what changed. Minor typo and formatting fixes are made without a note.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. How to report an error */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        3
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">How to report an error</h2>
                                        <p className="text-slate-700 leading-relaxed mb-6">
                                            If something looks wrong &mdash; a citation, a rating figure, a medical claim &mdash; please tell us. Reader reports are one of the best ways we keep this resource reliable.
                                        </p>

                                        <div className="bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_25%)]" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                                    <Mail className="h-6 w-6 text-[#b8893b] flex-shrink-0" />
                                                    <h3 className="text-xl font-bold text-white">
                                                        Email <a href="mailto:admin@militarydisabilitynexus.com" className="text-[#b8893b] hover:text-white underline underline-offset-4">admin@militarydisabilitynexus.com</a>
                                                    </h3>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                                    To help us check it fast, include what you can:
                                                </p>
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    <span className="inline-flex items-center bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">Page title or link</span>
                                                    <span className="inline-flex items-center bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">The statement in question</span>
                                                    <span className="inline-flex items-center bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">What you believe is correct</span>
                                                    <span className="inline-flex items-center bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">A source, if you have one</span>
                                                </div>
                                                <p className="text-xs text-slate-400 italic">
                                                    Please don't include personal claim details or identifiers in a correction report &mdash; we only need the content issue.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 4. Our response timeline */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        4
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">Our response timeline</h2>
                                        <p className="text-slate-700 leading-relaxed mb-6">
                                            We aim to move quickly, and faster when an error could affect a filing decision:
                                        </p>

                                        <div className="grid gap-6 sm:grid-cols-3">
                                            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col justify-between shadow-sm">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Clock className="h-5 w-5 text-[#8b2332] flex-shrink-0" />
                                                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-sans">Within 2 business days</h3>
                                                    </div>
                                                    <p className="text-slate-650 text-sm leading-relaxed">
                                                        We acknowledge your report and begin review.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col justify-between shadow-sm">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Clock className="h-5 w-5 text-[#8b2332] flex-shrink-0" />
                                                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-sans">Within 10 business days</h3>
                                                    </div>
                                                    <p className="text-slate-655 text-sm leading-relaxed">
                                                        We confirm the outcome &mdash; corrected, updated, clarified, or why no change was needed.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col justify-between shadow-sm">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <CheckCircle2 className="h-5 w-5 text-[#8b2332] flex-shrink-0" />
                                                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-sans">Right away</h3>
                                                    </div>
                                                    <p className="text-slate-655 text-sm leading-relaxed">
                                                        If an error could lead a veteran to act incorrectly, we prioritize and fix it as soon as it's verified.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Community Q&A content */}
                            <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm md:p-10">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8b2332] text-white font-bold flex items-center justify-center text-xl shadow-sm">
                                        5
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">Community Q&amp;A content</h2>
                                        <p className="text-slate-700 leading-relaxed">
                                            This policy covers content we publish &mdash; articles, guides, case studies, and our clinician "Expert Answers." Questions and comments posted by community members are their own, and we don't fact-check every member post. We do moderate the forum and will correct or remove a clinician Expert Answer under this same policy when an error is confirmed. See our <Link href="/community-guidelines" className="text-[#8b2332] hover:text-[#1e3a5f] font-semibold hover:underline">Community guidelines</Link> for how member content is handled.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Meta links block */}
                        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 text-sm text-slate-500">
                            <div className="flex gap-6 font-semibold">
                                <Link href="/methodology" className="hover:text-slate-800 hover:underline">
                                    Methodology &amp; Editorial Standards
                                </Link>
                                <Link href="/disclaimer" className="hover:text-slate-800 hover:underline">
                                    Disclaimer
                                </Link>
                                <Link href="/contact" className="hover:text-slate-800 hover:underline">
                                    Contact
                                </Link>
                            </div>
                            <div className="italic">Page last reviewed: {LAST_REVIEWED}</div>
                        </div>
                    </main>
                </div>
            </div>
        </Layout>
    );
}
