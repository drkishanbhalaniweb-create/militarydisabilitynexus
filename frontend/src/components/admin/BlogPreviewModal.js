import { X } from 'lucide-react';
import { Clock, Calendar, User } from 'lucide-react';
import AttributionPanel from '../trust/AttributionPanel';
import { clinicalReviewTeam, editorialTeam } from '../../lib/trust';
import { formatBlogHTML } from '../../lib/htmlUtils';

const BlogPreviewModal = ({ isOpen, onClose, post }) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        return new Date(dateString || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Live Layout Preview</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Modal Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                    <article className="min-h-full pb-16">
                        {/* Hero */}
                        <header className="bg-gradient-to-br from-navy-700 to-navy-800 py-16">
                            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                                <span className="inline-flex items-center space-x-2 text-indigo-50 mb-6 font-semibold">
                                    <ArrowLeftIcon /> Back to Blog
                                </span>
                                <div className="block">
                                    <div className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                        {post.category || 'Category'}
                                    </div>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                                    {post.title || 'Untitled Post'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-indigo-50">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-5 h-5" />
                                        <span>{post.author_name || 'Author Name'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5" />
                                        <span>{formatDate(post.published_at)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-5 h-5" />
                                        <span>{post.read_time || 'Read time'}</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {post.featured_image && (
                            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8 relative z-10">
                                <div className="w-full h-96 overflow-hidden rounded-2xl shadow-2xl bg-slate-200">
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                            <div className="prose-container mb-12">
                                {post.content_html ? (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: formatBlogHTML(post.content_html) }}
                                    />
                                ) : (
                                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg text-center py-12 text-slate-400 font-semibold italic">
                                        No content added yet.
                                    </div>
                                )}
                            </div>

                            <AttributionPanel
                                author={editorialTeam}
                                reviewer={clinicalReviewTeam}
                                updatedLabel={`Originally published ${formatDate(post.published_at)}`}
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
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
};

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

export default BlogPreviewModal;
