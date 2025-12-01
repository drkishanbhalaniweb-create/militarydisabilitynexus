import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { blogApi } from '../lib/api';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await blogApi.getBySlug(slug);
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Post not found</h2>
          <Link to="/blog" className="text-indigo-600 hover:text-indigo-700">
            Back to Blog
          </Link>
        </div>
      </div>
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
        title={post.title}
        description={post.excerpt}
        keywords={`${post.category}, VA disability, ${post.tags?.join(', ')}`}
        article={true}
        publishedTime={post.published_at}
        author={post.author_name}
        structuredData={structuredData}
      />
      <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
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
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
          <OptimizedImage
            src={post.featured_image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-2xl shadow-2xl"
            priority={true}
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div
            className="prose prose-slate prose-lg max-w-none"
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
            to="/contact"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-slate-50 transition-colors"
          >
            Get Free Consultation
          </Link>
        </div>
      </article>
      </div>
    </>
  );
};

export default BlogPost;
