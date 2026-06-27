import React from 'react';
import Layout from '../src/components/Layout';
import SEO from '../src/components/SEO';
import Link from 'next/link';

export default function CommunityGuidelines() {
    return (
        <Layout>
            <SEO
                title="Community Guidelines | Military Disability Nexus"
                description="How our veteran Q&A community works: how to ask, how to protect your privacy, what isn't allowed, how we moderate, and where to get crisis support right now."
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Community', path: '/community' },
                    { name: 'Guidelines', path: '/community-guidelines' }
                ]}
            />

            {/* Hero Section */}
            <div className="bg-navy-900 text-white py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center gap-2 bg-navy-800 text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Community Guidelines
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
                        A straight, respectful place for veterans to ask
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
                        Our Q&A community is where veterans, families, and advocates work through VA documentation and evidence questions together. These guidelines keep it useful, honest, and safe.
                    </p>
                    <p className="text-sm text-slate-400 mt-8 font-mono">
                        Last reviewed: June 2026 &middot; Maintained by the MDN Community Team
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-slate-50 min-h-screen py-12 md:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Lead Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-10">
                        <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
                            Read this before you post. It explains what the community is for, how to protect yourself, what we don't allow, and where to turn if you need help right now.
                        </p>
                    </div>

                    {/* Numbered Sections */}
                    <div className="space-y-12">

                        {/* 1. What this community is for */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    1
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">What this community is for</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <p>
                                        This is a place to ask questions and share experience about VA documentation, evidence, and the claims process. It exists to help you understand how the system works — not to replace an accredited representative, attorney, or your treating clinician.
                                    </p>
                                    <ul className="space-y-3 pl-1">
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>General education about VA evidence, DBQs, nexus letters, C&P exams, and rating criteria</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Peer experience from others who have been through the same process</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Plain-language help with terminology and documentation standards</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 2. Who you'll find here */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    2
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Who you'll find here</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <p>
                                        The community is open to veterans and service members at any stage of a claim, the family members and caregivers who support them, and accredited advocates. Our team takes part too — and when we do, we post under a labeled account so you always know a reply came from MDN staff.
                                    </p>
                                    <p>
                                        A reply from our team is general education. It does not review your specific claim and does not create a physician-patient or attorney-client relationship.
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-navy-900 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full mt-2 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                        Verified MDN Team
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Protect your privacy */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    3
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Protect your privacy — read this first</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <p>
                                        This community is public and searchable. Anything you post can be seen by anyone — including the VA, employers, and search engines. Once it's public, you can't fully take it back.
                                    </p>
                                    
                                    <div className="bg-red-50/50 border border-red-200 border-l-4 border-l-red-600 rounded-xl p-5 md:p-6 my-4 shadow-sm">
                                        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-3">
                                            Never post in a public thread
                                        </h3>
                                        <ul className="space-y-2.5">
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-red-950 font-medium">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span>Your full name, address, phone number, or email</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-red-950 font-medium">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span>Your Social Security number, VA file number, or claim number</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-red-950 font-medium">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span>Photos or scans of your medical records, C-file, or rating decisions</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-red-950 font-medium">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span>Specific dates or details that could identify you</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <p>
                                        Keep questions general — “a knee condition I think is secondary to my back” rather than uploaded documents. If you need someone to review your actual records, that's a private engagement, not something to do in an open thread.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 4. How to ask a good question */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    4
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">How to ask a good question</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <ul className="space-y-3 pl-1">
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Focus on the documentation or evidence question, not your whole history</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Say what you've already read or tried — it helps people help you</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Use general terms for conditions and timeframes</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>One question per post keeps the answers focused and easy to follow</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 5. How we treat each other */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    5
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">How we treat each other</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <p>
                                        This is a community of people who served. Treat each other accordingly.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <div className="font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-2">Respect</div>
                                            <p className="text-sm text-slate-600 leading-relaxed">No harassment, personal attacks, slurs, or discrimination based on branch, era, rank, gender, race, religion, orientation, or discharge status.</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <div className="font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-2">Good faith</div>
                                            <p className="text-sm text-slate-600 leading-relaxed">Assume others are asking honestly. Disagree with the claim or the evidence — not the person.</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <div className="font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-2">Stay on topic</div>
                                            <p className="text-sm text-slate-600 leading-relaxed">Keep threads on VA documentation and the claims process. Political debates belong somewhere else.</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <div className="font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-2">No gatekeeping</div>
                                            <p className="text-sm text-slate-600 leading-relaxed">Every veteran's experience is valid. “You don't have it as bad as…” has no place here.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. What's not allowed */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    6
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">What's not allowed</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <p>
                                        Content in these categories is removed. Repeat or serious violations result in removal from the community.
                                    </p>
                                    
                                    <div className="bg-red-50/50 border border-red-200 border-l-4 border-l-red-600 rounded-xl p-5 md:p-6 my-4 shadow-sm">
                                        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-4">
                                            Prohibited
                                        </h3>
                                        <ul className="space-y-3.5">
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-slate-800">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span><strong>Coaching dishonesty.</strong> Advice to exaggerate or fabricate symptoms, manufacture evidence, or script untruthful answers for a C&P exam. We will not host content meant to deceive the VA.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-slate-800">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span><strong>Guarantees.</strong> Promises or predictions about ratings, approvals, or claim outcomes.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-slate-800">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span><strong>Solicitation and spam.</strong> Self-promotion or recruiting — including unaccredited “claim consultants” trolling for clients.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-slate-800">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span><strong>Sharing others' information.</strong> Posting anyone else's private, identifying, or medical details.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-slate-800">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span><strong>Impersonation.</strong> Posing as a clinician, attorney, VA employee, or another veteran.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-slate-800">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span><strong>Individualized professional advice</strong> presented as a personalized legal or medical service.</span>
                                            </li>
                                            <li className="flex items-start gap-2.5 text-sm md:text-base text-slate-800">
                                                <span className="w-1.5 h-1.5 bg-red-600 transform rotate-45 mt-2 flex-shrink-0" />
                                                <span><strong>Hate, threats, or harassment</strong> of any member.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7. How our team takes part */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    7
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">How our team takes part</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <p>
                                        When our team answers, we give general, educational information grounded in VA policy and 38 CFR. We'll tell you plainly when a question is beyond what a public forum can responsibly address, and point you toward a private review, an accredited representative, or your treating provider.
                                    </p>
                                    <p>
                                        A team reply here is not a review of your specific claim, and it does not create a professional relationship. For how our published content is held accurate, see our <Link href="/corrections-policy" className="text-red-700 font-semibold hover:underline">Corrections Policy</Link> and <Link href="/methodology" className="text-red-700 font-semibold hover:underline">Methodology & Editorial Standards</Link>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 8. Reporting and moderation */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    8
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Reporting and moderation</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <ul className="space-y-3 pl-1">
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Posts that violate these guidelines may be edited or removed</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Use the report button, or email <strong>admin@militarydisabilitynexus.com</strong>, to flag content</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>Serious violations — coaching fraud, harassment, posting private information — can result in immediate removal without warning</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm md:text-base">
                                            <span className="w-1.5 h-1.5 bg-red-700 transform rotate-45 mt-2.5 flex-shrink-0" />
                                            <span>If your content was removed and you believe it was a mistake, you can ask the Community Team to review it</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 9. If you're in crisis */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    9
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">If you're in crisis</h2>
                                <div className="text-slate-700 leading-relaxed space-y-4">
                                    <p>
                                        This community can't provide crisis support, and some moments are too urgent to wait for a reply. If you or someone you know is struggling, reach out now. It's free, confidential, and available 24/7 — whether or not you're enrolled in VA care.
                                    </p>
                                    
                                    <div className="bg-gradient-to-br from-navy-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 my-6 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                                        <h3 className="font-sans font-extrabold text-xl text-white mb-2">
                                            You don't have to wait for a forum reply
                                        </h3>
                                        <p className="text-slate-300 text-sm md:text-base mb-6">
                                            The Veterans Crisis Line connects you with caring, qualified responders — many of them veterans themselves.
                                        </p>
                                        <div className="font-sans font-extrabold text-lg text-white border-b border-white/10 pb-4 mb-4">
                                            Veterans Crisis Line
                                        </div>
                                        <div className="space-y-3 font-mono">
                                            <div className="flex flex-wrap items-baseline gap-3 text-sm md:text-base text-white">
                                                <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400 min-w-[70px]">Call</span>
                                                <span>Dial <b className="text-amber-400 text-base font-bold">988</b>, then Press <b className="text-amber-400 text-base font-bold">1</b></span>
                                            </div>
                                            <div className="flex flex-wrap items-baseline gap-3 text-sm md:text-base text-white">
                                                <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400 min-w-[70px]">Text</span>
                                                <span><b className="text-amber-400 text-base font-bold">838255</b></span>
                                            </div>
                                            <div className="flex flex-wrap items-baseline gap-3 text-sm md:text-base text-white">
                                                <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400 min-w-[70px]">Chat</span>
                                                <a href="https://www.veteranscrisisline.net/get-help-now/chat" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-bold">
                                                    VeteransCrisisLine.net/Chat
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 10. What this community isn't */}
                        <div className="flex flex-col md:flex-row gap-6 border-t border-slate-200 pt-10">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-sans font-extrabold text-xl">
                                    10
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">What this community isn't</h2>
                                <div className="text-slate-700 leading-relaxed">
                                    <div className="bg-slate-100 border-l-4 border-l-navy-600 rounded-xl p-5 md:p-6 shadow-inner text-slate-700">
                                        <p className="text-sm md:text-base leading-relaxed">
                                            The Community Q&A does not provide legal representation, medical diagnosis, or treatment advice, and does not establish any professional relationship. For decisions about your claim or your health, consult an accredited VA representative or your treating clinician.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Meta & Cross-Links */}
                    <div className="border-t border-slate-200 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex flex-wrap gap-4 md:gap-6 font-sans text-sm font-semibold text-slate-600">
                            <Link href="/methodology" className="hover:text-red-700 transition-colors">
                                Methodology & Editorial Standards
                            </Link>
                            <Link href="/corrections-policy" className="hover:text-red-700 transition-colors">
                                Corrections Policy
                            </Link>
                            <Link href="/disclaimer" className="hover:text-red-700 transition-colors">
                                Disclaimer
                            </Link>
                        </div>
                        <div className="text-sm text-slate-500 font-medium italic">
                            Page last reviewed: June 2026
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
