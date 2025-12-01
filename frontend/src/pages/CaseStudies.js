import { useEffect, useState } from 'react';
import { Briefcase, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { caseStudyApi } from '../lib/api';
import SEO from '../components/SEO';

const CaseStudies = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    setLoading(true);
    try {
      const data = await caseStudyApi.getAll();
      setCaseStudies(data);
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
                  We provide professional, medically supported documentation that helps strengthen VA disability claims — without guarantees, pressure, or copy‑paste templates. Every story here is anonymous, respectful, and focused on what matters most: solid medical rationale.
                </p>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
            {/* Case Studies Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-700 mx-auto" />
              </div>
            ) : caseStudies.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-slate-600">No case studies available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {caseStudies.map((caseStudy) => (
                  <div
                    key={caseStudy.id}
                    data-testid={`case-study-${caseStudy.slug}`}
                    className="bg-white/90 backdrop-blur-xl rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all p-6"
                  >
                    {/* Header with Tags */}
                    <div className="mb-4">
                      {caseStudy.tags && caseStudy.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {caseStudy.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded text-xs font-semibold uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded text-xs font-semibold uppercase mb-3">
                          {caseStudy.client_name || 'Service Connection'}
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {caseStudy.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {caseStudy.excerpt}
                      </p>
                    </div>

                    {/* Challenge Section */}
                    {caseStudy.challenge && (
                      <div className="mb-4">
                        <div className="flex items-start space-x-2 mb-2">
                          <Target className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <h4 className="text-sm font-bold text-slate-900">Challenge:</h4>
                        </div>
                        <div 
                          className="text-sm text-slate-600 leading-relaxed pl-6 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: caseStudy.challenge }}
                        />
                      </div>
                    )}

                    {/* What Worked Before Section */}
                    {caseStudy.solution && (
                      <div className="mb-4">
                        <div className="flex items-start space-x-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <h4 className="text-sm font-bold text-slate-900">What worked before:</h4>
                        </div>
                        <div 
                          className="text-sm text-slate-600 leading-relaxed pl-6 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: caseStudy.solution }}
                        />
                      </div>
                    )}

                    {/* Our Contribution Section */}
                    {caseStudy.results && (
                      <div className="mb-4">
                        <div className="flex items-start space-x-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <h4 className="text-sm font-bold text-slate-900">Our contribution:</h4>
                        </div>
                        <div 
                          className="text-sm text-slate-600 leading-relaxed pl-6 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: caseStudy.results }}
                        />
                      </div>
                    )}

                  </div>
                ))}
              </div>
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
