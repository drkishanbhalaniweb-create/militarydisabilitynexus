import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { blogApi } from '../lib/api';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { label: 'All', value: '' },
    { label: 'Nexus Letters', value: 'nexus-letters' },
    { label: 'Exam Prep', value: 'exam-prep' },
    { label: 'Aid & Attendance', value: 'aid-attendance' },
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await blogApi.search(searchQuery, selectedCategory || null);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <>
      <SEO
        title="VA Disability Claim Resources & Guides"
        description="Expert insights, tips, and resources for your VA disability claim. Learn about nexus letters, DBQs, C&P exams, and claim strategies from medical professionals."
        keywords="VA disability blog, nexus letter guide, DBQ information, C&P exam tips, veteran resources"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' }
        ]}
      />
      <div className="relative min-h-screen overflow-hidden">
        {/* Fixed Background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <img
            src="/blogimg.png"
            alt="Background pattern"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'blur(4px)',
              transform: 'scale(1.1)'
            }}
            role="presentation"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-white/50"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-br from-navy-600 to-navy-800 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                <span>BLOG</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm">Guides & Updates</h1>
              <p className="text-xl text-slate-700">
                Expert insights, tips, and resources for your VA disability claim
              </p>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Search and Filters */}
            <div className="mb-12">
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-xl mx-auto">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="blog-search-input"
                    className="w-full px-6 py-4 pl-12 rounded-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg focus:border-navy-600 focus:outline-none text-slate-900"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </form>

              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    data-testid={`category-${cat.value || 'all'}`}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === cat.value
                      ? 'bg-gradient-to-br from-navy-600 to-navy-800 text-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-xl text-slate-700 hover:bg-white border border-white/40 shadow-lg'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700 mx-auto" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-slate-600">No articles found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <h2 className="sr-only">Latest Articles</h2>
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105"
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      data-testid={`blog-post-${post.slug}`}
                      className="block h-full"
                    >
                      {post.featured_image ? (
                        <OptimizedImage
                          src={post.featured_image}
                          alt={post.title}
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-navy-600 to-navy-800" />
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-navy-700 font-semibold uppercase">{post.category}</span>
                          <span className="text-xs text-slate-500">{new Date(post.published_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-navy-700 transition-colors">
                          {post.title}
                        </h3>
                        <div className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">
                          {post.excerpt.split('\n').map((line, i) => {
                            return line.trim() ? <p key={i} className="mb-1">{line}</p> : <br key={i} />;
                          })}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>{post.read_time}</span>
                          </div>
                          <div className="flex items-center text-navy-700 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                            <span>Read more</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
