import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { bodySystemApi, conditionApi, servicesApi } from '../../../../src/lib/api';
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

const SystemConditionsPage = ({ service, system, conditions, allServices, allSystems }) => {
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    if (!system || !service) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
                        <Link href="/services" className="text-indigo-600 hover:text-indigo-800">
                            Return to Services
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    const statCards = system.stat_cards || [];
    const buildTrustLinks = system.build_trust_links || [];
    const specialistGuide = system.specialist_guide || [];
    const pairedSystems = system.paired_systems || [];
    const otherServices = (allServices || []).filter(s => s.slug !== service.slug);

    // Strip HTML tags for fallback display in plain-text Hero Card
    const heroText = system.hero_description || 
        (system.overview ? system.overview.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '');

    const hasHtml = system.overview ? /<[a-z][\s\S]*>/i.test(system.overview) : false;



    const navLinks = [
        { label: 'Overview', href: '#overview', show: !!system.overview },
        { label: 'Conditions', href: '#conditions', show: conditions.length > 0 },
        { label: 'Service-Connection Pathways', href: '#pathways', show: system.pathways && system.pathways.length > 0 },
        { label: 'Why It\'s Complex', href: '#challenges', show: system.challenges && system.challenges.length > 0 },
        { label: 'Medical Evidence Services', href: '#services', show: true },
        { label: 'Provider Specialty', href: '#providers', show: service.slug === 'independent-medical-opinion-nexus-letter' && specialistGuide.length > 0 },
        { label: 'FAQs', href: '#faqs', show: system.faqs && system.faqs.length > 0 },
        { label: 'Related Systems', href: '#related-systems', show: allSystems && allSystems.filter(s => s.id !== system.id).length > 0 },
    ].filter(link => link.show);

    const mainServiceSlugs = [
        'independent-medical-opinion-nexus-letter',
        'disability-benefits-questionnaire-dbq',
        'claim-readiness-review'
    ];
    const comparisonServices = (allServices || [])
        .filter(s => mainServiceSlugs.includes(s.slug))
        .sort((a, b) => mainServiceSlugs.indexOf(a.slug) - mainServiceSlugs.indexOf(b.slug));

    const serviceStaticMeta = {
        'independent-medical-opinion-nexus-letter': {
            purpose: "A clinician's written opinion on whether a condition is at least as likely as not connected to service, with the supporting medical rationale.",
            whenItHelps: "When you need to establish or strengthen the causal link — particularly for secondary claims or a claim that was previously denied."
        },
        'disability-benefits-questionnaire-dbq': {
            purpose: "Standardized disability questionnaires completed by licensed clinicians to evaluate the severity of your conditions according to VA rating criteria.",
            whenItHelps: "When you are filing for an initial rating, an increase, or need to document current functional impairment for a C&P exam."
        },
        'claim-readiness-review': {
            purpose: "A pre-filing review of your medical records to identify what is already documented and what evidence may be missing.",
            whenItHelps: "Before filing or refiling, when you want a clear, honest picture of where a claim stands medically."
        }
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "name": `${service.title} for ${system.name} Conditions`,
                "description": system.description,
                "publisher": {
                    ...buildOrganizationReference()
                },
                "hasPart": conditions.map(c => ({
                    "@type": "MedicalWebPage",
                    "name": c.hero_heading,
                    "url": `https://www.militarydisabilitynexus.com/services/${service.slug}/${system.slug}/${c.slug}`
                }))
            },
            ...(system.faqs && system.faqs.length > 0 ? [
                {
                    "@type": "FAQPage",
                    "mainEntity": system.faqs.map(faq => ({
                        "@type": "Question",
                        "name": faq.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": faq.answer
                        }
                    }))
                }
            ] : [])
        ]
    };

    return (
        <Layout>
            <PricingModal 
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                service={service}
                isMentalHealth={system.is_mental_health}
            />
            <SEO
                title={`${system.name} ${service.title} | Military Disability Nexus`}
                description={system.description}
                structuredData={structuredData}
                canonical={`/services/${service.slug}/${system.slug}`}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Services', path: '/services' },
                    { name: service.title, path: `/services/${service.slug}` },
                    { name: system.name, path: `/services/${service.slug}/${system.slug}` }
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
                        <span className="text-slate-950 font-semibold">{system.name}</span>
                    </nav>

                    {/* Hero Card */}
                    <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="max-w-3xl relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                {system.icon && (
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-2xl flex-shrink-0">
                                        <DynamicIcon name={system.icon} className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80">
                                    {system.name} Claims
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {system.name}
                            </h1>
                            <p className="text-sm text-slate-400 mb-2">{system.description}</p>
                            {heroText && (
                                <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                                    {heroText}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-8">
                                {service.slug === 'independent-medical-opinion-nexus-letter' ? (
                                    <button
                                        onClick={() => setIsPricingModalOpen(true)}
                                        className="text-white px-8 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110"
                                        style={{ backgroundColor: '#B91C3C' }}
                                    >
                                        View Pricing — From {system.is_mental_health ? '$1,600+' : '$400+'}
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

                {/* Jump Navigation */}
                {navLinks.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:text-red-700 hover:border-red-500 transition-all shadow-sm flex-shrink-0"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Overview */}
                            {system.overview && (
                                <section id="overview" className="scroll-mt-20 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>About {system.name} Claims</h2>
                                    {hasHtml ? (
                                        <div 
                                            className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-6"
                                            dangerouslySetInnerHTML={{ __html: system.overview }}
                                        />
                                    ) : (
                                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-6">
                                            <p>{system.overview}</p>
                                        </div>
                                    )}



                                    {/* Note Callout */}
                                    <div className="mt-6 text-xs text-slate-700 leading-relaxed bg-slate-50 border-l-4 rounded-r-xl p-4" style={{ borderColor: '#B91C3C' }}>
                                        While no medical opinion can guarantee a specific VA outcome, clear, credible, and well-documented evidence gives a claim its strongest foundation. Our role is the medicine and the documentation — the decision on the claim rests with the VA.
                                    </div>
                                </section>
                            )}

                            {/* Conditions Directory Grid */}
                            <section id="conditions" className="scroll-mt-20">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                    {system.name} Conditions
                                </h2>
                                <p className="text-sm text-slate-500 mb-6">Click any condition to view its dedicated page with DC codes, rating criteria, secondary connections, and specialist guidance.</p>
                                
                                {conditions.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                                        <p className="text-slate-500">We are currently updating our list of specific conditions in this category. Contact us for a free consultation about your specific claim.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {conditions.map((condition) => (
                                            <Link 
                                                href={`/services/${service.slug}/${system.slug}/${condition.slug}`} 
                                                key={condition.id}
                                                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-red-300 hover:-translate-y-0.5 transition-all group flex flex-col h-full"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    {condition.icon && (
                                                        <span className="text-xl flex-shrink-0">
                                                            <DynamicIcon name={condition.icon} className="w-5 h-5 text-slate-700" />
                                                        </span>
                                                    )}
                                                    <h3 className="font-semibold text-slate-900 text-sm">
                                                        {condition.page_title}
                                                    </h3>
                                                </div>
                                                <p className="text-slate-500 line-clamp-2 text-xs leading-relaxed mt-1 flex-grow">
                                                    {condition.short_description || condition.meta_description}
                                                </p>
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                                    <span className="text-xs font-semibold" style={{ color: '#983c44' }}>
                                                        From {system.is_mental_health ? '$1,600+' : '$400+'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                                        View Details <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                                {condition.paired_conditions && condition.paired_conditions.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                                        <span className="font-semibold" style={{ color: '#983c44' }}>Usually paired with:</span>{' '}
                                                        {condition.paired_conditions
                                                            .map(pc => {
                                                                if (!pc) return '';
                                                                if (typeof pc === 'object') return pc.name || '';
                                                                try {
                                                                    const parsed = JSON.parse(pc);
                                                                    if (typeof parsed === 'object' && parsed !== null) {
                                                                        return parsed.name || '';
                                                                    }
                                                                } catch {
                                                                    // Fallback for plain string
                                                                }
                                                                return pc;
                                                            })
                                                            .filter(name => name && String(name).trim() !== '')
                                                            .join(', ')}
                                                    </div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Signature Pathways */}
                            {system.pathways && system.pathways.length > 0 && (
                                <section id="pathways" className="scroll-mt-20 bg-gradient-to-br from-slate-50 to-red-50/20 rounded-2xl p-8 border border-slate-200 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-red-500/5 blur-xl pointer-events-none" />
                                    <div className="relative z-10">
                                        <span className="inline-block text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-2" style={{ backgroundColor: 'rgba(152,60,68,0.1)', color: '#983c44' }}>
                                            How Conditions Connect
                                        </span>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                            Common {system.name} Service-Connection Pathways
                                        </h2>
                                        <p className="text-sm text-slate-500 mb-6">
                                            {system.pathways_intro || `Many ${system.name.toLowerCase()} claims succeed not as standalone conditions, but as part of a chain — one diagnosis medically explaining another. These are the relationships we most often document in plain medical terms.`}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {system.pathways.map((path, idx) => {
                                                const cardContent = (
                                                    <>
                                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                                            <span className="text-xs font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                                                                {path.from}
                                                            </span>
                                                            <span className="text-red-700 font-bold">→</span>
                                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200/60" style={{ backgroundColor: 'rgba(152,60,68,0.05)', color: '#983c44' }}>
                                                                {path.to}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 text-xs leading-relaxed">
                                                            {path.mechanism}
                                                        </p>
                                                    </>
                                                );
                                                const cardClass = "block bg-white rounded-xl border border-slate-200 p-5 hover:border-red-300 hover:-translate-y-0.5 transition-all shadow-sm text-left";

                                                if (path.url) {
                                                    return (
                                                        <Link key={idx} href={path.url} className={cardClass}>
                                                            {cardContent}
                                                        </Link>
                                                    );
                                                }

                                                return (
                                                    <div key={idx} className={cardClass}>
                                                        {cardContent}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Complexity / Challenges */}
                            {system.challenges && system.challenges.length > 0 && (
                                <section id="challenges" className="scroll-mt-20">
                                    <span className="inline-block text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-2" style={{ backgroundColor: 'rgba(152,60,68,0.1)', color: '#983c44' }}>
                                        What Makes Them Hard
                                    </span>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                        {system.challenges_title || `Why ${system.name} Claims Can Be Challenging`}
                                    </h2>
                                    <p className="text-sm text-slate-500 mb-6">
                                        Understanding these challenges in advance is the first step toward building a clearer medical record — and knowing where additional evidence may help.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {system.challenges.map((chal, idx) => (
                                            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all">
                                                {chal.icon && (
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 text-slate-700 mb-3 border border-slate-100">
                                                        <DynamicIcon name={chal.icon} className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <h4 className="font-bold text-slate-900 text-sm mb-2">{chal.title}</h4>
                                                <p className="text-slate-600 text-xs leading-relaxed">{chal.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Medical Evidence Services Comparison Matrix */}
                            {comparisonServices.length > 0 && (
                                <section id="services" className="scroll-mt-20">
                                    <span className="inline-block text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-2" style={{ backgroundColor: 'rgba(152,60,68,0.1)', color: '#983c44' }}>
                                        How We Help
                                    </span>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                        {system.services_title || `Medical Evidence Services for ${system.name} Claims`}
                                    </h2>
                                    <p className="text-sm text-slate-500 mb-6">
                                        {system.services_intro || `Clinician-led services support ${system.name.toLowerCase()} claims at different stages. Each focuses on the medical evidence — clear diagnoses, sound causation reasoning, and well-documented severity.`}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {comparisonServices.map((svc) => {
                                            const meta = serviceStaticMeta[svc.slug] || {
                                                purpose: svc.short_description,
                                                whenItHelps: "When you need professional medical documentation to support your claim."
                                            };
                                            const customDesc = (system.service_descriptions || []).find(d => d.service_slug === svc.slug)?.text;
                                            const finalDesc = customDesc || svc.short_description;
                                            
                                            return (
                                                <div key={svc.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-red-300 transition-all flex flex-col h-full">
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 text-slate-700 mb-4 border border-slate-100">
                                                        <DynamicIcon name={svc.icon || 'file-text'} className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-sm mb-3" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                                        {svc.title}
                                                    </h3>
                                                    
                                                    <div className="space-y-3 flex-grow text-xs">
                                                        <div>
                                                            <span className="block font-bold text-[9px] uppercase tracking-wider text-red-700 mb-0.5">Purpose</span>
                                                            <p className="text-slate-600 leading-relaxed">{meta.purpose}</p>
                                                        </div>
                                                        <div>
                                                            <span className="block font-bold text-[9px] uppercase tracking-wider text-red-700 mb-0.5">When It May Help</span>
                                                            <p className="text-slate-600 leading-relaxed">{meta.whenItHelps}</p>
                                                        </div>
                                                        {finalDesc && (
                                                            <div>
                                                                <span className="block font-bold text-[9px] uppercase tracking-wider text-red-700 mb-0.5">For {system.name} Claims</span>
                                                                <p className="text-slate-850 font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">{finalDesc}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {service.slug === 'independent-medical-opinion-nexus-letter' && (
                                        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                                            Looking for a DBQ instead? Disability Benefits Questionnaires are handled within our separate{' '}
                                            <Link href={`/services/disability-benefits-questionnaire-dbq/${system.slug}`} className="font-semibold text-red-700 hover:underline">
                                                DBQ service for {system.name.toLowerCase()}
                                            </Link>
                                            . This page covers the Nexus Letter and Independent Medical Opinion service line.
                                        </p>
                                    )}
                                </section>
                            )}

                            {/* Specialist Guide (Re-styled matching prototype Section 7) */}
                            {service.slug === 'independent-medical-opinion-nexus-letter' && specialistGuide.length > 0 && (
                                <section id="providers" className="scroll-mt-20">
                                    <span className="inline-block text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-2" style={{ backgroundColor: 'rgba(152,60,68,0.1)', color: '#983c44' }}>
                                        Transparent Provider Selection
                                    </span>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                        Why Provider Specialty Matters
                                    </h2>
                                    <p className="text-sm text-slate-500 mb-6">
                                        The clinician who writes an opinion shapes how persuasive it is. There is no single "best" provider for every claim — the right fit depends on the condition and the medical questions involved.
                                    </p>
                                    
                                    <div className="rounded-2xl p-8 border border-slate-200 relative overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, rgba(41,67,95,0.06), rgba(152,60,68,0.08))' }}>
                                        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-30" style={{ background: 'rgba(152,60,68,0.15)' }} />
                                        <div className="relative z-10">
                                            <span className="inline-block text-white text-[9px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-4" style={{ backgroundColor: '#983c44' }}>
                                                Matching Expertise to the Claim
                                            </span>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {specialistGuide.map((spec, i) => (
                                                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-red-300 hover:-translate-y-0.5 transition-all flex flex-col h-full shadow-sm">
                                                        <h4 className="font-bold text-slate-900 text-sm mb-1" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>{spec.name}</h4>
                                                        {spec.role && <div className="text-[11px] text-slate-500 mb-3">{spec.role}</div>}
                                                        <p className="text-slate-650 text-xs leading-relaxed flex-grow mb-4">{spec.best_for}</p>
                                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                            <span className="text-xs font-semibold" style={{ color: '#983c44' }}>{spec.price}</span>
                                                            {spec.note && <span className="text-[10px] text-slate-500">{spec.note}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="mt-5 text-xs text-slate-700 leading-relaxed flex flex-wrap gap-2 justify-between items-center">
                                                <p><strong>Our approach:</strong> we match each veteran to a clinician whose expertise fits the medical questions in their case.</p>
                                                <Link href="/blog/who-should-write-your-va-nexus-letter-specialist-guide" className="font-semibold hover:underline inline-flex items-center gap-1" style={{ color: '#983c44' }}>
                                                    Read the full Specialist Guide <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Commonly Paired Systems */}
                            {pairedSystems.length > 0 && (
                                <section className="rounded-2xl p-8 border border-slate-200 relative overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, rgba(41,67,95,0.06), rgba(152,60,68,0.04))' }}>
                                    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-30" style={{ background: 'rgba(152,60,68,0.15)' }} />
                                    <div className="relative z-10">
                                        <span className="inline-block text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-3" style={{ backgroundColor: '#983c44' }}>
                                            Commonly Paired
                                        </span>
                                        <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                            {system.paired_title || `Veterans Usually Pair ${system.name} With These Systems`}
                                        </h2>
                                        {system.pair_note && (
                                            <p className="text-sm text-slate-600 leading-relaxed mb-5">{system.pair_note}</p>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {pairedSystems.map((psName, i) => (
                                                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-red-300 hover:-translate-y-0.5 transition-all cursor-pointer">
                                                    <div className="font-semibold text-slate-900 text-sm">{psName}</div>
                                                    <div className="text-xs font-semibold mt-2" style={{ color: '#983c44' }}>Explore →</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* FAQ Section */}
                            {system.faqs && system.faqs.length > 0 && (
                                <section id="faqs" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6 scroll-mt-20" aria-labelledby="faq-heading">
                                    <h2 id="faq-heading" className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                        Frequently Asked Questions
                                    </h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {system.faqs.map((faq, idx) => (
                                            <AccordionItem key={idx} value={`item-${idx}`}>
                                                <AccordionTrigger className="text-left font-semibold text-slate-900">{faq.question}</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
                                                        {faq.answer.split('\n').map((line, i) => {
                                                            const processLinks = (text) => {
                                                                const parts = text.split(/(\[[^\]]+\]\s*\([^)]+\))/g);
                                                                return parts.map((part, index) => {
                                                                    const match = part.match(/\[([^\]]+)\]\s*\(([^)]+)\)/);
                                                                    if (match) {
                                                                        const url = match[2].trim();
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

                                                            if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                                                return (
                                                                    <div key={i} className="flex gap-2 mb-1">
                                                                        <span className="flex-shrink-0">•</span>
                                                                        <span>{processLinks(line.trim().replace(/^[•\-*]\s*/, ''))}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            return line.trim() ? <p key={i} className="mb-3">{processLinks(line)}</p> : <br key={i} />;
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </section>
                            )}

                            {/* Related Body Systems */}
                            {allSystems && allSystems.filter(s => s.id !== system.id).length > 0 && (
                                <section id="related-systems" className="scroll-mt-20">
                                    <span className="inline-block text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-2" style={{ backgroundColor: 'rgba(152,60,68,0.1)', color: '#983c44' }}>
                                        Other Body Systems
                                    </span>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                        Explore Other Body Systems We Support
                                    </h2>
                                    <p className="text-sm text-slate-500 mb-6">
                                        We provide medical evidence services for all major body systems evaluated by the VA.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {allSystems
                                            .filter(s => s.id !== system.id)
                                            .map((sys) => (
                                                <Link
                                                    key={sys.id}
                                                    href={`/services/${service.slug}/${sys.slug}`}
                                                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-red-300 hover:-translate-y-0.5 transition-all shadow-sm flex flex-col h-full group"
                                                >
                                                    {sys.icon && (
                                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 text-slate-700 mb-3 border border-slate-100">
                                                            <DynamicIcon name={sys.icon} className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-red-700 transition-colors" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                                        {sys.name}
                                                    </h4>
                                                    <p className="text-slate-600 text-xs leading-relaxed flex-grow mb-4 line-clamp-3">
                                                        {sys.description}
                                                    </p>
                                                    <span className="text-xs font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1" style={{ color: '#983c44' }}>
                                                        Explore {service.title}s <ArrowRight className="w-3.5 h-3.5" />
                                                    </span>
                                                </Link>
                                            ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 space-y-5">
                                {/* Payment Box */}
                                {service.slug === 'independent-medical-opinion-nexus-letter' ? (
                                    <div className="bg-slate-900 rounded-2xl p-7 shadow-xl text-white">
                                        <div className="mb-5">
                                            <div className="text-xs text-white/50 font-medium mb-0.5">{system.name} {service.title}</div>
                                            <div className="text-xs text-white/50">Starting at</div>
                                            <div className="text-4xl font-bold my-1" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                                {system.is_mental_health ? '$1,600+' : '$400+'}
                                            </div>
                                            <p className="text-xs text-white/45 mt-1">
                                                {system.is_mental_health ? 'Psychiatrist / Psychologist' : 'Nurse Practitioner · Single condition'}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => setIsPricingModalOpen(true)}
                                            className="w-full text-white border border-white/20 px-6 py-3 rounded-xl font-semibold text-center transition-all mb-3 text-sm hover:bg-white/10"
                                            style={{ backgroundColor: '#B91C3C' }}
                                        >
                                            See All Pricing Tiers →
                                        </button>

                                        {service.slug === 'claim-readiness-review' ? (
                                            <Link
                                                href="/claim-readiness-review"
                                                className="w-full bg-white/10 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all hover:bg-white/15 border border-white/18 block text-sm"
                                            >
                                                Book Now - ${service.base_price_usd}
                                            </Link>
                                        ) : service.slug === 'aid-and-attendance' ? (
                                            <div className="space-y-2">
                                                <Link
                                                    href="/forms?service=aid-and-attendance"
                                                    className="w-full bg-white/10 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all hover:bg-white/15 border border-white/18 block text-sm"
                                                >
                                                    Complete Aid & Attendance Form
                                                </Link>
                                                <Link
                                                    href="/contact"
                                                    className="w-full bg-transparent text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-white/10 transition-all border border-white/18 block text-sm"
                                                >
                                                    General Inquiry
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/forms?service=${service.slug}`}
                                                className="w-full bg-white/10 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all hover:bg-white/15 border border-white/18 block text-sm"
                                            >
                                                Book Free Consultation
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-7 shadow-xl border border-slate-200 text-slate-900">
                                        <div className="mb-5">
                                            <div className="text-xs text-slate-500 font-medium mb-0.5">{system.name} {service.title}</div>
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
                                                    className="w-full bg-white text-navy-600 px-6 py-3 rounded-xl font-semibold text-center hover:bg-slate-50 transition-all border border-slate-300 block text-sm"
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

                                {/* Build Trust Before Buying */}
                                {buildTrustLinks.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <h4 className="font-bold text-slate-900 text-sm mb-3" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>Build Trust Before Buying</h4>
                                        <div className="space-y-1">
                                            {buildTrustLinks.map((link, i) => (
                                                <Link
                                                    key={i}
                                                    href={link.url || '#'}
                                                    className="flex items-center justify-between px-2 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                >
                                                    <span>{link.label}</span>
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
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export async function getStaticPaths() {
    return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
    try {
        const { slug, system_slug } = params;
        
        const [service, system, allServices, allSystems] = await Promise.all([
            servicesApi.getBySlug(slug),
            bodySystemApi.getBySlug(system_slug),
            servicesApi.getAll(),
            bodySystemApi.getAll()
        ]);
        
        if (!service || !system) {
            return { notFound: true };
        }

        const conditions = await conditionApi.getByBodySystem(system.id, service.id);

        return {
            props: {
                service,
                system,
                conditions: conditions || [],
                allServices: allServices || [],
                allSystems: allSystems || [],
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error(`Error fetching data for ${params.slug}/${params.system_slug}:`, error);
        return { notFound: true };
    }
}

export default SystemConditionsPage;
