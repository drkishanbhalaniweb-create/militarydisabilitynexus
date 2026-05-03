import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { conditionApi, servicesApi, blogApi, caseStudyApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../src/components/ui/accordion';
import { buildOrganizationReference } from '../../src/lib/trust';

const ConditionDetail = ({ condition, relatedServices = [], relatedBlogs = [], relatedCaseStudies = [] }) => {
    const router = useRouter();

    if (router.isFallback) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
            </Layout>
        );
    }

    if (!condition) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Condition not found</h2>
                        <p className="text-slate-600 mb-4">The requested condition could not be loaded.</p>
                        <Link href="/" className="text-indigo-600 hover:text-indigo-700">
                            Back to Home
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
                keywords={`${condition.hero_heading}, VA disability, secondary condition, nexus letter, DBQ`}
                structuredData={structuredData}
                faqSchema={condition.faqs}
                canonical={`/conditions/${condition.slug}`}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: condition.hero_heading, path: `/conditions/${condition.slug}` }
                ]}
            />
            <div className="bg-slate-50 min-h-screen">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{condition.hero_heading}</h1>
                        {condition.meta_description && (
                            <p className="text-xl text-navy-100">{condition.meta_description}</p>
                        )}
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Rich Text Overview */}
                            <section className="bg-white rounded-2xl p-8" aria-labelledby="overview-heading">
                                <h2 id="overview-heading" className="text-2xl font-bold text-slate-900 mb-6">VA Disability Requirements</h2>
                                <div 
                                    className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&>p]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: condition.content_html }}
                                />
                            </section>

                            {/* FAQ Section */}
                            {condition.faqs && condition.faqs.length > 0 && (
                                <section className="bg-white rounded-2xl p-8" aria-labelledby="faq-heading">
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
                                <section className="bg-white rounded-2xl p-8" aria-labelledby="insights-heading">
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
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 space-y-6">
                                {/* Related Services */}
                                {relatedServices.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">How We Can Help</h3>
                                        <div className="space-y-4">
                                            {relatedServices.map(service => (
                                                <Link 
                                                    href={`/services/${service.slug}`} 
                                                    key={service.id}
                                                    className="block p-4 rounded-xl border border-slate-200 hover:border-navy-400 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="font-semibold text-slate-900 mb-1">{service.title}</div>
                                                    <div className="text-sm text-slate-600 mb-3 line-clamp-2">{service.short_description}</div>
                                                    <div className="flex items-center text-sm font-medium text-navy-600">
                                                        Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Call to Action Box */}
                                <div className="bg-gradient-to-br from-navy-700 to-navy-900 rounded-2xl p-6 shadow-xl text-white">
                                    <h3 className="text-xl font-bold mb-3">Ready to file your claim?</h3>
                                    <p className="text-navy-100 text-sm mb-6">
                                        Don't let missing medical evidence deny your claim. Our clinicians provide the expert DBQs and Nexus Letters you need.
                                    </p>
                                    <Link
                                        href="/contact"
                                        className="w-full bg-white text-navy-800 px-4 py-3 rounded-xl font-semibold text-center transition-all hover:bg-slate-50 block"
                                    >
                                        Get a Free Consultation
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export async function getStaticPaths() {
    try {
        const conditions = await conditionApi.getAll(false);
        const paths = conditions.map((c) => ({
            params: { slug: c.slug },
        }));

        return {
            paths,
            fallback: 'blocking',
        };
    } catch (error) {
        console.error('Error fetching condition paths:', error);
        return {
            paths: [],
            fallback: 'blocking',
        };
    }
}

export async function getStaticProps({ params }) {
    const { slug } = params;

    try {
        const condition = await conditionApi.getBySlug(slug);

        if (!condition) {
            return { notFound: true };
        }

        // Fetch related services
        let relatedServices = [];
        try {
            if (condition.related_service_ids && condition.related_service_ids.length > 0) {
                const allServices = await servicesApi.getAll();
                relatedServices = allServices.filter(s => condition.related_service_ids.includes(s.id));
            }
        } catch (e) {
            console.error('Error fetching related services:', e);
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
                relatedServices,
                relatedBlogs,
                relatedCaseStudies,
            },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error('Error in getStaticProps for condition:', error);
        return { notFound: true };
    }
}

export default ConditionDetail;
