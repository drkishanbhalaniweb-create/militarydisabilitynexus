import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, Eye, Target, Lightbulb, TrendingUp, Star } from 'lucide-react';
import { caseStudyApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
// import OptimizedImage from '../../src/components/OptimizedImage'; // Simple img replacement

export async function getStaticPaths() {
    try {
        const caseStudies = await caseStudyApi.getAll();
        const paths = caseStudies.map((cs) => ({
            params: { slug: cs.slug },
        }));
        return { paths, fallback: 'blocking' };
    } catch (error) {
        console.error('Error getting static paths for case studies:', error);
        return { paths: [], fallback: 'blocking' };
    }
}

export async function getStaticProps({ params }) {
    try {
        const caseStudy = await caseStudyApi.getBySlug(params.slug);

        if (!caseStudy) {
            return { notFound: true };
        }

        return {
            props: { caseStudy },
            revalidate: 10,
        };
    } catch (error) {
        console.error(`Error fetching case study for slug ${params.slug}:`, error);
        return { notFound: true };
    }
}

const CaseStudyDetail = ({ caseStudy }) => {
    const router = useRouter();

    useEffect(() => {
        if (caseStudy?.slug) {
            caseStudyApi.incrementViews(caseStudy.slug);
        }
    }, [caseStudy?.slug]);

    if (router.isFallback) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700" />
                </div>
            </Layout>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Structured data for case study
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": caseStudy.title,
        "description": caseStudy.excerpt,
        "datePublished": caseStudy.published_at,
        "dateModified": caseStudy.updated_at || caseStudy.published_at,
        "publisher": {
            "@type": "Organization",
            "name": "Military Disability Nexus",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.militarydisabilitynexus.com/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.militarydisabilitynexus.com/case-studies/${caseStudy.slug}`
        }
    };

    return (
        <Layout>
            <SEO
                title={caseStudy.title}
                description={caseStudy.excerpt}
                keywords={`case study, success story, VA disability, ${caseStudy.client_name || ''}`}
                article={true}
                publishedTime={caseStudy.published_at}
                structuredData={structuredData}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Case Studies', path: '/case-studies' },
                    { name: caseStudy.title, path: `/case-studies/${caseStudy.slug}` }
                ]}
            />
            <div className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <section className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/case-studies"
                            className="inline-flex items-center space-x-2 text-indigo-50 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Case Studies</span>
                        </Link>
                        {caseStudy.tags && caseStudy.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {caseStudy.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-block bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{caseStudy.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-indigo-50">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>{formatDate(caseStudy.published_at)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Eye className="w-5 h-5" />
                                <span>{caseStudy.views || 0} views</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Image */}
                {caseStudy.featured_image && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
                        <div className="w-full h-96 overflow-hidden rounded-2xl shadow-2xl">
                            <img
                                src={caseStudy.featured_image}
                                alt={caseStudy.title}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Excerpt */}
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
                        <p className="text-xl text-slate-700 leading-relaxed">
                            {caseStudy.excerpt}
                        </p>
                    </div>

                    {/* Challenge Section */}
                    {caseStudy.challenge && (
                        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-red-100 p-3 rounded-lg">
                                    <Target className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">The Challenge</h2>
                            </div>
                            <div
                                className="prose prose-slate prose-lg max-w-none prose-headings:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                                dangerouslySetInnerHTML={{ __html: caseStudy.challenge }}
                            />
                        </div>
                    )}

                    {/* What Existed Before Section */}
                    {caseStudy.solution && (
                        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Lightbulb className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">What Existed Before</h2>
                            </div>
                            <div
                                className="prose prose-slate prose-lg max-w-none prose-headings:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                                dangerouslySetInnerHTML={{ __html: caseStudy.solution }}
                            />
                        </div>
                    )}

                    {/* Our Contribution Section */}
                    {caseStudy.results && (
                        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Our Contribution</h2>
                            </div>
                            <div
                                className="prose prose-slate prose-lg max-w-none prose-headings:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                                dangerouslySetInnerHTML={{ __html: caseStudy.results }}
                            />
                        </div>
                    )}

                    {/* Key Takeaway - Yellow Box */}
                    {caseStudy.key_takeaway && (
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 md:p-12 shadow-lg mb-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-amber-200 p-3 rounded-lg">
                                    <Star className="w-6 h-6 text-amber-700" />
                                </div>
                                <h2 className="text-2xl font-bold text-amber-900">Key Takeaway</h2>
                            </div>
                            <div
                                className="prose prose-lg max-w-none text-amber-900 prose-headings:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                                dangerouslySetInnerHTML={{ __html: caseStudy.key_takeaway }}
                            />
                        </div>
                    )}

                    {/* Full Content (if no structured sections) */}
                    {!caseStudy.challenge && !caseStudy.solution && !caseStudy.results && (
                        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
                            <div
                                className="prose prose-slate prose-lg max-w-none prose-headings:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2"
                                dangerouslySetInnerHTML={{ __html: caseStudy.content_html }}
                            />
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-12 bg-gradient-to-br from-navy-700 to-navy-800 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Ready to achieve similar results?
                        </h3>
                        <p className="text-indigo-50 mb-6">
                            Let our expert team help you with your VA disability claim
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-white text-navy-600 px-8 py-3 rounded-full font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Get Free Consultation
                        </Link>
                    </div>
                </article>
            </div>
        </Layout>
    );
};

export default CaseStudyDetail;
