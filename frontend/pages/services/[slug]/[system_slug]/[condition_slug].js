import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, CheckCircle, Activity, FileText, Link2 } from 'lucide-react';
import { conditionApi, servicesApi, bodySystemApi, blogApi, caseStudyApi } from '../../../../src/lib/api';
import DynamicIcon from '../../../../src/components/ui/dynamic-icon';
import SEO from '../../../../src/components/SEO';
import Layout from '../../../../src/components/Layout';
import PricingModal from '../../../../src/components/services/PricingModal';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../../../src/components/ui/accordion';
import { buildOrganizationReference } from '../../../../src/lib/trust';

const NestedConditionDetail = ({ condition, bodySystem, service, relatedBlogs = [], relatedCaseStudies = [] }) => {
    const router = useRouter();
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    if (router.isFallback) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
            </Layout>
        );
    }

    if (!condition || !service || !bodySystem) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Page not found</h2>
                        <p className="text-slate-600 mb-4">The requested page could not be loaded.</p>
                        <Link href="/services" className="text-indigo-600 hover:text-indigo-700">
                            Back to Services
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    // Structured data for condition page
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "name": condition.page_title,
        "description": condition.meta_description,
        "about": {
            "@type": "MedicalCondition",
            "name": condition.hero_heading
        },
        "publisher": {
            ...buildOrganizationReference()
        }
    };

    return (
        <Layout>
            <SEO
                title={condition.page_title}
                description={condition.meta_description}
                keywords={`${condition.hero_heading}, ${service.title}, VA disability, secondary condition`}
                structuredData={structuredData}
                faqSchema={condition.faqs}
                canonical={`/services/${service.slug}/${bodySystem.slug}/${condition.slug}`}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Services', path: '/services' },
                    { name: service.title, path: `/services/${service.slug}` },
                    { name: bodySystem.name, path: `/services/${service.slug}/${bodySystem.slug}` },
                    { name: condition.hero_heading, path: `/services/${service.slug}/${bodySystem.slug}/${condition.slug}` }
                ]}
            />
            <div className="bg-slate-50 min-h-screen pb-20">
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
                        <Link href={`/services/${service.slug}`} className="hover:text-navy-700 transition-colors">
                            {service.title}
                        </Link>
                        <span className="text-slate-400">›</span>
                        <Link href={`/services/${service.slug}/${bodySystem.slug}`} className="hover:text-navy-700 transition-colors">
                            {bodySystem.name}
                        </Link>
                        <span className="text-slate-400">›</span>
                        <span className="text-slate-950 font-semibold">{condition.hero_heading}</span>
                    </nav>

                    {/* Hero Card */}
                    <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
                            <div className="w-96 h-96 bg-white rounded-full absolute -right-20 -top-20 blur-3xl"></div>
                        </div>
                        <div className="max-w-3xl relative z-10">
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="inline-flex items-center px-3 py-1 bg-red-700 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                                    {bodySystem.name} · {service.title}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{condition.hero_heading}</h1>
                            {condition.meta_description && (
                                <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-8">{condition.meta_description}</p>
                            )}
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={() => setIsPricingModalOpen(true)}
                                    className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
                                >
                                    View Pricing — From {condition.stat_starting_price || condition.specialist_guide?.[0]?.price || '$400'}
                                </button>
                                <Link 
                                    href={`/forms?service=${service.slug}`}
                                    className="bg-transparent hover:bg-white/5 border border-slate-400 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                >
                                    Free Consultation
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* 4 Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">DIAGNOSTIC CODE</span>
                            <div className="text-2xl font-serif text-slate-900 mb-1">
                                {condition.dc_code ? `DC ${condition.dc_code}` : 'Varies'}
                            </div>
                            <div className="text-xs text-red-700 font-medium">
                                {condition.dc_name || 'Based on affected nerve/area'}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">STARTING AT</span>
                            <div className="text-2xl font-serif text-slate-900 mb-1">{condition.stat_starting_price || condition.specialist_guide?.[0]?.price || '$400'}</div>
                            <div className="text-xs text-red-700 font-medium">{condition.stat_provider || condition.specialist_guide?.[0]?.name || 'Nurse Practitioner'}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">TURNAROUND</span>
                            <div className="text-2xl font-serif text-slate-900 mb-1">{condition.stat_turnaround_time || '7–10 Days'}</div>
                            <div className="text-xs text-red-700 font-medium">{condition.stat_turnaround_note || 'Rush 48–72hrs'}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">CONSULTATION</span>
                            <div className="text-2xl font-serif text-slate-900 mb-1">{condition.stat_consultation_type || 'Free'}</div>
                            <div className="text-xs text-red-700 font-medium">{condition.stat_consultation_note || 'No obligation'}</div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Dark VA Diagnostic Code Section */}
                            <section className="bg-navy-800 rounded-2xl p-8 shadow-xl text-white">
                                <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">VA DIAGNOSTIC CODE</div>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                                    {condition.dc_code ? `DC ${condition.dc_code}` : 'Varies'}
                                </h2>
                                <div className="text-sm text-slate-300 mb-8 pb-8 border-b border-slate-700/60">
                                    {condition.dc_name || 'Based on affected nerve root and degree of incomplete paralysis'}
                                </div>
                                
                                {condition.ratings?.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-4 md:grid-cols-5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                            <div className="col-span-1">RATING</div>
                                            <div className="col-span-3 md:col-span-4">CRITERIA</div>
                                        </div>
                                        <div className="space-y-4">
                                            {condition.ratings.map((rating, idx) => (
                                                <div key={idx} className="grid grid-cols-4 md:grid-cols-5 items-start text-sm border-t border-slate-700/40 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
                                                    <div className="col-span-1 font-bold text-white text-lg">{rating.pct}</div>
                                                    <div className="col-span-3 md:col-span-4 text-slate-300 leading-relaxed">{rating.criteria}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-slate-400 italic">No specific rating schedule provided.</div>
                                )}
                            </section>
                            
                            {/* Rich Text Overview */}
                            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" aria-labelledby="overview-heading">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 id="overview-heading" className="text-2xl font-bold text-slate-900">VA Disability Requirements for {service.title}</h2>
                                        {condition.dc_code && (
                                            <p className="text-sm font-semibold text-slate-500 mt-1">
                                                Diagnostic Code (DC) {condition.dc_code} {condition.dc_name ? `- ${condition.dc_name}` : ''}
                                            </p>
                                        )}
                                    </div>
                                    {condition.icon && (
                                        <div className="text-4xl">
                                            <DynamicIcon name={condition.icon} className="w-10 h-10 text-indigo-600" />
                                        </div>
                                    )}
                                </div>
                                <div 
                                    className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&>p]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: condition.content_html }}
                                />
                            </section>

                            {/* Features */}
                            {condition.features?.length > 0 && (
                                <div className="grid grid-cols-1 gap-8">
                                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-indigo-600" /> Evidence Checklist
                                        </h3>
                                        <ul className="space-y-3">
                                            {condition.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 text-sm leading-relaxed">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>
                            )}

                            {/* Secondary Connections */}
                            {condition.secondary_connections?.length > 0 && (
                                <section className="bg-slate-100/60 rounded-[2rem] p-8 md:p-10 border border-slate-200/50 relative overflow-hidden">
                                    {/* Decorative subtle background circle */}
                                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-slate-200/40 rounded-full pointer-events-none"></div>
                                    
                                    <div className="mb-6 relative z-10">
                                        <span className="inline-flex items-center px-3 py-1 bg-red-700 text-white text-[10px] font-bold rounded-md uppercase tracking-wider mb-3">
                                            Secondary Service Connections
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                                            How {condition.hero_heading || condition.page_title} Connects to Service
                                        </h2>
                                        <p className="text-sm text-slate-600">
                                            These are the medical pathways our clinicians use to establish nexus between {(condition.hero_heading || condition.page_title || '').toLowerCase()} and military service:
                                        </p>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        {condition.secondary_connections.map((conn, idx) => (
                                            <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                        <Link2 className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-slate-900 text-base mb-1">
                                                        {conn.url ? (
                                                            <Link href={conn.url} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                                                {conn.from}
                                                            </Link>
                                                        ) : (
                                                            conn.from
                                                        )}
                                                        <span className="text-slate-400 mx-2">→</span>
                                                        <span className="text-slate-700">{condition.hero_heading || condition.page_title}</span>
                                                    </h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{conn.mechanism}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* FAQ Section */}
                            {condition.faqs && condition.faqs.length > 0 && (
                                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" aria-labelledby="faq-heading">
                                    <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {condition.faqs.map((faq, idx) => (
                                            <AccordionItem key={idx} value={`item-${idx}`}>
                                                <AccordionTrigger className="text-left font-semibold text-slate-800">{faq.question}</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                        {faq.answer}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </section>
                            )}

                            {/* Related Insights */}
                            {(relatedBlogs.length > 0 || relatedCaseStudies.length > 0) && (
                                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" aria-labelledby="insights-heading">
                                    <h2 id="insights-heading" className="text-2xl font-bold text-slate-900 mb-6">Related Insights & Proof</h2>
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

                            {/* Additional Relationships */}
                            {(condition.paired_conditions?.length > 0 || condition.internal_links?.length > 0) && (
                                <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                        <Activity className="w-6 h-6 mr-2 text-indigo-600" /> Additional Clinical Context
                                    </h2>
                                    <div className="space-y-6">
                                        {condition.paired_conditions?.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-3">Often Filed With</h3>
                                                <ul className="space-y-2 mb-2">
                                                    {condition.paired_conditions.map((pc, idx) => (
                                                        <li key={idx} className="flex items-center text-slate-700">
                                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                                                            {pc}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {condition.pair_note && (
                                                    <p className="text-sm text-slate-600 italic border-l-2 border-indigo-200 pl-3">
                                                        {condition.pair_note}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {condition.internal_links?.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-3">Related Guides</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {condition.internal_links.map((link, idx) => (
                                                        <Link key={idx} href={link.url} className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 transition-colors">
                                                            {link.icon && (
                                                                <span className="text-2xl mr-3 flex-shrink-0">
                                                                    <DynamicIcon name={link.icon} className="w-6 h-6 text-indigo-600" />
                                                                </span>
                                                            )}
                                                            <div>
                                                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{link.label}</div>
                                                                <div className="font-semibold text-slate-900">{link.title}</div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 space-y-6">
                                <div className="bg-navy-700 rounded-2xl p-6 shadow-xl text-white border border-navy-600">
                                    <div className="text-sm text-slate-300 mb-2 font-medium">{condition.hero_heading || `${bodySystem.name} Nexus Letter`}</div>
                                    <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">Starting at</div>
                                    <div className="text-5xl font-serif font-bold mb-2">
                                        {condition.specialist_guide?.[0]?.price || '$400'}
                                    </div>
                                    <div className="text-sm text-slate-300 mb-8 border-b border-navy-600 pb-6">
                                        {condition.specialist_guide?.[0]?.name || 'Nurse Practitioner'} · Single condition
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsPricingModalOpen(true)}
                                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 px-4 rounded-xl mb-3 flex items-center justify-center transition-colors shadow-lg"
                                    >
                                        See All Pricing Tiers <ArrowRight className="w-4 h-4 ml-2"/>
                                    </button>
                                    <Link 
                                        href={`/forms?service=${service.slug}`}
                                        className="w-full bg-transparent hover:bg-navy-600 border border-slate-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-colors"
                                    >
                                        Book Free Consultation
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            <PricingModal 
                isOpen={isPricingModalOpen} 
                onClose={() => setIsPricingModalOpen(false)} 
                isMentalHealth={bodySystem?.is_mental_health || false}
            />
        </Layout>
    );
};

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking',
    };
}

export async function getStaticProps({ params }) {
    const { slug, system_slug, condition_slug } = params;

    try {
        const [service, bodySystem] = await Promise.all([
            servicesApi.getBySlug(slug),
            bodySystemApi.getBySlug(system_slug)
        ]);

        if (!service || !bodySystem) {
            return { notFound: true };
        }

        const condition = await conditionApi.getBySlug(condition_slug, service.id);

        if (!condition) {
            return { notFound: true };
        }

        // Fetch related blogs and case studies by performing a basic text match
        let relatedBlogs = [];
        let relatedCaseStudies = [];
        try {
            const conditionName = condition.hero_heading.toLowerCase();
            
            // Blogs
            const allBlogs = await blogApi.getAll(50);
            const scoredBlogs = allBlogs.map(blog => {
                let score = 0;
                if ((blog.title || '').toLowerCase().includes(conditionName)) score += 10;
                if ((blog.excerpt || '').toLowerCase().includes(conditionName)) score += 5;
                return { ...blog, score };
            }).sort((a, b) => b.score - a.score);
            relatedBlogs = scoredBlogs.filter(b => b.score > 0).slice(0, 2);

            // Case Studies
            const allStudies = await caseStudyApi.getAll(false);
            const scoredStudies = allStudies.map(study => {
                let score = 0;
                if ((study.title || '').toLowerCase().includes(conditionName)) score += 10;
                const studyTags = (study.tags || []).map(t => t.toLowerCase());
                if (studyTags.some(t => t.includes(conditionName) || conditionName.includes(t))) score += 5;
                return { ...study, score };
            }).sort((a, b) => b.score - a.score);
            relatedCaseStudies = scoredStudies.filter(s => s.score > 0).slice(0, 2);

        } catch (e) {
            console.error('Error fetching related content:', e);
        }

        return {
            props: {
                condition,
                bodySystem,
                service,
                relatedBlogs,
                relatedCaseStudies,
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error(`Error in getStaticProps for condition ${condition_slug}:`, error);
        return { notFound: true };
    }
}

export default NestedConditionDetail;
