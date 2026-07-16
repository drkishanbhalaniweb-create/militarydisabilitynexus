import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle, Clock, ArrowRight, Search } from 'lucide-react';
import { servicesApi, blogApi, caseStudyApi, testimonialApi, bodySystemApi, conditionApi } from '../../src/lib/api';
import DynamicIcon from '../../src/components/ui/dynamic-icon';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import TestimonialCard from '../../src/components/testimonials/TestimonialCard';
import PricingModal from '../../src/components/services/PricingModal';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../src/components/ui/accordion';
import { buildOrganizationReference, serviceTagMap } from '../../src/lib/trust';
import { formatRichHTML } from '../../src/lib/htmlUtils';

// SEO-optimized title overrides — ensures high-value keywords appear in the <title> tag
const ServiceDetail = ({ service, slug, allServices = [], relatedBlogs = [], relatedCaseStudies = [], relatedTestimonials = [], bodySystemsWithCounts = [] }) => {
    const router = useRouter();
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    // Fallback for when the page is being generated (if fallback: true was used, but we use blocking so this might not render)
    if (router.isFallback) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
            </Layout>
        );
    }

    if (!service) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Service not found</h2>
                        <p className="text-slate-600 mb-4">The requested service could not be loaded.</p>
                        <div className="space-x-4">
                            <Link href="/services" className="text-indigo-600 hover:text-indigo-700">
                                Back to Services
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const conditionForSchema = [];

    // Structured data for service
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": service.ai_citable_lead || service.short_description,
        "provider": {
            ...buildOrganizationReference()
        },
        "serviceType": service.category,
        "areaServed": {
            "@type": "Country",
            "name": "United States"
        },
        "offers": {
            "@type": "Offer",
            "price": service.base_price_usd,
            "priceCurrency": "USD"
        },
        ...(conditionForSchema.length > 0 && {
            "audience": {
                "@type": "MedicalAudience",
                "healthCondition": conditionForSchema
            }
        })
    };

    return (
        <Layout>
            <SEO
                title={service.seo_title || service.title}
                description={service.seo_description || service.short_description}
                keywords={service.seo_keywords || `${service.title}, ${service.category}, VA disability, medical documentation`}
                structuredData={structuredData}
                faqSchema={service.faqs}
                canonical={`/services/${service.slug}`}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Services', path: '/services' },
                    { name: service.title, path: `/services/${service.slug}` }
                ]}
            />
            <div className="bg-slate-50 min-h-screen">
                {/* Breadcrumbs & Hero Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-2 mb-6 text-sm font-medium text-slate-500" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-navy-700 transition-colors">
                            Home
                        </Link>
                        <span className="text-slate-400">›</span>
                        <Link href="/services" className="hover:text-navy-700 transition-colors">
                            Services
                        </Link>
                        <span className="text-slate-400">›</span>
                        <span className="text-slate-950 font-semibold">{service.title}</span>
                    </nav>

                    {/* Hero Card */}
                    <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="max-w-3xl relative z-10">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">{service.short_description}</p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                {service.slug === 'attorney-advocate-partnership' ? (
                                    <Link 
                                        href={`/forms?service=${slug}`}
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all text-center flex items-center justify-center"
                                    >
                                        Drop us a message
                                    </Link>
                                ) : service.slug === 'independent-medical-opinion-nexus-letter' ? (
                                    <button 
                                        onClick={() => setIsPricingModalOpen(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all"
                                    >
                                        View Pricing &mdash; From $400+
                                    </button>
                                ) : (
                                    <Link 
                                        href={
                                            service.slug === 'claim-readiness-review'
                                                ? '/claim-readiness-review'
                                                : service.slug === 'aid-and-attendance'
                                                ? '/forms?service=aid-and-attendance'
                                                : `/forms?service=${slug}`
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all text-center flex items-center justify-center"
                                    >
                                        Book Now &mdash; ${service.base_price_usd?.toLocaleString() || 'N/A'}
                                    </Link>
                                )}
                                {service.slug !== 'attorney-advocate-partnership' && (
                                    <Link 
                                        href={`/forms?service=${slug}`}
                                        className="bg-transparent border border-slate-600 hover:border-slate-400 text-white font-semibold py-3 px-8 rounded-xl transition-all text-center"
                                    >
                                        Free Consultation
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {(() => {
                                const defaultLayout = [
                                    { id: 'overview', type: 'standard', name: 'Overview', is_visible: true },
                                    { id: 'included', type: 'standard', name: "What's Included", is_visible: true },
                                    { id: 'pricing', type: 'standard', name: 'Pricing at a Glance', is_visible: true },
                                    { id: 'systems', type: 'standard', name: 'Browse by Medical Category', is_visible: true },
                                    { id: 'faq', type: 'standard', name: 'Frequently Asked Questions', is_visible: true },
                                    { id: 'insights', type: 'standard', name: 'Related Insights', is_visible: true },
                                    { id: 'testimonials', type: 'standard', name: 'Relevant Veteran Feedback', is_visible: true },
                                ];

                                const layout = Array.isArray(service.layout_sections) && service.layout_sections.length > 0
                                    ? service.layout_sections
                                    : defaultLayout;

                                const renderSection = (section) => {
                                    if (!section.is_visible) return null;

                                    if (section.type === 'custom_rich_text') {
                                        return (
                                            <section key={section.id} id={section.id} className="bg-white rounded-2xl p-8 custom-rich-text-section mb-8">
                                                {section.title && (
                                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h3>
                                                )}
                                                <div 
                                                    className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: formatRichHTML(section.content_html || '') }}
                                                />
                                            </section>
                                        );
                                    }

                                    switch (section.id) {
                                        case 'overview':
                                            return (
                                                <section key="overview" id="overview" className="bg-white rounded-2xl p-8 mb-8" aria-labelledby="overview-heading">
                                                    {/* AI Citable Lead / Direct Answer */}
                                                    <div className="mb-8 p-6 bg-indigo-50 border-l-4 border-indigo-600 rounded-r-xl">
                                                        <h2 className="text-lg font-bold text-navy-800 mb-2">What is a {service.title}?</h2>
                                                        <p className="text-slate-700 font-medium leading-relaxed">
                                                            {service.ai_citable_lead || service.short_description}
                                                        </p>
                                                    </div>
                                                    
                                                    <h3 id="overview-heading" className="text-2xl font-bold text-slate-900 mb-4">Overview</h3>
                                                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                        {service.full_description && service.full_description.split('\n').map((line, i) => {
                                                            // Process [text](url) in the line
                                                            const processLinks = (text) => {
                                                                const parts = text.split(/(\[[^\]]+\]\s*\([^)]+\))/g);
                                                                return parts.map((part, index) => {
                                                                    const match = part.match(/\[([^\]]+)\]\s*\(([^)]+)\)/);
                                                                    if (match) {
                                                                        const url = match[2].trim();
                                                                        // Validate URL: only allow http, https, mailto, tel, and relative paths (excluding //)
                                                                        if (/^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(url)) {
                                                                            return (
                                                                                <Link key={index} href={url} className="text-navy-600 hover:underline font-medium">
                                                                                    {match[1]}
                                                                                </Link>
                                                                            );
                                                                        }
                                                                    }
                                                                    return part;
                                                                });
                                                            };

                                                            // Check if line starts with bullet point markers
                                                            if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                                                return (
                                                                    <div key={i} className="flex gap-2 mb-2">
                                                                        <span className="flex-shrink-0">•</span>
                                                                        <span>{processLinks(line.trim().replace(/^[•\-*]\s*/, ''))}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            // Regular paragraph
                                                            return line.trim() ? <p key={i} className="mb-3">{processLinks(line)}</p> : <br key={i} />;
                                                        })}
                                                    </div>
                                                    <p className="text-slate-600 italic mt-6 border-t border-slate-100 pt-6">
                                                        While no medical opinion can guarantee a specific VA outcome, our mission is to ensure your documentation is clear, credible, and professionally prepared — giving your claim the best possible foundation for success.
                                                    </p>
                                                </section>
                                            );
                                        case 'included':
                                            if (!service.features || service.features.length === 0) return null;
                                            return (
                                                <section key="included" id="included" className="bg-white rounded-2xl p-8 mb-8" aria-labelledby="included-heading">
                                                    <h2 id="included-heading" className="text-2xl font-bold text-slate-900 mb-6">What's Included</h2>
                                                    <div className="divide-y divide-slate-100">
                                                        {service.features.map((feature, idx) => (
                                                            <div key={idx} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                                                                <CheckCircle className="w-5 h-5 text-navy-600 flex-shrink-0 mt-0.5" />
                                                                <p className="text-slate-700 font-medium leading-relaxed">{feature}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            );
                                        case 'pricing':
                                            if (service.slug !== 'independent-medical-opinion-nexus-letter') return null;
                                            return (
                                                <section key="pricing" id="pricing" className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200 rounded-2xl p-8 mb-8" aria-labelledby="pricing-heading">
                                                    <h2 id="pricing-heading" className="text-2xl font-bold text-slate-900 mb-2">Pricing at a Glance</h2>
                                                    <p className="text-slate-600 mb-6 text-sm">All claim theories (presumptive, direct, secondary) included in a single letter at internist/specialist level.</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center h-full">
                                                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nurse Practitioner</div>
                                                            <div className="text-2xl font-bold text-slate-900 mb-2">$400+</div>
                                                            <div className="text-[12px] font-semibold text-[#B91C3C]">Single condition</div>
                                                        </div>
                                                        <div className="bg-white p-6 rounded-xl border-2 border-indigo-200 shadow-md flex flex-col justify-center items-center text-center h-full relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                                                            <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Internist / Specialist</div>
                                                            <div className="text-2xl font-bold text-slate-900 mb-2">$945+</div>
                                                            <div className="text-[12px] font-semibold text-slate-600">All theories included</div>
                                                        </div>
                                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center h-full">
                                                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sub-Specialist</div>
                                                            <div className="text-2xl font-bold text-slate-900 mb-2">$1,800+</div>
                                                            <div className="text-[12px] font-semibold text-slate-500">Complex / High-stakes</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <button 
                                                            onClick={() => setIsPricingModalOpen(true)}
                                                            className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 flex items-center justify-center mx-auto transition-colors"
                                                        >
                                                            See Full Pricing Breakdown <ArrowRight className="w-4 h-4 ml-1" />
                                                        </button>
                                                    </div>
                                                </section>
                                            );
                                        case 'systems':
                                            if (!bodySystemsWithCounts || bodySystemsWithCounts.length === 0) return null;
                                            return (
                                                <section key="systems" id="systems" className="bg-white rounded-2xl p-8 mb-8" aria-labelledby="systems-heading">
                                                    <h2 id="systems-heading" className="text-2xl font-bold text-slate-900 mb-2">Browse by Medical Category</h2>
                                                    <p className="text-slate-600 mb-6">Select a category to view conditions eligible for {service.title}.</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {bodySystemsWithCounts.map((system) => (
                                                            <Link 
                                                                href={`/services/${slug}/${system.slug}`} 
                                                                key={system.id}
                                                                className="bg-slate-50 rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-navy-300 transition-all group flex flex-col h-full"
                                                            >
                                                                <div className="flex items-start gap-4 mb-3">
                                                                    {system.icon && (
                                                                        <span className="text-3xl flex-shrink-0 bg-white w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                                                                            <DynamicIcon name={system.icon} className="w-6 h-6 text-indigo-600" />
                                                                        </span>
                                                                    )}
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-navy-700 transition-colors">
                                                                            {system.name}
                                                                        </h3>
                                                                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mt-1 inline-block">
                                                                            {system.conditionCount} {service.title.includes('Nexus') ? 'Nexus Letters' : service.title.includes('DBQ') ? 'DBQs' : 'Conditions'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-slate-600 line-clamp-2 text-sm mt-2 flex-grow">
                                                                    {system.description}
                                                                </p>
                                                                {system.conditionsPreview && system.conditionsPreview.length > 0 && (
                                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                                        {system.conditionsPreview.map((cond, i) => (
                                                                            <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm border border-slate-200">
                                                                                {cond}
                                                                            </span>
                                                                        ))}
                                                                        {system.conditionCount > 4 && (
                                                                            <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm border border-slate-200">
                                                                                +{system.conditionCount - 4} more
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center text-sm text-navy-600 font-semibold group-hover:translate-x-1 transition-transform mt-4">
                                                                    View Conditions <ArrowRight className="w-4 h-4 ml-1" />
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="mt-8 bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex flex-col sm:flex-row items-center gap-4">
                                                        <div className="flex-shrink-0 bg-white p-3 rounded-full shadow-sm border border-indigo-100">
                                                            <Search className="w-6 h-6 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 text-center sm:text-left">
                                                            <div className="font-bold text-navy-800">Don't see your condition?</div>
                                                            <div className="text-sm text-slate-600 mt-1">We cover 100+ conditions. Book a free consultation and we'll match you with the right specialist.</div>
                                                        </div>
                                                        <Link href={`/forms?service=${slug}`} className="bg-navy-600 hover:bg-navy-700 text-white text-sm font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap">
                                                            Book a Call
                                                        </Link>
                                                    </div>
                                                </section>
                                            );
                                        case 'faq':
                                            if (!service.faqs || service.faqs.length === 0) return null;
                                            return (
                                                <section key="faq" id="faq" className="bg-white rounded-2xl p-8 mb-8" aria-labelledby="faq-heading">
                                                    <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                                                    <Accordion type="single" collapsible className="w-full">
                                                        {service.faqs.map((faq, idx) => (
                                                            <AccordionItem key={idx} value={`item-${idx}`}>
                                                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                                                <AccordionContent>
                                                                    <div className="text-slate-600 whitespace-pre-wrap">
                                                                        {faq.answer.split('\n').map((line, i) => {
                                                                            // Process [text](url) in the line
                                                                            const processLinks = (text) => {
                                                                                const parts = text.split(/(\[[^\]]+\]\s*\([^)]+\))/g);
                                                                                return parts.map((part, index) => {
                                                                                    const match = part.match(/\[([^\]]+)\]\s*\(([^)]+)\)/);
                                                                                    if (match) {
                                                                                        const url = match[2].trim();
                                                                                        // Validate URL: only allow http, https, mailto, tel, and relative paths (excluding //)
                                                                                        if (/^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(url)) {
                                                                                            return (
                                                                                                <Link key={index} href={url} className="text-navy-600 hover:underline font-medium">
                                                                                                    {match[1]}
                                                                                                </Link>
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                    return part;
                                                                                });
                                                                            };

                                                                            // Check if line starts with bullet point markers
                                                                            if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                                                                return (
                                                                                    <div key={i} className="flex gap-2 mb-1">
                                                                                        <span className="flex-shrink-0">•</span>
                                                                                        <span>{processLinks(line.trim().replace(/^[•\-*]\s*/, ''))}</span>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            // Regular paragraph
                                                                            return line.trim() ? <p key={i} className="mb-3">{processLinks(line)}</p> : <br key={i} />;
                                                                        })}
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        ))}
                                                    </Accordion>
                                                </section>
                                            );
                                        case 'insights':
                                            if (relatedBlogs.length === 0 && relatedCaseStudies.length === 0) return null;
                                            return (
                                                <section key="insights" id="insights" className="bg-white rounded-2xl p-8 mb-8" aria-labelledby="insights-heading">
                                                    <h2 id="insights-heading" className="text-2xl font-bold text-slate-900 mb-6">Related Insights</h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {relatedBlogs.map(blog => (
                                                            <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                                                                <div className="border border-slate-200 rounded-xl p-5 hover:border-navy-500 hover:shadow-md transition-all h-full bg-slate-50">
                                                                    <span className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-2 block">Blog</span>
                                                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-navy-700">{blog.title}</h3>
                                                                    <div className="text-sm text-slate-600 line-clamp-2">{blog.excerpt}</div>
                                                                    <div className="mt-4 flex items-center text-navy-600 text-sm font-medium">
                                                                        Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                        {relatedCaseStudies.map(study => (
                                                            <Link href={`/case-studies/${study.slug}`} key={study.id} className="group block">
                                                                <div className="border border-slate-200 rounded-xl p-5 hover:border-red-500 hover:shadow-md transition-all h-full bg-slate-50">
                                                                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 block">Case Study</span>
                                                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-red-700">{study.title}</h3>
                                                                    <div className="text-sm text-slate-600 line-clamp-2">{study.excerpt}</div>
                                                                    <div className="mt-4 flex items-center text-red-600 text-sm font-medium">
                                                                        View Case Study <ArrowRight className="w-4 h-4 ml-1" />
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </section>
                                            );
                                        case 'testimonials':
                                            if (!relatedTestimonials || relatedTestimonials.length === 0) return null;
                                            return (
                                                <section key="testimonials" id="testimonials" className="bg-white rounded-2xl p-8 mb-8" aria-labelledby="testimonials-heading">
                                                    <div className="flex items-center justify-between gap-4 mb-6">
                                                        <div>
                                                            <h2 id="testimonials-heading" className="text-2xl font-bold text-slate-900">Relevant Veteran Feedback</h2>
                                                            <p className="mt-2 text-slate-600">
                                                                Real testimonial proof tied to the type of service a visitor is evaluating.
                                                            </p>
                                                        </div>
                                                        <Link href="/testimonials" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-navy-800">
                                                            View all testimonials
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                        {relatedTestimonials.map((testimonial) => (
                                                            <TestimonialCard
                                                                key={testimonial.id}
                                                                testimonial={testimonial}
                                                                compact={true}
                                                                showDate={false}
                                                            />
                                                        ))}
                                                    </div>
                                                </section>
                                            );
                                        default:
                                            return null;
                                    }
                                };

                                return layout.map(section => renderSection(section));
                            })()}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 space-y-6">
                                {/* Diagnostic Box - Only show for claim-readiness-review */}
                                {service.slug === 'claim-readiness-review' && (
                                    <div className="bg-gradient-to-br from-navy-50 to-slate-50 rounded-2xl p-8 shadow-xl" style={{ border: '2px solid #163b63' }}>
                                    <div className="mb-6">
                                        <div className="text-sm text-navy-600 font-semibold mb-2">Not Sure If You're Ready?</div>
                                        <div className="text-2xl font-bold text-slate-900 mb-2">
                                            Free Claim Readiness Check
                                        </div>
                                        <p className="text-slate-600 text-sm">
                                            Take our 5-question diagnostic to assess your claim readiness before booking
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center space-x-3 text-slate-700 text-sm">
                                            <CheckCircle className="w-5 h-5 text-navy-600 flex-shrink-0" />
                                            <span>Takes only 2 minutes</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-slate-700 text-sm">
                                            <CheckCircle className="w-5 h-5 text-navy-600 flex-shrink-0" />
                                            <span>Instant personalized results</span>
                                        </div>

                                    </div>

                                    <Link
                                        href="/diagnostic"
                                        className="w-full bg-navy-700 text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg hover:bg-navy-800 block"
                                    >
                                        Start Free Diagnostic
                                    </Link>

                                    <p className="text-xs text-slate-500 mt-4 text-center">
                                        Get clarity on your claim readiness before filling claim
                                    </p>
                                </div>
                            )}

                            {/* Payment Box */}
                            {service.slug === 'independent-medical-opinion-nexus-letter' ? (
                                <div className="bg-slate-900 rounded-2xl p-8 shadow-xl text-white">
                                    <div className="mb-6">
                                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Nurse Practitioner</div>
                                        <div className="text-sm text-slate-400 mb-1">Starting at</div>
                                        <div className="text-4xl font-bold mb-1">
                                            $400+
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">Single condition</p>
                                    </div>

                                    <button 
                                        onClick={() => setIsPricingModalOpen(true)}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-3 rounded-xl font-semibold text-center transition-all mb-4"
                                    >
                                        See All Pricing Tiers &rarr;
                                    </button>

                                    <Link
                                        href={`/forms?service=${slug}`}
                                        data-testid="book-now-button"
                                        className="w-full text-white px-6 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:bg-red-700 block"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        Book Free Consultation
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 text-slate-900">
                                    {service.slug === 'attorney-advocate-partnership' ? (
                                        <>
                                            <div className="mb-6">
                                                <div className="text-xl font-bold text-slate-900 mb-2">Partner Program</div>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    We provide custom pricing and dedicated support channels for attorney and advocate firms. Contact us to learn how we can support your cases.
                                                </p>
                                            </div>

                                            <div className="space-y-4 mb-6 text-slate-700">
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <Clock className="w-5 h-5 text-navy-600 flex-shrink-0" />
                                                    <span>{service.duration || 'Custom priority timeline'}</span>
                                                </div>
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <CheckCircle className="w-5 h-5 text-navy-600 flex-shrink-0" />
                                                    <span>Dedicated firm portal & coordinator</span>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/forms?service=${slug}`}
                                                data-testid="book-now-button"
                                                className="w-full text-white px-6 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:bg-red-700 block"
                                                style={{ backgroundColor: '#B91C3C' }}
                                            >
                                                Drop us a message
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-6">
                                                <div className="text-sm text-slate-500 mb-2">Starting at</div>
                                                <div className="text-4xl font-bold text-slate-900 mb-1">
                                                    ${service.base_price_usd?.toLocaleString() || 'N/A'}
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-6 text-slate-700">
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <Clock className="w-5 h-5 text-navy-600 flex-shrink-0" />
                                                    <span>{service.duration}</span>
                                                </div>
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <CheckCircle className="w-5 h-5 text-navy-600 flex-shrink-0" />
                                                    <span>One on One consultation with Expert</span>
                                                </div>
                                            </div>

                                            {service.slug === 'claim-readiness-review' ? (
                                                <Link
                                                    href="/claim-readiness-review"
                                                    data-testid="book-now-button"
                                                    className="w-full text-white px-6 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:bg-red-700 block"
                                                    style={{ backgroundColor: '#B91C3C' }}
                                                >
                                                    Book Now - ${service.base_price_usd}
                                                </Link>
                                            ) : service.slug === 'aid-and-attendance' ? (
                                                <div className="space-y-3">
                                                    <Link
                                                        href="/forms?service=aid-and-attendance"
                                                        data-testid="aid-attendance-form-button"
                                                        className="w-full text-white px-6 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:bg-red-700 block"
                                                        style={{ backgroundColor: '#B91C3C' }}
                                                    >
                                                        Complete Aid & Attendance Form
                                                    </Link>
                                                    <Link
                                                        href="/contact"
                                                        data-testid="book-now-button"
                                                        className="w-full bg-white text-navy-600 px-6 py-4 rounded-xl font-semibold text-center hover:bg-slate-50 transition-all border border-slate-300 block"
                                                    >
                                                        General Inquiry
                                                    </Link>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={`/forms?service=${slug}`}
                                                    data-testid="book-now-button"
                                                    className="w-full text-white px-6 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:bg-red-700 block"
                                                    style={{ backgroundColor: '#B91C3C' }}
                                                >
                                                    Book Free Consultation
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
                                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">Build Trust Before Buying</div>
                                <div className="mt-3 text-2xl font-bold">Explore proof and standards</div>
                                <div className="mt-4 space-y-3 text-sm text-white/80">
                                    <Link href="/case-studies" className="block hover:text-white">Case studies for real claim scenarios</Link>
                                    <Link href="/testimonials" className="block hover:text-white">Testimonials from veterans</Link>
                                    <Link href="/medical-review-policy" className="block hover:text-white">Medical review policy</Link>
                                    <Link href="/editorial-policy" className="block hover:text-white">Editorial policy</Link>
                                </div>
                            </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Related Services — Cross-linking for SEO */}
                {allServices.length > 1 && (
                    <section className="py-16 bg-white border-t border-slate-200">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Explore Our Other Services</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allServices
                                    .filter(s => s.slug !== service.slug)
                                    .slice(0, 3)
                                    .map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/services/${related.slug}`}
                                            className="group rounded-xl border border-slate-200 p-6 hover:border-navy-300 hover:shadow-lg transition-all"
                                        >
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-navy-700 transition-colors mb-2">
                                                {related.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                                {related.short_description?.split('\n')[0]}
                                            </p>
                                            <span className="inline-flex items-center text-sm font-medium text-navy-600 group-hover:translate-x-1 transition-transform">
                                                Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                            </span>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                    </section>
                )}
            </div >
            
            <PricingModal 
                isOpen={isPricingModalOpen} 
                onClose={() => setIsPricingModalOpen(false)} 
                isMentalHealth={false}
            />
        </Layout>
    );
};

export async function getStaticPaths() {
    try {
        const services = await servicesApi.getAll();
        const paths = services.map((service) => ({
            params: { slug: service.slug },
        }));

        return {
            paths,
            fallback: 'blocking',
        };
    } catch (error) {
        console.error('Error fetching paths:', error);
        return {
            paths: [],
            fallback: 'blocking',
        };
    }
}

export async function getStaticProps({ params }) {
    const { slug } = params;

    // Clean the slug - take only the first part before any comma (legacy handling)
    const cleanSlug = Array.isArray(slug) ? slug[0].split(',')[0].trim() : slug.split(',')[0].trim();

    try {
        const service = await servicesApi.getBySlug(cleanSlug);

        if (!service) {
            return { notFound: true };
        }

        const serviceTags = serviceTagMap[cleanSlug] || [];

        // Fetch related blogs
        let relatedBlogs = [];
        try {
            // Try searching by specific keywords from title or category
            // If just general search, we can try the service title
            const allBlogs = await blogApi.getAll(20); // Get recent blogs to filter

            // Score blogs by relevance to service
            const scoredBlogs = allBlogs.map(blog => {
                let score = 0;
                const serviceTitle = service.title.toLowerCase();
                const blogTitle = blog.title.toLowerCase();
                const blogContent = (blog.excerpt || '').toLowerCase();

                if (blogTitle.includes(serviceTitle)) score += 10;
                if (blogContent.includes(serviceTitle)) score += 5;
                if (service.category && (blog.category || '').toLowerCase() === service.category.toLowerCase()) score += 3;

                return { ...blog, score };
            }).sort((a, b) => b.score - a.score);

            relatedBlogs = scoredBlogs.filter(b => b.score > 0).slice(0, 3);

            // If not enough related, fill with most recent
            if (relatedBlogs.length < 3) {
                const existingIds = new Set(relatedBlogs.map(b => b.id));
                for (const blog of allBlogs) {
                    if (!existingIds.has(blog.id) && relatedBlogs.length < 3) {
                        relatedBlogs.push(blog);
                        existingIds.add(blog.id);
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching and filtering blogs:', e);
        }

        // Fetch related case studies
        let relatedCaseStudies = [];
        try {
            const allStudies = await caseStudyApi.getAll();

            const scoredStudies = allStudies.map(study => {
                let score = 0;
                const serviceTitle = service.title.toLowerCase();
                const studyTitle = study.title.toLowerCase();
                const studyTags = (study.tags || []).map(t => t.toLowerCase());

                if (studyTitle.includes(serviceTitle)) score += 10;
                if (studyTags.some(t => serviceTitle.includes(t) || t.includes(serviceTitle))) score += 5;

                return { ...study, score };
            }).sort((a, b) => b.score - a.score);

            relatedCaseStudies = scoredStudies.filter(s => s.score > 0).slice(0, 3);

            if (relatedCaseStudies.length < 3) {
                const existingIds = new Set(relatedCaseStudies.map(s => s.id));
                for (const study of allStudies) {
                    if (!existingIds.has(study.id) && relatedCaseStudies.length < 3) {
                        relatedCaseStudies.push(study);
                        existingIds.add(study.id);
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching and filtering case studies:', e);
        }

        let relatedTestimonials = [];
        try {
            if (serviceTags.length > 0) {
                const allTestimonials = await testimonialApi.getAll(50);
                relatedTestimonials = allTestimonials
                    .filter((testimonial) =>
                        serviceTags.some((tag) => (testimonial.tags || []).includes(tag))
                    )
                    .slice(0, 2);
            }
        } catch (e) {
            console.error('Error fetching related testimonials:', e);
        }

        // Fetch all services for the "Related Services" cross-linking section
        let allServices = [];
        try {
            allServices = await servicesApi.getAll();
        } catch (e) {
            console.error('Error fetching all services for cross-links:', e);
        }

        // Fetch body systems and conditions to build the 4-level drill down grid
        let bodySystemsWithCounts = [];
        try {
            const [allSystems, serviceConditions] = await Promise.all([
                bodySystemApi.getAll(true),
                conditionApi.getAll(false, service.id)
            ]);

            bodySystemsWithCounts = allSystems.map(system => {
                const sysConditions = serviceConditions.filter(c => c.body_system_id === system.id);
                const count = sysConditions.length;
                const conditionsPreview = sysConditions.slice(0, 4).map(c => c.page_title || c.dc_name || c.slug);
                return { ...system, conditionCount: count, conditionsPreview };
            }).filter(system => system.conditionCount > 0) // Only show systems that have conditions for this service
              .sort((a, b) => a.display_order - b.display_order);
              
        } catch (e) {
            console.error('Error fetching body systems:', e);
        }

        return {
            props: {
                service,
                slug: cleanSlug,
                allServices,
                relatedBlogs: relatedBlogs,
                relatedCaseStudies: relatedCaseStudies,
                relatedTestimonials,
                bodySystemsWithCounts,
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return { notFound: true };
    }
}

export default ServiceDetail;
