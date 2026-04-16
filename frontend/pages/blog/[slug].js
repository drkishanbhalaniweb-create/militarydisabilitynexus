import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Clock, Calendar, User, ArrowRight } from 'lucide-react';
import { blogApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import AttributionPanel from '../../src/components/trust/AttributionPanel';
import { formatBlogHTML } from '../../src/lib/htmlUtils';
import {
    buildOrganizationReference,
    clinicalReviewTeam,
    editorialTeam,
} from '../../src/lib/trust';

export async function getStaticPaths() {
    try {
        const posts = await blogApi.getAll(10000);
        const paths = posts.map((post) => ({
            params: { slug: post.slug },
        }));
        return { paths, fallback: 'blocking' };
    } catch (error) {
        console.error('Error getting static paths for blog:', error);
        return { paths: [], fallback: 'blocking' };
    }
}

export async function getStaticProps({ params }) {
    try {
        const post = await blogApi.getBySlug(params.slug);

        if (!post) {
            return { notFound: true };
        }

        return {
            props: { post },
            revalidate: 3600, // Revalidate every hour
        };
    } catch (error) {
        console.error(`Error fetching blog post for slug ${params.slug}:`, error);
        return { notFound: true };
    }
}

const BlogPost = ({ post }) => {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Extract FAQs from content_html for JSON-LD
    const generateFaqSchema = (html) => {
        if (!html || !html.includes('faq-block')) return null;

        const faqs = [];
        const faqRegex = /<div class="faq-block">.*?<h3>(.*?)<\/h3>.*?<div class="faq-answer">(.*?)<\/div>/gis;

        let match;
        while ((match = faqRegex.exec(html)) !== null) {
            const questionText = match[1].replace(/<[^>]*>?/gm, '').trim();
            const answerText = match[2].replace(/<[^>]*>?/gm, '').trim();
            if (questionText && answerText) {
                faqs.push({
                    "@type": "Question",
                    "name": questionText,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answerText
                    }
                });
            }
        }

        if (faqs.length === 0) return null;

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs
        };
    };

    // Structured data for blog article
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "url": `https://www.militarydisabilitynexus.com/blog/${post.slug}`,
        "author": {
            "@type": "Organization",
            "name": editorialTeam.name,
            "url": `https://www.militarydisabilitynexus.com${editorialTeam.href}`
        },
        "datePublished": post.published_at,
        "dateModified": post.updated_at || post.published_at,
        "keywords": post.tags || [],
        "publisher": {
            ...buildOrganizationReference(),
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.militarydisabilitynexus.com/logo.png"
            }
        },
        ...(post.featured_image ? {
            "image": [post.featured_image]
        } : {}),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.militarydisabilitynexus.com/blog/${post.slug}`
        }
    };

    const faqSchema = generateFaqSchema(post.content_html);
    const finalStructuredData = faqSchema ? [structuredData, faqSchema] : structuredData;

    return (
        <Layout>
            <SEO
                title={post.title}
                description={post.excerpt}
                keywords={`${post.category}, VA disability, ${post.tags?.join(', ')}`}
                article={true}
                publishedTime={post.published_at}
                modifiedTime={post.updated_at || post.published_at}
                author={post.author_name}
                structuredData={finalStructuredData}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Blog', path: '/blog' },
                    { name: post.title, path: `/blog/${post.slug}` }
                ]}
            />
            <article className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <header className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center space-x-2 text-indigo-50 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Blog</span>
                        </Link>
                        <div className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            {post.category}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{post.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-indigo-50">
                            <div className="flex items-center space-x-2">
                                <User className="w-5 h-5" />
                                <span>{post.author_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>{formatDate(post.published_at)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>{post.read_time}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {post.featured_image && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
                        <div className="w-full h-96 overflow-hidden rounded-2xl shadow-2xl">
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div 
                        className="prose-container"
                        dangerouslySetInnerHTML={{ __html: formatBlogHTML(post.content_html) }}
                    />

                    <AttributionPanel
                        author={editorialTeam}
                        reviewer={clinicalReviewTeam}
                        updatedLabel={`Originally published ${formatDate(post.published_at)}${post.updated_at ? ` • Last updated ${formatDate(post.updated_at)}` : ''}`}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                            {post.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <Link href="/services" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-100">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Services</div>
                            <div className="mt-2 text-lg font-bold text-slate-900">See service options</div>
                            <p className="mt-2 text-sm text-slate-600">Move from educational content to the relevant documentation or review service.</p>
                        </Link>
                        <Link href="/testimonials" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-100">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Proof</div>
                            <div className="mt-2 text-lg font-bold text-slate-900">Read testimonials</div>
                            <p className="mt-2 text-sm text-slate-600">See how veterans describe the experience in their own words.</p>
                        </Link>
                        <Link href="/medical-review-policy" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-100">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Standards</div>
                            <div className="mt-2 text-lg font-bold text-slate-900">Medical review policy</div>
                            <p className="mt-2 text-sm text-slate-600">Understand how clinically sensitive educational content is reviewed on this site.</p>
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 bg-gradient-to-br from-navy-700 to-navy-800 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Need help with your VA claim?
                        </h3>
                        <p className="text-indigo-50 mb-6">
                            Get expert guidance and documentation from our licensed clinicians
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Get Free Consultation
                            <ArrowRight className="inline ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </article>
        </Layout>
    );
};

export default BlogPost;
