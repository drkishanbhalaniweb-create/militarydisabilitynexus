import Link from 'next/link';
import { Award, CheckCircle, Shield, ArrowRight, FileText, Clipboard, Briefcase, Landmark } from 'lucide-react';
import { servicesApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../src/components/ui/accordion';

const hubFaqs = [
    {
        question: 'Do I need a Nexus Letter, a DBQ, or both for my VA claim?',
        answer: 'It depends on where your claim stands. A Nexus Letter provides a medical opinion connecting your condition to military service — it establishes why the VA should grant service connection. A DBQ documents the current severity of your condition using the VA\'s own standardized format — it helps determine what rating you receive. Many claims benefit from both: the Nexus Letter builds the bridge to service connection, and the DBQ ensures your symptoms are fully captured for rating purposes.',
    },
    {
        question: 'What\'s the difference between a Nexus Letter and an Independent Medical Opinion (IMO)?',
        answer: 'In practice, these terms refer to the same type of document. A Nexus Letter is an Independent Medical Opinion (IMO) that specifically addresses whether your condition is connected to your military service. Both are written by a licensed clinician who reviews your medical records and provides a detailed opinion using the VA\'s "at least as likely as not" standard of proof. You may see the terms used interchangeably across VA resources and veteran communities.',
    },
    {
        question: 'When should I get a Claim Readiness Review instead of jumping straight into a Nexus Letter?',
        answer: 'A Claim Readiness Review is a smart first step if you\'re unsure whether your claim has the evidence it needs — or if you\'ve already been denied and aren\'t sure why. The review examines your medical records, service records, and existing documentation to identify specific gaps that could lead to a denial. This way, you invest in the right documentation from the start rather than ordering a Nexus Letter or DBQ that may not address the actual weakness in your claim.',
    },
    {
        question: 'Is an Aid & Attendance evaluation part of a standard VA disability claim?',
        answer: 'No — Aid & Attendance is a separate benefit that provides additional monthly compensation on top of your existing disability rating. It\'s available to veterans (or their surviving spouses) who need assistance with daily activities like bathing, dressing, or eating due to service-connected disabilities. Qualifying requires specific medical documentation showing the level of care you need, which is where a professional Aid & Attendance evaluation comes in.',
    },
    {
        question: 'Can I get a Nexus Letter for a 1151 claim if I was harmed by VA medical care?',
        answer: 'Yes, but a 1151 claim requires a different type of nexus opinion than a standard service-connection claim. Instead of linking your condition to military service, the clinician must establish that your additional disability was caused by VA medical treatment and that the treatment involved negligence or an outcome that was not a reasonably expected complication. Our 1151 case documentation is specifically structured to address both the causation and fault elements the VA requires under 38 U.S.C. § 1151.',
    },
    {
        question: 'Does the VA accept private nexus letters?',
        answer: 'Yes. The VA must consider competent medical opinions from qualified private providers — not only its own C&P examiners. A private nexus letter is legitimate evidence, and the VA weighs it based on the provider’s qualifications, whether they reviewed your records, and the strength of the medical rationale. A well-reasoned opinion using the “at least as likely as not” standard carries real probative value.',
    },
    {
        question: 'Do I really need a nexus letter for my VA claim?',
        answer: 'A nexus letter isn’t always mandatory, but it’s often decisive. If service connection isn’t already obvious from your records — or if you’ve been denied for “no nexus established” or “insufficient medical evidence” — a strong nexus letter directly addresses the gap that caused the problem. A Claim Readiness Review can tell you whether your specific claim needs one before you spend money on documentation.',
    },
    {
        question: 'How much does a VA nexus letter cost?',
        answer: 'The cost varies with the complexity of your claim, the medical specialty required, and the volume of records to review, so there’s no single flat price. Because every claim is different, we provide a quote after an initial assessment. The best starting point is our free claim readiness diagnostic, which shows what your claim actually needs before you commit to anything.',
    },
    {
        question: 'How long does it take to get a nexus letter?',
        answer: 'Turnaround depends on the complexity of your case and how quickly we receive your complete medical and service records. Once we have everything we need, we complete your report within a defined timeframe that we share with you when you begin — so you can plan around your filing or appeal deadlines.',
    }
];

// Map service name keywords in FAQ answers to their service page slugs
const faqServiceLinks = {
    'Nexus Letter': '/services/independent-medical-opinion-nexus-letter',
    'Independent Medical Opinion (IMO)': '/services/independent-medical-opinion-nexus-letter',
    'DBQ': '/services/disability-benefits-questionnaire-dbq',
    'Claim Readiness Review': '/services/claim-readiness-review',
    'Aid & Attendance': '/services/aid-and-attendance',
    '1151 claim': '/services/va-medical-malpractice-1151-case',
    '1151 case documentation': '/services/va-medical-malpractice-1151-case',
    'TDIU': '/services/tdiu-unemployability-medical-documentation',
    'TDIU Documentation': '/services/tdiu-unemployability-medical-documentation',
    'Attorney & Advocate Partnership': '/services/attorney-advocate-partnership',
    'Attorney & Advocate Partnership Program': '/services/attorney-advocate-partnership',
};

const Services = ({ services }) => {
    const standardServices = (services || []).filter(
        s => s.slug !== 'attorney-advocate-partnership' && s.slug !== 'cp-exam-coaching'
    );
    const partnershipService = (services || []).find(s => s.slug === 'attorney-advocate-partnership');

    const getIconComponent = (iconName) => {
        const icons = {
            'file-text': FileText,
            'clipboard': Clipboard,
            'heart-pulse': CheckCircle,
            'users': Award,
            'lightbulb': Award,
            'file-search': Shield,
            'alert-triangle': CheckCircle,
            'briefcase': Briefcase,
            'landmark': Landmark,
        };
        return icons[iconName] || Shield;
    };

    // Render FAQ answer text with internal service links
    const renderFaqAnswer = (text) => {
        // Build a regex that matches any of the service link keys
        // Sort by length descending so longer matches take priority (e.g., "Independent Medical Opinion (IMO)" before "IMO")
        const keys = Object.keys(faqServiceLinks).sort((a, b) => b.length - a.length);
        const escapedKeys = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${escapedKeys.join('|')})`, 'g');

        const parts = text.split(regex);
        const usedLinks = new Set();

        return parts.map((part, i) => {
            // Only link the first occurrence of each service name to avoid over-linking
            if (faqServiceLinks[part] && !usedLinks.has(faqServiceLinks[part])) {
                usedLinks.add(faqServiceLinks[part]);
                return (
                    <Link key={i} href={faqServiceLinks[part]} className="text-red-700 hover:underline font-medium">
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    return (
        <Layout>
            <SEO
                title="VA Disability Documentation Services | Nexus Letters, DBQs & More"
                description="Expert medical documentation for VA disability claims — Nexus Letters, DBQs, Aid & Attendance evaluations, Claim Readiness Reviews, and 1151 case opinions from licensed clinicians."
                keywords="VA nexus letter, DBQ evaluation, aid and attendance, 1151 claim, veteran medical services, VA disability documentation"
                canonical="/services"
                structuredData={services && services.length > 0 ? {
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": "VA Disability Documentation Services",
                    "description": "Professional medical documentation services for VA disability claims",
                    "numberOfItems": services.length,
                    "itemListElement": services.map((service, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": service.title,
                        "url": `https://www.militarydisabilitynexus.com/services/${service.slug}`
                    }))
                } : undefined}
                faqSchema={hubFaqs}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Services', path: '/services' }
                ]}
            />

            <div className="relative min-h-screen overflow-hidden">
                {/* Fixed Background Image with Glassmorphic Blur */}
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <img
                        src="/wavefillservicep.webp"
                        alt="Background pattern"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            filter: 'blur(4px)',
                            transform: 'scale(1.1)'
                        }}
                        role="presentation"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-white/50"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Hero Section */}
                    <section className="pt-20 pb-12">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="inline-flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-wider text-navy-700">
                                <span className="w-5 h-0.5 bg-red-600"></span>
                                <span>VA Disability Documentation</span>
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mt-4">
                                Denied for “insufficient medical evidence”? <span className="text-red-700">The problem usually isn’t your claim.</span>
                            </h1>
                            
                            <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mt-4">
                                Many veterans file for a condition they know is service-connected — and still get a denial. Our licensed clinicians translate your medical history into evidence written in the VA’s own language, addressing the exact criteria raters are trained to find.
                            </p>

                            <blockquote className="my-6 p-6 bg-white rounded-r-xl border-l-4 border-red-600 shadow-lg max-w-2xl">
                                <p className="font-sans font-semibold text-xl leading-snug text-slate-900">
                                    “It’s not that the connection isn’t real. It’s that the documentation didn’t speak the VA’s language.”
                                </p>
                            </blockquote>

                            <p className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500 mt-8 mb-4">What VA raters actually look for</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md">
                                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700 text-lg font-bold mb-3">⚕</div>
                                    <b className="block font-sans font-bold text-slate-900 text-base mb-1">Precise medical terminology</b>
                                    <span className="text-sm text-slate-600 leading-relaxed">The exact clinical language raters are trained to recognize.</span>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md">
                                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700 text-lg font-bold mb-3">⚖</div>
                                    <b className="block font-sans font-bold text-slate-900 text-base mb-1">A clearly stated nexus</b>
                                    <span className="text-sm text-slate-600 leading-relaxed">An opinion meeting the “at least as likely as not” — or stronger “more likely than not” — standard.</span>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-md">
                                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700 text-lg font-bold mb-3">§</div>
                                    <b className="block font-sans font-bold text-slate-900 text-base mb-1">Evidence tied to 38 CFR</b>
                                    <span className="text-sm text-slate-600 leading-relaxed">Documentation that addresses the rating criteria directly.</span>
                                </div>
                            </div>

                            <p className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500 mt-8 mb-3">Whatever your claim needs</p>
                            <div className="flex flex-wrap gap-2.5">
                                <Link href="/services/independent-medical-opinion-nexus-letter" className="inline-flex items-center gap-1.5 bg-white border border-navy-100 hover:border-red-600 hover:text-red-700 text-navy-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-sm transition-all hover:-translate-y-0.5">
                                    <span className="text-red-600 font-bold">›</span> Nexus Letter / IMO
                                </Link>
                                <Link href="/services/disability-benefits-questionnaire-dbq" className="inline-flex items-center gap-1.5 bg-white border border-navy-100 hover:border-red-600 hover:text-red-700 text-navy-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-sm transition-all hover:-translate-y-0.5">
                                    <span className="text-red-600 font-bold">›</span> DBQ
                                </Link>
                                <Link href="/services/aid-and-attendance" className="inline-flex items-center gap-1.5 bg-white border border-navy-100 hover:border-red-600 hover:text-red-700 text-navy-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-sm transition-all hover:-translate-y-0.5">
                                    <span className="text-red-600 font-bold">›</span> Aid &amp; Attendance
                                </Link>
                                <Link href="/services/claim-readiness-review" className="inline-flex items-center gap-1.5 bg-white border border-navy-100 hover:border-red-600 hover:text-red-700 text-navy-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-sm transition-all hover:-translate-y-0.5">
                                    <span className="text-red-600 font-bold">›</span> Claim Readiness Review
                                </Link>
                                <Link href="/services/va-medical-malpractice-1151-case" className="inline-flex items-center gap-1.5 bg-white border border-navy-100 hover:border-red-600 hover:text-red-700 text-navy-900 font-semibold text-sm px-4 py-2.5 rounded-full shadow-sm transition-all hover:-translate-y-0.5">
                                    <span className="text-red-600 font-bold">›</span> 1151 Documentation
                                </Link>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-8">
                                <Link href="/diagnostic" className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-lg shadow-lg hover:shadow-red-600/30 transition-all hover:-translate-y-0.5">
                                    Take the free claim readiness diagnostic →
                                </Link>
                                <span className="text-sm text-slate-500 font-medium">Instant assessment — no cost, no obligation.</span>
                            </div>

                            <p className="mt-6 pt-4 border-t border-slate-200/60 text-xs text-slate-500 max-w-3xl leading-relaxed">
                                We provide medical documentation only — not legal representation or medical treatment. Our role is to give your claim the strongest possible chance of being evaluated on its merits.
                            </p>
                        </div>
                    </section>

                    {/* Stats Band Section */}
                    <section className="bg-navy-900 text-slate-100 py-16 w-full relative z-10" style={{ marginTop: '-1px' }}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="inline-flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-wider text-red-400 mb-6">
                                <span className="w-5 h-0.5 bg-red-400"></span>
                                <span>Why a nexus letter matters</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                <div className="border-t border-red-500/50 pt-5">
                                    <span className="block font-sans font-extrabold text-3xl text-white leading-none mb-3">3 elements</span>
                                    <span className="block text-sm text-slate-300 leading-relaxed">
                                        To grant service connection, the VA needs a current diagnosis, an in-service event, and a medical nexus linking the two. Miss one — usually the nexus — and the claim is denied. (<a href="https://www.law.cornell.edu/cfr/text/38/3.303" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">38 CFR § 3.303</a>)
                                    </span>
                                </div>
                                <div className="border-t border-red-500/50 pt-5">
                                    <span className="block font-sans font-extrabold text-3xl text-white leading-none mb-3">“No nexus”</span>
                                    <span className="block text-sm text-slate-300 leading-relaxed">
                                        One of the most common reasons real, service-connected claims still get denied — the connection was never stated in a medical opinion the VA could accept. That’s the gap a nexus letter fills.
                                    </span>
                                </div>
                                <div className="border-t border-red-500/50 pt-5">
                                    <span className="block font-sans font-extrabold text-3xl text-white leading-none mb-3">50%</span>
                                    <span className="block text-sm text-slate-300 leading-relaxed">
                                        All a nexus opinion must show is that the link is “at least as likely as not.” When the evidence is in balance, the benefit of the doubt goes to you. (<a href="https://www.law.cornell.edu/uscode/text/38/5107" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">38 U.S.C. § 5107(b)</a>)
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-8">
                                Based on the service-connection standard in <a href="https://www.law.cornell.edu/cfr/text/38/3.303" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">38 CFR § 3.303</a> and the benefit-of-the-doubt rule, <a href="https://www.law.cornell.edu/uscode/text/38/5107" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">38 U.S.C. § 5107(b)</a>.
                            </p>
                        </div>
                    </section>

                    {/* Comparison Section */}
                    <section className="bg-slate-50 py-16 border-y border-slate-200 relative z-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="max-w-3xl mb-10">
                                <div className="inline-flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-2">
                                    <span className="w-5 h-0.5 bg-red-600"></span>
                                    <span>Which document do I need?</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Nexus Letter, DBQ, or something else?</h2>
                                <p className="text-slate-600 mt-2">Each document proves a different thing to the VA. Here’s how they compare so you can invest in the right evidence from the start.</p>
                            </div>
                            
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-navy-800 text-white font-sans font-semibold">
                                                <th className="p-4">Document</th>
                                                <th className="p-4">What it proves</th>
                                                <th className="p-4">When you need it</th>
                                                <th className="p-4">Standard used</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="p-4 font-semibold text-navy-800 whitespace-nowrap">
                                                    <Link href="/services/independent-medical-opinion-nexus-letter" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">Nexus Letter / IMO</Link>
                                                </td>
                                                <td className="p-4 text-slate-700">Your condition is connected to service</td>
                                                <td className="p-4 text-slate-700">Establishing or appealing service connection</td>
                                                <td className="p-4 text-slate-700">“At least as likely as not”</td>
                                            </tr>
                                            <tr className="bg-slate-50/20 hover:bg-slate-50/50">
                                                <td className="p-4 font-semibold text-navy-800 whitespace-nowrap">
                                                    <Link href="/services/disability-benefits-questionnaire-dbq" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">DBQ</Link>
                                                </td>
                                                <td className="p-4 text-slate-700">How severe your condition currently is</td>
                                                <td className="p-4 text-slate-700">Getting the correct disability rating</td>
                                                <td className="p-4 text-slate-700">VA rating criteria (<a href="https://www.ecfr.gov/current/title-38/chapter-I/part-4" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">38 CFR</a>)</td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="p-4 font-semibold text-navy-800 whitespace-nowrap">
                                                    <Link href="/services/claim-readiness-review" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">Claim Readiness Review</Link>
                                                </td>
                                                <td className="p-4 text-slate-700">Where your evidence is weak before filing</td>
                                                <td className="p-4 text-slate-700">Before filing, or after an unexplained denial</td>
                                                <td className="p-4 text-slate-700">Gap analysis vs. rating criteria</td>
                                            </tr>
                                            <tr className="bg-slate-50/20 hover:bg-slate-50/50">
                                                <td className="p-4 font-semibold text-navy-800 whitespace-nowrap">
                                                    <Link href="/services/aid-and-attendance" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">Aid &amp; Attendance</Link>
                                                </td>
                                                <td className="p-4 text-slate-700">You need help with daily activities</td>
                                                <td className="p-4 text-slate-700">Seeking added monthly compensation</td>
                                                <td className="p-4 text-slate-700">Functional / ADL documentation</td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="p-4 font-semibold text-navy-800 whitespace-nowrap">
                                                    <Link href="/services/va-medical-malpractice-1151-case" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">1151 Opinion</Link>
                                                </td>
                                                <td className="p-4 text-slate-700">VA care caused additional disability</td>
                                                <td className="p-4 text-slate-700">Injury caused by VA medical treatment</td>
                                                <td className="p-4 text-slate-700">Causation + fault under <a href="https://www.law.cornell.edu/uscode/text/38/1151" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">38 U.S.C. § 1151</a></td>
                                            </tr>
                                            <tr className="bg-slate-50/20 hover:bg-slate-50/50">
                                                <td className="p-4 font-semibold text-navy-800 whitespace-nowrap">
                                                    <Link href="/services/tdiu-unemployability-medical-documentation" className="text-blue-600 hover:text-blue-800 hover:underline font-bold">TDIU Documentation</Link>
                                                </td>
                                                <td className="p-4 text-slate-700">A medical opinion that your conditions prevent gainful work</td>
                                                <td className="p-4 text-slate-700">Strengthening a TDIU claim (typically attorney-filed)</td>
                                                <td className="p-4 text-slate-700">Functional capacity / employability opinion</td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="p-4 font-semibold text-slate-500 whitespace-nowrap">
                                                    SSDI Documentation
                                                </td>
                                                <td className="p-4 text-slate-700">A medical opinion that you can’t sustain substantial work</td>
                                                <td className="p-4 text-slate-700">Strengthening an SSDI claim (typically attorney-filed)</td>
                                                <td className="p-4 text-slate-700">SSA residual functional capacity (RFC) standard</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-slate-500 max-w-4xl leading-relaxed">
                                <strong className="text-navy-800 font-semibold">Note on TDIU &amp; SSDI:</strong> These claims are typically filed and handled by an attorney or accredited representative. We don’t file the claim — we provide the independent medical opinion that strengthens it, documenting how your conditions limit your ability to work.
                            </p>
                        </div>
                    </section>

                    {/* Services Grid Section */}
                    <section className="py-20 relative z-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="max-w-3xl mb-12">
                                <div className="inline-flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-2">
                                    <span className="w-5 h-0.5 bg-red-600"></span>
                                    <span>Available services</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Medical documentation, built to VA standards</h2>
                                <p className="text-slate-600 mt-2">Every report is authored by a board-certified physician matched to your condition and written to meet VA evidentiary requirements.</p>
                            </div>

                            {!standardServices || standardServices.length === 0 ? (
                                <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl">
                                    <p className="text-slate-600 text-lg">No services available at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <h2 className="sr-only">Available Services</h2>
                                        {standardServices.map((service) => {
                                            const IconComponent = getIconComponent(service.icon);
                                            return (
                                                <div
                                                    key={service.id}
                                                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group flex flex-col"
                                                >
                                                    {/* Icon */}
                                                    <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                                                        <IconComponent className="w-6 h-6 text-white" />
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-navy-700 transition-colors">
                                                        <Link href={`/services/${service.slug}`}>
                                                            {service.title}
                                                        </Link>
                                                    </h3>

                                                    {/* Description */}
                                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed flex-grow">
                                                        {service.short_description}
                                                    </p>

                                                    {/* Features */}
                                                    {service.features && service.features.length > 0 && (
                                                        <div className="space-y-2.5 mb-6">
                                                            {service.features.slice(0, 3).map((feature, idx) => (
                                                                <div key={idx} className="flex items-start space-x-2">
                                                                    <CheckCircle className="w-5 h-5 text-navy-700 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-xs text-slate-700 font-medium leading-normal">{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Pricing */}
                                                    {service.base_price_usd > 0 && (
                                                        <div className="mb-6 p-4 bg-navy-50/80 backdrop-blur-sm rounded-lg border border-navy-100/50">
                                                            <div className="text-xs text-slate-500 mb-0.5">Starting at</div>
                                                            <div className="text-2xl font-bold text-navy-800">
                                                                ${service.base_price_usd}
                                                                {service.slug === 'independent-medical-opinion-nexus-letter' && '+'}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* CTA */}
                                                    <Link
                                                        href={`/services/${service.slug}`}
                                                        className="inline-flex items-center space-x-2 text-navy-700 font-bold text-sm hover:text-navy-800 transition-colors group-hover:translate-x-1 mt-auto"
                                                    >
                                                        <span>Learn More</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Wide partnership card */}
                                    {partnershipService && (
                                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="max-w-4xl">
                                                <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center mb-4 shadow-md">
                                                    <Landmark className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-navy-700 transition-colors">
                                                    <Link href={`/services/${partnershipService.slug}`}>
                                                        {partnershipService.title}
                                                    </Link>
                                                </h3>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    {partnershipService.short_description}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <Link
                                                    href={`/services/${partnershipService.slug}`}
                                                    className="inline-flex items-center space-x-2 bg-navy-800 hover:bg-navy-900 text-white font-bold text-sm px-6 py-3.5 rounded-lg shadow-md transition-all hover:-translate-y-0.5"
                                                >
                                                    <span>Learn more about partnering</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Trust Section */}
                    <section className="bg-navy-900 text-slate-100 py-12 relative z-10 w-full" style={{ marginTop: '-1px' }}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            <h2 className="text-2xl font-extrabold text-white max-w-md leading-tight">
                                Clinician-authored. Reviewed. Built to be defensible.
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-12">
                                <div>
                                    <b className="block text-white font-bold text-sm mb-1">Board-certified physicians</b>
                                    <span className="text-xs text-slate-300">Specialty-matched to your claimed condition</span>
                                </div>
                                <div>
                                    <b className="block text-white font-bold text-sm mb-1">Written to VA standards</b>
                                    <span className="text-xs text-slate-300">Structured around the rating criteria in 38 CFR</span>
                                </div>
                                <div>
                                    <b className="block text-white font-bold text-sm mb-1">Independent &amp; evidence-based</b>
                                    <span className="text-xs text-slate-300">Grounded in your records and medical literature</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="py-20 relative z-10 bg-slate-50 border-y border-slate-200">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="max-w-3xl mb-10 text-center mx-auto">
                                <div className="inline-flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-wider text-red-700 mb-2">
                                    <span className="w-5 h-0.5 bg-red-600"></span>
                                    <span>Common questions</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Frequently asked questions</h2>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
                                <Accordion type="single" collapsible className="w-full divide-y divide-slate-100">
                                    {hubFaqs.map((faq, idx) => (
                                        <AccordionItem key={idx} value={`item-${idx}`} className="border-none py-1.5">
                                            <AccordionTrigger className="text-left font-sans font-bold text-slate-900 text-base sm:text-lg py-4 hover:text-red-700 transition-colors [&>svg]:text-red-600">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-4 pt-1">
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    {renderFaqAnswer(faq.answer)}
                                                </p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 relative z-10">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-[2rem] p-10 sm:p-12 text-center shadow-2xl relative overflow-hidden border border-navy-700/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-transparent pointer-events-none"></div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
                                        Ready to give your claim its best shot?
                                    </h2>
                                    <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                                        Start with a free claim readiness diagnostic, or book a call to talk through exactly what your claim needs.
                                    </p>
                                    <div className="flex flex-wrap gap-4 justify-center">
                                        <Link
                                            href="/diagnostic"
                                            className="inline-flex items-center space-x-2 bg-red-700 hover:bg-red-800 text-white px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base shadow-lg transition-all hover:-translate-y-0.5"
                                        >
                                            <span>Free claim readiness diagnostic →</span>
                                        </Link>
                                        <Link
                                            href="/contact"
                                            className="inline-flex items-center space-x-2 bg-transparent border-2 border-slate-400 hover:border-white text-white px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base transition-all hover:-translate-y-0.5"
                                        >
                                            <span>Book a call</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    try {
        const services = await servicesApi.getAll();
        return {
            props: {
                services: services || [],
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error fetching services for static props:', error);
        return {
            props: {
                services: [],
            },
            revalidate: 86400,
        };
    }
}

export default Services;
