import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, category }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-600">
          Question {currentStep} of {totalSteps}
        </span>
        {category && (
          <span className="text-sm font-medium text-navy-600">
            {category}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-navy-600 to-navy-800 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
