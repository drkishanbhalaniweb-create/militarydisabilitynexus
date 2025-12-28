import React from 'react';
import { CheckCircle } from 'lucide-react';

const QuestionCard = ({ question, onAnswer, selectedAnswer }) => {
  const handleSelect = (option) => {
    onAnswer(question.id, option.text, option.points);
  };

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          {question.title}
        </h2>
        <p className="text-slate-600 text-base md:text-lg">
          {question.helper}
        </p>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option.text;
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className={`
                w-full p-5 rounded-xl border-2 text-left transition-all duration-300
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                ${isSelected
                  ? 'border-navy-600 bg-navy-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-navy-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <span className={`text-base md:text-lg font-medium ${
                  isSelected ? 'text-navy-900' : 'text-slate-700'
                }`}>
                  {option.text}
                </span>
                {isSelected && (
                  <CheckCircle className="w-6 h-6 text-navy-600 flex-shrink-0 ml-3" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
