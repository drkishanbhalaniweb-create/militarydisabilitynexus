import React from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

const iconMap = {
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle
};

const RecommendationCard = ({ recommendation }) => {
  const Icon = iconMap[recommendation.icon] || Info;
  
  const badgeColors = {
    green: 'border-green-600 text-green-700 bg-green-50',
    blue: 'border-blue-600 text-blue-700 bg-blue-50',
    orange: 'border-orange-600 text-orange-700 bg-orange-50',
    red: 'border-red-600 text-red-700 bg-red-50'
  };

  // Custom badge text mapping
  const getBadgeText = (category) => {
    switch(category) {
      case 'FULLY_READY':
        return 'FULLY READY';
      case 'OPTIONAL_CONFIRMATION':
        return 'READY BUT CLAIM READINESS REVIEW SUGGESTED';
      case 'REVIEW_BENEFICIAL':
        return 'REVIEW BENEFICIAL';
      case 'REVIEW_STRONGLY_RECOMMENDED':
        return 'WEAK, CLAIM READINESS REVIEW STRONGLY RECOMMENDED';
      default:
        return category.replace(/_/g, ' ').toLowerCase();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
      {/* Icon and Badge */}
      <div className="flex items-center justify-between mb-6">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${recommendation.color}20` }}
        >
          <Icon className="w-8 h-8" style={{ color: recommendation.color }} />
        </div>
        <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${badgeColors[recommendation.badgeColor]}`}>
          Claim Strength: {getBadgeText(recommendation.category)}
        </div>
      </div>

      {/* Main Message */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
        {recommendation.message}
      </h2>
      
      {/* Subtitle */}
      <p className="text-lg text-slate-600">
        {recommendation.subtitle}
      </p>
    </div>
  );
};

export default RecommendationCard;
