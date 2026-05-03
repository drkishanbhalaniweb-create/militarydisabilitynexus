import Link from 'next/link';
import Head from 'next/head';
import { ArrowLeft, ExternalLink, Calendar, User, BookOpen, ArrowRight } from 'lucide-react';
import { clinicalProfileApi, blogApi, caseStudyApi } from '../../src/lib/api';
import SEO from '../../src/components/SEO';
import Layout from '../../src/components/Layout';
import { supabase } from '../../src/lib/supabase';
import { buildOrganizationReference } from '../../src/lib/trust';

export async function getStaticPaths() {
    try {
        const profiles = await clinicalProfileApi.getAll(true);
        const paths = profiles.map((p) => ({
            params: { slug: p.slug },
        }));
        return { paths, fallback: 'blocking' };
    } catch (error) {
        console.error('Error getting static paths for clinicians:', error);
        return { paths: [], fallback: 'blocking' };
    }
}

export async function getStaticProps({ params }) {
    try {
        const profile = await clinicalProfileApi.getBySlug(params.slug);

        if (!profile) {
            return { notFound: true };
        }

        // Fetch associated articles (blogs + case studies where this profile is author or reviewer)
        let articles = [];
        try {
            const [allBlogs, allStudies] = await Promise.all([
                blogApi.getAll(500),
                caseStudyApi.getAll(),
            ]);

            const authoredBlogs = allBlogs
                .filter(b => b.author_profile_id === profile.id || b.reviewer_profile_id === profile.id)
                .map(b => ({
                    id: b.id,
                    title: b.title,
                    slug: b.slug,
                    excerpt: b.excerpt,
                    published_at: b.published_at,
                    type: 'blog',
                    role: b.author_profile_id === profile.id ? 'Author' : 'Reviewer',
                }));

            const authoredStudies = allStudies
                .filter(s => s.author_profile_id === profile.id || s.reviewer_profile_id === profile.id)
                .map(s => ({
                    id: s.id,
                    title: s.title,
                    slug: s.slug,
                    excerpt: s.excerpt,
                    published_at: s.published_at,
                    type: 'case_study',
                    role: s.author_profile_id === profile.id ? 'Author' : 'Reviewer',
                }));

            // Fetch community expert answers
            const { data: communityAnswers } = await supabase
                .from('community_answers')
                .select('id, content, created_at, community_questions(title, slug)')
                .eq('clinician_profile_id', profile.id)
                .eq('status', 'published')
                .limit(10);

            const expertAnswers = (communityAnswers || []).map(a => ({
                id: a.id,
                title: a.community_questions?.title,
                slug: a.community_questions?.slug,
                excerpt: a.content.substring(0, 160) + '...',
                published_at: a.created_at,
                type: 'community_answer',
                role: 'Expert Contributor'
            }));

            articles = [...authoredBlogs, ...authoredStudies, ...expertAnswers]
                .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        } catch (e) {
            console.error('Error fetching associated articles:', e);
        }

        return {
            props: { profile, articles },
            revalidate: 3600,
        };
    } catch (error) {
        console.error(`Error fetching clinician profile for slug ${params.slug}:`, error);
        return { notFound: true };
    }
}

const ClinicianProfile = ({ profile, articles = [] }) => {
    const displayName = profile.full_name + (profile.credentials ? `, ${profile.credentials}` : '');

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // JSON-LD Physician structured data for E-E-A-T
    const structuredData = {
        "@context": "https://schema.org",
        "@type": ["Person", "Physician"],
        "@id": `https://www.militarydisabilitynexus.com/clinician/${profile.slug}#physician`,
        "name": displayName,
        "description": profile.bio,
        "url": `https://www.militarydisabilitynexus.com/clinician/${profile.slug}`,
        "sameAs": [
            ...(profile.linkedin_url ? [profile.linkedin_url] : []),
            ...(profile.board_certification_url ? [profile.board_certification_url] : [])
        ],
        ...(profile.photo_url ? { "image": profile.photo_url } : {}),
        "worksFor": buildOrganizationReference(),
        "jobTitle": profile.credentials || "Clinical Contributor",
        "hasCredential": [
            {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "Medical License/Certification",
                "name": profile.credentials || "Medical Credential"
            }
        ]
    };

    return (
        <Layout>
            <SEO
                title={`${displayName} — Clinician Profile`}
                description={profile.bio ? profile.bio.substring(0, 160) : `Learn about ${displayName}, a clinician contributing to Military Disability Nexus.`}
                structuredData={structuredData}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Clinicians', path: '/clinician' },
                    { name: profile.full_name, path: `/clinician/${profile.slug}` },
                ]}
            />

            <div className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <section className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center space-x-2 text-indigo-50 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Blog</span>
                        </Link>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {profile.photo_url ? (
                                <img
                                    src={profile.photo_url}
                                    alt={profile.full_name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white/20 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <User className="w-10 h-10 text-white/60" />
                                </div>
                            )}

                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                                    {profile.full_name}
                                </h1>
                                {profile.credentials && (
                                    <p className="mt-1 text-lg text-indigo-200 font-medium">{profile.credentials}</p>
                                )}
                                {profile.linkedin_url && (
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View LinkedIn Profile
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bio */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-200">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-6">
                            About
                        </h2>
                        <div className="prose prose-lg prose-slate max-w-none">
                            {profile.bio.split('\n').map((paragraph, idx) => (
                                paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                            ))}
                        </div>
                    </div>

                    {/* Articles by this clinician */}
                    {articles.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-6">
                                Published Contributions
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={article.type === 'blog' ? `/blog/${article.slug}` : article.type === 'case_study' ? `/case-studies/${article.slug}` : `/community/question/${article.slug}`}
                                        className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-navy-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                article.type === 'blog'
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : article.type === 'case_study'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {article.type === 'blog' ? 'Blog' : article.type === 'case_study' ? 'Case Study' : 'Expert Answer'}
                                            </span>
                                            <span className="text-xs text-slate-400">{article.role}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-navy-700 transition-colors leading-snug">
                                            {article.title}
                                        </h3>
                                        {article.excerpt && (
                                            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                                                {article.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{formatDate(article.published_at)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-12 bg-gradient-to-br from-navy-700 to-navy-800 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Need expert clinical documentation?
                        </h3>
                        <p className="text-indigo-50 mb-6">
                            Get connected with our licensed clinicians for your VA claim
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-white text-navy-600 px-8 py-3 rounded-full font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Get Free Consultation
                            <ArrowRight className="inline ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </article>
            </div>
        </Layout>
    );
};

export default ClinicianProfile;
