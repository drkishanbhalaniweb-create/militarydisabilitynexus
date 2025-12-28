import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Clock, CheckCircle, FileText, Heart, HelpCircle, Lock } from 'lucide-react';
import SEO from '../components/SEO';
import RecommendationCard from '../components/diagnostic/RecommendationCard';
import AssessmentBreakdown from '../components/diagnostic/AssessmentBreakdown';
import { getRecommendationData } from '../lib/diagnosticScoring';

const DiagnosticResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [price, setPrice] = useState(225);

  // Get data from navigation state or localStorage
  const stateData = location.state;
  
  useEffect(() => {
    // If no state data, redirect back to diagnostic
    if (!stateData || !stateData.answers || typeof stateData.score !== 'number') {
      navigate('/diagnostic');
    }
  }, [stateData, navigate]);

  if (!stateData) {
    return null;
  }

  const { answers, score, recommendation: recommendationCategory } = stateData;
  const recommendation = getRecommendationData(score);

  return (
    <>
      <SEO
        title="Your Claim Readiness Results"
        description="View your personalized VA claim readiness assessment and next steps."
      />

      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Claim Readiness Check
            </h1>
            <p className="text-lg text-slate-600">
              Identify common VA claim risks before filing.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-navy-600 to-navy-800 mx-auto mt-4 rounded-full" />
          </div>

          {/* Main Recommendation */}
          <div className="mb-8">
            <RecommendationCard recommendation={recommendation} />
          </div>

          {/* Assessment Breakdown */}
          <div className="mb-8">
            <AssessmentBreakdown answers={answers} score={score} />
          </div>

          {/* What to Expect Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              What to Expect from a Claim Readiness Review
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4 text-lg">What to Expect</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">60-Minute Consultation</div>
                      <div className="text-sm text-slate-600">Comprehensive review of your claim</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Expert Guidance</div>
                      <div className="text-sm text-slate-600">From experienced VA claim professionals</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Detailed Action Plan</div>
                      <div className="text-sm text-slate-600">Clear next steps to strengthen your claim</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Confidential & Secure</div>
                      <div className="text-sm text-slate-600">Your information stays private</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4 text-lg">What to Prepare</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Service Records</div>
                      <div className="text-sm text-slate-600">DD-214 and service treatment records</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Heart className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Medical Documentation</div>
                      <div className="text-sm text-slate-600">Current medical records and diagnoses</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Previous VA Decisions</div>
                      <div className="text-sm text-slate-600">Any prior claim decisions or denials</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <HelpCircle className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Your Questions</div>
                      <div className="text-sm text-slate-600">List of concerns or uncertainties</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {recommendation.ctaText}
            </h2>
            <p className="text-slate-600 mb-6">
              {recommendation.ctaSubtext}
            </p>
            
            <div className="inline-flex items-center bg-navy-100 text-navy-800 px-6 py-3 rounded-full font-bold text-2xl mb-6">
              ${price}
            </div>

            <Link
              to="/claim-readiness-review"
              state={{ fromDiagnostic: true, diagnosticScore: score }}
              className="inline-block w-full md:w-auto text-white px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#B91C3C' }}
            >
              Pay ${price} & Schedule Appointment
            </Link>

            <p className="text-sm text-slate-500 mt-4 flex items-center justify-center">
              <Lock className="w-4 h-4 mr-2" />
              Secure payment powered by Stripe
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="text-navy-600 hover:text-navy-700 font-medium underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiagnosticResults;
