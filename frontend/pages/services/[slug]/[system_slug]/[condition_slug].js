import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { conditionApi, servicesApi, bodySystemApi, blogApi, caseStudyApi } from '../../../../src/lib/api';
import { getConditionRoutingDecision } from '../../../../src/lib/conditionRouting';
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
import { formatRichHTML } from '../../../../src/lib/htmlUtils';
import {
    DEFAULT_CONDITION_SECTIONS,
    getRenderableLayoutSections,
} from '../../../../src/lib/layoutSections';

const NestedConditionDetail = ({ condition, bodySystem, service, relatedBlogs = [], relatedCaseStudies = [], allServices = [], siblingConditions = [] }) => {
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

    const statCards = condition.stat_cards || [];
    const specialistGuide = condition.specialist_guide || [];
    const secondaryConnections = condition.secondary_connections || [];
    const pairedConditions = (condition.paired_conditions || []).map(pc => {
        if (!pc) return null;
        if (typeof pc === 'object') {
            return { name: pc.name || '', url: pc.url || '' };
        }
        try {
            const parsed = JSON.parse(pc);
            if (typeof parsed === 'object' && parsed !== null) {
                return { name: parsed.name || '', url: parsed.url || '' };
            }
        } catch {
            // Fallback for plain strings
        }
        return { name: String(pc) || '', url: '' };
    }).filter(pc => pc && pc.name && String(pc.name).trim() !== '');
    const internalLinks = condition.internal_links || [];
    const otherServices = (allServices || []).filter(s => s.slug !== service.slug);
    const otherConditions = (siblingConditions || []).filter(c => c.id !== condition.id);
    const isMH = bodySystem?.is_mental_health || false;
    const basePriceText = bodySystem?.cta_price || (isMH ? '$1,600+' : '$400+');
    const displayCtaPrice = basePriceText.toLowerCase().startsWith('from') ? basePriceText : `From ${basePriceText}`;
    const basePriceValue = basePriceText.toLowerCase().startsWith('from ') ? basePriceText.substring(5) : basePriceText;

    // Helper functions to clean and deduplicate titles (prevents double-appending "Nexus Letter" or "DBQ" to the title/subheadings)
    const getCleanConditionTitle = (heroHeading, svcTitle) => {
        const heading = heroHeading || '';
        const svc = svcTitle || '';
        
        if (heading.toLowerCase().includes(svc.toLowerCase())) {
            return heading;
        }
        
        if (svc.toLowerCase().includes('nexus') || svc.toLowerCase().includes('opinion')) {
            if (heading.toLowerCase().includes('nexus') || heading.toLowerCase().includes('imo')) {
                return heading;
            }
            return `${heading} Nexus Letter`;
        }
        
        if (svc.toLowerCase().includes('dbq') || svc.toLowerCase().includes('questionnaire')) {
            if (heading.toLowerCase().includes('dbq') || heading.toLowerCase().includes('questionnaire')) {
                return heading;
            }
            return `${heading} DBQ`;
        }
        
        return `${heading} ${svc}`;
    };

    const getCleanConditionTitlePlural = (heroHeading, svcTitle) => {
        const clean = getCleanConditionTitle(heroHeading, svcTitle);
        if (clean.toLowerCase().endsWith('letter')) return `${clean}s`;
        if (clean.toLowerCase().endsWith('dbq')) return `${clean}s`;
        return clean;
    };

    const cleanConditionTitle = getCleanConditionTitle(condition.hero_heading, service.title);
    const cleanConditionTitlePlural = getCleanConditionTitlePlural(condition.hero_heading, service.title);

    const layoutSections = getRenderableLayoutSections(
        condition.layout_sections,
        DEFAULT_CONDITION_SECTIONS,
        {
            preserveEmpty: true,
            supportedStandardIdsOnly: true,
            fallbackWhenEmpty: true,
            requireRenderableCustomContent: true,
        },
    );

    const renderSection = (sectionId) => {
        switch (sectionId) {
            case 'ratings':
                return (
                    <section key="ratings" className="bg-navy-800 rounded-2xl p-8 shadow-xl text-white">
                        <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">VA DIAGNOSTIC CODE</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
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
                );
            case 'about':
                return (
                    <section key="about" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                            About {cleanConditionTitle} VA Claims
                        </h2>
                        <div 
                            className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&>p]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
                            dangerouslySetInnerHTML={{ __html: formatRichHTML(condition.content_html) }}
                        />
                    </section>
                );
            case 'features':
                if (!condition.features || condition.features.length === 0) return null;
                return (
                    <section key="features" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>What&apos;s Included</h2>
                        <div className="space-y-3 mt-4">
                            {condition.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#B91C3C' }} />
                                    <span className="text-slate-700 text-sm leading-relaxed">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case 'connections':
                if (secondaryConnections.length === 0) return null;
                return (
                    <section key="connections" className="rounded-2xl p-8 border border-slate-200 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(41,67,95,0.06), rgba(152,60,68,0.08))' }}>
                        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-30" style={{ background: 'rgba(152,60,68,0.15)' }} />
                        <div className="relative z-10">
                            <span className="inline-block text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-3" style={{ backgroundColor: '#983c44' }}>
                                Secondary Service Connections
                            </span>
                            <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                How {cleanConditionTitle} Connects to Service
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-5">
                                These are the medical pathways our clinicians use to establish nexus between {(cleanConditionTitle || '').toLowerCase()} and military service:
                            </p>
                            <div className="space-y-3">
                                {secondaryConnections.map((conn, idx) => {
                                    const cardContent = (
                                        <>
                                            <span className="text-base flex-shrink-0 mt-0.5">🔗</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm" style={{ color: '#29435f' }}>
                                                    {conn.from} <span className="text-slate-400 mx-1">→</span> {cleanConditionTitle}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">{conn.mechanism}</div>
                                            </div>
                                        </>
                                    );
                                    return conn.url ? (
                                        <Link key={idx} href={conn.url} className="flex gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                                            {cardContent}
                                        </Link>
                                    ) : (
                                        <div key={idx} className="flex gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                            {cardContent}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            case 'specialist':
                if (service.slug !== 'independent-medical-opinion-nexus-letter' || specialistGuide.length === 0) return null;
                return (
                    <section key="specialist" className="rounded-2xl p-8 border border-slate-200 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(41,67,95,0.06), rgba(152,60,68,0.08))' }}>
                        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-30" style={{ background: 'rgba(152,60,68,0.15)' }} />
                        <div className="relative z-10">
                            <span className="inline-block text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-3" style={{ backgroundColor: '#983c44' }}>
                                Specialist Guide
                            </span>
                            <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                Who Should Write Your {cleanConditionTitle}?
                            </h2>
                            <p className="text-sm text-slate-600 mb-5">Match the writer to the medical question for maximum probative weight:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {specialistGuide.map((spec, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-red-300 hover:-translate-y-0.5 transition-all">
                                        <div className="font-bold text-slate-900 text-sm mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>{spec.name}</div>
                                        <div className="text-xs text-slate-600 leading-relaxed mb-3">{spec.best_for}</div>
                                        <div className="text-sm font-bold" style={{ color: '#983c44' }}>{spec.price}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-sm text-slate-500">
                                <Link href="/blog/who-should-write-your-va-nexus-letter-specialist-guide" className="font-semibold hover:underline" style={{ color: '#983c44' }}>
                                    Read the full Specialist Guide →
                                </Link>
                            </div>
                        </div>
                    </section>
                );
            case 'faqs':
                if (!condition.faqs || condition.faqs.length === 0) return null;
                return (
                    <section key="faqs" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" aria-labelledby="faq-heading">
                        <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>Frequently Asked Questions</h2>
                        <p className="text-sm text-slate-500 mb-6">About {cleanConditionTitlePlural}</p>
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
                );
            case 'related_pages':
                if (internalLinks.length === 0) return null;
                return (
                    <section key="related_pages" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>Related Pages</h2>
                        <p className="text-sm text-slate-500 mb-4">Explore related services, conditions, and resources</p>
                        <div className="space-y-2 mt-4">
                            {internalLinks.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-sm transition-all group"
                                >
                                    {link.icon && (
                                        <span className="text-xl flex-shrink-0">
                                            <DynamicIcon name={link.icon} className="w-5 h-5 text-slate-600" />
                                        </span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#983c44' }}>{link.label}</div>
                                        <div className="font-semibold text-slate-900 text-sm">{link.title}</div>
                                    </div>
                                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: '#983c44' }}>→</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            case 'paired_conditions':
                if (pairedConditions.length === 0) return null;
                return (
                    <section key="paired_conditions" className="rounded-2xl p-8 border border-slate-200 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(41,67,95,0.06), rgba(152,60,68,0.04))' }}>
                        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-30" style={{ background: 'rgba(152,60,68,0.15)' }} />
                        <div className="relative z-10">
                            <span className="inline-block text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-3" style={{ backgroundColor: '#983c44' }}>
                                Commonly Paired
                            </span>
                            <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                Veterans Usually Pair {cleanConditionTitle} With These Conditions
                            </h2>
                            {condition.pair_note && (
                                <p className="text-sm text-slate-600 leading-relaxed mb-5">{condition.pair_note}</p>
                            )}
                            <div className="flex flex-wrap gap-3">
                                {pairedConditions.map((pc, i) => {
                                    if (pc.url) {
                                        return (
                                            <Link
                                                key={i}
                                                href={pc.url}
                                                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold hover:border-red-300 transition-all cursor-pointer block"
                                                style={{ color: '#29435f' }}
                                            >
                                                {pc.name} →
                                            </Link>
                                        );
                                    }
                                    return (
                                        <div
                                            key={i}
                                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-default"
                                        >
                                            {pc.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            case 'insights':
                if (relatedBlogs.length === 0 && relatedCaseStudies.length === 0) return null;
                return (
                    <section key="insights" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" aria-labelledby="insights-heading">
                        <h2 id="insights-heading" className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>Related Insights & Proof</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relatedBlogs.map(blog => (
                                <Link href={`/blog/${blog.slug}`} key={blog.id} className="group block">
                                    <div className="border border-slate-200 rounded-xl p-5 hover:border-red-300 hover:shadow-md transition-all h-full bg-slate-50">
                                        <span className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#29435f' }}>Blog</span>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-navy-700">{blog.title}</h3>
                                        <div className="text-sm text-slate-655 line-clamp-2">{blog.excerpt}</div>
                                        <div className="mt-4 flex items-center text-sm font-medium" style={{ color: '#983c44' }}>
                                            Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {relatedCaseStudies.map(study => (
                                <Link href={`/case-studies/${study.slug}`} key={study.id} className="group block">
                                    <div className="border border-slate-200 rounded-xl p-5 hover:border-red-300 hover:shadow-md transition-all h-full bg-slate-50">
                                        <span className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#983c44' }}>Case Study</span>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-red-700">{study.title}</h3>
                                        <div className="text-sm text-slate-600 line-clamp-2">{study.excerpt}</div>
                                        <div className="mt-4 flex items-center text-sm font-medium" style={{ color: '#983c44' }}>
                                            View Case Study <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

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
            <PricingModal 
                isOpen={isPricingModalOpen} 
                onClose={() => setIsPricingModalOpen(false)} 
                service={service}
                isMentalHealth={isMH}
            />
            <SEO
                title={condition.page_title}
                description={condition.meta_description}
                keywords={`${cleanConditionTitle}, VA disability, secondary condition`}
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
                        <Link href="/" className="hover:text-navy-700 transition-colors">Home</Link>
                        <span className="text-slate-400">›</span>
                        <Link href="/services" className="hover:text-navy-700 transition-colors">Services</Link>
                        <span className="text-slate-400">›</span>
                        <Link href={`/services/${service.slug}`} className="hover:text-navy-700 transition-colors">{service.title}</Link>
                        <span className="text-slate-400">›</span>
                        <Link href={`/services/${service.slug}/${bodySystem.slug}`} className="hover:text-navy-700 transition-colors">{bodySystem.name}</Link>
                        <span className="text-slate-400">›</span>
                        <span className="text-slate-950 font-semibold">{condition.hero_heading}</span>
                    </nav>

                    {/* Hero Card */}
                    <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
                            <div className="w-96 h-96 bg-white rounded-full absolute -right-20 -top-20 blur-3xl"></div>
                        </div>
                        <div className="max-w-3xl relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
                                {bodySystem.icon && <DynamicIcon name={bodySystem.icon} className="w-3.5 h-3.5" />}
                                {bodySystem.name} · {service.title}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                {condition.hero_heading}
                            </h1>
                            {(condition.hero_description || condition.meta_description) && (
                                <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                                    {condition.hero_description || condition.meta_description}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-8">
                                {service.slug === 'independent-medical-opinion-nexus-letter' ? (
                                    <button
                                        onClick={() => setIsPricingModalOpen(true)}
                                        className="text-white px-8 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        View Pricing — {displayCtaPrice}
                                    </button>
                                ) : (
                                    <Link
                                        href={
                                            service.slug === 'claim-readiness-review'
                                                ? '/claim-readiness-review'
                                                : `/forms?service=${service.slug}`
                                        }
                                        className="text-white px-8 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110 flex items-center justify-center"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        Book Now — ${service.base_price_usd?.toLocaleString() || 'N/A'}
                                    </Link>
                                )}
                                <Link
                                    href="/contact"
                                    className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-white/15 transition-all"
                                >
                                    Free Consultation
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Stat Cards */}
                {statCards.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                        <div className={`grid gap-4 ${statCards.length === 4 ? 'grid-cols-2 md:grid-cols-4' : statCards.length === 3 ? 'grid-cols-3' : statCards.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {statCards.map((stat, i) => (
                                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-medium">{stat.label}</div>
                                    <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>{stat.value}</div>
                                    {stat.subtext && <div className="text-xs mt-1" style={{ color: '#B91C3C' }}>{stat.subtext}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {layoutSections.map((sec) => {
                                if (sec.is_visible === false) return null;
                                if (sec.type === 'custom_rich_text') {
                                    if (typeof sec.content_html !== 'string' || !sec.content_html.trim()) return null;
                                    const title = typeof sec.title === 'string' ? sec.title.trim() : '';
                                    return (
                                        <section key={sec.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                            {title && (
                                                <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                                    {title}
                                                </h2>
                                            )}
                                            <div 
                                                className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&>p]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
                                                dangerouslySetInnerHTML={{ __html: formatRichHTML(sec.content_html) }}
                                            />
                                        </section>
                                    );
                                }
                                return renderSection(sec.id);
                            })}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 space-y-5">
                                 {/* Pricing Box */}
                                {service.slug === 'independent-medical-opinion-nexus-letter' ? (
                                    <div className="rounded-2xl p-7 shadow-xl text-white" style={{ background: 'linear-gradient(160deg, #29435f, #3a5a7a)' }}>
                                        <div className="mb-5">
                                            <div className="text-xs text-white/50 font-medium mb-0.5">{cleanConditionTitle}</div>
                                            <div className="text-xs text-white/50">Starting at</div>
                                            <div className="text-4xl font-bold my-1" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                                {basePriceValue}
                                            </div>
                                            <p className="text-xs text-white/45 mt-1">
                                                {isMH ? 'Psychiatrist / Psychologist' : 'Nurse Practitioner · Single condition'}
                                            </p>
                                        </div>

                                        {isMH && (
                                            <div className="border rounded-lg px-3 py-2 mb-4 text-[11px]" style={{ background: 'rgba(152,60,68,.25)', borderColor: 'rgba(152,60,68,.4)', color: '#e8a0a8' }}>
                                                ⚠️ Mental Health minimum — specialized DSM-5 documentation
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => setIsPricingModalOpen(true)}
                                            className="w-full text-white border border-white/20 px-6 py-3 rounded-xl font-semibold text-center transition-all mb-3 text-sm hover:bg-white/10"
                                            style={{ backgroundColor: '#B91C3C' }}
                                        >
                                            See All Pricing Tiers →
                                        </button>

                                        <Link
                                            href={`/forms?service=${service.slug}`}
                                            className="w-full bg-white/10 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all hover:bg-white/15 border border-white/18 block text-sm"
                                        >
                                            Book Free Consultation
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-7 shadow-xl border border-slate-200 text-slate-900">
                                        <div className="mb-5">
                                            <div className="text-xs text-slate-500 font-medium mb-0.5">{cleanConditionTitle}</div>
                                            <div className="text-sm text-slate-500 mb-1">Starting at</div>
                                            <div className="text-4xl font-bold text-slate-900 my-1" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
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
                                                className="w-full text-white px-6 py-3 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110 block text-sm"
                                                style={{ backgroundColor: '#B91C3C' }}
                                            >
                                                Book Now - ${service.base_price_usd}
                                            </Link>
                                        ) : service.slug === 'aid-and-attendance' ? (
                                            <div className="space-y-2">
                                                <Link
                                                    href="/forms?service=aid-and-attendance"
                                                    className="w-full text-white px-6 py-3 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110 block text-sm"
                                                    style={{ backgroundColor: '#B91C3C' }}
                                                >
                                                    Complete Aid & Attendance Form
                                                </Link>
                                                <Link
                                                    href="/contact"
                                                    className="w-full bg-white text-navy-600 px-6 py-3 rounded-xl font-semibold text-center hover:bg-slate-50 transition-all border border-slate-350 block text-sm"
                                                >
                                                    General Inquiry
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/forms?service=${service.slug}`}
                                                className="w-full text-white px-6 py-3 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110 block text-sm"
                                                style={{ backgroundColor: '#B91C3C' }}
                                            >
                                                Book Free Consultation
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* DC Quick Reference */}
                                {condition.dc_code && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <h4 className="font-bold text-slate-900 text-sm mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                            DC {condition.dc_code} — Quick Reference
                                        </h4>
                                        <div className="text-sm text-slate-700 leading-relaxed">
                                            {condition.dc_name}
                                            {condition.ratings?.length > 0 && (
                                                <div className="text-xs text-slate-500 mt-1">
                                                    Rating range: {condition.ratings[condition.ratings.length - 1]?.pct} – {condition.ratings[0]?.pct}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Other Conditions in this System */}
                                {otherConditions.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <h4 className="font-bold text-slate-900 text-sm mb-3" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                            Other {bodySystem.name} Conditions
                                        </h4>
                                        <div className="space-y-1">
                                            {otherConditions.map((c) => (
                                                <Link
                                                    key={c.id}
                                                    href={`/services/${service.slug}/${bodySystem.slug}/${c.slug}`}
                                                    className="flex items-center justify-between px-2 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                >
                                                    <span>{c.icon && <DynamicIcon name={c.icon} className="w-3.5 h-3.5 inline mr-1.5 text-slate-500" />}{c.page_title || c.hero_heading}</span>
                                                    <span className="text-xs" style={{ color: '#983c44' }}>→</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Services */}
                                {otherServices.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <h4 className="font-bold text-slate-900 text-sm mb-3" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>Other Services</h4>
                                        <div className="space-y-1">
                                            {otherServices.map((s) => (
                                                <Link
                                                    key={s.id}
                                                    href={`/services/${s.slug}`}
                                                    className="flex items-center justify-between px-2 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                >
                                                    <span>{s.title}</span>
                                                    <span className="text-xs" style={{ color: '#983c44' }}>→</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>

                    {/* DBQ / Nexus Letter cross-link note above footer */}
                    <div 
                        className="mt-12 p-6 bg-slate-100 border-l-4 rounded-r-xl text-slate-700 text-sm md:text-base leading-relaxed" 
                        style={{ borderColor: '#B91C3C' }}
                    >
                        {service.slug === 'disability-benefits-questionnaire-dbq' ? (
                            <>
                                Looking for a Nexus Letter instead? Nexus Letters (medical connection opinions) are handled within our separate{' '}
                                <Link 
                                    href="/services/independent-medical-opinion-nexus-letter" 
                                    className="font-semibold hover:underline" 
                                    style={{ color: '#B91C3C' }}
                                >
                                    Nexus Letter service
                                </Link>
                                . This page covers the {cleanConditionTitle}.
                            </>
                        ) : (
                            <>
                                Looking for a DBQ instead? Disability Benefits Questionnaires are handled within our separate{' '}
                                <Link 
                                    href="/services/disability-benefits-questionnaire-dbq" 
                                    className="font-semibold hover:underline" 
                                    style={{ color: '#B91C3C' }}
                                >
                                    DBQ service
                                </Link>
                                . This page covers the {cleanConditionTitle}.
                            </>
                        )}
                    </div>
                </div>
            </div>
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
        const [service, bodySystem, allServices] = await Promise.all([
            servicesApi.getBySlug(slug),
            bodySystemApi.getBySlug(system_slug),
            servicesApi.getAll()
        ]);

        if (!service || !bodySystem) {
            return { notFound: true };
        }

        const condition = await conditionApi.getBySlug(condition_slug, service.id);

        if (!condition) {
            return { notFound: true };
        }

        const routingDecision = getConditionRoutingDecision({
            requestedService: service,
            requestedBodySystem: bodySystem,
            condition,
        });

        if (routingDecision.type === 'notFound') {
            return { notFound: true };
        }

        if (routingDecision.type === 'redirect') {
            return {
                redirect: {
                    destination: routingDecision.destination,
                    permanent: true,
                },
            };
        }

        const siblingConditions = await conditionApi.getByBodySystem(bodySystem.id, service.id);

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
                allServices: allServices || [],
                siblingConditions: siblingConditions || [],
            },
            revalidate: 3600,
        };
    } catch (error) {
        console.error(`Error in getStaticProps for condition ${condition_slug}:`, error);
        return { notFound: true };
    }
}

export default NestedConditionDetail;
