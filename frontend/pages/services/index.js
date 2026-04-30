import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle, Shield, ArrowRight, FileText, Clipboard } from 'lucide-react';
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
};

const Services = ({ services }) => {
    const getIconComponent = (iconName) => {
        const icons = {
            'file-text': FileText,
            'clipboard': Clipboard,
            'heart-pulse': CheckCircle,
            'users': Award,
            'lightbulb': Award,
            'file-search': Shield,
            'alert-triangle': CheckCircle,
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
                    <Link key={i} href={faqServiceLinks[part]} className="text-navy-600 hover:underline font-medium">
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
                keywords="VA nexus letter, DBQ evaluation, aid and attendance, C&P exam coaching, 1151 claim, veteran medical services, VA disability documentation"
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
                            <h1 className="text-5xl font-bold text-slate-900 mb-8 text-center">VA Disability Services</h1>
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-2xl">
                                <p className="text-base text-slate-700 leading-relaxed">
                                    Too many veterans have had the experience of filing a VA disability claim with a condition they know is connected to their service — only to receive a denial letter citing "insufficient medical evidence" or "no nexus established." It's not that the connection isn't real. It's that the documentation didn't speak the VA's language. VA raters evaluate claims using specific clinical criteria, and they look for precise medical terminology, a clearly stated nexus opinion using the "at least as likely as not" standard, and evidence that directly addresses the rating criteria in 38 CFR. That's where professional medical documentation comes in. Our clinicians specialize in translating your medical history into the evidence the VA needs to make a fair decision. Whether you need a{' '}
                                    <Link href="/services/independent-medical-opinion-nexus-letter" className="text-navy-600 hover:underline font-medium">Nexus Letter</Link>{' '}
                                    to establish service connection, a{' '}
                                    <Link href="/services/disability-benefits-questionnaire-dbq" className="text-navy-600 hover:underline font-medium">Disability Benefits Questionnaire (DBQ)</Link>{' '}
                                    to document the severity of your condition, an{' '}
                                    <Link href="/services/aid-and-attendance" className="text-navy-600 hover:underline font-medium">Aid & Attendance evaluation</Link>,{' '}
                                    a{' '}
                                    <Link href="/services/claim-readiness-review" className="text-navy-600 hover:underline font-medium">Claim Readiness Review</Link>{' '}
                                    to identify gaps before you file, or{' '}
                                    <Link href="/services/va-medical-malpractice-1151-case" className="text-navy-600 hover:underline font-medium">1151 case documentation</Link>{' '}
                                    for injuries caused by VA medical care — every report is written to meet VA evidentiary standards. We don't provide legal representation or medical treatment. We provide the medical documentation that gives your claim the best chance of being evaluated on its merits. Not sure what you need? Start with our{' '}
                                    <Link href="/diagnostic" className="text-navy-600 hover:underline font-medium">free VA claim readiness diagnostic</Link>{' '}
                                    to get an instant assessment.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Services Grid */}
                    <section className="pb-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {!services || services.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-slate-600 text-lg">No services available at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <h2 className="sr-only">Available Services</h2>
                                    {services.map((service) => {
                                        const IconComponent = getIconComponent(service.icon);
                                        return (
                                            <div
                                                key={service.id}
                                                className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group"
                                            >
                                                {/* Icon */}
                                                <div className="w-16 h-16 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                                    <IconComponent className="w-8 h-8 text-white" />
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                                    <Link href={`/services/${service.slug}`} className="hover:text-navy-700 transition-colors">
                                                        {service.title}
                                                    </Link>
                                                </h3>

                                                {/* Description */}
                                                <div className="text-slate-600 mb-6 leading-relaxed whitespace-pre-wrap">
                                                    {service.short_description.split('\n').map((line, i) => {
                                                        return line.trim() ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                                                    })}
                                                </div>

                                                {/* Features */}
                                                {service.features && service.features.length > 0 && (
                                                    <div className="space-y-3 mb-6">
                                                        {service.features.slice(0, 3).map((feature, idx) => (
                                                            <div key={idx} className="flex items-start space-x-2">
                                                                <CheckCircle className="w-5 h-5 text-navy-700 mt-0.5 flex-shrink-0" />
                                                                <span className="text-sm text-slate-700">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Pricing */}
                                                {service.pricing && (
                                                    <div className="mb-6 p-4 bg-navy-50/80 backdrop-blur-sm rounded-lg border border-navy-100/50">
                                                        <div className="text-sm text-slate-600 mb-1">Starting at</div>
                                                        <div className="text-3xl font-bold text-navy-700">${service.pricing.base_price}</div>
                                                    </div>
                                                )}

                                                {/* CTA */}
                                                <Link
                                                    href={`/services/${service.slug}`}
                                                    className="inline-flex items-center space-x-2 text-navy-700 font-semibold hover:text-navy-800 transition-colors group-hover:translate-x-1"
                                                >
                                                    <span>Learn More</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="pb-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-2xl">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {hubFaqs.map((faq, idx) => (
                                        <AccordionItem key={idx} value={`item-${idx}`}>
                                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-slate-600 leading-relaxed">
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
                    <section className="pb-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                                <div className="relative z-10">
                                    <h2 className="text-4xl font-bold text-white mb-6">
                                        Ready to Get Started?
                                    </h2>
                                    <p className="text-xl text-white/90 mb-8">
                                        Contact us for a free consultation and let us help strengthen your VA claim
                                    </p>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center space-x-2 bg-white text-navy-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-all hover:scale-105 shadow-xl"
                                    >
                                        <span>Contact Us</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
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
