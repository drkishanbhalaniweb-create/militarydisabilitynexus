import Link from 'next/link';
import { ArrowRight, Activity } from 'lucide-react';
import { bodySystemApi, conditionApi, servicesApi } from '../../../../src/lib/api';
import DynamicIcon from '../../../../src/components/ui/dynamic-icon';
import SEO from '../../../../src/components/SEO';
import Layout from '../../../../src/components/Layout';
import { buildOrganizationReference } from '../../../../src/lib/trust';

const SystemConditionsPage = ({ service, system, conditions }) => {
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
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {system.name} {service.title}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                                {system.description}
                            </p>
                        </div>
                    </section>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Overview */}
                            {system.overview && (
                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        <p>{system.overview}</p>
                                    </div>
                                </section>
                            )}

                            {/* Conditions Directory Grid */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-navy-600" />
                                    Supported Conditions
                                </h2>
                                
                                {conditions.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                                        <p className="text-slate-500">We are currently updating our list of specific conditions in this category. Contact us for a free consultation about your specific claim.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {conditions.map((condition) => (
                                            <Link 
                                                href={`/services/${service.slug}/${system.slug}/${condition.slug}`} 
                                                key={condition.id}
                                                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-navy-300 transition-all group flex flex-col h-full"
                                            >
                                                <div className="flex items-start gap-4 mb-4">
                                                    {condition.icon && (
                                                        <span className="text-2xl flex-shrink-0 bg-slate-50 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-100">
                                                            <DynamicIcon name={condition.icon} className="w-5 h-5 text-indigo-600" />
                                                        </span>
                                                    )}
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-navy-700 transition-colors line-clamp-2">
                                                            {condition.page_title}
                                                        </h3>
                                                        {condition.dc_code && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">DC {condition.dc_code}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow">
                                                    {condition.short_description || condition.meta_description}
                                                </p>
                                                <div className="flex items-center text-sm text-navy-600 font-semibold group-hover:translate-x-1 transition-transform mt-auto">
                                                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Specialist Guide Widget */}
                            {system.specialist_guide && system.specialist_guide.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recommended Providers</h3>
                                    <div className="space-y-4">
                                        {system.specialist_guide.map((spec, i) => (
                                            <div key={i} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                                <h4 className="font-bold text-slate-900">{spec.name}</h4>
                                                {spec.role && <p className="text-xs text-navy-600 font-medium mt-0.5">{spec.role}</p>}
                                                {spec.best_for && <p className="text-sm text-slate-600 mt-2">{spec.best_for}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Paired Systems Widget */}
                            {system.paired_systems && system.paired_systems.length > 0 && (
                                <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">Often Filed With</h3>
                                    <ul className="space-y-2 mb-4">
                                        {system.paired_systems.map((ps, i) => (
                                            <li key={i} className="flex items-center text-slate-700 font-medium">
                                                <span className="w-1.5 h-1.5 bg-navy-400 rounded-full mr-2" />
                                                {ps}
                                            </li>
                                        ))}
                                    </ul>
                                    {system.pair_note && (
                                        <p className="text-sm text-slate-600 italic">
                                            {system.pair_note}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Contact CTA */}
                            <div className="bg-navy-900 rounded-2xl shadow-lg p-6 text-white text-center">
                                <h3 className="text-xl font-bold mb-2">Need a {service.title}?</h3>
                                <p className="text-navy-100 text-sm mb-6">
                                    Our clinicians specialize in {system.name.toLowerCase()} conditions.
                                </p>
                                <Link
                                    href={`/forms?service=${service.slug}`}
                                    className="block w-full bg-white text-navy-900 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Get Started
                                </Link>
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
        
        const [service, system] = await Promise.all([
            servicesApi.getBySlug(slug),
            bodySystemApi.getBySlug(system_slug)
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
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error(`Error fetching data for ${params.slug}/${params.system_slug}:`, error);
        return { notFound: true };
    }
}

export default SystemConditionsPage;
