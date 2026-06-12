import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { bodySystemApi, conditionApi, servicesApi } from '../../../../src/lib/api';
import DynamicIcon from '../../../../src/components/ui/dynamic-icon';
import SEO from '../../../../src/components/SEO';
import Layout from '../../../../src/components/Layout';
import PricingModal from '../../../../src/components/services/PricingModal';
import { buildOrganizationReference } from '../../../../src/lib/trust';

const SystemConditionsPage = ({ service, system, conditions, allServices }) => {
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

    const structuredData = {
        "@context": "https://schema.org",
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
    };

    return (
        <Layout>
            <PricingModal 
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                service={service}
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
                            {system.icon && (
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-2xl mb-4">
                                    <DynamicIcon name={system.icon} className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
                                {system.name} Claims
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {system.name} {service.title}s
                            </h1>
                            <p className="text-sm text-slate-400 mb-2">{system.description}</p>
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                                {system.overview}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-8">
                                <button
                                    onClick={() => setIsPricingModalOpen(true)}
                                    className="text-white px-8 py-4 rounded-xl font-semibold text-center transition-all hover:shadow-lg hover:brightness-110"
                                    style={{ backgroundColor: '#B91C3C' }}
                                >
                                    View Pricing — From {system.is_mental_health ? '$1,600' : '$400'}
                                </button>
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
                            {/* Overview */}
                            {system.overview && (
                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>About {system.name} Claims</h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        <p>{system.overview}</p>
                                    </div>
                                </section>
                            )}

                            {/* Specialist Guide Card */}
                            {specialistGuide.length > 0 && (
                                <section className="rounded-2xl p-8 border border-slate-200 relative overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, rgba(41,67,95,0.06), rgba(152,60,68,0.08))' }}>
                                    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-30" style={{ background: 'rgba(152,60,68,0.15)' }} />
                                    <div className="relative z-10">
                                        <span className="inline-block text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-3" style={{ backgroundColor: '#983c44' }}>
                                            Specialist Guide
                                        </span>
                                        <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                            Who Should Write Your {system.name} {service.title}?
                                        </h2>
                                        <p className="text-sm text-slate-600 mb-5">Choosing the right provider is as important as the letter itself:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {specialistGuide.map((spec, i) => (
                                                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-red-300 hover:-translate-y-0.5 transition-all">
                                                    <div className="font-bold text-slate-900 text-sm mb-1" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>{spec.name}</div>
                                                    {spec.role && <div className="text-xs text-slate-500 mb-2">{spec.role}</div>}
                                                    <div className="text-xs text-slate-600 leading-relaxed mb-3">{spec.best_for}</div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold" style={{ color: '#983c44' }}>{spec.price}</span>
                                                        {spec.note && <span className="text-[11px] text-slate-500">{spec.note}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-sm text-slate-500">
                                            <Link href="/blog/who-should-write-your-va-nexus-letter-specialist-guide" className="font-semibold hover:underline" style={{ color: '#983c44' }}>
                                                Read the full Specialist Guide →
                                            </Link>
                                            {' '}— Learn which provider carries the most probative weight.
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Conditions Directory Grid */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                    {service.title}s by Condition — {system.name}
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
                                                        {condition.page_title} {service.title}
                                                    </h3>
                                                </div>
                                                <p className="text-slate-500 line-clamp-2 text-xs leading-relaxed mt-1 flex-grow">
                                                    {condition.short_description || condition.meta_description}
                                                </p>
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                                    <span className="text-xs font-semibold" style={{ color: '#983c44' }}>
                                                        From {system.is_mental_health ? '$1,600' : '$400'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                                        View Details <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                                {condition.paired_conditions && condition.paired_conditions.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                                        <span className="font-semibold" style={{ color: '#983c44' }}>Usually paired with:</span>{' '}
                                                        {condition.paired_conditions.join(', ')}
                                                    </div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>

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
                                            Veterans Usually Pair {system.name} With These Systems
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
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 space-y-5">
                                {/* Payment Box */}
                                <div className="rounded-2xl p-7 shadow-xl text-white" style={{ background: 'linear-gradient(160deg, #29435f, #3a5a7a)' }}>
                                    <div className="mb-5">
                                        <div className="text-xs text-white/50 font-medium mb-0.5">{system.name} {service.title}</div>
                                        <div className="text-xs text-white/50">Starting at</div>
                                        <div className="text-4xl font-bold my-1" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                                            {system.is_mental_health ? '$1,600' : '$400'}
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
        
        const [service, system, allServices] = await Promise.all([
            servicesApi.getBySlug(slug),
            bodySystemApi.getBySlug(system_slug),
            servicesApi.getAll()
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
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error(`Error fetching data for ${params.slug}/${params.system_slug}:`, error);
        return { notFound: true };
    }
}

export default SystemConditionsPage;
