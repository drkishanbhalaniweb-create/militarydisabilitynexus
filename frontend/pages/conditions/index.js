import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { conditionApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import { buildOrganizationReference } from '../../src/lib/trust';

const ConditionsHub = ({ conditions = [] }) => {
    // Structured data for the directory page
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "VA Disability Conditions We Support",
        "description": "Explore the medical conditions we support for VA disability claims, including independent medical opinions (IMO) and disability benefits questionnaires (DBQ).",
        "publisher": {
            ...buildOrganizationReference()
        },
        "hasPart": conditions.map(c => ({
            "@type": "MedicalWebPage",
            "name": c.hero_heading,
            "url": `https://www.militarydisabilitynexus.com/conditions/${c.slug}`
        }))
    };

    return (
        <Layout>
            <SEO
                title="VA Disability Conditions We Support | Military Disability Nexus"
                description="Explore the comprehensive list of medical conditions we support for VA disability claims. Get expert DBQs and Nexus Letters for PTSD, Sleep Apnea, and more."
                keywords="VA disability conditions, PTSD nexus letter, sleep apnea DBQ, VA claims, secondary conditions"
                structuredData={structuredData}
                canonical="/conditions"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Conditions', path: '/conditions' }
                ]}
            />
            
            <div className="bg-slate-50 min-h-screen pb-20">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Medical Conditions We Support</h1>
                        <p className="text-xl text-navy-100 max-w-3xl mx-auto">
                            Our network of clinicians provides expert medical evidence, including Nexus Letters and DBQs, for a wide range of VA disability claims.
                        </p>
                    </div>
                </section>

                {/* Directory Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {conditions.length === 0 ? (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Check Back Soon</h2>
                            <p className="text-slate-600">We are currently updating our list of supported conditions.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {conditions.map((condition) => (
                                <Link 
                                    href={`/conditions/${condition.slug}`} 
                                    key={condition.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg hover:border-navy-300 transition-all group flex flex-col h-full"
                                >
                                    <div className="flex-grow">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-navy-700 transition-colors">
                                            {condition.hero_heading}
                                        </h2>
                                        <p className="text-slate-600 line-clamp-3 mb-6">
                                            {condition.meta_description}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-navy-600 font-semibold group-hover:translate-x-2 transition-transform mt-auto">
                                        Learn about VA Evidence <ArrowRight className="w-5 h-5 ml-2" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-100">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Don't see your condition?</h2>
                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                            We support hundreds of medical conditions. Schedule a free consultation to discuss your specific claim and see how our clinical experts can help.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex bg-navy-700 text-white px-8 py-4 rounded-full font-bold hover:bg-navy-800 transition-all shadow-md hover:shadow-lg"
                        >
                            Get a Free Consultation
                        </Link>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    try {
        const conditions = await conditionApi.getAll(); // By default, only fetches published ones

        return {
            props: {
                conditions,
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error fetching conditions directory:', error);
        return {
            props: {
                conditions: [],
            },
            revalidate: 60,
        };
    }
}

export default ConditionsHub;
