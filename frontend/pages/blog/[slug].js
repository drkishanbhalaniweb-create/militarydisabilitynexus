import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ArrowLeft, Clock, Calendar, User, ArrowRight } from 'lucide-react';
import { blogApi, caseStudyApi, clinicalProfileApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import AttributionPanel from '../../src/components/trust/AttributionPanel';
import ClinicalAuthorCard from '../../src/components/shared/ClinicalAuthorCard';
import TableOfContents from '../../src/components/blog/TableOfContents';
import LeadMagnetHydrator from '../../src/components/blog/LeadMagnetHydrator';
import RelatedInsights from '../../src/components/shared/RelatedInsights';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../src/components/ui/accordion';
import { formatBlogHTML } from '../../src/lib/htmlUtils';
import {
    buildOrganizationReference,
    clinicalReviewTeam,
    editorialTeam,
} from '../../src/lib/trust';

export async function getStaticPaths() {
    try {
        const posts = await blogApi.getAll(100);
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

        // Fetch Related Insights
        let relatedInsights = [];
        
        // 1. Try manual selection first
        if (post.related_post_ids && post.related_post_ids.length > 0) {
            const manualBlogs = await blogApi.getByIds(post.related_post_ids);
            relatedInsights = manualBlogs.map(b => ({ ...b, type: 'blog' }));
            
            // If we have room, check for manual case studies too (assuming same column)
            // For now, blogApi.getByIds covers it if they are in same table, 
            // but usually they are separate.
        }

        // 2. Fallback to auto-populate if less than 3
        if (relatedInsights.length < 3) {
            const allBlogs = await blogApi.getAll(50);
            const allStudies = await caseStudyApi.getAll();
            
            const candidates = [
                ...allBlogs.filter(b => b.id !== post.id).map(b => ({ ...b, type: 'blog' })),
                ...allStudies.map(s => ({ ...s, type: 'case_study' }))
            ];

            // Score by tag/category match
            const scored = candidates.map(item => {
                let score = 0;
                if (item.category === post.category) score += 5;
                const commonTags = (item.tags || []).filter(t => (post.tags || []).includes(t));
                score += commonTags.length * 2;
                return { ...item, score };
            }).sort((a, b) => b.score - a.score);

            const additional = scored.slice(0, 3 - relatedInsights.length);
            relatedInsights = [...relatedInsights, ...additional];
        }

        // Fetch clinical profiles if linked
        let authorProfile = null;
        let reviewerProfile = null;
        try {
            if (post.author_profile_id) {
                authorProfile = await clinicalProfileApi.getById(post.author_profile_id);
            }
            if (post.reviewer_profile_id) {
                reviewerProfile = await clinicalProfileApi.getById(post.reviewer_profile_id);
            }
        } catch (e) {
            console.error('Error fetching clinical profiles:', e);
        }

        return {
            props: { 
                post,
                relatedInsights: relatedInsights.slice(0, 3),
                authorProfile,
                reviewerProfile,
            },
            revalidate: 3600,
        };
    } catch (error) {
        console.error(`Error fetching blog post for slug ${params.slug}:`, error);
        return { notFound: true };
    }
}

const BlogPost = ({ post, relatedInsights = [], authorProfile = null, reviewerProfile = null }) => {
    const router = useRouter();

    const formattedContent = useMemo(() => {
        if (!post?.content_html) return { html: '', tocItems: [], hasToc: false };
        return formatBlogHTML(post.content_html, { extractToc: true });
    }, [post?.content_html]);

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

    // Generate JSON-LD for AI-Citable FAQs
    const generateFaqSchema = (faqs) => {
        if (!faqs || faqs.length === 0) return null;

        const structuredFaqs = faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }));

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": structuredFaqs
        };
    };

    // Structured data for blog article
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.seo_description || post.excerpt,
        "url": `https://www.militarydisabilitynexus.com/blog/${post.slug}`,
        "author": authorProfile ? {
            "@type": "Person",
            "name": authorProfile.full_name + (authorProfile.credentials ? `, ${authorProfile.credentials}` : ''),
            "url": `https://www.militarydisabilitynexus.com/clinician/${authorProfile.slug}`,
            ...(authorProfile.linkedin_url ? { "sameAs": [authorProfile.linkedin_url] } : {})
        } : {
            "@type": "Organization",
            "name": 'Editorial Team',
            "url": `https://www.militarydisabilitynexus.com${editorialTeam.href}`
        },
        "datePublished": post.published_at,
        "dateModified": post.updated_at || post.published_at,
        "keywords": post.seo_keywords ? post.seo_keywords.split(',').map(k => k.trim()) : (post.tags || []),
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

    const faqSchema = generateFaqSchema(post.faqs);
    const finalStructuredData = faqSchema ? [structuredData, faqSchema] : structuredData;

    const displayAuthorName = authorProfile 
        ? `${authorProfile.full_name}${authorProfile.credentials ? `, ${authorProfile.credentials}` : ''}`
        : 'Editorial Team';

    return (
        <Layout>
            <SEO
                title={post.seo_title || post.title}
                description={post.seo_description || post.excerpt}
                keywords={post.seo_keywords || `${post.category}, VA disability, ${post.tags?.join(', ')}`}
                article={true}
                publishedTime={post.published_at}
                modifiedTime={post.updated_at || post.published_at}
                author={displayAuthorName}
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
                        <div>
                            <span className="inline-block border border-white/25 bg-white/[0.07] text-slate-200 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-4 backdrop-blur-sm">
                                {post.category?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">{post.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-indigo-50">
                            <div className="flex items-center space-x-2">
                                <User className="w-5 h-5" />
                                <span>{displayAuthorName}</span>
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
                        <div className="w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl relative">
                            <Image
                                src={post.featured_image}
                                alt={post.featured_image_alt || post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 relative">
                        {/* Mobile TOC */}
                        {formattedContent.hasToc && (
                            <div className="block lg:hidden mb-8 w-full">
                                <TableOfContents items={formattedContent.tocItems} mobile={true} />
                            </div>
                        )}

                        {/* Desktop TOC Sidebar */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-24">
                                {formattedContent.hasToc && (
                                    <TableOfContents items={formattedContent.tocItems} />
                                )}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-7 w-full">
                            <div 
                                className="prose-container"
                                dangerouslySetInnerHTML={{ __html: formattedContent.html }}
                            />
                            <LeadMagnetHydrator />

                            {/* AI-Citable FAQs */}
                            {post.faqs && post.faqs.length > 0 && (
                                <div className="mt-12 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm" itemScope itemType="https://schema.org/FAQPage">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {post.faqs.map((faq, index) => (
                                            <AccordionItem key={index} value={`item-${index}`} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                                                <AccordionTrigger className="text-left text-lg font-bold text-slate-900" itemProp="name">
                                                    {faq.question}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                                                        <p className="text-slate-600 leading-relaxed text-base pt-2" itemProp="text">{faq.answer}</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
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
                                    <ArrowRight className="inline ml-2 w-4 h-4" />
                                </Link>
                            </div>

                            {(authorProfile || reviewerProfile) ? (
                                <ClinicalAuthorCard
                                    author={authorProfile}
                                    reviewer={reviewerProfile}
                                    updatedLabel={`Originally published ${formatDate(post.published_at)}${post.updated_at ? ` • Last updated ${formatDate(post.updated_at)}` : ''}`}
                                />
                            ) : (
                                <AttributionPanel
                                    author={editorialTeam}
                                    reviewer={clinicalReviewTeam}
                                    updatedLabel={`Originally published ${formatDate(post.published_at)}${post.updated_at ? ` • Last updated ${formatDate(post.updated_at)}` : ''}`}
                                />
                            )}

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

                        </div>

                        {/* Empty Right Column for balance */}
                        <div className="hidden lg:block lg:col-span-2"></div>
                    </div>
                    
                    {/* Related Insights - Moved outside the grid to make TOC stop at blog end */}
                    <div className="mt-16">
                        <RelatedInsights insights={relatedInsights} />
                    </div>

                    {/* Disclaimer */}
                    <div className="border-t border-slate-200 mt-16 pt-8 max-w-4xl mx-auto">
                        <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed text-left sm:text-center">
                            <strong className="font-bold">About this article.</strong> <span className="italic">This post is general educational and medical information published by the Military Disability Nexus clinical team. It is not legal advice, not individualized medical advice, and not a substitute for a personal evaluation by a licensed clinician or a consultation with an accredited representative. Reading it does not create a doctor-patient or attorney-client relationship. VA law and rating criteria change; some details may not reflect the most recent updates, and every claim is decided by the VA on its own facts – no outcome is promised or guaranteed. Military Disability Nexus is an independent medical-evidence provider and is not affiliated with, endorsed by, or acting on behalf of the U.S. Department of Veterans Affairs or any government agency. Free claims assistance is available from VA-accredited Veterans Service Organizations and county Veterans Service Officers; you can verify any representative's accreditation through the <span className="underline">VA Office of General Counsel</span>.</span>
                        </p>
                    </div>
                </div>
            </article>
        </Layout>
    );
};

export default BlogPost;
