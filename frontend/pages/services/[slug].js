import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle, ArrowLeft, Clock, ArrowRight, FileText } from 'lucide-react';
import { servicesApi, blogApi, caseStudyApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../src/components/ui/accordion';

const ServiceDetail = ({ service, relatedBlogs = [], relatedCaseStudies = [] }) => {
    const router = useRouter();

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

    // Structured data for service
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": service.short_description,
        "provider": {
            "@type": "Organization",
            "name": "Military Disability Nexus",
            "url": "https://militarydisabilitynexus.com"
        },
        "serviceType": service.category,
        "offers": {
            "@type": "Offer",
            "price": service.base_price_usd,
            "priceCurrency": "USD"
        }
    };

    return (
        <Layout>
            <SEO
                title={service.title}
                description={service.short_description}
                keywords={`${service.title}, ${service.category}, VA disability, medical documentation`}
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
                {/* Header */}
                <section className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/services"
                            className="inline-flex items-center space-x-2 text-navy-100 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Services</span>
                        </Link>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{service.title}</h1>
                        <p className="text-xl text-navy-100">{service.short_description}</p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Overview */}
                            <section className="bg-white rounded-2xl p-8" aria-labelledby="overview-heading">
                                <h2 id="overview-heading" className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {service.full_description && service.full_description.split('\n').map((line, i) => {
                                        // Check if line starts with bullet point markers
                                        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                            return (
                                                <div key={i} className="flex gap-2 mb-2">
                                                    <span className="flex-shrink-0">•</span>
                                                    <span>{line.trim().replace(/^[•\-*]\s*/, '')}</span>
                                                </div>
                                            );
                                        }
                                        // Regular paragraph
                                        return line.trim() ? <p key={i} className="mb-3">{line}</p> : <br key={i} />;
                                    })}
                                </div>
                            </section>

                            {/* What's Included */}
                            <section className="bg-white rounded-2xl p-8" aria-labelledby="included-heading">
                                <h2 id="included-heading" className="text-2xl font-bold text-slate-900 mb-6">What's Included</h2>
                                <div className="space-y-4">
                                    {service.features && service.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start space-x-3">
                                            <CheckCircle className="w-6 h-6 text-navy-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                            <span className="text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* FAQ */}
                            {service.faqs && service.faqs.length > 0 && (
                                <section className="bg-white rounded-2xl p-8" aria-labelledby="faq-heading">
                                    <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {service.faqs.map((faq, idx) => (
                                            <AccordionItem key={idx} value={`item-${idx}`}>
                                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="text-slate-600 whitespace-pre-wrap">
                                                        {faq.answer.split('\n').map((line, i) => {
                                                            // Check if line starts with bullet point markers
                                                            if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                                                return (
                                                                    <div key={i} className="flex gap-2 mb-1">
                                                                        <span className="flex-shrink-0">•</span>
                                                                        <span>{line.trim().replace(/^[•\-*]\s*/, '')}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            // Regular paragraph
                                                            return line.trim() ? <p key={i} className="mb-3">{line}</p> : <br key={i} />;
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </section>
                            )}

                            {/* Related Insights */}
                            {(relatedBlogs.length > 0 || relatedCaseStudies.length > 0) && (
                                <section className="bg-white rounded-2xl p-8" aria-labelledby="insights-heading">
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
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1 space-y-6">
                            {/* Diagnostic Box - Only show for claim-readiness-review */}
                            {service.slug === 'claim-readiness-review' && (
                                <div className="sticky top-24 bg-gradient-to-br from-navy-50 to-slate-50 rounded-2xl p-8 shadow-xl" style={{ border: '2px solid #163b63' }}>
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
                                        <div className="flex items-center space-x-3 text-slate-700 text-sm">
                                            <CheckCircle className="w-5 h-5 text-navy-600 flex-shrink-0" />
                                            <span>No email required</span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/diagnostic"
                                        className="w-full bg-navy-700 text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg hover:bg-navy-800 block"
                                    >
                                        Start Free Diagnostic
                                    </Link>

                                    <p className="text-xs text-slate-500 mt-4 text-center">
                                        Get clarity on your claim readiness before investing
                                    </p>
                                </div>
                            )}

                            {/* Payment Box */}
                            <div className="sticky top-24 bg-white rounded-2xl p-8 shadow-xl" style={{ border: '2px solid #B91C3C' }}>
                                <div className="mb-6">
                                    <div className="text-sm text-slate-500 mb-2">Starting at</div>
                                    <div className="text-4xl font-bold text-slate-900 mb-1">
                                        ${service.base_price_usd?.toLocaleString() || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center space-x-3 text-slate-700">
                                        <Clock className="w-5 h-5 text-navy-600" />
                                        <span>{service.duration}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-slate-700">
                                        <CheckCircle className="w-5 h-5 text-navy-600" />
                                        <span>One on One consultation with Expert</span>
                                    </div>
                                </div>

                                {service.slug === 'claim-readiness-review' ? (
                                    <Link
                                        href="/claim-readiness-review"
                                        data-testid="book-now-button"
                                        className="w-full text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg block"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        Book Now - ${service.base_price_usd}
                                    </Link>
                                ) : service.slug === 'aid-attendance' ? (
                                    <div className="space-y-3">
                                        <Link
                                            href="/aid-attendance-form"
                                            data-testid="aid-attendance-form-button"
                                            className="w-full text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg block"
                                            style={{ backgroundColor: '#B91C3C' }}
                                        >
                                            Complete Aid & Attendance Form
                                        </Link>
                                        <Link
                                            href="/contact"
                                            data-testid="book-now-button"
                                            className="w-full bg-white text-navy-600 px-6 py-4 rounded-full font-semibold text-center hover:bg-slate-50 transition-all border-2 border-navy-600 block"
                                        >
                                            General Inquiry
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href="/contact"
                                        data-testid="book-now-button"
                                        className="w-full text-white px-6 py-4 rounded-full font-semibold text-center transition-all hover:shadow-lg block"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        Get a Free Consultation
                                    </Link>
                                )}

                                {(service.slug === 'claim-readiness-review' || service.slug === 'aid-attendance') && (
                                    <p className="text-sm text-slate-500 mt-4 text-center">
                                        {service.slug === 'claim-readiness-review'
                                            ? 'Pay now and get your comprehensive review in 5-7 days'
                                            : 'Complete our specialized form for faster processing'
                                        }
                                    </p>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </div >
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

        return {
            props: {
                service,
                slug: cleanSlug,
                relatedBlogs: relatedBlogs,
                relatedCaseStudies: relatedCaseStudies,
            },
            revalidate: 86400, // Revalidate every 24 hours
        };
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return { notFound: true };
    }
}

export default ServiceDetail;
