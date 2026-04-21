import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const RelatedInsights = ({ insights = [], title = "Related Insights" }) => {
    if (!insights || insights.length === 0) return null;

    return (
        <section className="bg-white rounded-2xl p-8 mb-12 shadow-sm border border-slate-100" aria-labelledby="insights-heading">
            <h2 id="insights-heading" className="text-2xl font-bold text-slate-900 mb-8">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.map((item) => {
                    const isCaseStudy = item.type === 'case_study' || item.is_case_study;
                    const typeLabel = isCaseStudy ? 'Case Study' : 'Blog';
                    const href = isCaseStudy ? `/case-studies/${item.slug}` : `/blog/${item.slug}`;
                    
                    const borderHoverClass = isCaseStudy ? 'hover:border-red-500' : 'hover:border-navy-500';
                    const textColorClass = isCaseStudy ? 'text-red-600' : 'text-navy-600';
                    const textHoverClass = isCaseStudy ? 'group-hover:text-red-700' : 'group-hover:text-navy-700';
                    
                    return (
                        <Link href={href} key={item.id} className="group block h-full">
                            <div className={`border border-slate-200 rounded-xl p-5 ${borderHoverClass} hover:shadow-md transition-all h-full bg-slate-50 flex flex-col`}>
                                <span className={`text-[10px] font-bold ${textColorClass} uppercase tracking-widest mb-3 block`}>
                                    {typeLabel}
                                </span>
                                <h3 className={`text-lg font-bold text-slate-900 mb-3 ${textHoverClass} line-clamp-2 leading-tight`}>
                                    {item.title}
                                </h3>
                                <div className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow italic leading-relaxed">
                                    {item.excerpt}
                                </div>
                                <div className={`mt-auto flex items-center ${textColorClass} text-sm font-bold uppercase tracking-wider`}>
                                    {isCaseStudy ? 'View Case Study' : 'Read Article'} 
                                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default RelatedInsights;
