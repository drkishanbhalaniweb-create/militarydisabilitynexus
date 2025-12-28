import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { ASSESSMENT_AREAS, STATUS_INDICATORS } from '../../lib/diagnosticConfig';
import { getStatusForPoints } from '../../lib/diagnosticScoring';

const iconMap = {
  CheckCircle,
  AlertCircle,
  XCircle
};

const AssessmentBreakdown = ({ answers, score }) => {
  const assessmentItems = Object.entries(answers).map(([questionId, points]) => {
    const area = ASSESSMENT_AREAS[questionId];
    const status = getStatusForPoints(points);
    const indicator = STATUS_INDICATORS[status];
    
    return {
      name: area.name,
      description: area.description,
      status,
      indicator,
      points
    };
  });

  // Separate items by status
  const issues = assessmentItems.filter(item => item.points > 0);
  const strengths = assessmentItems.filter(item => item.points === 0);

  const colorClasses = {
    green: 'border-green-600 bg-green-50',
    yellow: 'border-yellow-600 bg-yellow-50',
    red: 'border-red-600 bg-red-50'
  };

  const textColors = {
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700'
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left Column: Issues/Areas to Review */}
      <div className={`rounded-2xl p-6 ${score === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
        <h3 className={`text-xl font-bold mb-4 ${score === 0 ? 'text-green-900' : 'text-red-900'}`}>
          {score === 0 ? 'Your Claim Strengths' : 'Why This Recommendation Was Shown'}
        </h3>
        
        <div className="space-y-3">
          {score === 0 ? (
            // Perfect score - show all as strengths
            strengths.map((item, index) => {
              const Icon = iconMap[item.indicator.icon];
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${colorClasses[item.indicator.color]}`}
                >
                  <div className="flex items-start">
                    <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${textColors[item.indicator.color]}`} />
                    <div>
                      <div className={`font-semibold ${textColors[item.indicator.color]}`}>
                        {item.name}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Show only issues
            issues.length > 0 ? (
              issues.map((item, index) => {
                const Icon = iconMap[item.indicator.icon];
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${colorClasses[item.indicator.color]}`}
                  >
                    <div className="flex items-start">
                      <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${textColors[item.indicator.color]}`} />
                      <div>
                        <div className={`font-semibold ${textColors[item.indicator.color]}`}>
                          {item.name}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-600">All areas appear adequate.</p>
            )
          )}
        </div>
      </div>

      {/* Right Column: What a Review Focuses On */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          What a Claim Readiness Review Focuses On
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900">Service connection review</div>
              <div className="text-sm text-slate-600 mt-1">
                Verify medical nexus and service records
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900">Evidence alignment</div>
              <div className="text-sm text-slate-600 mt-1">
                Ensure documentation supports your rating goal
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900">Denial risk identification</div>
              <div className="text-sm text-slate-600 mt-1">
                Spot common issues before filing
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900">Claim strategy clarity</div>
              <div className="text-sm text-slate-600 mt-1">
                Confirm correct pathway and approach
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900">Independent & confidential</div>
              <div className="text-sm text-slate-600 mt-1">
                Objective analysis from experienced professionals
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBreakdown;
