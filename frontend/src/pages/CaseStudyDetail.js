import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Briefcase, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { caseStudyApi } from '../lib/api';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';

const CaseStudyDetail = () => {
  const { slug } = useParams();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseStudy = async () => {
      try {
        const data = await caseStudyApi.getBySlug(slug);
        setCaseStudy(data);
        // Increment view count
        await caseStudyApi.incrementViews(slug);
      } catch (error) {
        console.error('Error fetching case study:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseStudy();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700" />
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Case study not found</h2>
          <Link to="/case-studies" className="text-navy-600 hover:text-navy-700">
            Back to Case Studies
          </Link>
        </div>
      </div>
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
        "url": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : ''
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : ''
    }
  };

  return (
    <>
      <SEO 
        title={caseStudy.title}
        description={caseStudy.excerpt}
        keywords={`case study, success story, VA disability, ${caseStudy.client_name || ''}`}
        article={true}
        publishedTime={caseStudy.published_at}
        structuredData={structuredData}
      />
      <div className="bg-slate-50 min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/case-studies"
              className="inline-flex items-center space-x-2 text-indigo-50 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Case Studies</span>
            </Link>
            {caseStudy.client_name && (
              <div className="inline-flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Briefcase className="w-4 h-4" />
                <span>{caseStudy.client_name}</span>
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
            <OptimizedImage
              src={caseStudy.featured_image}
              alt={caseStudy.title}
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              priority={true}
            />
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
                className="prose prose-slate prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: caseStudy.challenge }}
              />
            </div>
          )}

          {/* Solution Section */}
          {caseStudy.solution && (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Our Solution</h2>
              </div>
              <div
                className="prose prose-slate prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: caseStudy.solution }}
              />
            </div>
          )}

          {/* Results Section */}
          {caseStudy.results && (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">The Results</h2>
              </div>
              <div
                className="prose prose-slate prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: caseStudy.results }}
              />
            </div>
          )}

          {/* Full Content (if no structured sections) */}
          {!caseStudy.challenge && !caseStudy.solution && !caseStudy.results && (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <div
                className="prose prose-slate prose-lg max-w-none"
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
              to="/contact"
              className="inline-block bg-white text-navy-600 px-8 py-3 rounded-full font-semibold hover:bg-slate-50 transition-colors"
            >
              Get Free Consultation
            </Link>
          </div>
        </article>
      </div>
    </>
  );
};

export default CaseStudyDetail;
