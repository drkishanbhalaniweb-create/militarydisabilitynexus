import { useEffect, useState } from 'react';
import { Briefcase, Filter } from 'lucide-react';
import { caseStudyApi } from '../lib/api';
import SEO from '../components/SEO';

const AVAILABLE_TAGS = [
  'SMC/Aid & Attendance',
  'Primary Service Connection',
  'Secondary Service Connection',
  'Mental Health Claim',
  '1151 Claim',
  'Claim Readiness Review'
];

const CaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [filteredCaseStudies, setFilteredCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  useEffect(() => {
    if (selectedTag) {
      setFilteredCaseStudies(
        caseStudies.filter(cs => cs.tags && cs.tags.includes(selectedTag))
      );
    } else {
      setFilteredCaseStudies(caseStudies);
    }
  }, [selectedTag, caseStudies]);

  const fetchCaseStudies = async () => {
    setLoading(true);
    try {
      const data = await caseStudyApi.getAll();
      console.log('Case studies data:', data); // Debug log
      setCaseStudies(data);
      setFilteredCaseStudies(data);
    } catch (error) {
      console.error('Error fetching case studies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Case Studies - Success Stories & Client Results"
        description="Explore our case studies showcasing successful client engagements, challenges overcome, and measurable results achieved in VA disability claims."
        keywords="case studies, success stories, client results, VA disability success, nexus letter results"
      />
      <div className="relative min-h-screen overflow-hidden">
        {/* Fixed Background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/blogimg.png")',
              filter: 'blur(4px)',
              transform: 'scale(1.1)',
              width: '100%',
              height: '100%'
            }}
            role="presentation"
            aria-hidden="true"
          ></div>
          <div className="absolute inset-0 bg-white/50"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <section className="py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl p-12 sm:p-16 shadow-2xl text-center">
                <div className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg" style={{ backgroundColor: '#B91C3C' }}>
                  <Briefcase className="w-4 h-4" />
                  <span>CASE STUDIES</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  Success Stories
                </h1>
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-4xl mx-auto">
                  We provide medically supported documentation and expert guidance to help strengthen VA disability claims — including primary service connection, secondary conditions, Aid & Attendance, PACT Act claims, and §1151 cases.
                </p>
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-4xl mx-auto mt-4">
                  Each case study on this page is based on real veterans we've assisted, with all personal details removed to protect privacy.
                </p>
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-4xl mx-auto mt-4">
                  Our focus is on accurate medical reasoning, clear evidence analysis, and properly structured documentation — never guarantees, pressure tactics, or copy-paste templates.
                </p>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
            {/* Tag Filter */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Filter by Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTag === null
                      ? 'bg-slate-800 text-white shadow-lg'
                      : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                >
                  All Case Studies
                </button>
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTag && (
                <p className="mt-3 text-sm text-slate-600">
                  Showing {filteredCaseStudies.length} case {filteredCaseStudies.length === 1 ? 'study' : 'studies'} for "{selectedTag}"
                </p>
              )}
            </div>

            {/* Case Studies Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700 mx-auto" />
              </div>
            ) : filteredCaseStudies.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-slate-600">
                  {selectedTag ? `No case studies found for "${selectedTag}"` : 'No case studies available yet'}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View all case studies
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile: Horizontal Scroll - Full Width */}
                <div className="md:hidden -mx-4 sm:-mx-6 lg:-mx-8">
                  <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    <div className="flex" style={{ width: `${filteredCaseStudies.length * 100}vw` }}>
                      {filteredCaseStudies.map((caseStudy) => {
                        // Get tag colors based on tag type
                        const getTagColors = (tag) => {
                          if (tag?.includes('SMC') || tag?.includes('Aid')) 
                            return { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', dot: 'bg-amber-500' };
                          if (tag?.includes('PTSD') || tag?.includes('Mental')) 
                            return { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', dot: 'bg-blue-500' };
                          if (tag?.includes('Secondary')) 
                            return { text: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', dot: 'bg-orange-500' };
                          if (tag?.includes('Primary')) 
                            return { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-500' };
                          if (tag?.includes('1151')) 
                            return { text: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300', dot: 'bg-purple-500' };
                          if (tag?.includes('Claim Readiness') || tag?.includes('Readiness Review')) 
                            return { text: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-300', dot: 'bg-indigo-500' };
                          return { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', dot: 'bg-slate-500' };
                        };
                        
                        const primaryTag = caseStudy.tags?.[0] || 'Case Study';
                        const tagColors = getTagColors(primaryTag);
                        
                        return (
                          <div
                            key={caseStudy.id}
                            data-testid={`case-study-${caseStudy.slug}`}
                            className="snap-start flex-shrink-0 w-screen px-6 py-6"
                          >
                            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 h-full overflow-y-auto" style={{ maxHeight: '70vh' }}>
                              {/* Tag with colored dot and pill shape */}
                              <div className="flex items-center gap-2 mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${tagColors.bg} ${tagColors.text} border ${tagColors.border}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${tagColors.dot}`}></span>
                                  {primaryTag}
                                </span>
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                                {caseStudy.title}
                              </h3>
                              
                              {/* Description/Excerpt */}
                              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                                {caseStudy.excerpt}
                              </p>

                              {/* Challenge Section */}
                              {caseStudy.challenge && (
                                <div className="mb-5">
                                  <h4 className="text-sm font-bold text-slate-900 mb-2">Challenge:</h4>
                                  <div 
                                    className="text-sm text-slate-700 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1.5 [&_li]:text-slate-700 [&_p]:mb-2"
                                    dangerouslySetInnerHTML={{ __html: caseStudy.challenge }}
                                  />
                                </div>
                              )}

                              {/* What existed before Section */}
                              {caseStudy.solution && (
                                <div className="mb-5">
                                  <h4 className="text-sm font-bold text-slate-900 mb-2">What existed before:</h4>
                                  <div 
                                    className="text-sm text-slate-700 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1.5 [&_li]:text-slate-700 [&_p]:mb-2"
                                    dangerouslySetInnerHTML={{ __html: caseStudy.solution }}
                                  />
                                </div>
                              )}

                              {/* Our contribution Section */}
                              {caseStudy.results && (
                                <div className="mb-5">
                                  <h4 className="text-sm font-bold text-slate-900 mb-2">Our contribution:</h4>
                                  <div 
                                    className="text-sm text-slate-700 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1.5 [&_li]:text-slate-700 [&_p]:mb-2"
                                    dangerouslySetInnerHTML={{ __html: caseStudy.results }}
                                  />
                                </div>
                              )}

                              {/* Key Takeaway - Yellow Box */}
                              {caseStudy.key_takeaway && (
                                <div className="mt-5 bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-300">
                                      Key Takeaway
                                    </span>
                                  </div>
                                  <div 
                                    className="text-sm text-amber-900 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1.5 [&_li]:text-amber-800 [&_p]:mb-2"
                                    dangerouslySetInnerHTML={{ __html: caseStudy.key_takeaway }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Scroll indicator */}
                  <div className="flex justify-center gap-2 mt-6">
                    {filteredCaseStudies.map((_, index) => (
                      <div 
                        key={index} 
                        className="w-2 h-2 rounded-full bg-slate-400"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCaseStudies.map((caseStudy) => {
                  // Get tag colors based on tag type
                  const getTagColors = (tag) => {
                    if (tag?.includes('SMC') || tag?.includes('Aid')) 
                      return { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', dot: 'bg-amber-500' };
                    if (tag?.includes('PTSD') || tag?.includes('Mental')) 
                      return { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', dot: 'bg-blue-500' };
                    if (tag?.includes('Secondary')) 
                      return { text: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', dot: 'bg-orange-500' };
                    if (tag?.includes('Primary')) 
                      return { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-500' };
                    if (tag?.includes('1151')) 
                      return { text: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300', dot: 'bg-purple-500' };
                    if (tag?.includes('Claim Readiness') || tag?.includes('Readiness Review')) 
                      return { text: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-300', dot: 'bg-indigo-500' };
                    return { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', dot: 'bg-slate-500' };
                  };
                  
                  const primaryTag = caseStudy.tags?.[0] || 'Case Study';
                  const tagColors = getTagColors(primaryTag);
                  
                  return (
                    <div
                      key={caseStudy.id}
                      data-testid={`case-study-${caseStudy.slug}`}
                      className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      {/* Tag with colored dot and pill shape */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${tagColors.bg} ${tagColors.text} border ${tagColors.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tagColors.dot}`}></span>
                          {primaryTag}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                        {caseStudy.title}
                      </h3>
                      
                      {/* Description/Excerpt */}
                      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                        {caseStudy.excerpt}
                      </p>

                      {/* Challenge Section */}
                      {caseStudy.challenge && (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Challenge:</h4>
                          <div 
                            className="text-sm text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1 [&_li]:text-slate-600 [&_p]:mb-2"
                            dangerouslySetInnerHTML={{ __html: caseStudy.challenge }}
                          />
                        </div>
                      )}

                      {/* What existed before Section */}
                      {caseStudy.solution && (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">What existed before:</h4>
                          <div 
                            className="text-sm text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1 [&_li]:text-slate-600 [&_p]:mb-2"
                            dangerouslySetInnerHTML={{ __html: caseStudy.solution }}
                          />
                        </div>
                      )}

                      {/* Our contribution Section */}
                      {caseStudy.results && (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Our contribution:</h4>
                          <div 
                            className="text-sm text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1 [&_li]:text-slate-600 [&_p]:mb-2"
                            dangerouslySetInnerHTML={{ __html: caseStudy.results }}
                          />
                        </div>
                      )}

                      {/* Key Takeaway - Yellow Box */}
                      {caseStudy.key_takeaway && (
                        <div className="mt-4 bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-300">
                              Key Takeaway
                            </span>
                          </div>
                          <div 
                            className="text-sm text-amber-900 leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1 [&_li]:text-amber-800 [&_p]:mb-2"
                            dangerouslySetInnerHTML={{ __html: caseStudy.key_takeaway }}
                          />
                        </div>
                      )}

                    </div>
                  );
                })}
                </div>
              </>
            )}

            {/* What These Case Studies Show Section */}
            <div className="max-w-5xl mx-auto mt-16 mb-12">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                  What These Case Studies Show
                </h2>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-slate-900 mr-3 mt-1">•</span>
                    <span className="leading-relaxed">
                      Many VA denials are driven by incomplete or unclear medical rationale, not by a lack of symptoms.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-900 mr-3 mt-1">•</span>
                    <span className="leading-relaxed">
                      SMC, PTSD, migraine, sleep apnea, and secondary claims often require detailed functional and clinical explanation.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-900 mr-3 mt-1">•</span>
                    <span className="leading-relaxed">
                      Personalized, ethical medical opinions are more persuasive than generic, template-style letters.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-900 mr-3 mt-1">•</span>
                    <span className="leading-relaxed">
                      Our focus is on clear, defensible documentation that helps VA fully understand the medical side of your claim.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ready to Strengthen Your VA Claim Section */}
            <div className="max-w-5xl mx-auto mb-16">
              <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl p-10 sm:p-14 shadow-2xl text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Strengthen Your VA Claim?
                </h2>
                <p className="text-lg text-white/90 leading-relaxed mb-8 max-w-3xl mx-auto">
                  If your claim has been denied, deferred, or feels "stuck," a clear medical opinion may help the VA better understand your condition and its connection to service. We offer focused, veteran-centered evaluations and written opinions designed specifically for VA disability claims.
                </p>
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="text-white px-8 py-3.5 rounded-lg font-semibold text-base hover:shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#B91C3C' }}
                >
                  Start Your Case Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseStudies;
