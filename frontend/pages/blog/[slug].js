import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { blogApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
// import OptimizedImage from '../../src/components/OptimizedImage'; // Simple img wrapper

export async function getStaticPaths() {
    try {
        const posts = await blogApi.getAll(10000);
        const paths = posts.map((post) => ({
            params: { slug: post.slug },
        }));
        return { paths, fallback: false };
    } catch (error) {
        console.error('Error getting static paths for blog:', error);
        return { paths: [], fallback: false };
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
            revalidate: 3600,
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

    // Structured data for blog article
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "author": {
            "@type": "Person",
            "name": post.author_name
        },
        "datePublished": post.published_at,
        "dateModified": post.updated_at || post.published_at,
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
            "@id": `https://www.militarydisabilitynexus.com/blog/${post.slug}`
        }
    };

    return (
        <Layout>
            <SEO
                title={post.title}
                description={post.excerpt}
                keywords={`${post.category}, VA disability, ${post.tags?.join(', ')}`}
                article={true}
                publishedTime={post.published_at}
                author={post.author_name}
                structuredData={structuredData}
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
                                <span>{post.published_at}</span>
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
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
                        <div
                            className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-indigo-600"
                            dangerouslySetInnerHTML={{ __html: post.content_html }}
                        />
                    </div>

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
                        </Link>
                    </div>
                </div>
            </article>
        </Layout>
    );
};

export default BlogPost;
